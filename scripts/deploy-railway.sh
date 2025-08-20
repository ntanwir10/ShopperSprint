#!/bin/bash

# 🚂 Railway.com Deployment Script for PricePulse
# Automated deployment to Railway with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Emojis
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
TRAIN="🚂"

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
    echo -e "${BLUE}${INFO} $1${NC}"
}

title() {
    echo ""
    echo -e "${PURPLE}${TRAIN} $1${NC}"
    echo -e "${PURPLE}$(printf '%.s=' $(seq 1 ${#1}))${NC}"
}

# Check prerequisites
check_prerequisites() {
    title "Checking Prerequisites"
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        error "Railway CLI is not installed"
        info "Install it with: npm install -g @railway/cli"
        info "Or visit: https://docs.railway.app/develop/cli#install"
        exit 1
    else
        success "Railway CLI found"
    fi
    
    # Check if logged in to Railway
    if ! railway whoami &> /dev/null; then
        error "Not logged in to Railway"
        info "Login with: railway login"
        exit 1
    else
        success "Logged in to Railway"
    fi
    
    # Check if in project directory
    if [ ! -f "package.json" ] || [ ! -f "config/deployment/nixpacks.toml" ]; then
        error "Must be run from project root directory"
        exit 1
    else
        success "In correct project directory"
    fi
}

# Setup Railway project
setup_railway_project() {
    title "Setting Up Railway Project"
    
    # Check if already linked to a Railway project
    if [ -f ".railway" ]; then
        warning "Already linked to a Railway project"
        railway status
    else
        log "Creating new Railway project..."
        railway init
        success "Railway project created"
    fi
}

# Choose deployment strategy
choose_deployment_strategy() {
    title "Choose Railway Deployment Strategy"
    
    echo "🚂 Railway Deployment Options:"
    echo ""
    echo "1. 🎯 Single Service (Recommended)"
    echo "   ✅ Frontend + Backend in one Railway service"
    echo "   ✅ Single domain, one service cost"
    echo "   ✅ API at /api/*, frontend at /*"
    echo "   ✅ Simpler configuration"
    echo ""
    echo "2. 🔄 Separate Services"
    echo "   ✅ Frontend and Backend as separate Railway services"
    echo "   ✅ Independent scaling and deployment"
    echo "   ✅ Two domains (one for API, one for frontend)"
    echo "   ⚠️  Higher cost (two services)"
    echo ""
    
    read -p "Choose deployment strategy (1-single/2-separate) [1]: " -n 1 -r
    echo
    
    case ${REPLY:-1} in
        1)
            DEPLOYMENT_STRATEGY="single"
            info "Selected: Single Service Deployment"
            ;;
        2)
            DEPLOYMENT_STRATEGY="separate"
            info "Selected: Separate Services Deployment"
            ;;
        *)
            warning "Invalid choice, defaulting to Single Service"
            DEPLOYMENT_STRATEGY="single"
            ;;
    esac
}

