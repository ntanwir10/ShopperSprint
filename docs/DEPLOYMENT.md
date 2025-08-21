# 🚀 Deployment Guide

## Quick Railway Deployment

**Recommended for getting started:**

```bash
# 1. Setup Railway project
npm run deploy:setup

# 2. Deploy to Railway
npm run deploy
```

## Deployment Strategy

### Phase 1: Railway Free (0-3 months)
- **Cost**: $0/month
- **Perfect for**: Validation, beta testing
- **Limitations**: App sleeps after 30min, slower cold starts

### Phase 2: Railway Paid (3-12 months)  
- **Cost**: $5-25/month
- **Perfect for**: Real users, 24/7 uptime
- **Features**: No sleep, custom domains, better performance

### Phase 3: VPS Migration (12+ months)
- **Cost**: $5-15/month (Hostinger VPS)
- **Perfect for**: Cost optimization, full control
- **When**: Railway costs exceed $25/month consistently

## Railway Setup

### First Time Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
npm run deploy:setup
```

### Environment Variables

Set these in Railway dashboard:

```bash
# Required
NODE_ENV=production
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
JWT_SECRET=your-jwt-secret

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Options

**Option 1: Supabase (Recommended)**
- Free tier: 500MB database
- Pro tier: $25/month for 8GB
- Includes auth, real-time features
- Easy Railway integration

**Option 2: Railway PostgreSQL**
- Add PostgreSQL service in Railway
- More expensive but fully integrated
- Automatic backups included

## Deployment Process

### Pre-deployment Checks
```bash
# Run quality checks
npm run ci

# Verify build works
npm run build

# Check environment variables
railway variables
```

### Deploy
```bash
# Deploy to Railway
npm run deploy

# Check deployment status
npm run deploy:status

# View deployment logs
npm run deploy:logs
```

### Post-deployment
```bash
# Test the deployed app
curl https://your-app.railway.app/health

# Check all endpoints work
# Test user registration/login
# Verify database connections
```

## Custom Domain

### Setup Custom Domain
1. Go to Railway dashboard → Settings → Domains
2. Add your domain (e.g., `shoppersprint.com`)
3. Update DNS records as shown
4. SSL certificate auto-generated

### DNS Configuration
```
Type: CNAME
Name: @
Value: your-app.railway.app
```

## Monitoring

### Railway Dashboard
- View logs, metrics, deployments
- Monitor CPU, memory usage
- Set up alerts for downtime

### Health Checks
```bash
# Check app health
curl https://your-app.railway.app/health

# Monitor from local
npm run deploy:status
npm run deploy:logs
```

## Scaling

### Automatic Scaling
- Railway auto-scales based on traffic
- No configuration needed
- Pay only for what you use

### Manual Scaling
- Upgrade Railway plan when needed
- Monitor costs in Railway dashboard
- Consider VPS migration at $25+/month

## Troubleshooting

### Build Failures
```bash
# Check build logs
npm run deploy:logs

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues
```

### Runtime Errors
```bash
# Check application logs
railway logs

# Common issues:
# - Database connection errors
# - Missing environment variables
# - Port configuration issues
```

### Performance Issues
```bash
# Monitor in Railway dashboard
# Check response times
# Monitor memory usage
# Consider upgrading plan
```

## Cost Optimization

### Railway Cost Management
- Monitor usage in dashboard
- Set spending limits
- Use free tier for development
- Upgrade only when needed

### Migration to VPS
**When Railway costs exceed $25/month:**

1. **Setup Hostinger VPS** ($5-15/month)
2. **Use existing Docker configuration**
3. **Migrate database and deploy**
4. **Update DNS to point to VPS**

## Backup Strategy

### Database Backups
- Supabase: Automatic backups included
- Railway PostgreSQL: Automatic backups
- Manual backups: Export via dashboard

### Code Backups
- Git repository is your backup
- Tag releases: `git tag v1.0.0`
- Keep deployment configs in repo

## Security

### Environment Variables
- Never commit secrets to git
- Use Railway's environment variables
- Rotate secrets regularly

### SSL/HTTPS
- Railway provides automatic SSL
- Custom domains get free SSL
- All traffic encrypted

### Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access

## Future Scaling Options

### Enterprise Features (Future)
- **AWS Migration**: When you need enterprise features
- **Multi-region deployment**: For global users  
- **Advanced monitoring**: Custom metrics and alerts
- **Auto-scaling**: Based on custom metrics

### Cost Comparison
| Users | Railway | VPS | AWS |
|-------|---------|-----|-----|
| 0-1K | $0-25 | $60/year | $600/year |
| 1K-10K | $25-100 | $120/year | $1200/year |
| 10K+ | $100+ | $300/year | $2400+/year |

## Next Steps

1. **Deploy to Railway free tier** for validation
2. **Add custom domain** when ready for users
3. **Monitor costs** and upgrade as needed
4. **Consider VPS migration** when costs justify it

For detailed VPS migration guide, see the [complete deployment strategy document](deployment/COMPLETE_DEPLOYMENT_STRATEGY.md).
