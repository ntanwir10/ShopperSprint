#!/bin/bash
# Railway Deployment Script with Environment Template Integration

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

# Environment configuration
ENV=${1:-staging}
COMMAND=${2:-deploy}

# Check Railway CLI
check_railway() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
        exit 1
    fi
}

# Setup environment for deployment
setup_environment() {
    local env=$1
    
    case $env in
        "staging")
            print_info "🎭 Setting up staging environment..."
            if [ -f ".env.staging.example" ]; then
                cp .env.staging.example .env
                print_success "Staging environment configured"
                print_warning "Make sure to generate JWT_SECRET: openssl rand -base64 64"
            else
                print_error "Staging template not found"
                exit 1
            fi
            ;;
            
        "production"|"prod")
            print_info "🚀 Setting up production environment..."
            if [ -f ".env.production.example" ]; then
                cp .env.production.example .env
                print_success "Production environment configured"
                print_warning "Make sure to:"
                print_warning "1. Generate JWT_SECRET: openssl rand -base64 64"
                print_warning "2. Set up noreply@shoppersprint.com email"
                print_warning "3. Configure custom domain in Railway"
            else
                print_error "Production template not found"
                exit 1
            fi
            ;;
            
        *)
            print_error "Unknown environment: $env"
            print_info "Usage: $0 [staging|production] [deploy|status|logs]"
            exit 1
            ;;
    esac
}

# Environment-specific deployment
deploy_environment() {
    local env=$1
    
    print_info "Deploying to $env environment..."
    
    # Setup environment first
    setup_environment $env
    
    # Run tests before deployment
    print_info "Running tests before $env deployment..."
    npm run test
    npm run typecheck
    npm run lint
    
    if [ "$env" = "production" ] || [ "$env" = "prod" ]; then
        print_info "Running additional production tests..."
        npm audit --audit-level high
        npm run build
    fi
    
    # Deploy to Railway
    print_info "Deploying to Railway..."
    railway deploy
    
    print_success "$env deployment completed!"
    
    if [ "$env" = "staging" ]; then
        print_info "Staging URL: Check Railway dashboard for generated domain"
    else
        print_info "Production URL: https://shoppersprint.com"
    fi
}

# Show deployment status
show_status() {
    local env=$1
    print_info "Checking $env deployment status..."
    railway status
}

# Show deployment logs
show_logs() {
    local env=$1
    print_info "Showing $env deployment logs..."
    railway logs
}

# Main execution
main() {
    check_railway
    
    case $COMMAND in
        "deploy")
            deploy_environment $ENV
            ;;
        "status")
            show_status $ENV
            ;;
        "logs")
            show_logs $ENV
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            print_info "Usage: $0 [staging|production] [deploy|status|logs]"
            exit 1
            ;;
    esac
}

# Help message
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "ShopperSprint Railway Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  staging            - Railway staging deployment"
    echo "  production, prod   - Railway production deployment"
    echo ""
    echo "Commands:"
    echo "  deploy            - Deploy to environment (default)"
    echo "  status            - Show deployment status"
    echo "  logs              - Show deployment logs"
    echo ""
    echo "Features:"
    echo "  - Automatically sets up environment from templates"
    echo "  - Runs tests before deployment"
    echo "  - Uses Railway CLI for deployment"
    echo ""
    echo "Examples:"
    echo "  $0 staging         # Deploy to staging"
    echo "  $0 prod deploy     # Deploy to production"
    echo "  $0 staging status  # Check staging status"
    echo "  $0 prod logs       # View production logs"
    echo ""
    echo "Prerequisites:"
    echo "  - Railway CLI installed: npm install -g @railway/cli"
    echo "  - Railway project configured: railway login && railway init"
    echo "  - PostgreSQL and Redis services added to Railway project"
    exit 0
fi

main
