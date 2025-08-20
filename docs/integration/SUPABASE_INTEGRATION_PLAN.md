## Supabase Integration Plan (Backend, Database, Frontend)

This document defines an end-to-end migration and integration plan to adopt Supabase across the stack. It is exhaustive and designed to minimize risk through phased rollout, clear ownership, and verifiable acceptance criteria.

### Goals

- Unify authentication and OAuth using Supabase Auth (with secure JWT, email verification, password reset, OAuth providers).
- Migrate PostgreSQL to Supabase managed Postgres while retaining Drizzle ORM and existing schema with minimal disruption.
- Introduce Row Level Security (RLS) policies for user-scoped tables.
- Optionally adopt Supabase Storage for user uploads and Supabase Realtime for pub/sub events.
- Keep Redis for caching and ephemeral state where it provides clear value.
- Update CI/CD, environments, and documentation to reflect the new platform.

### Current Architecture Snapshot

- Backend: Node.js/Express, Drizzle ORM (Postgres), Redis, JWT auth with custom sessions, OAuth via openid-client; services include search/scraping, price history, notifications, email.
- Frontend: React (Vite), shadcn/ui, `AuthContext` with custom login/register, OAuth redirects to backend, API client attaches JWT from `localStorage`.
- Database: Postgres (local/prod via docker-compose), schema managed by Drizzle migrations.
- Infra: Docker and Docker Compose (dev/prod), Nginx for frontend and reverse-proxy, monitoring stack in prod compose.
- CI/CD: GitHub Actions for CI, dev/prod deploy; images published to GHCR.

### Integration Scope and Strategy

- Supabase components to adopt:
  - Auth (email/password + OAuth: Google, Apple)
  - Postgres (managed database)
  - Realtime (optional replacement/augmentation for in-app WebSocket broadcasting)
  - Storage (optional for uploads/avatars)
  - Edge Functions (optional for future scraping/event tasks; not in phase 1)

- Keep existing components:
  - Redis (caching/search results; transient OAuth state)
  - Drizzle ORM (database access layer)
  - Existing scraping/search services (migrate DB connections only)

### Decision Log

- DB Migration: Move to Supabase-managed Postgres. Continue using Drizzle migrations against Supabase DB.
- Auth Migration: Replace custom JWT and `openid-client` with Supabase Auth. Maintain an application `profiles` table linked to `auth.users` for app-specific metadata (firstName, lastName, role, preferences).
- Sessions: Rely on Supabase sessions/JWT; deprecate `userSessions` table after cutover.
- OAuth: Use Supabase providers; remove backend `/api/auth/oauth/*` routes after cutover.
- Realtime: Optional, adopt incrementally; keep current WebSocket service until parity.
- Storage: Optional; adopt later to replace local `uploads/`.

### Environment and Secrets Mapping

- Backend (new):
  - SUPABASE_URL
  - SUPABASE_ANON_KEY (for public token verification when necessary)
  - SUPABASE_SERVICE_ROLE_KEY (server-side elevated operations)
  - DATABASE_URL (Supabase Postgres connection URL)
  - Keep: REDIS_URL, SMTP_*, FRONTEND_URL
  - Transitional (until auth cutover): JWT_SECRET, SESSION_EXPIRES_IN_DAYS
  - Feature flag: USE_SUPABASE_AUTH=true|false (toggle legacy vs Supabase auth in backend)

- Frontend (new):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - Continue: VITE_API_URL, feature flags

- CI/CD Secrets:
  - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_DB_PASSWORD (if using direct DB connection)
  - Update DATABASE_URL to Supabase connection string

### Database Migration Plan

1) Provision Supabase project and database.
2) Enable required extensions (if not already): `pgcrypto`, `uuid-ossp`, `pg_trgm`.
3) Schema alignment options:
   - Preferred: Continue using Drizzle migrations against Supabase. Point `DATABASE_URL` to Supabase and run migrations in staging/production.
   - Alternative: Port to Supabase SQL migrations. Not required initially.
4) Data model adjustments:
   - Create `public.profiles` table (if not present) containing app-specific fields currently on `users` (e.g., firstName, lastName, username, role, isActive, emailVerified) and `userPreferences` remains linked by `user_id`.
   - Maintain `public.users` only if required by existing code; otherwise, pivot to `auth.users` + `public.profiles`.
   - Add foreign key `profiles.user_id` -> `auth.users.id` with `on delete cascade`.
   - Consider migrating `oauthAccounts` usage to `auth.identities`. Keep table temporarily for reporting/backfill.
   - Plan to deprecate `userSessions` post-auth cutover.
