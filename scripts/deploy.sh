#!/bin/bash

# Simple Production Deployment Script for PricePulse
# This script provides basic deployment functionality without over-engineering

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.prod.yml" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "🚀 Starting PricePulse production deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.production exists
if [ ! -f "backend/.env.production" ]; then
    print_error ".env.production file not found in backend directory"
    print_status "Please create it first with your production credentials"
    exit 1
fi

# Build and deploy
print_status "🏗️ Building production application..."
npm run build:prod

print_status "🐳 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

print_status "⏳ Waiting for services to start..."
sleep 15

print_status "🔍 Checking service status..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "✅ All services are running"
else
    print_error "❌ Some services failed to start"
    print_status "Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

print_success "🎉 Production deployment completed successfully!"
print_status "🌐 Your application should be available at your configured domain"
print_status "📊 Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
