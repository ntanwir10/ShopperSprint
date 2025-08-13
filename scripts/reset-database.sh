#!/bin/bash

# Reset script for Product Price Tracker database
set -e

echo "🔄 Resetting Product Price Tracker Database"
echo "==========================================="

# Stop and remove containers with volumes
echo "🛑 Stopping and removing database containers..."
docker-compose down -v

# Remove any orphaned containers
docker-compose rm -f

echo "🧹 Cleaning up Docker volumes..."
docker volume prune -f

# Start fresh containers
echo "🚀 Starting fresh database containers..."
docker-compose up -d postgres postgres-test redis

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

echo "✅ Database reset complete!"
echo ""
echo "🔧 Next steps:"
echo "  1. cd backend"
echo "  2. npm run db:generate"
echo "  3. npm run db:push"
echo "  4. npm run db:seed"