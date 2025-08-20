#!/bin/bash

# 🚀 PricePulse Master Automation Script
# One script to rule them all - handles development setup, deployment, and management
# Usage: ./scripts/automate.sh [command] [options]

set -e

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Emojis for better UX
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
DATABASE="🗄️"
CLOUD="☁️"
FIRE="🔥"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}${SUCCESS} $1${NC}"
}

error() {
    echo -e "${RED}${ERROR} $1${NC}"
}

warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

info() {
    echo -e "${CYAN}${INFO} $1${NC}"
}

title() {
    echo ""
    echo -e "${BOLD}${PURPLE}$1${NC}"
    echo -e "${PURPLE}$(printf '%.s=' $(seq 1 ${#1}))${NC}"
}

# Environment detection
detect_environment() {
    if [ -f "backend/.env.production" ] && [ "$1" == "prod" ]; then
        echo "production"
    elif [ -f "backend/.env.staging" ] && [ "$1" == "staging" ]; then
        echo "staging"
    else
        echo "development"
    fi
}

# Health check functions
check_prerequisites() {
    title "${GEAR} Checking Prerequisites"
    
    local missing=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing+=("Node.js")
    else
        success "Node.js $(node --version) found"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    else
        success "npm $(npm --version) found"
    fi
    
    # Check Docker (for local development)
    if ! command -v docker &> /dev/null; then
        warning "Docker not found (optional for Supabase-only setup)"
    else
        success "Docker found"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing+=("Git")
    else
        success "Git found"
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        error "Missing required tools: ${missing[*]}"
        exit 1
    fi
}

# Environment setup
setup_environment() {
    title "${GEAR} Setting Up Environment"
    
    # Run existing env setup
    ./scripts/setup-env.sh
    
    # Check for Supabase configuration
    if [ ! -f "backend/.env" ]; then
        error "Backend .env file not found"
        exit 1
    fi
    
    # Validate Supabase configuration
    if ! grep -q "SUPABASE_URL" backend/.env; then
        warning "SUPABASE_URL not found in backend/.env"
        info "Add your Supabase project URL to backend/.env"
    fi
    
    if ! grep -q "SUPABASE_ANON_KEY" backend/.env; then
        warning "SUPABASE_ANON_KEY not found in backend/.env"
        info "Add your Supabase anon key to backend/.env"
    fi
    
    success "Environment setup completed"
}

# Install dependencies
install_dependencies() {
    title "${GEAR} Installing Dependencies"
    
    log "Installing root dependencies..."
    npm install
    
    log "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    log "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    success "All dependencies installed"
}

# Database setup
setup_database() {
    title "${DATABASE} Setting Up Database"
    
    local env=${1:-development}
    
    if [ "$env" == "development" ]; then
        log "Starting local database containers..."
        npm run db:start
        
        log "Waiting for databases to be ready..."
        sleep 10
        
        log "Setting up database schema..."
        cd backend && npm run db:push && cd ..
        
        log "Seeding database with initial data..."
        cd backend && npm run db:seed && cd ..
        
        success "Local database setup completed"
    else
        log "Using Supabase managed database..."
        cd backend && npm run db:push && cd ..
        
        if [ "$env" == "production" ]; then
            log "Setting up production data sources..."
            cd backend && npm run db:setup:prod && cd ..
        fi
        
        success "Supabase database setup completed"
    fi
}

# Health checks
run_health_checks() {
    title "${FIRE} Running Health Checks"
    
    local env=${1:-development}
    local port=${2:-3001}
    
    log "Checking backend health..."
    if command -v curl &> /dev/null; then
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s "http://localhost:${port}/health" > /dev/null; then
                success "Backend health check passed"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                error "Backend health check failed after ${max_attempts} attempts"
                return 1
            fi
            
            log "Waiting for backend... (attempt $attempt/$max_attempts)"
            sleep 2
            ((attempt++))
        done
    else
        warning "curl not found, skipping health checks"
    fi
}

# Development setup
setup_development() {
    title "${ROCKET} Setting Up Development Environment"
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database "development"
    
    success "Development environment ready!"
    info "Run 'npm run dev' to start development servers"
}

# Build application
build_application() {
    title "${GEAR} Building Application"
    
    local env=${1:-production}
    
    log "Building frontend..."
    cd frontend && npm run build && cd ..
    
    log "Building backend..."
    cd backend && npm run build && cd ..
    
    success "Application built successfully"
}

# Deploy to staging
deploy_staging() {
    title "${CLOUD} Deploying to Staging"
    
    check_prerequisites
    
    log "Building application for staging..."
    build_application "staging"
    
    log "Running tests..."
    npm run test
    
    log "Building Docker images for staging..."
    docker build -t ghcr.io/$(git config --get remote.origin.url | sed 's/.*github.com.//' | sed 's/.git$//')/frontend:staging-$(git rev-parse --short HEAD) ./frontend
    docker build -t ghcr.io/$(git config --get remote.origin.url | sed 's/.*github.com.//' | sed 's/.git$//')/backend:staging-$(git rev-parse --short HEAD) ./backend
    
    log "Deploying to staging environment..."
    # Use GitHub Actions workflow dispatch for staging deployment
    if command -v gh &> /dev/null; then
        log "Triggering GitHub Actions staging deployment..."
        gh workflow run "🚀 Deploy to Production" --field environment=staging
        success "Staging deployment triggered via GitHub Actions"
    else
        warning "GitHub CLI not found, using fallback deployment..."
        ./scripts/deploy-vercel.sh
    fi
    
    success "Staging deployment completed"
}

