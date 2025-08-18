# Backend environment

Required:

```env
FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=PricePulse <your-email@gmail.com>
```

Notes:

- Gmail requires an App Password (2FA enabled).
- If your SMTP requires SSL on 465, set `SMTP_PORT=465` and `SMTP_SECURE=true`.

## .env files layout

- `backend/.env` (runtime, not committed): backend server, DB, Redis, SMTP, FRONTEND_URL
- `backend/.env.example` (template, committed): placeholders only
- `frontend/.env` or `.env.development` (build-time, not committed): only `VITE_*` keys
- `frontend/.env.example` (template, committed): placeholders only
- Root `.env` (optional): only if your tooling uses it; otherwise omit

## Frontend environment

If not proxying through the dev server, set:

```url
VITE_API_BASE_URL=http://localhost:3001
```

Optional feature flag to hide auth UI while backend auth is disabled:

```env
VITE_AUTH_ENABLED=false
```

## 🔧 Environment Setup Guide

This guide provides comprehensive instructions for setting up the PricePulse development environment. The system works without user authentication and uses email-based management for price alerts.

## 🎯 Overview

PricePulse is a full-stack price tracking application with:

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Tailwind CSS
- **Features**: Anonymous product search, price comparison, and email-based price alerts

## 📋 Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Docker**: Version 20.10.0 or higher
- **Docker Compose**: Version 2.0.0 or higher
- **Git**: Version 2.30.0 or higher

### Optional Software

- **PostgreSQL**: Version 15 or higher (if not using Docker)
- **Redis**: Version 7 or higher (if not using Docker)
- **VS Code**: Recommended editor with TypeScript support
- **Postman**: For API testing

### System Requirements

- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 2GB free space
- **OS**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 18.04+)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ntanwir10/pricepulse.git
cd pricepulse
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Setup Environment

```bash
# Copy environment template
npm run env:setup

# Edit environment variables
# See Environment Variables section below
```

### 4. Start Development Environment

```bash
# Start databases
npm run db:start

# Start application
npm run dev
```

### 5. Verify Setup

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Environment Configuration

### Environment Files Structure

```
pricepulse/
├── .env.example          # Template file (tracked in git)
├── .env                  # Your configuration (ignored by git)
├── backend/
│   ├── .env.example     # Backend template
│   └── .env             # Backend configuration
└── frontend/
    ├── .env.example     # Frontend template
    └── .env             # Frontend configuration
```

### Root Environment (.env)

```env
# Application
NODE_ENV=development
APP_NAME=PricePulse
APP_VERSION=1.0.0

# Frontend
FRONTEND_URL=http://localhost:5173
FRONTEND_PORT=5173

# Backend
BACKEND_URL=http://localhost:3001
BACKEND_PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=pricepulse
DB_PASSWORD=pricepulse123
DB_NAME=pricepulse
DATABASE_URL=postgresql://pricepulse:pricepulse123@localhost:5432/pricepulse

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Email (for anonymous alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pricepulse.com
SMTP_SECURE=false

# Scraping
SCRAPING_DELAY=1000
MAX_CONCURRENT_SCRAPES=3
SCRAPING_TIMEOUT=30000

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
CORS_ORIGIN=http://localhost:5173

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=info
```

### Backend Environment (backend/.env)

```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=pricepulse
DB_PASSWORD=pricepulse123

# Feature flags
# Toggle application authentication routes (/api/auth, /api/notifications)
# false = disabled (anonymous flows only), true = enabled
AUTH_ENABLED=false
```

### Frontend Environment (frontend/.env)

```env
# Application
VITE_APP_NAME=PricePulse
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Track prices, save money, and never overpay again

# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=10000
VITE_API_RETRY_ATTEMPTS=3

# WebSocket Configuration
VITE_WS_URL=ws://localhost:3001/ws
VITE_WS_RECONNECT_INTERVAL=5000
VITE_WS_MAX_RECONNECT_ATTEMPTS=5

# Feature Flags
VITE_ENABLE_ANONYMOUS_ALERTS=true
VITE_ENABLE_PRICE_HISTORY=true
VITE_ENABLE_COMPARISON=true
VITE_ENABLE_REAL_TIME_UPDATES=true

# Analytics (optional)
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_ID=

# Development
VITE_DEV_MODE=true
VITE_MOCK_DATA_ENABLED=true
VITE_HOT_RELOAD=true
```

### Supabase Configuration (optional but recommended)

If you are integrating Supabase (managed Postgres + Auth), add the following variables.

Backend (`backend/.env`):

