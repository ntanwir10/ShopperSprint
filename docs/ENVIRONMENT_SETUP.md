# Environment Setup Guide

This guide will help you set up the development environment for PricePulse.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Quick Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ntanwir10/pricepulse.git
   cd pricepulse
   ```

2. **Run the environment setup script**

   ```bash
   npm run env:setup
   ```

   This copies `.env.example` to `.env`

3. **Complete the setup**

   ```bash
   npm run setup
   ```

### Environment Switching

```bash
# Show current environment
npm run env:status

# Switch to development (Docker)
npm run env:dev

# Switch to production (NeonDB)
npm run env:prod

# Get help
npm run env:help
```

## 🔧 Environment Variables

### Database Configuration

```env
# Development (Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USER=pricepulse
DB_PASSWORD=pricepulse123
DB_NAME=pricepulse

# Production (NeonDB)
DATABASE_URL=postgresql://user:password@host/database
```

### Redis Configuration

```env
# Development
REDIS_URL=redis://localhost:6379

# Production
REDIS_URL=redis://your-redis-host:6379
```

### Server Configuration

```env
PORT=3001
NODE_ENV=development  # or production
FRONTEND_URL=http://localhost:5173
```

### Scraping Configuration

```env
SCRAPING_DELAY=1000
MAX_CONCURRENT_SCRAPES=3
SCRAPING_TIMEOUT=30000
```

## 🐳 Development Environment (Docker)

### Features

- **Database**: Local PostgreSQL via Docker
- **Cache**: Local Redis via Docker
- **Configuration**: `.env.development` or `.env`
- **Start Command**: `npm run dev:docker`

### Setup

```bash
# Start databases
npm run db:start

# Start backend
npm run dev:docker

# Start frontend (new terminal)
npm run dev:frontend
```

## ☁️ Production Environment (NeonDB)

### Features

- **Database**: NeonDB PostgreSQL (serverless)
- **Cache**: Production Redis (AWS ElastiCache, Redis Cloud, etc.)
- **Configuration**: `.env.production`
- **Start Command**: `npm run dev:neon` (dev) or `npm run start:production`

### Setup

1. **Sign up for NeonDB** at [neon.tech](https://neon.tech)
2. **Create new project** and get connection details
3. **Update `.env.production`** with your credentials
4. **Switch environment**: `npm run env:prod`
5. **Run migrations**: `npm run db:migrate`
6. **Test connection**: `npm run dev:neon`

## 🔒 Security Best Practices

### ✅ DO

- Keep `.env.example` updated with all required variables
- Use descriptive placeholder names
- Document what each variable is for
- Run `npm run env:setup` for new environments

### ❌ DON'T

- Never commit `.env` files with real data
- Never commit `.env.production` files
- Never hardcode secrets in source code
- Never share your `.env` file contents

## 🛠️ Available Commands

```bash
# Environment setup
npm run env:setup        # Copy .env.example to .env

# Environment switching
npm run env:status       # Show current environment
npm run env:dev          # Switch to development
npm run env:prod         # Switch to production

# Complete project setup
npm run setup            # Install + env setup + database setup

# Individual setup steps
npm run install:all      # Install dependencies only
npm run db:setup         # Database setup only
```

## 🔄 Migration Path

### From Docker to NeonDB

1. **Sign up for NeonDB** and create project
2. **Update `.env.production`** with credentials
3. **Switch environment**: `npm run env:prod`
4. **Run migrations**: `npm run db:migrate`
5. **Test connection**: `npm run dev:neon`

### From NeonDB to Self-Hosted

1. **Export data** from NeonDB
2. **Set up PostgreSQL** on your server
3. **Create new `.env`** with server details
4. **Import data** to new database
5. **Update environment** variables

## 🚨 Troubleshooting

### Common Issues

1. **SSL Connection Errors**
   - Ensure `NODE_ENV=production` is set
   - Check NeonDB host accessibility

2. **Environment Not Switching**
   - Verify script permissions: `chmod +x scripts/switch-env.sh`
   - Check file paths and existence

3. **Database Connection Failures**
   - Verify environment variables
   - Check network connectivity
   - Validate NeonDB credentials

### Debug Commands

```bash
# Check current environment
npm run env:status

# Verify database connection
cd backend && npm run dev:neon

# Check environment file
cat backend/.env | grep NODE_ENV

# Test database directly
cd backend && npm run db:studio
```

## 📁 File Structure

```tree
pricepulse/
├── backend/
│   ├── .env                    # Current environment (auto-switched)
│   ├── .env.development       # Docker development config
│   ├── .env.production        # NeonDB production config
│   ├── .env.example           # Template for new environments
│   └── src/database/
│       └── connection.ts      # Enhanced connection logic
├── scripts/
│   └── switch-env.sh          # Environment switching script
└── docs/
    ├── ENVIRONMENT_SETUP.md   # This document
    └── NEONDB_SETUP.md        # Detailed NeonDB setup
```

## 🎯 Next Steps

### Immediate Actions

1. **Test environment switching**: `npm run env:status`
2. **Verify Docker setup**: `npm run db:start`
3. **Test development mode**: `npm run dev:docker`

### When Ready for Production

1. **Sign up for NeonDB** and create project
2. **Configure `.env.production`** with credentials
3. **Test production connection**: `npm run dev:neon`
4. **Deploy to production** platform

## 📚 Related Documentation

- **[Quick Setup Guide](QUICK_SETUP.md)** - Quick start guide
- **[Development Workflow](DEVELOPMENT_WORKFLOW.md)** - Daily development workflow
- **[NeonDB Setup](NEONDB_SETUP.md)** - Complete NeonDB setup guide
- **[README.md](../README.md)** - Main project documentation
