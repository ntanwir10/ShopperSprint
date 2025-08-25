#!/bin/bash
# shoppersprint.sh - Main Orchestrator for ShopperSprint Development & Deployment
# Smart modular system that provides unified interface to all operations

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULES_DIR="$SCRIPT_DIR/modules"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_command() { echo -e "${CYAN}[COMMAND]${NC} $1"; }

# Load environment variables from .env file
load_env() {
    if [ -f ".env" ]; then
        # Source the .env file to properly handle quoted values
        set -a
        source .env
        set +a
        return 0
    else
        return 1
    fi
}

# Show comprehensive help
show_help() {
    echo "🚀 ShopperSprint - Unified Development & Deployment System"
    echo "=========================================================="
    echo ""
    echo "Usage: ./scripts/shoppersprint.sh [COMMAND] [SERVICE] [OPTIONS]"
    echo ""
    echo "🏗️  DEVELOPMENT COMMANDS:"
    echo "  dev [service]              Start development environment"
    echo "  build [service]            Build application(s)"
    echo "  test [service]             Run tests"
    echo "  validate                   Run all validations"
    echo "  clean [service]            Clean build artifacts"
    echo "  setup                      Setup development environment"
    echo "  deps [command]             Manage dependencies (check/update/audit)"
    echo ""
    echo "🚀 DEPLOYMENT COMMANDS:"
    echo "  deploy [service]           Deploy to Vercel"
    echo "  deploy:full                Quality + build + deploy pipeline"
    echo "  deploy:rollback            Rollback deployment"
    echo "  deploy:status              Check deployment status"
    echo ""
    echo "🔧 SERVICE MANAGEMENT:"
    echo "  start [service]            Start service(s)"
    echo "  stop [service]             Stop service(s)"
    echo "  restart [service]          Restart service(s)"
    echo "  status [service]           Show service status"
    echo "  logs [service]             Show service logs"
    echo ""
    echo "📦 DEPENDENCY MANAGEMENT:"
    echo "  deps:check                 Check for updates"
    echo "  deps:update                Update dependencies"
    echo "  deps:audit                 Security audit"
    echo ""
    echo "✅ QUALITY CHECKS:"
    echo "  quality [type]             Run quality checks (type: deps, full, etc.)"
    echo ""
    echo "🌍 ENVIRONMENT MANAGEMENT:"
echo "  env:switch [env]           Switch environment (dev/production)"
echo "  env:validate               Validate environment configuration"
echo "  env:dev                    Setup development environment (auto-copy + validate)"
echo "  env:prod                   Setup production template (auto-copy + validate)"
echo "  env:production             Switch to production environment (legacy)"
    echo ""
    echo "🛠️  SPECIALIZED UTILITIES:"
    echo "  assets:generate            Generate favicon and assets"
    echo "  dns:check                  Check DNS propagation"
    echo ""
    echo "SERVICES:"
    echo "  all                        All services (default)"
    echo "  frontend                   Frontend React app"
    echo "  backend                    Backend Node.js API"
    echo "  db                         PostgreSQL database"
    echo "  redis                      Redis cache"
    echo ""
    echo "OPTIONS:"
    echo "  --production               Production environment"
    echo "  --force                    Skip validations"
    echo "  --dry-run                  Show what would happen"
    echo ""
    echo "EXAMPLES:"
    echo "  ./scripts/shoppersprint.sh dev                    # Start all services"
    echo "  ./scripts/shoppersprint.sh build frontend         # Build frontend only"
    echo "  ./scripts/shoppersprint.sh build monorepo         # Build all services"
    echo "  ./scripts/shoppersprint.sh deploy backend         # Deploy backend only"
    echo "  ./scripts/shoppersprint.sh deploy:full            # Complete pipeline"
    echo "  ./scripts/shoppersprint.sh start db               # Start database only"
    echo "  ./scripts/shoppersprint.sh setup                  # Setup development environment"
    echo "  ./scripts/shoppersprint.sh deps check             # Check dependencies"
    echo "  ./scripts/shoppersprint.sh quality deps           # Run dependency quality checks"
    echo "  ./scripts/shoppersprint.sh env:switch production  # Switch to production"
echo "  ./scripts/shoppersprint.sh env:production         # Switch to production (legacy)"
echo "  ./scripts/shoppersprint.sh env:dev                # Setup dev environment (auto-copy + validate)"
echo "  ./scripts/shoppersprint.sh env:prod               # Setup production template (auto-copy + validate)"
echo "  ./scripts/shoppersprint.sh env:validate           # Validate environment"

    echo "  ./scripts/shoppersprint.sh dns:check              # Check DNS status"
    echo ""
    echo "SMART FEATURES:"
    echo "  • Automatic service dependency detection"
    echo "  • Intelligent change detection for deployments"
    echo "  • Unified logging and error handling"
    echo "  • Consistent interface across all operations"
}

