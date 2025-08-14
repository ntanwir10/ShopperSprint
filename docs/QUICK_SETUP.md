# 🚀 Quick Setup Guide

Get PricePulse running on your machine in under 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ntanwir10/pricepulse.git
   cd pricepulse
   ```

## ⚡ One-Command Setup

```bash
# Clone and setup everything
git clone https://github.com/ntanwir10/pricepulse.git
cd pricepulse
npm run setup
npm run dev
```

That's it! 🎉

## 📋 What Just Happened?

The `npm run setup` command automatically:

1. ✅ Installs all dependencies (frontend + backend)
2. ✅ Sets up environment files (copies .env.example to .env)
3. ✅ Starts PostgreSQL + Redis containers
4. ✅ Sets up database schema
5. ✅ Seeds initial data
6. ✅ Configures everything for development

## 🌐 Access Your App

- **Frontend**: <http://localhost:5173>
- **Backend API**: <http://localhost:3001>
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: <http://localhost:8080> (<admin@pricepulse.com> / admin123)

## 🔧 Environment Configuration

The project uses environment files for configuration:

- **`.env.example`**: Template with placeholders (tracked in git)
- **`.env`**: Your actual configuration (ignored by git)

**First time setup:**

```bash
npm run env:setup        # Copies .env.example to .env
# Then edit backend/.env with your real values
```

**Environment variables to configure:**

- Database credentials (host, port, user, password, name)
- Redis URL
- Server port
- Frontend URL for CORS
- API keys (when needed)

## 🔄 Common Commands

### 🚀 Quick Reference

```bash
# Quick start
npm run setup

# Development
npm run dev

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Building
npm run build:prod

# Deployment
npm run deploy

# See all available commands
npm run help
npm run scripts
```

### 🔍 API Monitoring

```bash
# Monitor API health and performance
./scripts/monitor_api.sh

# Options available:
# 1. Test Search API
# 2. Monitor Real-time Health
# 3. Analyze Performance
# 4. Run All Tests
```

### 📋 Detailed Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Environment & Database
npm run env:setup        # Setup environment files
npm run db:reset         # Reset to clean state
npm run db:stop          # Stop databases
npm run db:start         # Start databases only

# Building
npm run build            # Build both apps
npm run test             # Run all tests
```

## 🆘 Troubleshooting

**Database issues?**

```bash
npm run db:reset         # Clean reset
npm run db:setup         # Re-setup
```

**Port conflicts?**

```bash
npm run db:stop          # Stop everything
npm run db:start         # Start fresh
```

**Need clean slate?**

```bash
npm run db:stop:clean    # Remove all data
npm run setup            # Start over
```

## 📚 Next Steps

1. Check out the [main README.md](../README.md) for detailed documentation
2. Explore the [API Reference](API_REFERENCE.md) for backend endpoints
3. Review the [Project Plan](PROJECT_PLAN.md) for architecture details
4. Customize the frontend components
5. Add your own product sources
6. Check out the project on GitHub: [https://github.com/ntanwir10/pricepulse](https://github.com/ntanwir10/pricepulse)

## 🛠️ Available Scripts

The `scripts/` directory contains useful utilities:

- **`monitor_api.sh`** - API health monitoring and performance testing
- **`deploy-production.sh`** - Automated production deployment
- **`setup-database.sh`** - Database initialization and setup
- **`reset-database.sh`** - Database reset utility
- **`setup-env.sh`** - Environment configuration setup

> 💡 **Note**: This is a personal project maintained by a single developer. Feel free to fork and customize it for your own needs!

Happy coding! 🎯