```env
# Supabase (Authentication + Managed Postgres)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<paste_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<paste_service_role_key>

# Use Supabase Postgres for the application database (staging/prod recommended)
# Replace with your actual connection string from the Supabase dashboard
DATABASE_URL=postgresql://<user>:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

Frontend (`frontend/.env`):

```env
# Supabase client
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<paste_anon_key>
```

Notes:

- Keep Redis for caching/search. Supabase does not replace Redis in this setup.
- When Auth cutover happens, the frontend will use Supabase sessions and the backend middleware will verify Supabase JWTs. See `docs/SUPABASE_INTEGRATION_PLAN.md`.

## 🗄️ Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
npm run db:start

# Check status
docker ps

# View logs
docker logs pricepulse-postgres-1
docker logs pricepulse-redis-1
```

### Manual Setup

#### PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/

# Start service
# macOS
brew services start postgresql@15

# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE USER pricepulse WITH PASSWORD 'pricepulse123';
CREATE DATABASE pricepulse OWNER pricepulse;
GRANT ALL PRIVILEGES ON DATABASE pricepulse TO pricepulse;
\q
```

#### Redis

```bash
# Install Redis
# macOS
brew install redis

# Ubuntu/Debian
sudo apt install redis-server

# Start service
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
```

### Database Initialization

```bash
# Run database setup
npm run db:setup

# Apply migrations
cd backend
npm run db:migrate:apply

# Seed with sample data
npm run db:seed

# Verify setup
npm run db:verify
```

#### Using Supabase (Managed Postgres)

```bash
# 1) Create a Supabase project at https://supabase.com
# 2) In Database settings, copy your connection string (DATABASE_URL)
# 3) Enable extensions (Database » Extensions): pgcrypto, uuid-ossp, pg_trgm
# 4) Point your backend to Supabase DB
export DATABASE_URL="postgresql://<user>:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require"

# 5) Run migrations against Supabase (staging first)
cd backend
npm run db:migrate:apply

# 6) (Optional) Seed development data carefully (avoid on production)
npm run db:seed
```

RLS policies and a `profiles` table are recommended when using Supabase Auth. See `docs/SUPABASE_INTEGRATION_PLAN.md` for schema and policy guidance.

## 📧 Email Service Setup

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**
   - Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "PricePulse" as name
   - Copy the generated password

3. **Update Environment Variables**

   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   ```

### Other SMTP Providers

#### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

#### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### Test Email Configuration

```bash
# Test email service
cd backend
npm run test:email

# Or test via API
curl -X POST http://localhost:3001/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "PricePulse Test",
    "body": "This is a test email from PricePulse"
  }'
```

## 🔧 Development Tools Setup

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-json-language-features",
    "ms-vscode.vscode-json-language-server",
    "ms-vscode.vscode-json-language-service",
    "ms-vscode.vscode-json-language-support",
    "ms-vscode.vscode-json-languageserver",
    "ms-vscode.vscode-json-languageservice",
    "ms-vscode.vscode-json-languagesupport",
    "ms-vscode.vscode-json-languageserver",
    "ms-vscode.vscode-json-languageservice",
    "ms-vscode.vscode-json-languagesupport"
  ]
}
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Git Hooks

```bash
# Install Husky
npm run install:hooks

# Verify hooks
ls -la .git/hooks/

# Test pre-commit
npm run pre-commit
```

## 🧪 Testing Environment

### Test Database

```bash
# Create test database
createdb pricepulse_test

# Update test environment
# backend/.env.test
NODE_ENV=test
DATABASE_URL=postgresql://pricepulse:pricepulse123@localhost:5432/pricepulse_test
REDIS_URL=redis://localhost:6379/1
```

### Test Configuration

```typescript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:watch
npm run test:coverage

# Frontend tests
cd frontend
npm run test
npm run test:watch
npm run test:coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚀 Production Environment

### Environment Variables

```env
# Production environment
NODE_ENV=production
APP_ENV=production

# Database (use production database)
DATABASE_URL=postgresql://user:pass@prod-host:5432/pricepulse
REDIS_URL=redis://prod-host:6379

# Email (use production SMTP)
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=prod-email@domain.com
SMTP_PASS=prod-password

# Security
JWT_SECRET=super-secure-production-secret
SESSION_SECRET=super-secure-production-session-secret

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false

# Performance
ENABLE_CACHING=true
CACHE_TTL=900
ENABLE_COMPRESSION=true
```

Add Supabase variables for production if adopting Supabase:

```env
# Supabase (Auth + Managed Postgres)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<prod_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<prod_service_role_key>

# Prefer Supabase connection for production database
DATABASE_URL=postgresql://<user>:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

### Production Database

#### Supabase (Managed Postgres & Auth)

