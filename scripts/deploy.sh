#!/bin/bash
# deploy.sh - Deployment operations
# Replaces: deploy-railway.sh, deploy-production.sh, automate.sh deploy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Railway CLI is installed
check_railway() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
        exit 1
    fi
}

# Railway deployment
railway() {
    print_info "Deploying to Railway..."
    check_railway
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        print_info "Please login to Railway first..."
        railway login
    fi
    
    # Run pre-deployment checks
    print_info "Running pre-deployment checks..."
    ./ci.sh typecheck
    ./ci.sh lint
    ./ci.sh build
    
    # Deploy to Railway
    print_info "Deploying to Railway..."
    railway up
    
    print_success "🚀 Deployed to Railway successfully!"
    
    # Show deployment info
    print_info "Deployment details:"
    railway status
}

# Setup Railway project
setup() {
    print_info "Setting up Railway project..."
    check_railway
    
    # Initialize Railway project
    railway init
    
    # Set environment variables
    print_info "Setting up environment variables..."
    railway variables set NODE_ENV=production
    railway variables set PORT=3001
    
    print_success "Railway project setup complete!"
    print_info "Next steps:"
    echo "1. Set up your database (Supabase recommended)"
    echo "2. Add database URL: railway variables set DATABASE_URL=your-db-url"
    echo "3. Deploy: ./deploy.sh railway"
}

# Show deployment status
status() {
    check_railway
    print_info "Railway deployment status:"
    railway status
}

# Show deployment logs
logs() {
    check_railway
    print_info "Railway deployment logs:"
    railway logs
}

# Show help
help() {
    echo "🚀 Deployment Manager"
    echo ""
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  railway                Deploy to Railway"
    echo "  setup                  Setup Railway project"
    echo "  status                 Show deployment status"
    echo "  logs                   Show deployment logs"
    echo "  help                   Show this help"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh setup      # First-time Railway setup"
    echo "  ./deploy.sh railway    # Deploy to Railway"
    echo "  ./deploy.sh status     # Check deployment status"
}

# Main command handling
case "${1:-help}" in
    railway)
        railway
        ;;
    setup)
        setup
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
