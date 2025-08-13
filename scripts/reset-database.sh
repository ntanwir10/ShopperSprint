#!/bin/bash

echo "🔄 Resetting PricePulse databases..."

# Stop and remove all containers and volumes
echo "🛑 Stopping and removing containers..."
docker-compose down -v

# Start fresh databases
echo "🐘 Starting fresh databases..."
docker-compose up -d postgres postgres-test redis pgadmin

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Regenerate and push database schema
echo "🗄️ Regenerating database schema..."
cd backend
npm run db:generate
npm run db:push
cd ..

echo "✅ Database reset complete!"
echo ""
echo "🌐 Access your services:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo "   pgAdmin: http://localhost:8080 (admin@pricepulse.com / admin123)"
