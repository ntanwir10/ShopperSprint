#!/bin/bash
# monorepo-build.sh - Comprehensive Monorepo Build System for ShopperSprint
# Handles complete build pipeline with validations, database setup, and dependency management

set -e

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
print_build() { echo -e "${CYAN}[BUILD]${NC} $1"; }
print_validation() { echo -e "${PURPLE}[VALIDATION]${NC} $1"; }

# Show help
show_help() {
    echo "🏗️  ShopperSprint Monorepo Build System"
    echo "======================================="
    echo ""
    echo "Usage: ./scripts/monorepo-build.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build [type]           Build monorepo (type: full, frontend, backend, production)"
    echo "  validate               Run all validations (types, lint, test, deps)"
    echo "  setup                  Setup development environment (db, migrations, seed)"
    echo "  clean                  Clean all build artifacts and caches"
    echo "  deps                   Manage dependencies (check, update, audit)"
    echo "  help                   Show this help"
    echo ""
    echo "Build Types:"
    echo "  full                   Complete monorepo build with all validations"
    echo "  frontend               Build only frontend"
    echo "  backend                Build only backend"
    echo "  production             Production build with optimizations"
    echo ""
    echo "Examples:"
    echo "  ./scripts/monorepo-build.sh build full        # Complete build with validations"
    echo "  ./scripts/monorepo-build.sh build frontend    # Build only frontend"
    echo "  ./scripts/monorepo-build.sh validate          # Run all validations"
    echo "  ./scripts/monorepo-build.sh setup             # Setup development environment"
    echo "  ./scripts/monorepo-build.sh deps check        # Check dependencies"
    echo ""
    echo "Build Pipeline:"
    echo "  1. Environment validation"
    echo "  2. Dependency checks and updates"
    echo "  3. Code validation (types, lint, test)"
    echo "  4. Database setup and migrations"
    echo "  5. Service building"
    echo "  6. Integration testing"
    echo "  7. Production optimization (if applicable)"
}

# Check prerequisites
check_prerequisites() {
    print_validation "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose not found"
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Clean build artifacts
clean_build_artifacts() {
    print_build "Cleaning build artifacts and caches..."
    
    # Clean root
    npm run clean:cache
    
    # Clean frontend
    cd frontend && npm run clean && cd ..
    
    # Clean backend
    cd backend && npm run clean && cd ..
    
    # Remove additional build artifacts
    rm -rf dist/ build/ .next/ .nuxt/ .output/
    
    print_success "Build artifacts cleaned!"
}

# Check and update dependencies
manage_dependencies() {
    local action="${1:-check}"
    
    case "$action" in
        "check")
            print_validation "Checking dependencies..."
            
            print_info "Root dependencies:"
            npm outdated || true
            
            print_info "Frontend dependencies:"
            cd frontend && npm outdated || true && cd ..
            
            print_info "Backend dependencies:"
            cd backend && npm outdated || true && cd ..
            
            print_info "Security audit:"
            npm audit --audit-level moderate || true
            cd backend && npm audit --audit-level moderate || true && cd ..
            cd frontend && npm audit --audit-level moderate || true && cd ..
            
            print_success "Dependency check completed!"
            ;;
        "update")
            print_validation "Updating dependencies..."
            
            print_info "Updating root dependencies..."
            npm update
            
            print_info "Updating frontend dependencies..."
            cd frontend && npm update && cd ..
            
            print_info "Updating backend dependencies..."
            cd backend && npm update && cd ..
            
            print_success "Dependencies updated!"
            ;;
        "audit")
            print_validation "Running security audit..."
            
            npm audit --audit-level moderate || true
            cd backend && npm audit --audit-level moderate || true && cd ..
            cd frontend && npm audit --audit-level moderate || true && cd ..
            
            print_success "Security audit completed!"
            ;;
        *)
            print_error "Unknown dependency action: $action"
            exit 1
            ;;
    esac
}

# Run code validations
run_validations() {
    print_validation "Running code validations..."
    
    # Type checking
    print_info "Type checking frontend..."
    cd frontend && npm run type-check && cd ..
    
    print_info "Type checking backend..."
    cd backend && npm run type-check && cd ..
    
    # Linting
    print_info "Linting frontend..."
    cd frontend && npm run lint && cd ..
    
    print_info "Linting backend..."
    cd backend && npm run lint && cd ..
    
    # Testing
    print_info "Testing backend..."
    cd backend && npm test && cd ..
    
    print_info "Testing frontend..."
    cd frontend && npm run test:run && cd ..
    
    print_success "All validations passed!"
}

# Setup development environment
setup_environment() {
    print_build "Setting up development environment..."
    
    # Start database services
    print_info "Starting database services..."
    local dc=$(get_docker_compose)
    $dc up -d postgres redis
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    print_info "Running database migrations..."
    cd backend && npm run db:migrate && cd ..
    
    # Seed database if needed
    if [ -f "backend/src/database/seed.ts" ]; then
        print_info "Seeding database..."
        cd backend && npm run db:seed && cd ..
    fi
    
    print_success "Development environment setup completed!"
}

# Get Docker Compose command
get_docker_compose() {
    if docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

# Build frontend
build_frontend() {
    local production="$1"
    
    print_build "Building frontend..."
    cd frontend
    
    if [ "$production" = "true" ]; then
        print_info "Building frontend for production..."
        npm run build
    else
        print_info "Building frontend for development..."
        npm run build
    fi
    
    cd ..
    print_success "Frontend built successfully!"
}

# Build backend
build_backend() {
    local production="$1"
    
    print_build "Building backend..."
    cd backend
    
    if [ "$production" = "true" ]; then
        print_info "Building backend for production..."
        npm run build
    else
        print_info "Building backend for development..."
        npm run build
    fi
    
    cd ..
    print_success "Backend built successfully!"
}

# Build monorepo
build_monorepo() {
    local build_type="${1:-full}"
    
    case "$build_type" in
        "full")
            print_build "Building complete monorepo..."
            
            # Run validations
            run_validations
            
            # Setup environment
            setup_environment
            
            # Build services
            build_frontend "false"
            build_backend "false"
            
            print_success "Complete monorepo build finished!"
            ;;
        "frontend")
            print_build "Building frontend only..."
            build_frontend "false"
            ;;
        "backend")
            print_build "Building backend only..."
            build_backend "false"
            ;;
        "production")
            print_build "Building for production..."
            
            # Run validations
            run_validations
            
            # Build with production optimizations
            build_frontend "true"
            build_backend "true"
            
            print_success "Production build completed!"
            ;;
        *)
            print_error "Unknown build type: $build_type"
            show_help
            exit 1
            ;;
    esac
}

# Main command handling
main() {
    local command="${1:-help}"
    local option="${2:-}"
    
    case "$command" in
        "build")
            build_monorepo "$option"
            ;;
        "validate")
            run_validations
            ;;
        "setup")
            setup_environment
            ;;
        "clean")
            clean_build_artifacts
            ;;
        "deps")
            manage_dependencies "$option"
            ;;
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

# Check prerequisites before running
check_prerequisites

# Run main function
main "$@"
