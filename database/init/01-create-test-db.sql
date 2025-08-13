-- Create test database if it doesn't exist
-- This script runs automatically when the PostgreSQL container starts

-- Create the test database if it doesn't exist
SELECT 'CREATE DATABASE price_tracker_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'price_tracker_test')\gexec

-- Grant permissions to main database
GRANT ALL PRIVILEGES ON DATABASE price_tracker TO price_tracker_user;

-- Grant permissions to test database
GRANT ALL PRIVILEGES ON DATABASE price_tracker_test TO price_tracker_user;

-- Create any additional schemas or extensions here
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";