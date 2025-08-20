# Vercel Deployment Guide

This guide explains how to deploy the PricePulse application to Vercel for testing purposes.

## Prerequisites

1. Vercel account (free tier is sufficient for testing)
2. GitHub repository with your code
3. Database setup (Neon, Supabase, or other PostgreSQL provider)
4. Redis setup (Upstash or other Redis provider)

## Environment Variables

Set these environment variables in your Vercel dashboard (Project Settings > Environment Variables):

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database

# Redis
REDIS_URL=redis://username:password@host:port

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NODE_ENV=production
AUTH_ENABLED=true
FRONTEND_URL=https://shoppersprint.com

# Rate Limiting & Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=200
```

### Optional Variables

```bash
# OAuth (if using OAuth features)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn

# External APIs
RAPIDAPI_KEY=your-rapidapi-key
```

## Database Setup

### Option 1: Neon (Recommended for testing)

1. Go to [Neon](https://neon.tech/)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add it as `DATABASE_URL` in Vercel

### Option 2: Supabase

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Copy the URI connection string
5. Add it as `DATABASE_URL` in Vercel

### Option 3: Railway

1. Go to [Railway](https://railway.app/)
2. Create a new PostgreSQL database
3. Copy the connection URL
4. Add it as `DATABASE_URL` in Vercel

## Redis Setup

### Option 1: Upstash (Recommended for testing)

1. Go to [Upstash](https://upstash.com/)
2. Create a free account
3. Create a new Redis database
4. Copy the Redis URL
5. Add it as `REDIS_URL` in Vercel

### Option 2: Redis Cloud

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Copy the connection URL
5. Add it as `REDIS_URL` in Vercel

## Deployment Steps

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration

### 2. Configure Build Settings

Vercel should automatically detect the configuration from `vercel.json`, but verify:

- **Framework Preset**: Other
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm run install:all`

### 3. Add Environment Variables

1. Go to Project Settings > Environment Variables
2. Add all the required environment variables listed above
3. Make sure to set them for all environments (Development, Preview, Production)

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Database Migration

After deployment, you need to run database migrations:

1. Go to your Vercel dashboard
2. Navigate to Functions tab
3. You can run migrations by calling the API endpoint or using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Run database migrations (if you have a migration endpoint)
curl https://shoppersprint.com/api/migrate
```

## Testing the Deployment

1. Visit your Vercel URL
2. Check the health endpoint: `https://your-app.vercel.app/health`
3. Test the API: `https://your-app.vercel.app/api/search?q=test`
4. Test the frontend functionality

## Common Issues and Solutions

### 1. Build Failures

- Check the build logs in Vercel dashboard
- Ensure all dependencies are listed in package.json
- Verify TypeScript compilation errors

### 2. API Not Working

- Check environment variables are set correctly
- Verify database and Redis connections
- Check function logs in Vercel dashboard

### 3. CORS Issues

- Ensure `FRONTEND_URL` environment variable is set
- The backend is configured to allow Vercel domains (*.vercel.app)

### 4. Database Connection Issues

- Verify connection string format
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled for production databases

### 5. Cold Start Issues

- First request might be slow due to serverless cold starts
- This is normal for Vercel's free tier
- Consider upgrading to Pro for better performance

## Monitoring

You can monitor your app through:

1. **Vercel Dashboard**: Function logs, analytics, and performance metrics
2. **Database Logs**: Check your database provider's dashboard
3. **Custom Monitoring**: Add Sentry or other monitoring tools

## Security Considerations

1. Always use environment variables for secrets
2. Enable HTTPS (automatic on Vercel)
3. Configure proper CORS settings
4. Use rate limiting (already configured)
5. Regularly rotate JWT secrets and API keys

## Production Migration

When ready for production on other platforms (Spaceship, Hostinger):

1. Export environment variables from Vercel
2. Set up CI/CD pipeline for the production platform
3. Configure proper domain and SSL certificates
4. Set up monitoring and backup strategies
5. Consider using a CDN for better performance

## Support

For issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Check database and Redis provider status
4. Test API endpoints individually
