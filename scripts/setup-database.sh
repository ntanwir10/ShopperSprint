#!/bin/bash

# Setup script for Product Price Tracker database
set -e

echo "🚀 Setting up Product Price Tracker Database"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the database services
echo "📦 Starting database containers..."
docker-compose up -d postgres postgres-test redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if databases are accessible
echo "🔍 Checking database connections..."

# Check main database
if docker-compose exec -T postgres pg_isready -U price_tracker_user -d price_tracker > /dev/null 2>&1; then
    echo "✅ Main database is ready"
else
    echo "❌ Main database is not ready. Waiting a bit more..."
    sleep 5
fi

# Check test database
if docker-compose exec -T postgres-test pg_isready -U price_tracker_user -d price_tracker_test > /dev/null 2>&1; then
    echo "✅ Test database is ready"
else
    echo "❌ Test database is not ready. Waiting a bit more..."
    sleep 5
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📋 Connection Details:"
echo "  Main Database: postgresql://price_tracker_user:price_tracker_password@localhost:5432/price_tracker"
echo "  Test Database: postgresql://price_tracker_user:price_tracker_password@localhost:5433/price_tracker_test"
echo "  Redis: redis://localhost:6379"
echo "  pgAdmin: http://localhost:8080 (admin@pricetracker.com / admin123)"
echo ""
echo "🔧 Next steps:"
echo "  1. cd backend"
echo "  2. npm run db:generate"
echo "  3. npm run db:push"
echo "  4. npm run db:seed"
echo ""
echo "🛑 To stop the databases: docker-compose down"
echo "🗑️  To reset the databases: docker-compose down -v"