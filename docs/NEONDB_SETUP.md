# 🚀 NeonDB Production Setup Guide

This guide explains how to set up NeonDB for production deployment of the PricePulse application.

## Prerequisites

- NeonDB account (sign up at [neon.tech](https://neon.tech))
- Production Redis instance (AWS ElastiCache, Redis Cloud, etc.)
- Domain name for your application

## Step 1: Create NeonDB Database

1. **Sign up/Login to NeonDB**
   - Visit [neon.tech](https://neon.tech)
   - Create an account or sign in

2. **Create New Project**
   - Click "Create New Project"
   - Choose a project name (e.g., "pricepulse-prod")
   - Select a region close to your users
   - Choose "PostgreSQL 15" (latest stable)

3. **Get Connection Details**
   - After project creation, you'll see connection details
   - Copy the connection string (format: `postgresql://user:password@host/database`)
   - Note down the host, user, password, and database name

## Step 2: Configure Environment Variables

1. **Update `.env.production`**

   ```bash
   # Replace placeholder values with your actual NeonDB credentials
   DB_HOST=your-actual-host.neon.tech
   DB_USER=your-actual-username
   DB_PASSWORD=your-actual-password
   DB_NAME=your-actual-database
   DATABASE_URL=postgresql://your-actual-username:your-actual-password@your-actual-host.neon.tech/your-actual-database
   ```

2. **Set Production Redis URL**

   ```bash
   # Use your production Redis instance
   REDIS_URL=redis://your-redis-host:6379
   ```

3. **Configure Security Settings**

   ```bash
   SESSION_SECRET=your-super-secret-session-key-here
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## Step 3: Run Database Migrations

1. **Set Production Environment**

   ```bash
   export NODE_ENV=production
   ```

2. **Generate and Run Migrations**

   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

3. **Verify Database Setup**

   ```bash
   npm run db:studio
   ```

   - This will open Drizzle Studio in your browser
   - Verify all tables are created correctly

## Step 4: Test Production Connection

1. **Test Database Connection**

   ```bash
   npm run dev:neon
   ```

   - This will start the server in production mode
   - Check console logs for successful NeonDB connection

2. **Verify Health Check**

   ```bash
   curl http://localhost:3001/health
   ```

   - Should return `{"status":"OK","timestamp":"..."}`

## Step 5: Production Deployment

### Option A: Direct Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start:production
```

### Option B: Docker Production

```dockerfile
# Create production Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "run", "start:production"]
```

### Option C: Platform Deployment

- **Vercel**: Deploy frontend
- **Railway/Heroku**: Deploy backend
- **AWS/GCP**: Container deployment

## Step 6: SSL and Security

1. **NeonDB SSL Configuration**
   - NeonDB requires SSL connections
   - The application automatically configures SSL for production
   - SSL certificates are managed by NeonDB

2. **Environment Security**
   - Never commit `.env.production` to version control
   - Use environment variables in your deployment platform
   - Rotate secrets regularly

## Step 7: Monitoring and Maintenance

1. **Database Monitoring**
   - Use NeonDB dashboard for performance metrics
   - Monitor connection counts and query performance
   - Set up alerts for connection issues

2. **Application Monitoring**
   - Monitor API response times
   - Track error rates and database connection status
   - Set up health check monitoring

## Troubleshooting

### Common Issues

1. **SSL Connection Errors**

   ```text
   Error: self signed certificate in certificate chain
   ```

   - Solution: Ensure `NODE_ENV=production` is set
   - The app automatically configures SSL for production

2. **Connection Timeout**

   ```text
   Error: connect ETIMEDOUT
   ```

   - Check if NeonDB host is accessible
   - Verify firewall/network settings
   - Check NeonDB service status

3. **Authentication Errors**

   ```text
   Error: password authentication failed
   ```

   - Verify username/password in environment variables
   - Check if database user has proper permissions
   - Ensure database name is correct

### Performance Optimization

1. **Connection Pooling**
   - The app uses connection pooling (max: 10 connections)
   - Monitor connection usage in NeonDB dashboard
   - Adjust pool size based on load

2. **Query Optimization**
   - Use database indexes for frequently queried fields
   - Monitor slow queries in NeonDB logs
   - Implement query caching where appropriate

## Environment Variables Reference

| Variable       | Development (Docker)     | Production (NeonDB)              |
| -------------- | ------------------------ | -------------------------------- |
| `NODE_ENV`     | `development`            | `production`                     |
| `DB_HOST`      | `localhost`              | `your-host.neon.tech`            |
| `DB_PORT`      | `5432`                   | `5432`                           |
| `DB_USER`      | `pricepulse`             | `your-neon-user`                 |
| `DB_PASSWORD`  | `pricepulse123`          | `your-neon-password`             |
| `DB_NAME`      | `pricepulse`             | `your-neon-database`             |
| `DATABASE_URL` | Not set                  | `postgresql://user:pass@host/db` |
| `REDIS_URL`    | `redis://localhost:6379` | `redis://your-redis-host:6379`   |

## Next Steps

After setting up NeonDB:

1. **Deploy to Production**
   - Choose your deployment platform
   - Configure environment variables
   - Deploy and test thoroughly

2. **Set Up Monitoring**
   - Configure application monitoring
   - Set up database performance alerts
   - Implement logging and error tracking

3. **Scale and Optimize**
   - Monitor performance metrics
   - Optimize database queries
   - Scale resources as needed

## Support

- **NeonDB Documentation**: [docs.neon.tech](https://docs.neon.tech)
- **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team)
- **Application Issues**: Check the main README.md for troubleshooting
