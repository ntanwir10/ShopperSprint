// Fail-fast script to enforce required env in production

const isProd = process.env["NODE_ENV"] === "production";

if (isProd) {
  const missing: string[] = [];
  if (!process.env["JWT_SECRET"]) missing.push("JWT_SECRET");
  if (missing.length > 0) {
    console.error(`Missing required env in production: ${missing.join(", ")}`);
    process.exit(1);
  }
}

console.log("Env check passed");
