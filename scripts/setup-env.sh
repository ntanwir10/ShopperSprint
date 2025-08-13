#!/bin/bash

# Environment Setup Script for PricePulse
# This script sets up the environment files following the correct pattern:
# 1. .env.example contains only placeholders
# 2. .env contains real data (copied from .env.example and then updated)

set -e

echo "🔧 Setting up environment files..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ Error: .env.example file not found in backend directory"
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists"
    read -p "Do you want to overwrite it with .env.example? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. .env file not modified."
        exit 1
    fi
fi

# Copy .env.example to .env
echo "📋 Copying .env.example to .env..."
cp .env.example .env

echo "✅ Environment file setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your actual configuration values"
echo "2. Update the following placeholders with real data:"
echo "   - your_db_host → localhost (for development) or your production DB host"
echo "   - your_db_port → 5432 (for PostgreSQL)"
echo "   - your_db_user → your database username"
echo "   - your_db_password → your database password"
echo "   - your_db_name → your database name"
echo "   - your_redis_url → redis://localhost:6379 (for development) or your Redis URL"
echo "   - your_server_port → 3001 (or your preferred port)"
echo "   - your_node_env → development (or production)"
echo "   - your_frontend_url → http://localhost:5173 (for development) or your domain"
echo ""
echo "🔒 Remember: .env contains sensitive data and should never be committed to git!"
echo "📋 .env.example is tracked in git and serves as a template for other developers."
