-- Composite unique index to prevent duplicate active alerts per (email, product)
CREATE UNIQUE INDEX IF NOT EXISTS uq_anonymous_alert_email_product_active
ON anonymous_price_alerts (email, product_id, is_active)
WHERE is_active = true;

-- Helpful query indexes
CREATE INDEX IF NOT EXISTS idx_anonymous_alert_product_active
ON anonymous_price_alerts (product_id, is_active);

CREATE INDEX IF NOT EXISTS idx_anonymous_alert_email
ON anonymous_price_alerts (email);

