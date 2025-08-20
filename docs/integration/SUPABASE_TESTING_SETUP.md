# Supabase Testing Setup for PricePulse

## Quick Supabase Database Setup

### 1. Create Supabase Project

1. Go to: https://supabase.com/
2. Sign up/login with GitHub
3. Click "New Project"
4. Name: `pricepulse-testing`
5. Set password and region
6. Wait for setup (2-3 minutes)

### 2. Get Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection String** → **URI**
3. Copy the connection string (looks like: `postgresql://postgres:password@host:5432/postgres`)

### 3. Environment Variables for Testing

Add these in Vercel → Project Settings → Environment Variables:

```bash
# Essential for Testing
DATABASE_URL=postgresql://postgres:[your-password]@[your-host]:5432/postgres
JWT_SECRET=e2bce49dd14f840252d5a6b455c2570fd327691df8ac15fc5c1e52bd7abb47d7a58f1fbe425f9f0e80fd6a132c094000e177fca4e78f70e1d3b949e0c54cc430
NODE_ENV=production
AUTH_ENABLED=true
FRONTEND_URL=https://your-vercel-app.vercel.app

# Optional for Testing (disable features that need Redis)
REDIS_ENABLED=false
WEBSOCKET_ENABLED=false
EMAIL_NOTIFICATIONS_ENABLED=false
```

## What This Setup Gives You

- ✅ Working frontend
- ✅ Product search functionality  
- ✅ Basic API endpoints
- ✅ Database connectivity
- ✅ User authentication (existing JWT system)
- ❌ Real-time features (disabled)
- ❌ Advanced caching (disabled)
- ❌ Email notifications (disabled)

Perfect for testing the core functionality!
