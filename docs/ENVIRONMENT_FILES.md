# Environment Files Organization

This document explains the organization and usage of environment files in the ShopperSprint project.

## 📁 **Environment File Structure**

### **Local Development**

- **`.env`** - Your local development environment (gitignored)
- **`.env.example`** - Template for local development (committed to git)

### **Deployment Templates**

- **`.env.production`** - **Template** for Railway production deployment (NOT actual Railway config)

## 🎯 **Usage Guidelines**

### **1. Local Development (`.env` & `.env.example`)**

- **Purpose**: Local development with Docker containers
- **Database**: Local PostgreSQL and Redis instances
- **URLs**: `localhost` and `127.0.0.1` addresses
- **Security**: Development-level secrets (not production-ready)
- **Features**: Development tools enabled (PGAdmin, devtools)

**Example local setup:**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your local values
nano .env
```

### **2. Production Environment (`.env.production`)**

- **Purpose**: **Template** for Railway production deployment
- **Database**: **Template** showing Railway variable references (e.g., `${{Postgres.DATABASE_URL}}`)
- **URLs**: **Template** using Railway variables (e.g., `${{RAILWAY_PUBLIC_DOMAIN}}`)
- **Security**: **Template** with placeholder values (e.g., `REPLACE_WITH_ACTUAL_PRODUCTION_SECRET`)
- **Features**: Production optimizations, monitoring enabled

**⚠️ IMPORTANT**: This file is NOT used by Railway directly. It's a template that shows what variables need to be set in the Railway dashboard.

**Railway deployment process:**
1. Copy variables from `.env.production` to Railway dashboard Variables tab
2. Replace `REPLACE_WITH_*` values with actual production secrets
3. Railway automatically provides `${{Postgres.*}}` and `${{Redis.*}}` values
4. Railway automatically provides `${{RAILWAY_PUBLIC_DOMAIN}}` value
5. Deploy your application



## 🔧 **Environment Switching**

### **🚀 Automated Environment Setup (Recommended)**

The new automated commands handle both copying and validation in one step:

```bash
# Development environment - copies .env.example and validates
./scripts/shoppersprint.sh env:dev

# Production template - copies .env.production and checks structure
./scripts/shoppersprint.sh env:prod
```

**Benefits:**
- **One command** does everything
- **Automatic validation** after copying
- **Clear next steps** for Railway deployment
- **Error handling** if files are missing

### **Using the Unified Script System**

```bash
# Automated environment setup (recommended)
./scripts/shoppersprint.sh env:dev                    # Setup dev environment (auto-copy + validate)
./scripts/shoppersprint.sh env:prod                   # Setup production template (auto-copy + validate)

# Manual environment switching
./scripts/shoppersprint.sh env:switch production      # Switch to production template
./scripts/shoppersprint.sh env:switch development     # Switch to development template

# Validation
./scripts/shoppersprint.sh env:validate               # Validate current environment
```

### **Manual Environment Switching**

```bash
# For local development
cp .env.example .env

# For production deployment (template only)
cp .env.production .env
```

### **Command Comparison**

| Command                  | Purpose                   | Auto-Validate | Best For                    |
| ------------------------ | ------------------------- | ------------- | --------------------------- |
| `env:dev`                | Setup dev environment     | ✅ Yes         | **Daily development**       |
| `env:prod`               | Setup production template | ✅ Yes         | **Railway deployment prep** |
| `env:switch production`  | Copy production template  | ❌ No          | **Quick switching**         |
| `env:switch development` | Copy dev template         | ❌ No          | **Quick switching**         |
| `env:validate`           | Validate only             | ❌ No          | **Troubleshooting**         |

## 🚨 **Critical Railway Deployment Information**

### **How Railway Actually Works**

1. **Railway manages its own environment variables** in the Railway dashboard
2. **Local `.env` files are NOT pushed to Railway** - they're only for local development
3. **Railway environment variables are set separately** via Railway dashboard or CLI
4. **Your local `.env.production` is a TEMPLATE** showing what needs to be set in Railway

### **Railway Variable Syntax**

```bash
# Railway automatically provides these:
${{Postgres.DATABASE_URL}}      # PostgreSQL connection string
${{Postgres.PGHOST}}           # PostgreSQL host
${{Postgres.PGUSER}}           # PostgreSQL username
${{Postgres.PGPASSWORD}}       # PostgreSQL password
${{Postgres.PGDATABASE}}       # PostgreSQL database name
${{Redis.REDIS_URL}}           # Redis connection string
${{RAILWAY_PUBLIC_DOMAIN}}     # Your Railway service domain

# You must set these manually in Railway dashboard:
JWT_SECRET=your_actual_secret
SMTP_PASS=your_actual_password
# ... other secrets
```

### **Railway Deployment Steps**

1. **Create Railway project** and link your GitHub repository
2. **Add PostgreSQL service** to your Railway project
3. **Add Redis service** to your Railway project
4. **Add your application service** to your Railway project
5. **Copy variables from `.env.production`** to Railway dashboard Variables tab
6. **Replace placeholder values** with actual production secrets
7. **Deploy** - Railway will use its own environment variables, not your local files

## 🚨 **Security Considerations**

### **Never Commit Sensitive Data**

- `.env` files contain sensitive information
- Only `.env.example` should be committed to git
- Production secrets should be managed securely in Railway dashboard

### **Secret Management**

- **Local**: Use placeholder values in `.env.example`
- **Production**: Use Railway dashboard Variables tab

## 📋 **Required Environment Variables**

### **Core Configuration**

- `NODE_ENV` - Environment type (development/production)
- `PORT` - Application port
- `FRONTEND_URL` - Frontend application URL

### **Database**

- `DATABASE_URL` - Full database connection string
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### **Authentication**

- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `AUTH_ENABLED` - Enable/disable authentication

### **Email**

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### **Frontend (VITE_*)**

- `VITE_API_BASE_URL` - API endpoint
- `VITE_BACKEND_URL` - Backend service URL
- `VITE_APP_NAME`, `VITE_APP_VERSION`
- `VITE_ENABLE_DEVTOOLS` - Development tools toggle

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Missing .env file**: Copy from `.env.example`
2. **Database connection errors**: Check database credentials and host
3. **CORS issues**: Verify `FRONTEND_URL` matches your frontend
4. **Authentication failures**: Check `JWT_SECRET` and `AUTH_ENABLED`
5. **Railway deployment issues**: Ensure variables are set in Railway dashboard, not just local files

### **Validation Commands**

```bash
# Validate environment configuration
./scripts/shoppersprint.sh env:validate

# Check environment status
./scripts/shoppersprint.sh env:status
```

## 📚 **Additional Resources**

- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Variable Referencing](https://docs.railway.app/guides/variables#referencing-another-services-variable)
- [Docker Compose Environment](https://docs.docker.com/compose/environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
