#!/bin/bash

echo "🚀 Setting up PricePulse development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Start databases
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d postgres postgres-test redis pgadmin

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Install backend dependencies if not already installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Generate and push database schema
echo "🗄️ Setting up database schema..."
cd backend
npm run db:generate
npm run db:push
cd ..

# Install frontend dependencies if not already installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your services:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo "   pgAdmin: http://localhost:8080 (admin@pricepulse.com / admin123)"
echo ""
echo "🚀 Start development with: npm run dev"