5) RLS Policies:
   - Enable RLS on `public.profiles`, `user_preferences`, `price_alerts` (user-scoped tables).
   - Example SQL policies:
     - Enable RLS: `alter table public.profiles enable row level security;`
     - SELECT own: `create policy profiles_select_own on public.profiles for select using (auth.uid() = user_id);`
     - UPDATE own: `create policy profiles_update_own on public.profiles for update using (auth.uid() = user_id);`
     - INSERT by service role only: `create policy profiles_insert_service on public.profiles for insert with check (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');`
   - Anonymous alerts: keep non-RLS and only expose via backend endpoints; or restrict to service role if needed.
6) Data migration:
   - Export current Postgres via `pg_dump`; import into Supabase via `psql`/dashboard.
   - Seed `auth.users` via Supabase Admin API (service role). For existing users, set `email_confirm` true or force password reset.
   - Backfill `public.profiles.user_id` by joining on email to `auth.users`.
   - Ensure `user_preferences.user_id` matches `auth.users.id`.
7) Triggers:
   - Optional: Trigger on `auth.users` insert to create `public.profiles` row.
8) Performance:
   - Re-create indexes currently in migrations.
   - Validate query plans for Search/PriceHistory.

### Backend Changes

- Connection:
  - Update `backend/src/database/connection.ts` to use Supabase DATABASE_URL with SSL.
  - Keep Redis client.

- Auth Middleware (`backend/src/middleware/authMiddleware.ts`):
  - Replace custom JWT validation with Supabase JWT verification using `@supabase/supabase-js` server client (`auth.getUser()` from Bearer token) or JWKS verification.
  - Map Supabase `user` to app `UserProfile` by joining `public.profiles`.
  - Respect `USE_SUPABASE_AUTH` to allow incremental rollout.

- Auth Service (`backend/src/services/authService.ts`):
  - Deprecate custom `registerUser`, `loginUser`, `verifyToken`, `resetPassword` implementations.
  - Implement thin wrappers using Supabase Admin API (service role) for admin-only profile sync; return app profile.
  - Maintain endpoints for `GET /api/auth/me`, `POST /api/auth/logout` using Supabase session/token semantics.
  - Keep SMTP flows for anonymous alerts; Supabase email templates for auth flows.

- OAuth Service (`backend/src/services/oauthService.ts`):
  - Remove `openid-client` logic.
  - Replace `/api/auth/oauth/:provider` endpoints with 302 redirects to frontend that calls `supabase.auth.signInWithOAuth`.
  - Transitional period: Keep endpoints but implement 410 Gone + guidance once frontend updated.

- Profile/Preferences:
  - Update services accessing `users` to instead join `profiles` and/or use `auth.users` where appropriate.
  - Ensure writes respect RLS: use service role in backend or rely on policies allowing user writes to own rows.

- WebSocket/Realtime (optional):
  - Keep `websocketService` for now. Plan a follow-up to publish DB events to Supabase Realtime channels for frontend subscriptions.

### Frontend Changes