# Check if modules exist
check_modules() {
    if [ ! -d "$MODULES_DIR" ]; then
        print_error "Modules directory not found: $MODULES_DIR"
        print_info "Creating modules directory and moving scripts..."
        mkdir -p "$MODULES_DIR"
        
        # Move existing scripts to modules
        if [ -f "$SCRIPT_DIR/service-manager.sh" ]; then
            mv "$SCRIPT_DIR/service-manager.sh" "$MODULES_DIR/"
        fi
        if [ -f "$SCRIPT_DIR/monorepo-build.sh" ]; then
            mv "$SCRIPT_DIR/monorepo-build.sh" "$MODULES_DIR/"
        fi
        if [ -f "$SCRIPT_DIR/enhanced-deploy.sh" ]; then
            mv "$SCRIPT_DIR/enhanced-deploy.sh" "$MODULES_DIR/"
        fi
        if [ -f "$SCRIPT_DIR/quality-deploy.sh" ]; then
            mv "$SCRIPT_DIR/quality-deploy.sh" "$MODULES_DIR/"
        fi
        
        print_success "Scripts moved to modules directory"
    fi
}

# Smart service dependency detection
detect_service_dependencies() {
    local service="$1"
    
    case "$service" in
        "frontend")
            # Frontend depends on backend for API calls
            echo "backend"
            ;;
        "backend")
            # Backend depends on database and redis
            echo "db redis"
            ;;
        "websocket")
            # WebSocket is part of backend
            echo "backend"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Smart command routing
