-- Add anonymous price alerts table
-- This table allows users to create price alerts without user accounts

CREATE TABLE IF NOT EXISTS "anonymous_price_alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "target_price" integer NOT NULL, -- Store in cents to avoid floating point issues
  "currency" text NOT NULL DEFAULT 'USD',
  "alert_type" text NOT NULL DEFAULT 'below', -- below, above, percentage
  "threshold" integer, -- For percentage-based alerts
  "verification_token" text NOT NULL UNIQUE,
  "management_token" text NOT NULL UNIQUE,
  "is_verified" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_anonymous_alerts_email" ON "anonymous_price_alerts" ("email");
CREATE INDEX IF NOT EXISTS "idx_anonymous_alerts_product" ON "anonymous_price_alerts" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_anonymous_alerts_verified" ON "anonymous_price_alerts" ("is_verified", "is_active");
CREATE INDEX IF NOT EXISTS "idx_anonymous_alerts_management" ON "anonymous_price_alerts" ("management_token");
CREATE INDEX IF NOT EXISTS "idx_anonymous_alerts_verification" ON "anonymous_price_alerts" ("verification_token");

-- Add constraints for data integrity
ALTER TABLE "anonymous_price_alerts" 
  ADD CONSTRAINT "anonymous_alerts_management_token_unique" UNIQUE ("management_token");

ALTER TABLE "anonymous_price_alerts" 
  ADD CONSTRAINT "anonymous_alerts_verification_token_unique" UNIQUE ("verification_token");

-- Add check constraints for data validation
ALTER TABLE "anonymous_price_alerts" 
  ADD CONSTRAINT "anonymous_alerts_target_price_positive" CHECK ("target_price" > 0);

ALTER TABLE "anonymous_price_alerts" 
  ADD CONSTRAINT "anonymous_alerts_currency_length" CHECK (length("currency") = 3);

ALTER TABLE "anonymous_price_alerts" 
  ADD CONSTRAINT "anonymous_alerts_alert_type_valid" CHECK ("alert_type" IN ('below', 'above', 'percentage'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_anonymous_alerts_updated_at 
  BEFORE UPDATE ON "anonymous_price_alerts" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
