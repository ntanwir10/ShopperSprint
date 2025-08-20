#!/bin/bash

# Production Deployment Script for Price Tracker
# This script handles the complete deployment process

set -e  # Exit on any error

# Configuration
APP_NAME="price-tracker"
DEPLOY_USER="deploy"
DEPLOY_HOST="shoppersprint.com"
DEPLOY_PATH="/opt/price-tracker"
BACKUP_PATH="/var/backups/price-tracker"
LOG_PATH="/var/log/price-tracker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required commands exist
    command -v docker >/dev/null 2>&1 || { error "Docker is required but not installed"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { error "Docker Compose is required but not installed"; exit 1; }
    command -v git >/dev/null 2>&1 || { error "Git is required but not installed"; exit 1; }
    
    # Check if .env.production exists
    if [[ ! -f ".env.production" ]]; then
        error ".env.production file not found. Please create it from config/examples/.env.example"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    if [[ -d "$DEPLOY_PATH" ]]; then
        BACKUP_FILE="$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        sudo mkdir -p "$BACKUP_PATH"
        
        # Create backup
        sudo tar -czf "$BACKUP_FILE" -C "$DEPLOY_PATH" .
        
        # Keep only last 5 backups
        sudo find "$BACKUP_PATH" -name "backup-*.tar.gz" -type f -mtime +5 -delete
        
        log "Backup created: $BACKUP_FILE"
    else
        warn "No existing deployment found, skipping backup"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend image
    log "Building backend image..."
    docker build -t price-tracker-backend:latest ./backend
    
    # Build frontend image
    log "Building frontend image..."
    docker build -t price-tracker-frontend:latest ./frontend
    
    log "Docker images built successfully"
}

# Deploy to server
deploy_to_server() {
    log "Deploying to server..."
    
    # Create deployment package
    DEPLOY_PACKAGE="deploy-package-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$DEPLOY_PACKAGE" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='*.log' \
        --exclude='.env.local' \
        --exclude='.env.development' \
        .
    
    # Copy to server
    log "Copying deployment package to server..."
    scp "$DEPLOY_PACKAGE" "$DEPLOY_USER@$DEPLOY_HOST:/tmp/"
    
    # Execute deployment on server
    log "Executing deployment on server..."
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << 'EOF'
        set -e
        
        # Variables
        DEPLOY_PATH="/opt/price-tracker"
        BACKUP_PATH="/var/backups/price-tracker"
        LOG_PATH="/var/log/price-tracker"
        
        # Create necessary directories
        sudo mkdir -p "$DEPLOY_PATH" "$BACKUP_PATH" "$LOG_PATH"
        sudo chown $USER:$USER "$DEPLOY_PATH" "$BACKUP_PATH" "$LOG_PATH"
        
        # Extract deployment package
        cd /tmp
        tar -xzf deploy-package-*.tar.gz -C "$DEPLOY_PATH"
        
        # Set proper permissions
        sudo chown -R $USER:$USER "$DEPLOY_PATH"
        sudo chmod -R 755 "$DEPLOY_PATH"
        
        # Copy environment file
        if [[ -f "$DEPLOY_PATH/.env.production" ]]; then
            sudo cp "$DEPLOY_PATH/.env.production" "$DEPLOY_PATH/.env"
        fi
        
        # Create log directory with proper permissions
        sudo mkdir -p "$LOG_PATH"
        sudo chown $USER:$USER "$LOG_PATH"
        sudo chmod 755 "$LOG_PATH"
        
        # Stop existing services
        if [[ -f "$DEPLOY_PATH/docker-compose.prod.yml" ]]; then
            cd "$DEPLOY_PATH"
            docker-compose -f docker-compose.prod.yml down || true
        fi
        
        # Start new services
        log "Starting services..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services to be ready
        log "Waiting for services to be ready..."
        sleep 30
        
        # Check service health
        log "Checking service health..."
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log "Backend service is healthy"
        else
            error "Backend service health check failed"
            exit 1
        fi
        
        if curl -f http://localhost:80 > /dev/null 2>&1; then
            log "Frontend service is healthy"
        else
            error "Frontend service health check failed"
            exit 1
        fi
        
        # Clean up deployment package
        rm -f /tmp/deploy-package-*.tar.gz
        
        log "Deployment completed successfully"
EOF
    
    # Clean up local deployment package
    rm -f "$DEPLOY_PACKAGE"
    
    log "Deployment to server completed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << 'EOF'
        cd /opt/price-tracker
        
        # Run backend migrations
        docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate
        
        log "Database migrations completed"
EOF
}

# Seed database (if needed)
seed_database() {
    log "Seeding database..."
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << 'EOF'
        cd /opt/price-tracker
        
        # Seed database
        docker-compose -f docker-compose.prod.yml exec -T backend npm run db:seed
        
        log "Database seeding completed"
EOF
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check backend health
    if curl -f "http://$DEPLOY_HOST:3001/health" > /dev/null 2>&1; then
        log "Backend health check passed"
    else
        error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f "http://$DEPLOY_HOST" > /dev/null 2>&1; then
        log "Frontend health check passed"
    else
        error "Frontend health check failed"
        return 1
    fi
    
    # Check monitoring endpoint
    if curl -f "http://$DEPLOY_HOST:3001/api/monitoring/health" > /dev/null 2>&1; then
        log "Monitoring health check passed"
    else
        error "Monitoring health check failed"
        return 1
    fi
    
    log "All health checks passed"
}

# Rollback function
rollback() {
    error "Deployment failed, rolling back..."
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << 'EOF'
        cd /opt/price-tracker
        
        # Stop new services
        docker-compose -f docker-compose.prod.yml down || true
        
        # Restore from backup
        LATEST_BACKUP=$(ls -t /var/backups/price-tracker/backup-*.tar.gz | head -1)
        if [[ -n "$LATEST_BACKUP" ]]; then
            log "Restoring from backup: $LATEST_BACKUP"
            sudo rm -rf /opt/price-tracker/*
            sudo tar -xzf "$LATEST_BACKUP" -C /opt/price-tracker
            
            # Start old services
            docker-compose -f docker-compose.prod.yml up -d
            log "Rollback completed"
        else
            error "No backup found for rollback"
        fi
EOF
}

# Main deployment function
main() {
    log "Starting production deployment..."
    
    check_prerequisites
    create_backup
    build_images
    deploy_to_server
    run_migrations
    
    # Optional: seed database
    read -p "Do you want to seed the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        seed_database
    fi
    
    # Health check
    if health_check; then
        log "Deployment completed successfully!"
        log "Application is available at: http://$DEPLOY_HOST"
        log "Backend API: http://$DEPLOY_HOST:3001"
        log "Monitoring: http://$DEPLOY_HOST:3001/api/monitoring/health"
    else
        error "Health check failed"
        rollback
        exit 1
    fi
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --rollback     Rollback to previous deployment"
    echo "  --health       Perform health check only"
    echo "  --backup       Create backup only"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full deployment"
    echo "  $0 --health           # Health check only"
    echo "  $0 --backup           # Create backup only"
    echo "  $0 --rollback         # Rollback deployment"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    --rollback)
        rollback
        exit 0
        ;;
    --health)
        health_check
        exit 0
        ;;
    --backup)
        create_backup
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        usage
        exit 1
        ;;
esac
