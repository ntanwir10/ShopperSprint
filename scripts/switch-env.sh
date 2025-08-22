#!/bin/bash

# Environment Switching Script
set -e

ENV=${1:-development}

echo "🔄 Switching to $ENV environment..."

case $ENV in
  "development"|"dev")
    echo "🐳 Development uses local Docker containers"
    echo "✅ Use existing .env file with Docker settings"
    echo "🚀 Start with: npm run dev"
    echo "Database: localhost:5432 (Docker PostgreSQL)"
    echo "Redis: localhost:6379 (Docker Redis)"
    ;;
    
  "staging")
    if [ -f ".env.staging.example" ]; then
      echo "📁 Using staging configuration (Railway)"
      cp .env.staging.example .env.temp
      echo "⚠️  Update .env.temp with Railway staging credentials"
      echo "Database: Railway PostgreSQL (staging)"
      echo "Redis: Railway Redis (staging)"
      echo "URL: https://shoppersprint-staging.railway.app"
    else
      echo "❌ .env.staging.example not found"
      exit 1
    fi
    ;;
    
  "production"|"prod")
    if [ -f ".env.production.example" ]; then
      echo "📁 Using production configuration (Railway)"
      cp .env.production.example .env.temp
      echo "⚠️  Update .env.temp with Railway production credentials"
      echo "Database: Railway PostgreSQL (production)"
      echo "Redis: Railway Redis (production)"
      echo "URL: https://shoppersprint.com"
    else
      echo "❌ .env.production.example not found"
      exit 1
    fi
    ;;
    
  *)
    echo "❌ Unknown environment: $ENV"
    echo "Usage: $0 [development|staging|production]"
    echo ""
    echo "Environments:"
    echo "  development - Local Docker containers"
    echo "  staging     - Railway staging (subdomain)"
    echo "  production  - Railway production (custom domain)"
    exit 1
    ;;
esac

if [ "$ENV" != "development" ] && [ "$ENV" != "dev" ]; then
    echo ""
    echo "🔍 Next steps:"
    echo "1. Review .env.temp file"
    echo "2. Update with your Railway credentials"
    echo "3. Rename to .env when ready"
    echo ""
    echo "📋 Template created: .env.temp"
fi