route_command() {
    local command="$1"
    local service="${2:-all}"
    local options="${@:3}"
    
    case "$command" in
        # Development commands
        "dev")
            print_command "Starting development environment for $service..."
            if [ "$service" = "all" ]; then
                # Start all services including dev profile (frontend, backend)
                docker-compose --profile dev up -d
                print_info "🚀 Started all services: databases + frontend + backend"
            else
                local deps=$(detect_service_dependencies "$service")
                if [ -n "$deps" ]; then
                    print_info "Starting dependencies: $deps"
                    for dep in $deps; do
                        docker-compose --profile dev up -d "$dep"
                    done
                fi
                docker-compose --profile dev up -d "$service"
            fi
            print_success "Development environment started for $service"
            ;;
            
        "build")
            print_command "Building $service..."
            case "$service" in
                "frontend")
                    cd frontend && npm run build && cd ..
                    ;;
                "backend")
                    cd backend && npm run build && cd ..
                    ;;
                "all"|"monorepo")
                    "$MODULES_DIR/monorepo-build.sh" build full
                    ;;
                *)
                    print_error "Unknown service for building: $service"
                    exit 1
                    ;;
            esac
            print_success "$service built successfully"
            ;;
            
        "test")
            print_command "Testing $service..."
            case "$service" in
                "frontend")
                    cd frontend && npm run test:run && cd ..
                    ;;
                "backend")
                    cd backend && npm test && cd ..
                    ;;
                "all")
                    cd backend && npm test && cd ..
                    cd frontend && npm run test:run && cd ..
                    ;;
                *)
                    print_error "Unknown service for testing: $service"
                    exit 1
                    ;;
            esac
            print_success "$service tested successfully"
            ;;
            
        "validate")
            print_command "Running validations..."
            "$MODULES_DIR/monorepo-build.sh" validate
            ;;
            
        "clean")
            print_command "Cleaning $service..."
            case "$service" in
                "frontend")
                    cd frontend && npm run clean && cd ..
                    ;;
                "backend")
                    cd backend && npm run clean && cd ..
                    ;;
                "all")
                    npm run clean:cache
                    cd frontend && npm run clean && cd ..
                    cd backend && npm run clean && cd ..
                    ;;
                *)
                    print_error "Unknown service for cleaning: $service"
                    exit 1
                    ;;
            esac
            print_success "$service cleaned successfully"
            ;;
            
        "setup")
            print_command "Setting up development environment..."
            "$MODULES_DIR/monorepo-build.sh" setup
            ;;
            
        "deps")
            print_command "Managing dependencies..."
            local deps_command="${2:-check}"
            case "$deps_command" in
                "check") "$MODULES_DIR/monorepo-build.sh" deps check ;;
                "update") "$MODULES_DIR/monorepo-build.sh" deps update ;;
                "audit") "$MODULES_DIR/monorepo-build.sh" deps audit ;;
                *) print_error "Unknown deps command: $deps_command"; exit 1 ;;
            esac
            ;;
            
        # Deployment commands
        "deploy")
            print_command "Deploying $service..."
            "$MODULES_DIR/enhanced-deploy.sh" deploy "$service" "$options"
            ;;
            
        "deploy:full")
            print_command "Running complete deployment pipeline..."
            "$MODULES_DIR/quality-deploy.sh" full
            ;;
            
        "deploy:rollback")
            print_command "Rolling back deployment..."
            "$MODULES_DIR/enhanced-deploy.sh" rollback
            ;;
            
        "deploy:status")
            print_command "Checking deployment status..."
            "$MODULES_DIR/enhanced-deploy.sh" status
            ;;
            
        # Service management commands
        "start"|"stop"|"restart"|"status"|"logs")
            print_command "Service management: $command $service"
            if [ "$service" = "all" ] || [ "$service" = "frontend" ] || [ "$service" = "backend" ]; then
                # Use dev profile for frontend/backend services
                case "$command" in
                    "start")
                        if [ "$service" = "all" ]; then
                            docker-compose --profile dev up -d
                        else
                            docker-compose --profile dev up -d "$service"
                        fi
                        ;;
                    "stop")
                        docker-compose stop "$service"
                        ;;
                    "restart")
                        docker-compose restart "$service"
                        ;;
                    "status")
                        docker-compose --profile dev ps "$service"
                        ;;
                    "logs")
                        docker-compose --profile dev logs "$service"
                        ;;
                esac
            else
                # Use service manager for other services
                "$MODULES_DIR/service-manager.sh" "$command" "$service"
            fi
            ;;
            
        # Dependency management
        "deps:check")
            print_command "Checking dependencies..."
            "$MODULES_DIR/monorepo-build.sh" deps check
            ;;
            
        "deps:update")
            print_command "Updating dependencies..."
            "$MODULES_DIR/monorepo-build.sh" deps update
            ;;
            
        "deps:audit")
            print_command "Running security audit..."
            "$MODULES_DIR/monorepo-build.sh" deps audit
            ;;
            
        # Quality checks
        "quality")
            print_command "Running quality checks..."
            local quality_type="${2:-full}"
            if [ -f "$MODULES_DIR/quality-deploy.sh" ]; then
                "$MODULES_DIR/quality-deploy.sh" quality "$quality_type"
            else
                print_error "quality-deploy.sh not found"
                exit 1
            fi
            ;;
            
        # Environment management
        "env:switch")
            print_command "Switching environment..."
            local env="${2:-production}"
            case $env in
                "development"|"dev")
                    if [ -f ".env.example" ]; then
                        cp .env.example .env
                        print_success "✅ Development environment copied from .env.example"
                        print_info "📝 Edit .env with your local values if needed"
                        print_info "🚀 Ready for local development with Docker"
                    else
                        print_error ".env.example not found"
                        exit 1
                    fi
                    ;;
                "production"|"prod")
                    if [ -f ".env.production" ]; then
                        cp .env.production .env
                        print_success "✅ Production environment template copied to .env"
                        print_info "🚨 IMPORTANT: .env.production is a TEMPLATE for Railway deployment"
                        print_info "📋 Next steps for Railway deployment:"
                        print_info "   1. Copy variables from .env.production to Railway dashboard Variables tab"
                        print_info "   2. Replace REPLACE_WITH_* values with actual production secrets"
                        print_info "   3. Deploy to Railway - it will use Railway's environment variables, not this file"
                        print_info "🔗 Railway Dashboard: https://railway.app/dashboard"
                    else
                        print_error ".env.production not found"
                        exit 1
                    fi
                    ;;
                *)
                    print_error "Unknown environment: $env"
                    print_info "Available environments: development, production"
                    exit 1
                    ;;
            esac
            ;;
            
        "env:validate")
            print_command "Validating environment..."
            if [ -f ".env" ]; then
                # Load environment variables
                if load_env; then
                    print_success "✅ Loaded .env file"
                    
                    # Check required variables
                    local missing_vars=()
                    
                    # Core configuration
                    if [ -z "$NODE_ENV" ]; then missing_vars+=("NODE_ENV"); fi
                    if [ -z "$PORT" ]; then missing_vars+=("PORT"); fi
                    if [ -z "$FRONTEND_URL" ]; then missing_vars+=("FRONTEND_URL"); fi
                    
                    # Database
                    if [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then missing_vars+=("DATABASE_URL or DB_HOST"); fi
                    if [ -z "$DB_PASSWORD" ]; then missing_vars+=("DB_PASSWORD"); fi
                    
                    # Authentication
                    if [ -z "$JWT_SECRET" ]; then missing_vars+=("JWT_SECRET"); fi
                    
                    # Frontend
                    if [ -z "$VITE_API_BASE_URL" ]; then missing_vars+=("VITE_API_BASE_URL"); fi
                    if [ -z "$VITE_BACKEND_URL" ]; then missing_vars+=("VITE_BACKEND_URL"); fi
                    
                    if [ ${#missing_vars[@]} -eq 0 ]; then
                        print_success "🎯 Summary: $NODE_ENV environment ready"
                        print_info "Database: $DB_HOST:$DB_PORT/$DB_NAME"
                        print_info "Frontend: $FRONTEND_URL"
                        print_info "Backend: $VITE_BACKEND_URL"
                    else
                        print_warning "Missing required variables:"
                        for var in "${missing_vars[@]}"; do
                            print_warning "  - $var"
                        done
                    fi
                else
                    print_error "Failed to load .env file"
                    exit 1
                fi
            else
                print_error ".env file not found"
                print_info "Create one from .env.example for development"
                exit 1
            fi
            ;;
            
        "env:dev")
            print_command "Setting up development environment..."
            if [ -f ".env.example" ]; then
                cp .env.example .env
                print_success "✅ Development environment copied from .env.example"
                print_info "📝 Edit .env with your local values if needed"
                print_info "🚀 Ready for local development with Docker"
                
                # Auto-validate after copying
                print_info "🔍 Validating development environment..."
                if load_env; then
                    print_success "✅ Development environment loaded successfully"
                    print_info "🎯 Ready to run: ./scripts/shoppersprint.sh dev"
                else
                    print_error "❌ Failed to load development environment"
                    exit 1
                fi
            else
                print_error ".env.example not found"
                exit 1
            fi
            ;;
            
        "env:prod")
            print_command "Setting up production environment template..."
            if [ -f ".env.production" ]; then
                cp .env.production .env
                print_success "✅ Production environment template copied to .env"
                print_info "🚨 IMPORTANT: .env.production is a TEMPLATE for Vercel deployment"
                print_info "📋 Next steps for Vercel deployment:"
                print_info "   1. Copy variables from .env.production to Vercel dashboard Environment Variables"
                print_info "   2. Replace REPLACE_WITH_* values with actual production secrets"
                print_info "   3. Deploy to Vercel - it will use Vercel's environment variables, not this file"
                print_info "🔗 Vercel Dashboard: https://vercel.com/dashboard"
                
                # Check template structure instead of loading (Vercel vars cause shell errors)
                print_info "🔍 Checking production template structure..."
                if [ -f ".env" ]; then
                    print_success "✅ Production template copied successfully"
                    print_info "📋 Template contains Vercel variable references"
                    print_info "⚠️  Note: This is a template - actual deployment uses Vercel variables"
                    print_info "🎯 Ready to copy variables to Vercel dashboard"
                else
                    print_error "❌ Failed to copy production template"
                    exit 1
                fi
            else
                print_error ".env.production not found"
                exit 1
            fi
            ;;
            
        "env:production")
            print_command "Switching to production environment..."
            if [ -f ".env.production" ]; then
                cp .env.production .env
                print_success "✅ Production environment template copied to .env"
                print_info "🚨 IMPORTANT: .env.production is a TEMPLATE for Vercel deployment"
                print_info "📋 Next steps for Vercel deployment:"
                print_info "   1. Copy variables from .env.production to Vercel dashboard Environment Variables"
                print_info "   2. Replace REPLACE_WITH_* values with actual production secrets"
                print_info "   3. Deploy to Vercel - it will use Vercel's environment variables, not this file"
                print_info "🔗 Vercel Dashboard: https://vercel.com/dashboard"
            else
                print_error ".env.production not found"
                exit 1
            fi
            ;;
            

            
        "assets:generate")
            print_command "Generating assets..."
            print_info "Asset generation - this would create favicons and other assets"
            print_warning "Asset generation functionality needs to be implemented"
            ;;
            
        "dns:check")
            print_command "Checking DNS..."
            print_info "DNS checking - this would verify DNS propagation"
            print_warning "DNS checking functionality needs to be implemented"
            ;;
            
        # Help
        "help"|"--help"|"-h"|"")
            show_help
            ;;
            
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Main execution
main() {
    local command="${1:-help}"
    local service="${2:-all}"
    local options="${@:3}"
    
    # Check and setup modules
    check_modules
    
    # Route command to appropriate handler
    route_command "$command" "$service" "$options"
}

# Run main function
main "$@"
