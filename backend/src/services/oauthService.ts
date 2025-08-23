import { Issuer, generators, Client, TokenSet } from "openid-client";
import * as jose from "jose";
import { getDb, getRedis } from "../database/connection";
import {
  users,
  oauthAccounts,
  userSessions,
  userPreferences,
} from "../database/schema";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

type Provider = "google" | "apple";

interface OAuthStateData {
  provider: Provider;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
}

export class OAuthService {
  private googleIssuer: Issuer<Client> | null = null;
  private appleIssuer: Issuer<Client> | null = null;

  async getClient(provider: Provider): Promise<Client> {
    if (provider === "google") {
      if (!this.googleIssuer) {
        this.googleIssuer = await Issuer.discover(
          "https://accounts.google.com"
        );
      }
      const client = new this.googleIssuer.Client({
        client_id: process.env["GOOGLE_CLIENT_ID"] || "",
        client_secret: process.env["GOOGLE_CLIENT_SECRET"] || "",
        redirect_uris: [
          process.env["GOOGLE_REDIRECT_URI"] ||
            "http://localhost:3001/api/auth/oauth/google/callback",
        ],
        response_types: ["code"],
      });
      return client;
    }

    // Apple configuration (manual)
    if (!this.appleIssuer) {
      this.appleIssuer = new Issuer({
        issuer: "https://appleid.apple.com",
        authorization_endpoint: "https://appleid.apple.com/auth/authorize",
        token_endpoint: "https://appleid.apple.com/auth/token",
        jwks_uri: "https://appleid.apple.com/auth/keys",
      } as any);
    }

    const clientId = process.env["APPLE_CLIENT_ID"] || "";
    const teamId = process.env["APPLE_TEAM_ID"] || "";
    const keyId = process.env["APPLE_KEY_ID"] || "";
    const privateKeyPem = (process.env["APPLE_PRIVATE_KEY"] || "").replace(
      /\\n/g,
      "\n"
    );

    // Create client_secret JWT for Apple
    const now = Math.floor(Date.now() / 1000);
    const clientSecret = await new jose.SignJWT({
      iss: teamId,
      iat: now,
      exp: now + 60 * 60, // 1 hour
      aud: "https://appleid.apple.com",
      sub: clientId,
    })
      .setProtectedHeader({ alg: "ES256", kid: keyId })
      .sign(await jose.importPKCS8(privateKeyPem, "ES256"));

    const client = new this.appleIssuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [
        process.env["APPLE_REDIRECT_URI"] ||
          "http://localhost:3001/api/auth/oauth/apple/callback",
      ],
      response_types: ["code"],
    } as any);

    return client;
  }

  async startAuth(
    provider: Provider
  ): Promise<{ url: string; stateKey: string }> {
    const client = await this.getClient(provider);
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const state = generators.state();
    const nonce = generators.nonce();

    const redirectUri = this.getRedirectUri(provider);

    // Persist PKCE/state/nonce in Redis
    const redis = getRedis();
    const stateKey = `oauth:${provider}:state:${state}`;
    const stateData: OAuthStateData = {
      provider,
      nonce,
      codeVerifier,
      redirectUri,
    };
    await redis.setEx(stateKey, 600, JSON.stringify(stateData)); // 10 min TTL

    const authUrl = client.authorizationUrl({
      scope:
        provider === "google" ? "openid email profile" : "name email openid",
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
      redirect_uri: redirectUri,
    });

    return { url: authUrl, stateKey };
  }

  async handleCallback(
    provider: Provider,
    params: { code?: string; state?: string }
  ): Promise<{ token: string; expiresAt: string }> {
    if (!params.code || !params.state) {
      throw new Error("Missing OAuth parameters");
    }

    const redis = getRedis();
    const stateKey = `oauth:${provider}:state:${params.state}`;
    const stateJson = await redis.get(stateKey);
    if (!stateJson) {
      throw new Error("Invalid or expired state");
    }
    await redis.del(stateKey);
    const { codeVerifier, nonce, redirectUri } = JSON.parse(
      stateJson
    ) as OAuthStateData;

    const client = await this.getClient(provider);
    const tokenSet: TokenSet = await client.callback(
      redirectUri,
      { code: params.code, state: params.state },
      { code_verifier: codeVerifier, nonce }
    );

    // Validate ID Token and extract claims
    const claims = tokenSet.claims();
    const providerUserId = claims.sub as string;
    const email = (claims.email as string) || "";
    const emailVerified = Boolean(claims.email_verified);
    const name = (claims.name as string) || (claims.given_name as string) || "";

    // Link or create user
    const db = getDb();
    const user = await db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerUserId, providerUserId)
      ),
      with: { user: true as any },
    } as any);

    if (!user) {
      // Try to find by email
      const existingUser = email
        ? await db.query.users.findFirst({ where: eq(users.email, email) })
        : null;

      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create user with random password (hashed)
        const username = email || `${provider}_${providerUserId}`;
        const randomPassword = `${provider}_${providerUserId}_${Math.random()
          .toString(36)
          .slice(2)}`;
        const passwordHash = await bcrypt.hash(randomPassword, 12);
        const [newUser] = await db
          .insert(users)
          .values({
            email: email || `${providerUserId}@${provider}.local`,
            username,
            passwordHash,
            firstName: name || null,
            emailVerified,
          })
          .returning();

        if (!newUser) {
          throw new Error("Failed to create user");
        }
        userId = newUser.id;
        await db.insert(userPreferences).values({ userId });
      }

      await db.insert(oauthAccounts).values({
        userId,
        provider,
        providerUserId,
        accessToken: tokenSet.access_token || null,
        refreshToken: tokenSet.refresh_token || null,
        scope: Array.isArray(tokenSet.scope)
          ? tokenSet.scope.join(" ")
          : (tokenSet.scope as string | undefined) || null,
        expiresAt: tokenSet.expires_at
          ? new Date(tokenSet.expires_at * 1000)
          : null,
      });
    }

    // Get the linked user
    const linked = await db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerUserId, providerUserId)
      ),
    });

    const linkedUser = await db.query.users.findFirst({
      where: eq(users.id, linked!.userId),
    });
    if (!linkedUser) throw new Error("User not found after linking");

    // Issue our JWT and session
    const token = this.generateJWT(linkedUser.id);
    const expiresAt = this.calculateExpiryDate();
    await db
      .insert(userSessions)
      .values({ userId: linkedUser.id, token, expiresAt });

    return { token, expiresAt: expiresAt.toISOString() };
  }

  private getRedirectUri(provider: Provider): string {
    if (provider === "google") {
      return (
        process.env["GOOGLE_REDIRECT_URI"] ||
        "http://localhost:3001/api/auth/oauth/google/callback"
      );
    }
    return (
      process.env["APPLE_REDIRECT_URI"] ||
      "http://localhost:3001/api/auth/oauth/apple/callback"
    );
  }

  private generateJWT(userId: string): string {
    const secret = process.env["JWT_SECRET"];

    // Enforce secure JWT secret in all environments
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }

    // Check for insecure default secrets
    if (
      secret === "your-secret-key-change-in-production" ||
      secret === "dev-secret" ||
      secret.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must be a secure secret of at least 32 characters"
      );
    }

    const JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] || "7d";
    return jwt.sign({ userId }, secret as jwt.Secret, {
      expiresIn: JWT_EXPIRES_IN as any,
    });
  }

  private calculateExpiryDate(): Date {
    const SESSION_EXPIRES_IN_DAYS = parseInt(
      process.env["SESSION_EXPIRES_IN_DAYS"] || "7"
    );
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + SESSION_EXPIRES_IN_DAYS);
    return expiryDate;
  }
}

export const oauthService = new OAuthService();
