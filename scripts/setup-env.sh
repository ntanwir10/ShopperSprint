#!/bin/bash

# Environment Setup Script for PricePulse
# This script helps set up the environment configuration

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
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "🔧 Setting up PricePulse environment configuration..."

# Check if .env already exists
if [ -f "backend/.env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Keeping existing .env file"
        exit 0
    fi
fi

# Copy the example file
if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    print_success "Created .env from .env.example"
else
    print_error ".env.example not found in backend directory"
    exit 1
fi

print_success "✅ Environment configuration setup complete!"
echo ""
print_status "📋 Next steps:"
print_status "   1. Edit backend/.env with your specific values"
print_status "   2. Set NODE_ENV to 'development' or 'production'"
print_status "   3. Update database credentials if needed"
print_status "   4. Change JWT_SECRET for production use"
echo ""
print_status "🔧 Environment variables explained:"
print_status "   - NODE_ENV: Set to 'development' for local testing, 'production' for production"
print_status "   - DATABASE_URL: Full database connection string (recommended)"
print_status "   - DB_* variables: Individual database settings (alternative)"
print_status "   - MOCK_DATA_ENABLED: Set to 'false' for production, 'true' for development"
echo ""
print_warning "⚠️  Important:"
print_warning "   - Never commit .env files to version control"
print_warning "   - Use .env.example as a template"
print_warning "   - Change JWT_SECRET in production"