# Configure environment variables
configure_environment() {
    title "Configuring Environment Variables"
    
    info "Setting up Railway environment variables..."
    
    if [[ "$DEPLOYMENT_STRATEGY" == "single" ]]; then
        cat << 'EOF'
🔧 Required Environment Variables for Single Service:

DATABASE_URL         - Supabase or Railway PostgreSQL connection string
SUPABASE_URL         - Your Supabase project URL  
SUPABASE_ANON_KEY    - Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (for backend)
NODE_ENV             - Set to "production"
SERVE_FRONTEND       - Set to "true" (automatically configured)
PORT                 - Railway will set this automatically

Optional but recommended:
REDIS_URL           - Railway Redis or Upstash Redis
SMTP_HOST           - For email notifications
SMTP_USER           - SMTP username  
SMTP_PASS           - SMTP password
SMTP_FROM           - From email address

EOF
    else
        cat << 'EOF'
🔧 Required Environment Variables for Separate Services:

Backend Service:
DATABASE_URL         - Supabase or Railway PostgreSQL connection string
SUPABASE_URL         - Your Supabase project URL  
SUPABASE_ANON_KEY    - Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
NODE_ENV             - Set to "production"
SERVE_FRONTEND       - Set to "false" (automatically configured)
PORT                 - Railway will set this automatically

Frontend Service:
VITE_API_URL         - Your Railway backend URL (e.g., https://api.shoppersprint.com)
VITE_SUPABASE_URL    - Your Supabase project URL
VITE_SUPABASE_ANON_KEY - Your Supabase anon key
NODE_ENV             - Set to "production"

Optional for backend:
REDIS_URL, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM

EOF
    fi

    info "You can set these variables using:"
    echo "  railway variables set DATABASE_URL=your-database-url"
    echo "  railway variables set SUPABASE_URL=your-supabase-url"
    echo "  railway variables set SUPABASE_ANON_KEY=your-anon-key"
    echo ""
    
    read -p "Have you set the required environment variables? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "Please set environment variables before deploying"
        info "Use: railway variables set KEY=value"
        exit 1
    fi
}

# Deploy services based on strategy
deploy_services() {
    if [[ "$DEPLOYMENT_STRATEGY" == "single" ]]; then
        deploy_single_service
    else
        deploy_separate_services
    fi
}

# Deploy single service (frontend + backend)
deploy_single_service() {
    title "Deploying Single Service (Frontend + Backend)"
    
    log "Configuring for single service deployment..."
    
    # Copy single-service nixpacks config to root
    cp config/deployment/nixpacks.toml ./nixpacks.toml
    log "Using single-service nixpacks configuration"
    
    railway up --detach
    
    success "Single service deployment initiated"
    
    # Wait for deployment
    log "Waiting for deployment to complete..."
    sleep 45
    
    # Get the deployment URL
    local url
    if url=$(railway domain); then
        success "Application deployed successfully!"
        info "🌐 Application URL: $url"
        info "🏥 Health check: $url/health"
        info "📱 Frontend: $url"
        info "🔗 API: $url/api"
    else
        warning "Could not retrieve deployment URL"
        info "Check Railway dashboard for deployment status"
    fi
}

# Deploy separate services
deploy_separate_services() {
    title "Deploying Separate Services"
    
    info "This will deploy backend and frontend as separate Railway services"
    info "You'll need to create two Railway projects/services"
    echo ""
    
    # Deploy backend first
    deploy_backend_only
    
    echo ""
    read -p "Deploy frontend as separate service too? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_frontend_only
    else
        info "Backend deployed. Deploy frontend manually or use Vercel:"
        info "  npm run deploy:vercel"
    fi
}

# Deploy backend only
deploy_backend_only() {
    title "Deploying Backend Service"
    
    log "Configuring for backend-only deployment..."
    
    # Copy backend-specific nixpacks configuration
    if [[ -f "config/deployment/nixpacks-backend.toml" ]]; then
        cp config/deployment/nixpacks-backend.toml ./nixpacks.toml
        log "Using backend-only nixpacks configuration"
    fi
    
    railway up --detach
    
    success "Backend deployment initiated"
    
    # Wait for deployment
    log "Waiting for backend deployment to complete..."
    sleep 30
    
    # Get the deployment URL
    local url
    if url=$(railway domain); then
        success "Backend deployed successfully!"
        info "🔗 Backend API URL: $url"
        info "🏥 Health check: $url/health"
        info "📋 API docs: $url/api"
        
        # Save backend URL for frontend deployment
        BACKEND_URL="$url"
    else
        warning "Could not retrieve backend URL"
        info "Check Railway dashboard for deployment status"
    fi
}

# Deploy frontend only  
deploy_frontend_only() {
    title "Deploying Frontend Service"
    
    warning "⚠️  You need to create a separate Railway project for the frontend"
    info "1. Create new Railway project: railway init"
    info "2. Set VITE_API_URL to your backend URL"
    
    if [[ -n "$BACKEND_URL" ]]; then
        info "3. Set VITE_API_URL=$BACKEND_URL"
        echo ""
        echo "Copy this command:"
        echo "  railway variables set VITE_API_URL=$BACKEND_URL"
    fi
    
    read -p "Continue with frontend deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Frontend deployment skipped"
        return
    fi
    
    log "Configuring for frontend-only deployment..."
    
    # Copy frontend-specific nixpacks configuration
    if [[ -f "config/deployment/nixpacks-frontend.toml" ]]; then
        cp config/deployment/nixpacks-frontend.toml ./nixpacks.toml
        log "Using frontend-only nixpacks configuration"
    fi
    
    railway up --detach
    
    success "Frontend deployment initiated"
    
    # Wait for deployment
    log "Waiting for frontend deployment to complete..."
    sleep 30
    
    # Get the deployment URL
    local url
    if url=$(railway domain); then
        success "Frontend deployed successfully!"
        info "🌐 Frontend URL: $url"
    else
        warning "Could not retrieve frontend URL"
        info "Check Railway dashboard for deployment status"
    fi
}

# Health check deployment
check_deployment_health() {
    title "Checking Deployment Health"
    
    if [[ "$DEPLOYMENT_STRATEGY" == "single" ]]; then
        check_single_service_health
    else
        check_separate_services_health
    fi
}

# Health check for single service
check_single_service_health() {
    log "Getting deployment URL..."
    local url
    if url=$(railway domain); then
        log "Testing health endpoint..."
        if curl -f "$url/health" > /dev/null 2>&1; then
            success "✅ Backend health check passed!"
        else
            warning "⚠️  Backend health check failed"
        fi
        
        log "Testing frontend..."
        if curl -f "$url" > /dev/null 2>&1; then
            success "✅ Frontend health check passed!"
        else
            warning "⚠️  Frontend health check failed"
        fi
        
        success "🎉 Application is live at: $url"
        info "📱 Frontend: $url"
        info "🔗 API: $url/api"
        info "🏥 Health: $url/health"
    else
        warning "Could not get deployment URL"
        info "Check Railway dashboard for status"
    fi
}

# Health check for separate services
check_separate_services_health() {
    if [[ -n "$BACKEND_URL" ]]; then
        log "Testing backend health..."
        if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
            success "✅ Backend health check passed!"
            info "🔗 Backend API: $BACKEND_URL"
        else
            warning "⚠️  Backend health check failed"
        fi
    fi
    
    info "Check Railway dashboard for frontend service status"
}

# Add Railway-specific services
setup_railway_services() {
    title "Setting Up Railway Services"
    
    info "Adding recommended Railway services..."
    
    # Add PostgreSQL (if not using Supabase)
    read -p "Add Railway PostgreSQL database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway add postgresql
        success "PostgreSQL service added"
        warning "Update DATABASE_URL environment variable"
    fi
    
    # Add Redis
    read -p "Add Railway Redis cache? (y/N): " -n 1 -r  
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway add redis
        success "Redis service added"
        warning "Update REDIS_URL environment variable"
    fi
}



# Show post-deployment information
show_deployment_info() {
    title "Deployment Complete"
    
    if [[ "$DEPLOYMENT_STRATEGY" == "single" ]]; then
        success "🎉 Single service deployed to Railway!"
        echo ""
        info "✅ Your full-stack application is now live!"
        echo "  📱 Frontend and 🔗 API in one service"
        echo "  💰 Cost-effective single service"
        echo "  🔄 Unified deployment and scaling"
    else
        success "🎉 Services deployed to Railway!"
        echo ""
        info "✅ Microservices architecture deployed!"
        echo "  🔗 Backend API service"
        echo "  📱 Frontend service (if deployed)"
        echo "  ⚖️  Independent scaling"
    fi
    
    echo ""
    info "📋 Next Steps:"
    echo "  1. 🔍 Check deployment: railway logs"
    echo "  2. 🌐 Get URL: railway domain"  
    echo "  3. 🏥 Test health: curl \$(railway domain)/health"
    echo "  4. 📊 Monitor: railway dashboard"
    echo ""
    
    info "🔗 Useful Railway Commands:"
    echo "  railway logs          # View deployment logs"
    echo "  railway status        # Check service status"
    echo "  railway variables     # Manage environment variables"
    echo "  railway domain        # Get deployment URL"
    echo "  railway dashboard     # Open Railway dashboard"
    echo ""
    
    if [[ "$DEPLOYMENT_STRATEGY" == "single" ]]; then
        info "🎯 Single Service Architecture:"
        echo "  - Frontend: https://your-app.railway.app"
        echo "  - API: https://your-app.railway.app/api"
        echo "  - Health: https://your-app.railway.app/health"
    else
        info "🔄 Separate Services Architecture:"
        echo "  - Backend API: https://api.shoppersprint.com"
        echo "  - Frontend: https://shoppersprint.com"
        echo "  - Or use Vercel for frontend: npm run deploy:vercel"
    fi
    
    echo ""
    warning "🔒 Production Checklist:"
    echo "  - Set up custom domain for production use"
    echo "  - Configure SSL/TLS certificates"
    echo "  - Set up monitoring and alerting"
    echo "  - Regular backups if using Railway PostgreSQL"
    echo "  - Configure CORS for your custom domain"
}

# Main deployment function
main() {
    echo ""
    echo -e "${PURPLE}🚂 PricePulse Railway Deployment${NC}"
    echo -e "${PURPLE}=================================${NC}"
    
    check_prerequisites
    choose_deployment_strategy
    setup_railway_project
    configure_environment
    setup_railway_services
    deploy_services
    check_deployment_health
    show_deployment_info
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [strategy]"
        echo ""
        echo "Deployment Strategies:"
        echo "  single      Deploy frontend + backend as single service (recommended)"
        echo "  separate    Deploy frontend and backend as separate services"
        echo "  backend     Deploy backend only"
        echo "  frontend    Deploy frontend only"
        echo ""
        echo "Options:"
        echo "  help        Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                    # Interactive deployment"
        echo "  $0 single             # Single service deployment"
        echo "  $0 separate           # Separate services deployment"
        echo "  $0 backend            # Backend only"
        echo ""
        echo "Useful Railway commands:"
        echo "  railway logs          # View deployment logs"
        echo "  railway domain        # Get deployment URL"
        echo "  railway dashboard     # Open Railway dashboard"
        ;;
    "single")
        DEPLOYMENT_STRATEGY="single"
        main
        ;;
    "separate")
        DEPLOYMENT_STRATEGY="separate"
        main
        ;;
    "backend")
        DEPLOYMENT_STRATEGY="backend"
        check_prerequisites
        setup_railway_project
        configure_environment
        setup_railway_services
        deploy_backend_only
        check_deployment_health
        show_deployment_info
        ;;
    "frontend")
        DEPLOYMENT_STRATEGY="frontend"
        check_prerequisites
        setup_railway_project
        configure_environment
        deploy_frontend_only
        check_deployment_health
        show_deployment_info
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
