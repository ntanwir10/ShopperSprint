# 🚂 Railway Deployment Setup

## 🎯 **Ready-to-Use Environment Templates**

Our staging and production templates are **Railway-ready** with proper variable references.

### 🎭 **Staging Deployment**

1. **Create Railway Project**:

   ```bash
   railway login
   railway init
   ```

2. **Add Services**:
   - Add PostgreSQL service
   - Add Redis service

3. **Copy Environment**:

   ```bash
   npm run env:staging  # Creates .env.temp
   cp .env.temp .env    # Use staging config
   ```

4. **Deploy**:

   ```bash
   railway deploy
   ```

### 🚀 **Production Deployment**

1. **Create Separate Railway Project** (for production):

   ```bash
   railway init --name shoppersprint-prod
   ```

2. **Add Services**:
   - Add PostgreSQL service
   - Add Redis service

3. **Copy Environment**:

   ```bash
   npm run env:prod     # Creates .env.temp
   cp .env.temp .env    # Use production config
   ```

4. **Set Custom Domain**:
   - Configure `shoppersprint.com` in Railway dashboard

5. **Deploy**:

   ```bash
   railway deploy
   ```

## 🔧 **What's Pre-Configured**

### ✅ **Railway Variables**

- `${{Postgres.DATABASE_URL}}` - Auto-generated database URL
- `${{Redis.REDIS_URL}}` - Auto-generated Redis URL  
- `${{RAILWAY_PUBLIC_DOMAIN}}` - Auto-generated domain for staging

### ✅ **Environment-Specific Settings**

- **Staging**: Uses dev email, faster scraping, devtools disabled
- **Production**: Uses production email, slower scraping, optimized for scale

### ✅ **Security**

- Different JWT secrets for staging/production
- Production-ready SMTP configuration
- Proper CORS and security headers

## 🚨 **Manual Steps Required**

### **For Staging**

1. ✅ Railway variables are auto-configured
2. ✅ Email uses existing dev credentials
3. ⚠️ Generate new JWT secret: `openssl rand -base64 64`

### **For Production**

1. ✅ Railway variables are auto-configured  
2. ⚠️ Set up `noreply@shoppersprint.com` email
3. ⚠️ Generate strong JWT secret: `openssl rand -base64 64`
4. ⚠️ Configure custom domain in Railway

## 🎯 **Deployment Commands**

```bash
# Deploy to staging
npm run env:staging && cp .env.temp .env && railway deploy

# Deploy to production  
npm run env:prod && cp .env.temp .env && railway deploy
```

Your templates are now **Railway-ready**! 🚂
