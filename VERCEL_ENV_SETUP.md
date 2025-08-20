# Vercel Environment Variables Setup Guide

## Quick Setup Services

### 1. Database (PostgreSQL) - Choose One:

#### Option A: Neon (Recommended for testing)
1. Go to: https://neon.tech/
2. Sign up with GitHub
3. Create new project: `pricepulse-db`
4. Copy the connection string from dashboard
5. Set as `DATABASE_URL` in Vercel

#### Option B: Supabase
1. Go to: https://supabase.com/
2. Sign up with GitHub  
3. Create new project: `pricepulse`
4. Go to Settings → Database → Connection String → URI
5. Set as `DATABASE_URL` in Vercel

#### Option C: Railway
1. Go to: https://railway.app/
2. Sign up with GitHub
3. Create new PostgreSQL database
4. Copy connection URL
5. Set as `DATABASE_URL` in Vercel

### 2. Redis Cache - Choose One:

#### Option A: Upstash (Recommended for testing)
1. Go to: https://upstash.com/
2. Sign up with GitHub
3. Create new Redis database: `pricepulse-cache`
4. Copy Redis URL from dashboard
5. Set as `REDIS_URL` in Vercel

#### Option B: Redis Cloud
1. Go to: https://redis.com/try-free/
2. Create free account
3. Create new database
4. Copy connection URL
5. Set as `REDIS_URL` in Vercel

## Required Environment Variables for Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:

### Essential Variables:
```
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
AUTH_ENABLED=true
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Email Configuration (Optional):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
```

### Security & Performance:
```
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=200
CSRF_SECRET=another-secret-key-32-chars-min
```

## Step-by-Step Vercel Setup:

1. **Import from GitHub**:
   - Vercel Dashboard → Add New → Project
   - Import your `pricepulse` repository

2. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add each variable above
   - Set for: Production, Preview, and Development

3. **Trigger Deployment**:
   - Push any change to main branch
   - Or click "Redeploy" in Vercel dashboard

## Generate JWT Secret:
```bash
# Run this locally to generate a secure JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Test Your Deployment:

After setup, test these endpoints:
- `https://your-app.vercel.app/` (Frontend)
- `https://your-app.vercel.app/health` (Backend health)
- `https://your-app.vercel.app/api/search?query=test` (API test)

## Common Issues:

1. **Database Connection**: Ensure SSL is enabled and connection string format is correct
2. **Redis Connection**: Verify Redis URL includes credentials
3. **JWT Errors**: Ensure JWT_SECRET is at least 32 characters
4. **CORS Issues**: Set FRONTEND_URL to your actual Vercel app URL

## Need Help?

Check the logs in Vercel Dashboard → Functions tab for detailed error messages.
