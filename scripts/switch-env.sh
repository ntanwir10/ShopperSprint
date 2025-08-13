#!/bin/bash

# Environment Switching Script for PricePulse
# This script allows you to switch between different environment configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Function to show current environment
show_current_env() {
    if [ -f "backend/.env" ]; then
        ENV_TYPE=$(grep "NODE_ENV=" backend/.env | cut -d'=' -f2 || echo "development")
        print_status "Current environment: $ENV_TYPE"
        
        if [ "$ENV_TYPE" = "production" ]; then
            DB_HOST=$(grep "DB_HOST=" backend/.env | cut -d'=' -f2 || echo "not set")
            print_status "Database host: $DB_HOST"
        else
            print_status "Database: Docker PostgreSQL (localhost:5432)"
        fi
    else
        print_warning "No .env file found in backend directory"
    fi
}

# Function to switch to development (Docker)
switch_to_dev() {
    print_header "Switching to Development Environment (Docker)"
    
    if [ -f "backend/.env.development" ]; then
        cp backend/.env.development backend/.env
        print_status "Copied .env.development to .env"
    else
        print_warning ".env.development not found, using default development config"
        # Create basic development .env
        cat > backend/.env << EOF
# Development Environment (Docker)
NODE_ENV=development

# Database Configuration (Docker PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=pricepulse
DB_PASSWORD=pricepulse123
DB_NAME=pricepulse
DATABASE_URL=postgresql://pricepulse:pricepulse123@localhost:5432/pricepulse

# Redis Configuration (Docker)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Scraping Configuration
SCRAPING_DELAY=1000
MAX_CONCURRENT_SCRAPES=3
SCRAPING_TIMEOUT=30000
EOF
        print_status "Created default development .env file"
    fi
    
    print_status "Environment switched to development (Docker)"
    print_status "Start databases with: npm run db:start"
    print_status "Start backend with: npm run dev:docker"
}

# Function to switch to production (NeonDB)
switch_to_prod() {
    print_header "Switching to Production Environment (NeonDB)"
    
    if [ -f "backend/.env.production" ]; then
        cp backend/.env.production backend/.env
        print_status "Copied .env.production to .env"
        
        # Check if NeonDB credentials are configured
        if grep -q "your-neon-host" backend/.env; then
            print_warning "NeonDB credentials not configured yet!"
            print_warning "Please update .env.production with your actual NeonDB credentials"
            print_warning "Then run this script again"
            exit 1
        fi
        
        print_status "Environment switched to production (NeonDB)"
        print_status "Start backend with: npm run start:production"
        
    else
        print_error ".env.production not found!"
        print_status "Please create .env.production with your NeonDB credentials first"
        print_status "See NEONDB_SETUP.md for detailed instructions"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev, development    Switch to development environment (Docker)"
    echo "  prod, production    Switch to production environment (NeonDB)"
    echo "  status             Show current environment status"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev             # Switch to development"
    echo "  $0 production      # Switch to production"
    echo "  $0 status          # Show current environment"
}

# Main script logic
case "${1:-status}" in
    "dev"|"development")
        switch_to_dev
        ;;
    "prod"|"production")
        switch_to_prod
        ;;
    "status")
        show_current_env
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
print_status "Environment switch completed!"
show_current_env
