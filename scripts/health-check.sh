#!/bin/bash

# 🏥 PricePulse Health Check Script
# Comprehensive health monitoring for all services

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Emojis
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"

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

# Health check functions
check_backend() {
    local port=${1:-3001}
    local host=${2:-localhost}
    
    info "Checking backend at http://${host}:${port}"
    
    if command -v curl &> /dev/null; then
        local response
        if response=$(curl -s -w "%{http_code}" "http://${host}:${port}/health" -o /dev/null); then
            if [ "$response" = "200" ]; then
                success "Backend health check passed"
                return 0
            else
                error "Backend returned status code: $response"
                return 1
            fi
        else
            error "Backend health check failed - service unreachable"
            return 1
        fi
    else
        warning "curl not found, skipping backend health check"
        return 0
    fi
}

check_database() {
    info "Checking database connectivity"
    
    # Check if we can connect to the database via backend
    if command -v curl &> /dev/null; then
        local response
        if response=$(curl -s -w "%{http_code}" "http://localhost:3001/api/monitoring/db" -o /dev/null 2>/dev/null); then
            if [ "$response" = "200" ]; then
                success "Database connectivity check passed"
                return 0
            else
                warning "Database connectivity check returned: $response"
                return 1
            fi
        else
            warning "Could not check database connectivity"
            return 1
        fi
    else
        warning "curl not found, skipping database check"
        return 0
    fi
}

check_redis() {
    info "Checking Redis connectivity"
    
    # Check Redis via backend endpoint
    if command -v curl &> /dev/null; then
        local response
        if response=$(curl -s -w "%{http_code}" "http://localhost:3001/api/monitoring/redis" -o /dev/null 2>/dev/null); then
            if [ "$response" = "200" ]; then
                success "Redis connectivity check passed"
                return 0
            else
                warning "Redis connectivity check returned: $response"
                return 1
            fi
        else
            warning "Could not check Redis connectivity"
            return 1
        fi
    else
        warning "curl not found, skipping Redis check"
        return 0
    fi
}

check_frontend() {
    local port=${1:-5173}
    local host=${2:-localhost}
    
    info "Checking frontend at http://${host}:${port}"
    
    if command -v curl &> /dev/null; then
        local response
        if response=$(curl -s -w "%{http_code}" "http://${host}:${port}/" -o /dev/null); then
            if [ "$response" = "200" ]; then
                success "Frontend health check passed"
                return 0
            else
                error "Frontend returned status code: $response"
                return 1
            fi
        else
            error "Frontend health check failed - service unreachable"
            return 1
        fi
    else
        warning "curl not found, skipping frontend health check"
        return 0
    fi
}

check_docker_services() {
    info "Checking Docker services"
    
    if command -v docker &> /dev/null; then
        # Check for development containers
        if docker ps | grep -q "pricepulse-postgres"; then
            success "PostgreSQL container is running (dev)"
        elif docker ps | grep -q "pricepulse-postgres-prod"; then
            success "PostgreSQL container is running (prod)"
        else
            warning "PostgreSQL container not found (using Supabase or not started)"
        fi
        
        if docker ps | grep -q "pricepulse-redis"; then
            success "Redis container is running (dev)"
        elif docker ps | grep -q "pricepulse-redis-prod"; then
            success "Redis container is running (prod)"
        else
            warning "Redis container not found"
        fi
        
        # Check for production monitoring stack
        if docker ps | grep -q "pricepulse-prometheus"; then
            success "Prometheus monitoring is running"
        fi
        
        if docker ps | grep -q "pricepulse-grafana"; then
            success "Grafana monitoring is running"
        fi
        
        # Check Docker container health
        local unhealthy_containers
        unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "table {{.Names}}" | tail -n +2)
        if [ -n "$unhealthy_containers" ]; then
            error "Unhealthy containers found: $unhealthy_containers"
        else
            success "All running containers are healthy"
        fi
    else
        info "Docker not available (using Supabase/cloud services)"
    fi
}

check_environment() {
    info "Checking environment configuration"
    
    # Check backend environment
    if [ -f "backend/.env" ]; then
        success "Backend environment file found"
        
        if grep -q "SUPABASE_URL" backend/.env; then
            success "Supabase URL configured"
        else
            warning "Supabase URL not configured"
        fi
        
        if grep -q "DATABASE_URL" backend/.env; then
            success "Database URL configured"
        else
            warning "Database URL not configured"
        fi
    else
        error "Backend environment file not found"
    fi
    
    # Check frontend environment
    if [ -f "frontend/.env" ]; then
        success "Frontend environment file found"
    else
        warning "Frontend environment file not found (optional)"
    fi
}

check_node_modules() {
    info "Checking dependencies"
    
    if [ -d "node_modules" ]; then
        success "Root dependencies installed"
    else
        error "Root dependencies not installed"
    fi
    
    if [ -d "frontend/node_modules" ]; then
        success "Frontend dependencies installed"
    else
        error "Frontend dependencies not installed"
    fi
    
    if [ -d "backend/node_modules" ]; then
        success "Backend dependencies installed"
    else
        error "Backend dependencies not installed"
    fi
}

# Main health check function
main() {
    echo ""
    echo -e "${BLUE}🏥 PricePulse Health Check${NC}"
    echo -e "${BLUE}=========================${NC}"
    echo ""
    
    local failed=0
    
    # Environment and dependencies
    check_environment || ((failed++))
    echo ""
    
    check_node_modules || ((failed++))
    echo ""
    
    # Docker services (if using local development)
    check_docker_services
    echo ""
    
    # Service health checks
    check_backend || ((failed++))
    echo ""
    
    check_database || ((failed++))
    echo ""
    
    check_redis || ((failed++))
    echo ""
    
    # Frontend check (optional in development)
    if [ "$1" != "--backend-only" ]; then
        check_frontend || warning "Frontend check failed (may not be running)"
        echo ""
    fi
    
    # Summary
    echo -e "${BLUE}📊 Health Check Summary${NC}"
    echo -e "${BLUE}=======================${NC}"
    
    if [ $failed -eq 0 ]; then
        success "All critical health checks passed! 🎉"
        exit 0
    else
        error "$failed critical health check(s) failed"
        info "Check the logs above for details"
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --backend-only    Skip frontend health check"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Full health check"
    echo "  $0 --backend-only    # Backend services only"
}

# Handle arguments
case "$1" in
    "--help"|"-h")
        show_usage
        exit 0
        ;;
    "--backend-only")
        main "--backend-only"
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