# Deploy to production
deploy_production() {
    title "${CLOUD} Deploying to Production"
    
    check_prerequisites
    
    # Extra validation for production
    if [ ! -f "backend/.env.production" ]; then
        error "Production environment file not found"
        exit 1
    fi
    
    log "Running pre-deployment security checks..."
    if command -v npm &> /dev/null; then
        npm audit --audit-level=high --production
        cd backend && npm audit --audit-level=high --production && cd ..
        cd frontend && npm audit --audit-level=high --production && cd ..
    fi
    
    log "Building application for production..."
    build_application "production"
    
    log "Running comprehensive tests..."
    npm run test
    
    log "Running security and quality checks..."
    cd backend && npm run lint && cd ..
    cd frontend && npm run lint && cd ..
    
    log "Building Docker images for production..."
    docker build -t ghcr.io/$(git config --get remote.origin.url | sed 's/.*github.com.//' | sed 's/.git$//')/frontend:prod-$(git rev-parse --short HEAD) ./frontend
    docker build -t ghcr.io/$(git config --get remote.origin.url | sed 's/.*github.com.//' | sed 's/.git$//')/backend:prod-$(git rev-parse --short HEAD) ./backend
    
    log "Deploying to production..."
    # Use GitHub Actions for production deployment for better audit trail
    if command -v gh &> /dev/null; then
        log "Triggering GitHub Actions production deployment..."
        gh workflow run "🚀 Deploy to Production" --field environment=production
        success "Production deployment triggered via GitHub Actions"
        info "Monitor deployment status at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com.//' | sed 's/.git$//')/actions"
    else
        warning "GitHub CLI not found, using direct deployment..."
        ./scripts/deploy-production.sh
    fi
    
    success "Production deployment completed"
}

# Start development servers
start_development() {
    title "${ROCKET} Starting Development Servers"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
        warning "Dependencies not found, installing..."
        install_dependencies
    fi
    
    # Check if database is running
    if ! docker ps | grep -q "postgres\|redis"; then
        log "Starting databases..."
        npm run db:start
        sleep 5
    fi
    
    log "Starting development servers..."
    npm run dev
}

# Quick setup (one-command setup)
quick_setup() {
    title "${ROCKET} PricePulse Quick Setup"
    
    info "This will set up everything you need for development"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    
    setup_development
    
    echo ""
    success "${ROCKET} Setup completed! You can now:"
    info "  1. Run 'npm run dev' to start development"
    info "  2. Run './scripts/automate.sh dev' for full dev startup"
    info "  3. Run './scripts/automate.sh deploy staging' for staging deployment"
}

# Show usage
show_usage() {
    echo ""
    echo -e "${BOLD}${PURPLE}🚀 PricePulse Automation Script${NC}"
    echo ""
    echo -e "${BOLD}USAGE:${NC}"
    echo "  ./scripts/automate.sh [command] [options]"
    echo ""
    echo -e "${BOLD}COMMANDS:${NC}"
    echo "  ${GREEN}setup${NC}           Complete development environment setup"
    echo "  ${GREEN}dev${NC}             Start development servers with health checks"
    echo "  ${GREEN}build${NC}           Build application for production"
    echo "  ${GREEN}test${NC}            Run all tests with coverage"
    echo "  ${GREEN}deploy staging${NC}  Deploy to staging environment"
    echo "  ${GREEN}deploy prod${NC}     Deploy to production environment"
    echo "  ${GREEN}health${NC}          Run health checks"
    echo "  ${GREEN}quick${NC}           One-command setup (interactive)"
    echo ""
    echo -e "${BOLD}EXAMPLES:${NC}"
    echo "  ./scripts/automate.sh quick           # Interactive setup"
    echo "  ./scripts/automate.sh setup           # Full development setup"
    echo "  ./scripts/automate.sh dev             # Start development"
    echo "  ./scripts/automate.sh deploy staging  # Deploy to staging"
    echo "  ./scripts/automate.sh deploy prod     # Deploy to production"
    echo ""
    echo -e "${BOLD}ENVIRONMENT:${NC}"
    echo "  The script automatically detects your environment based on:"
    echo "  - .env files in backend/"
    echo "  - Command arguments"
    echo "  - Docker availability"
    echo ""
}

# Main command dispatcher
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        error "This script must be run from the project root directory"
        exit 1
    fi
    
    case "$1" in
        "setup")
            setup_development
            ;;
        "dev")
            start_development
            ;;
        "build")
            build_application
            ;;
        "test")
            title "${GEAR} Running Tests"
            npm run test
            success "All tests completed"
            ;;
        "deploy")
            case "$2" in
                "staging")
                    deploy_staging
                    ;;
                "prod"|"production")
                    deploy_production
                    ;;
                *)
                    error "Deploy target required: staging or prod"
                    show_usage
                    exit 1
                    ;;
            esac
            ;;
        "health")
            run_health_checks
            ;;
        "quick")
            quick_setup
            ;;
        "help"|"-h"|"--help"|"")
            show_usage
            ;;
        *)
            error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
