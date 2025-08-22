-- Add waitlist subscriptions table
CREATE TABLE IF NOT EXISTS waitlist_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  source TEXT NOT NULL DEFAULT 'coming_soon_page',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_active ON waitlist_subscriptions(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waitlist_updated_at 
    BEFORE UPDATE ON waitlist_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
