#!/bin/bash

# 🔍 PricePulse Environment Detection and Validation Script
# Automatically detects and validates environment configuration

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Emojis
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"
DATABASE="🗄️"
CLOUD="☁️"

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
    echo -e "${PURPLE}${GEAR} $1${NC}"
    echo -e "${PURPLE}$(printf '%.s=' $(seq 1 ${#1}))${NC}"
}

# Detect current environment
detect_environment() {
    local env="development"
    
    # Check for production indicators
    if [ -f "backend/.env.production" ] || [ "$NODE_ENV" = "production" ]; then
        env="production"
    elif [ -f "backend/.env.staging" ] || [ "$NODE_ENV" = "staging" ]; then
        env="staging"
    fi
    
    echo "$env"
}

# Validate environment files
validate_env_files() {
    title "Validating Environment Files"
    
    local env=$(detect_environment)
    local env_file="backend/.env"
    
    if [ "$env" = "production" ]; then
        env_file="backend/.env.production"
    elif [ "$env" = "staging" ]; then
        env_file="backend/.env.staging"
    fi
    
    info "Current environment: $env"
    info "Using environment file: $env_file"
    
    if [ ! -f "$env_file" ]; then
        error "Environment file not found: $env_file"
        return 1
    fi
    
    success "Environment file found"
    
    # Validate required variables
    local required_vars=(
        "NODE_ENV"
        "PORT"
        "DATABASE_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            missing_vars+=("$var")
        else
            success "$var is configured"
        fi
    done
    
    # Check optional but recommended variables
    local optional_vars=(
        "SUPABASE_SERVICE_ROLE_KEY"
        "REDIS_URL"
        "SMTP_HOST"
        "SMTP_USER"
        "FRONTEND_URL"
    )
    
    for var in "${optional_vars[@]}"; do
        if grep -q "^${var}=" "$env_file"; then
            success "$var is configured (optional)"
        else
            warning "$var not configured (optional)"
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    success "All required environment variables are configured"
}

# Validate Supabase configuration
validate_supabase() {
    title "Validating Supabase Configuration"
    
    local env_file="backend/.env"
    local env=$(detect_environment)
    
    if [ "$env" = "production" ]; then
        env_file="backend/.env.production"
    elif [ "$env" = "staging" ]; then
        env_file="backend/.env.staging"
    fi
    
    if [ ! -f "$env_file" ]; then
        error "Environment file not found"
        return 1
    fi
    
    # Extract Supabase URL
    local supabase_url
    if supabase_url=$(grep "^SUPABASE_URL=" "$env_file" | cut -d '=' -f2 | tr -d '"' | tr -d "'"); then
        if [[ $supabase_url =~ ^https://[a-z0-9]+\.supabase\.co$ ]]; then
            success "Supabase URL format is valid"
        else
            warning "Supabase URL format may be incorrect: $supabase_url"
        fi
    else
        error "Supabase URL not found"
        return 1
    fi
    
    # Check anon key format
    local anon_key
    if anon_key=$(grep "^SUPABASE_ANON_KEY=" "$env_file" | cut -d '=' -f2 | tr -d '"' | tr -d "'"); then
        if [ ${#anon_key} -gt 100 ]; then
            success "Supabase anon key appears valid"
        else
            warning "Supabase anon key may be incorrect (too short)"
        fi
    else
        error "Supabase anon key not found"
        return 1
    fi
    
    # Check service role key
    local service_key
    if service_key=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$env_file" | cut -d '=' -f2 | tr -d '"' | tr -d "'"); then
        if [ ${#service_key} -gt 100 ]; then
            success "Supabase service role key appears valid"
        else
            warning "Supabase service role key may be incorrect (too short)"
        fi
    else
        warning "Supabase service role key not configured (recommended for backend)"
    fi
}

# Check database connectivity
check_database_connection() {
    title "Checking Database Connection"
    
    local env_file="backend/.env"
    local env=$(detect_environment)
    
    if [ "$env" = "production" ]; then
        env_file="backend/.env.production"
    elif [ "$env" = "staging" ]; then
        env_file="backend/.env.staging"
    fi
    
    if [ ! -f "$env_file" ]; then
        error "Environment file not found"
        return 1
    fi
    
    # Extract database URL
    local database_url
    if database_url=$(grep "^DATABASE_URL=" "$env_file" | cut -d '=' -f2 | tr -d '"' | tr -d "'"); then
        if [[ $database_url =~ ^postgresql:// ]]; then
            success "Database URL format is valid"
            
            # Try to connect (if psql is available)
            if command -v psql &> /dev/null; then
                info "Testing database connection..."
                if psql "$database_url" -c "SELECT 1;" &> /dev/null; then
                    success "Database connection successful"
                else
                    warning "Database connection failed (check credentials)"
                fi
            else
                info "psql not available, skipping connection test"
            fi
        else
            error "Database URL format is invalid"
            return 1
        fi
    else
        error "Database URL not found"
        return 1
    fi
}

# Validate Node.js and npm versions
validate_node_versions() {
    title "Validating Node.js Environment"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        local node_version
        node_version=$(node --version | sed 's/v//')
        local major_version
        major_version=$(echo "$node_version" | cut -d '.' -f1)
        
        if [ "$major_version" -ge 18 ]; then
            success "Node.js $node_version (supported)"
        else
            warning "Node.js $node_version (recommend upgrading to 18+)"
        fi
    else
        error "Node.js not found"
        return 1
    fi
    
    # Check npm version
    if command -v npm &> /dev/null; then
        local npm_version
        npm_version=$(npm --version)
        success "npm $npm_version"
    else
        error "npm not found"
        return 1
    fi
    
    # Check for package.json files
    if [ -f "package.json" ]; then
        success "Root package.json found"
    else
        error "Root package.json not found"
    fi
    
    if [ -f "frontend/package.json" ]; then
        success "Frontend package.json found"
    else
        error "Frontend package.json not found"
    fi
    
    if [ -f "backend/package.json" ]; then
        success "Backend package.json found"
    else
        error "Backend package.json not found"
    fi
}

# Generate environment report
generate_report() {
    local env=$(detect_environment)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat << EOF

📊 Environment Report
====================
Generated: $timestamp
Environment: $env
Project: PricePulse

🔧 Configuration Status:
$(validate_env_files 2>&1 | grep -E "✅|❌|⚠️" || echo "  No configuration issues found")

☁️ Supabase Status:
$(validate_supabase 2>&1 | grep -E "✅|❌|⚠️" || echo "  Supabase configuration valid")

🗄️ Database Status:
$(check_database_connection 2>&1 | grep -E "✅|❌|⚠️" || echo "  Database connection not tested")

⚙️ Runtime Status:
$(validate_node_versions 2>&1 | grep -E "✅|❌|⚠️" || echo "  Runtime environment valid")

EOF
}

# Show recommendations
show_recommendations() {
    title "Recommendations"
    
    local env=$(detect_environment)
    
    info "Based on your current environment ($env), here are some recommendations:"
    
    if [ "$env" = "development" ]; then
        info "  • Use 'npm run quick' for initial setup"
        info "  • Use 'npm run dev' to start development servers"
        info "  • Use 'npm run health' to monitor service health"
    elif [ "$env" = "staging" ]; then
        info "  • Test deployment with 'npm run deploy:staging'"
        info "  • Run comprehensive tests before promotion"
        info "  • Monitor logs after deployment"
    else
        info "  • Ensure all tests pass before production deployment"
        info "  • Use 'npm run deploy:prod' for production deployment"
        info "  • Monitor health checks post-deployment"
    fi
    
    echo ""
    info "Next steps:"
    info "  1. Fix any issues shown above"
    info "  2. Run 'npm run health' to verify service health"
    info "  3. Use 'npm run automate --help' for automation options"
}

# Main function
main() {
    echo ""
    echo -e "${PURPLE}🔍 PricePulse Environment Detection${NC}"
    echo -e "${PURPLE}===================================${NC}"
    
    local failed=0
    
    validate_node_versions || ((failed++))
    validate_env_files || ((failed++))
    validate_supabase || ((failed++))
    
    # Only check database connection if not in CI
    if [ -z "$CI" ]; then
        check_database_connection || ((failed++))
    fi
    
    if [ "$1" = "--report" ]; then
        generate_report
    fi
    
    show_recommendations
    
    if [ $failed -eq 0 ]; then
        success "Environment validation completed successfully! 🎉"
        exit 0
    else
        error "$failed validation check(s) failed"
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --report      Generate detailed environment report"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0            # Validate environment"
    echo "  $0 --report   # Generate detailed report"
}

# Handle arguments
case "$1" in
    "--help"|"-h")
        show_usage
        exit 0
        ;;
    "--report")
        main "--report"
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
