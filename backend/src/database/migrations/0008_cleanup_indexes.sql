-- Indexes to support cleanup queries and improve performance

-- Deactivate expired sessions efficiently
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);

-- Anonymous alerts cleanup (unverified older than 24h)
CREATE INDEX IF NOT EXISTS idx_anonymous_alerts_created_at ON anonymous_price_alerts (created_at);