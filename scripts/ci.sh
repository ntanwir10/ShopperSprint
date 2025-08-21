#!/bin/bash
# ci.sh - Code quality and testing
# Replaces: local-ci.sh and all testing scripts

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

# Type checking
typecheck() {
    print_info "Running type checking..."
    
    print_info "Checking frontend types..."
    cd frontend && npm run type-check
    
    print_info "Checking backend types..."
    cd ../backend && npm run type-check
    cd ..
    
    print_success "Type checking passed!"
}

# Linting
lint() {
    local fix="$1"
    
    if [[ "$fix" == "fix" ]]; then
        print_info "Running linting with auto-fix..."
        cd frontend && npm run lint:fix
        cd ../backend && npm run lint:fix
        cd ..
        print_success "Linting fixed!"
    else
        print_info "Running linting..."
        cd frontend && npm run lint
        cd ../backend && npm run lint
        cd ..
        print_success "Linting passed!"
    fi
}

# Testing
test() {
    local coverage="$1"
    
    print_info "Running tests..."
    
    if [[ "$coverage" == "coverage" ]]; then
        print_info "Running tests with coverage..."
        cd backend && npm run test:coverage
        cd ../frontend && npm run test:coverage
        cd ..
        print_success "Tests with coverage completed!"
    else
        print_info "Running tests..."
        cd backend && npm run test
        cd ../frontend && npm run test:run
        cd ..
        print_success "Tests passed!"
    fi
}

# Build verification
build() {
    print_info "Building applications..."
    
    print_info "Building frontend..."
    cd frontend && npm run build
    
    print_info "Building backend..."
    cd ../backend && npm run build
    cd ..
    
    print_success "Build completed!"
}

# Full CI pipeline
full() {
    print_info "Running full CI pipeline..."
    
    typecheck
    lint
    test
    build
    
    print_success "🎉 Full CI pipeline completed successfully!"
}

# Show help
help() {
    echo "🧪 Code Quality & Testing Manager"
    echo ""
    echo "Usage: ./ci.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  typecheck              Run TypeScript type checking"
    echo "  lint [fix]             Run linting (optionally with auto-fix)"
    echo "  test [coverage]        Run tests (optionally with coverage)"
    echo "  build                  Build applications"
    echo "  full                   Run complete CI pipeline"
    echo "  help                   Show this help"
    echo ""
    echo "Examples:"
    echo "  ./ci.sh typecheck      # Check types only"
    echo "  ./ci.sh lint fix       # Run linting with auto-fix"
    echo "  ./ci.sh test coverage  # Run tests with coverage"
    echo "  ./ci.sh full           # Run everything"
}

# Main command handling
case "${1:-help}" in
    typecheck)
        typecheck
        ;;
    lint)
        lint "$2"
        ;;
    test)
        test "$2"
        ;;
    build)
        build
        ;;
    full)
        full
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
