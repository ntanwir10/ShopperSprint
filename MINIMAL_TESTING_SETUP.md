# Minimal Testing Setup - Supabase Only

## ✅ What You Need (2 minutes setup):

### 1. Supabase Database
1. Go to: https://supabase.com/
2. Create project: `pricepulse-testing`  
3. Copy connection string from: Settings → Database → Connection String → URI

### 2. Vercel Environment Variables
**Only these 4 variables needed for testing:**

```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
JWT_SECRET=e2bce49dd14f840252d5a6b455c2570fd327691df8ac15fc5c1e52bd7abb47d7a58f1fbe425f9f0e80fd6a132c094000e177fca4e78f70e1d3b949e0c54cc430
NODE_ENV=production  
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## ✅ What Works:
- ✅ Full frontend application
- ✅ Product search functionality
- ✅ API endpoints (/health, /api/search, etc.)
- ✅ Database connectivity
- ✅ Core authentication

## ⚠️ What's Disabled (but app still works):
- ❌ Search result caching (slightly slower)
- ❌ OAuth temporary storage (still works, just less efficient)
- ❌ Performance monitoring metrics
- ❌ Advanced rate limiting

**Perfect for testing all core functionality!**
