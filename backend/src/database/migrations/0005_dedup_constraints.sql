-- Add de-duplication constraints and helpful indexes

-- Ensure product names are unique by normalized_name
ALTER TABLE "products"
  ADD CONSTRAINT IF NOT EXISTS products_normalized_name_unique UNIQUE ("normalized_name");

-- Ensure a unique listing per product/source/url
ALTER TABLE "product_listings"
  ADD CONSTRAINT IF NOT EXISTS product_listings_unique_per_source UNIQUE ("product_id", "source_id", "url");

-- Ensure only one active alert per user/product
CREATE UNIQUE INDEX IF NOT EXISTS price_alerts_unique_active
  ON "price_alerts" ("user_id", "product_id")
  WHERE is_active = true;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_product_listings_product ON "product_listings" ("product_id");
CREATE INDEX IF NOT EXISTS idx_product_listings_source ON "product_listings" ("source_id");
CREATE INDEX IF NOT EXISTS idx_products_normalized_name ON "products" ("normalized_name");