1. Create project at `https://supabase.com`.
2. Enable required extensions: `pgcrypto`, `uuid-ossp`, `pg_trgm`.
3. Copy the connection string from the dashboard.
4. Update environment variables:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<prod_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<prod_service_role_key>
DATABASE_URL=postgresql://<user>:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

5. Run migrations against Supabase (staging first), then production.
6. Configure RLS and policies per `docs/SUPABASE_INTEGRATION_PLAN.md`.

#### NeonDB (PostgreSQL as a Service)

1. **Create Account**: Sign up at [neon.tech](https://neon.tech)
2. **Create Project**: New project with PostgreSQL 15
3. **Get Connection String**: Copy from dashboard
4. **Update Environment**:

   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/pricepulse?sslmode=require
   ```

#### AWS RDS

1. **Create RDS Instance**: PostgreSQL 15, t3.micro for development
2. **Configure Security Groups**: Allow access from your application
3. **Get Connection String**:

   ```env
   DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/pricepulse
   ```

### Production Redis

#### Redis Cloud

1. **Create Account**: Sign up at [redis.com](https://redis.com)
2. **Create Database**: Free tier available
3. **Get Connection String**:

   ```env
   REDIS_URL=redis://user:pass@host:port
   ```

#### AWS ElastiCache

1. **Create ElastiCache Cluster**: Redis 7, t3.micro
2. **Configure Security Groups**: Allow access from your application
3. **Get Connection String**:

   ```env
   REDIS_URL=redis://your-elasticache-endpoint:6379
   ```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs pricepulse-postgres-1

# Test connection
psql -h localhost -U pricepulse -d pricepulse -c "SELECT 1;"

# Reset database
npm run db:reset
npm run db:setup
```

#### Redis Connection Failed

```bash
# Check if Redis is running
docker ps | grep redis

# Check logs
docker logs pricepulse-redis-1

# Test connection
redis-cli ping

# Reset Redis
docker stop pricepulse-redis-1
docker rm pricepulse-redis-1
npm run db:start
```

#### Email Not Sending

```bash
# Check SMTP configuration
cd backend
npm run test:email

# Verify environment variables
echo $SMTP_HOST
echo $SMTP_USER
echo $SMTP_PASS

# Test with different provider
# Try Gmail app password instead of regular password
```

#### Frontend Build Issues

```bash
# Clear node_modules
rm -rf frontend/node_modules
rm -rf frontend/package-lock.json

# Reinstall dependencies
cd frontend
npm install

# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint
```

### Performance Issues

#### Database Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Redis Performance

```bash
# Check Redis memory usage
redis-cli info memory

# Check Redis keys
redis-cli keys "*" | wc -l

# Monitor Redis commands
redis-cli monitor
```

### Log Analysis

```bash
# Backend logs
cd backend
npm run logs

# Docker logs
docker logs pricepulse-backend-1 -f
docker logs pricepulse-frontend-1 -f

# Application logs
tail -f logs/app.log
tail -f logs/error.log
```

## 📚 Additional Resources

### Documentation

- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Project Plan](PROJECT_PLAN.md)** - Architecture and roadmap
- **[Development Workflow](DEVELOPMENT_WORKFLOW.md)** - Development process

### External Resources

- **[Node.js Documentation](https://nodejs.org/docs/)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**
- **[Redis Documentation](https://redis.io/documentation)**
- **[Docker Documentation](https://docs.docker.com/)**
- **[TypeScript Documentation](https://www.typescriptlang.org/docs/)**

### Community

- **[GitHub Issues](https://github.com/ntanwir10/pricepulse/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/ntanwir10/pricepulse/discussions)** - Ask questions
- **[GitHub Wiki](https://github.com/ntanwir10/pricepulse/wiki)** - Community documentation

## 🔄 Environment Management Commands

### Quick Commands

```bash
# Environment setup
npm run env:setup          # Copy .env.example to .env
npm run env:dev            # Switch to development
npm run env:prod           # Switch to production
npm run env:status         # Check current environment

# Database management
npm run db:start           # Start databases
npm run db:stop            # Stop databases
npm run db:setup           # Setup databases
npm run db:reset           # Reset databases
npm run db:seed            # Seed with sample data

# Application management
npm run dev                # Start development environment
npm run build              # Build for production
npm run start              # Start production server
npm run test               # Run all tests
npm run lint               # Check code quality
```

### Environment Switching

```bash
# Development environment
npm run env:dev
npm run db:start
npm run dev

# Production environment
npm run env:prod
npm run build
npm run start

# Test environment
npm run env:test
npm run test
```

This environment setup guide ensures you have everything needed to develop and run PricePulse successfully.