- Initialize Supabase client in `frontend/src/lib/supabase.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- AuthContext:
  - Replace custom login/register/logout with `supabase.auth.signInWithPassword`, `signUp`, `signOut`.
  - Subscribe to `supabase.auth.onAuthStateChange` to manage session state.
  - Expose `user` and `session` to components.
  - Remove storage of `auth_token` in `localStorage` (Supabase manages session persistence).
- OAuth:
  - Replace Google/Apple buttons to call `supabase.auth.signInWithOAuth({ provider: 'google'|'apple' })`.
- API Client (`frontend/src/lib/api.ts`):
  - Fetch Supabase access token via `supabase.auth.getSession()` per request; attach `Authorization: Bearer <access_token>`.
  - Remove reliance on custom `auth_token` in localStorage (Supabase manages persistence).
- Protected Routes:
  - Use Supabase session for gating.
- Profile/Preferences UI:
  - Continue using API endpoints; backend will read Supabase user and enforce RLS.

### Realtime Plan (Optional Phase)

- Use Supabase Realtime channels to subscribe to price updates and notifications:
  - Create channel `prices:product_id` to broadcast updates inserted into `price_history`.
  - Add DB triggers to publish to Realtime on insert/update.
  - Frontend subscribes via supabase-js channels.
  - Gradually deprecate custom WebSocket service when parity is reached.

### Storage Plan (Optional Phase)

- Create bucket `uploads` for user assets (avatars) and `product-images` if needed.
- Migrate any local `uploads/` to the buckets.
- Generate signed URLs on the backend (service role) or use public bucket policies if appropriate.

### CI/CD Updates

- Add environment secrets for Supabase to GitHub Actions; never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend build.
- Optionally add Supabase CLI to generate DB types and validate migrations in CI.
- Update build steps to generate Supabase types (optional): `supabase gen types typescript --project-id <id> --schema public > backend/src/types/supabase.ts`.
- Point backend `DATABASE_URL` to Supabase in deploy jobs; remove `postgres` service from production compose once cutover completes.
- Add health checks verifying Supabase connectivity.

### Local Development

- Option A (recommended): Use Supabase remote DB for dev; keep local Redis.
- Option B: Use Supabase CLI to run local stack (optional, heavier), or keep local Postgres until DB migration phase completes.
- Add `.env` entries:
  - Backend: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL.
  - Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.

### Phased Rollout

- Phase 0: Preparation
  - Provision Supabase, set secrets, enable extensions, create `profiles` table, write RLS policies, create service account keys.

- Phase 1: Database Cutover (keep legacy auth)
  - Point `DATABASE_URL` to Supabase in staging; run Drizzle migrations; run smoke tests; validate search/price flows.
  - Promote to production; keep local Redis.

- Phase 2: Auth Cutover
  - Frontend switches to Supabase Auth; backend middleware verifies Supabase JWT.
  - Keep legacy auth endpoints temporarily returning 410 with migration guidance.
  - Disable creation of `userSessions`; mark as deprecated.

- Phase 3: OAuth and Email
  - Remove `openid-client`; adopt Supabase OAuth flows.
  - Configure Supabase email templates and domain; keep SMTP for anonymous alerts or migrate to functions/provider.

- Phase 4: Realtime (optional)
  - Publish DB events; subscribe in frontend; deprecate custom WebSocket when stable.

- Phase 5: Storage (optional)
  - Migrate uploads to Supabase Storage; update URLs and policies.

- Phase 6: Cleanup
  - Drop deprecated tables/columns (`userSessions`, password hashes on app users if any remain).
  - Remove legacy code paths and environment variables.

### Risk Management and Rollback

- Risks: Token validation mismatches, RLS misconfiguration, data migration integrity, OAuth redirect misconfig, leakage of service role key, anonymous alerts blocked by RLS.
- Mitigations: Staging environment, feature flags, phased cutover, read-only dry runs.
- Rollback: Flip `USE_SUPABASE_AUTH=false`, point `DATABASE_URL` back; re-enable legacy auth; revert frontend to legacy `AuthContext`.

### Testing Strategy

- Unit tests: Update auth tests to cover Supabase token validation paths.
- Integration tests: Staging environment with Supabase; end-to-end flows for register/login/oauth/search/alerts.
- Security tests: RLS policy probes; ensure only owner can access own rows.

### Acceptance Criteria

- Users can sign up, log in, and use OAuth via Supabase in production.
- All app API endpoints function against Supabase Postgres with Drizzle.
- RLS active and enforced for user-scoped tables.
- CI/CD green with Supabase secrets; health checks pass; no leakage of `SUPABASE_SERVICE_ROLE_KEY`.

### Concrete Task Breakdown (Backlog)

- Backend
  - [ ] Add `@supabase/supabase-js` server dependency; implement server client helper (anon + service role).
  - [ ] Update `database/connection.ts` to use Supabase `DATABASE_URL` + SSL.
  - [ ] Implement Supabase-authenticated `authMiddleware` and profile join.
  - [ ] Introduce `profiles` access service; refactor services using `users`.
  - [ ] Add feature flag to toggle legacy vs Supabase auth.
  - [ ] Remove `openid-client` and legacy JWT issuance after cutover.

- Frontend
  - [ ] Add `@supabase/supabase-js`; create `lib/supabase.ts`.
  - [ ] Refactor `AuthContext` to supabase sessions and flows.
  - [ ] Update API client to attach Supabase access token.
  - [ ] Swap OAuth buttons to `signInWithOAuth`.

- Database
  - [ ] Create `profiles` table + constraints + triggers.
  - [ ] Enable RLS + write policies for `profiles`, `user_preferences`, `price_alerts`.
  - [ ] Run Drizzle migrations on Supabase.
  - [ ] Execute data migration and backfill scripts.

- CI/CD & Ops
  - [ ] Add Supabase secrets to GitHub Actions; update compose/envs.
  - [ ] Update health checks and deploy docs.
  - [ ] Observability dashboards post-cutover.

### Out of Scope (Now)

- Moving scraping to Supabase Edge Functions.
- Replacing Redis with Supabase-native alternatives.

---

For setup details, also see `docs/ENVIRONMENT_SETUP.md` and `docs/QUICK_SETUP.md` (to be updated post-integration).


