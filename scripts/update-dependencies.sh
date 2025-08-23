#!/bin/bash

# ShopperSprint Dependency Update Script
# Efficiently updates all dependencies with proper testing and rollback

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Create backup
create_backup() {
    log "Creating backup of package.json files..."
    
    # Create backup directory
    mkdir -p .dependency-backup/$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR=".dependency-backup/$(date +%Y%m%d_%H%M%S)"
    
    # Backup package files
    cp package.json "$BACKUP_DIR/"
    cp backend/package.json "$BACKUP_DIR/backend-package.json"
    cp frontend/package.json "$BACKUP_DIR/frontend-package.json"
    
    # Backup lock files if they exist
    [ -f package-lock.json ] && cp package-lock.json "$BACKUP_DIR/"
    [ -f backend/package-lock.json ] && cp backend/package-lock.json "$BACKUP_DIR/backend-package-lock.json"
    [ -f frontend/package-lock.json ] && cp frontend/package-lock.json "$BACKUP_DIR/frontend-package-lock.json"
    
    success "Backup created in $BACKUP_DIR"
    echo "$BACKUP_DIR" > .last-backup-path
}

# Restore from backup
restore_backup() {
    if [ -f .last-backup-path ]; then
        BACKUP_DIR=$(cat .last-backup-path)
        log "Restoring from backup: $BACKUP_DIR"
        
        cp "$BACKUP_DIR/package.json" .
        cp "$BACKUP_DIR/backend-package.json" backend/package.json
        cp "$BACKUP_DIR/frontend-package.json" frontend/package.json
        
        [ -f "$BACKUP_DIR/package-lock.json" ] && cp "$BACKUP_DIR/package-lock.json" .
        [ -f "$BACKUP_DIR/backend-package-lock.json" ] && cp "$BACKUP_DIR/backend-package-lock.json" backend/package-lock.json
        [ -f "$BACKUP_DIR/frontend-package-lock.json" ] && cp "$BACKUP_DIR/frontend-package-lock.json" frontend/package-lock.json
        
        success "Backup restored successfully"
    else
        error "No backup found to restore"
        exit 1
    fi
}

# Update strategy function
update_dependencies() {
    local scope=$1
    local strategy=$2
    
    log "Updating $scope dependencies with $strategy strategy..."
    
    case $strategy in
        "security")
            log "Fixing security vulnerabilities..."
            npm audit fix --force
            ;;
        "patch")
            log "Updating patch versions..."
            npm update
            ;;
        "minor")
            log "Updating minor versions..."
            npx npm-check-updates -u --target minor
            npm install
            ;;
        "major")
            log "Updating major versions (interactive)..."
            npx npm-check-updates -u --target latest
            npm install
            ;;
        "interactive")
            log "Interactive update selection..."
            npx npm-check-updates -i
            npm install
            ;;
    esac
}

# Test function
run_tests() {
    local scope=$1
    
    log "Running tests for $scope..."
    
    case $scope in
        "root")
            npm run lint || return 1
            ;;
        "backend")
            cd backend
            npm run type-check || return 1
            npm run lint || return 1
            npm run test || return 1
            cd ..
            ;;
        "frontend")
            cd frontend
            npm run type-check || return 1
            npm run lint || return 1
            npm run test:run || return 1
            cd ..
            ;;
    esac
    
    success "$scope tests passed"
}

# Main update process
main() {
    local strategy=${1:-"interactive"}
    local scope=${2:-"all"}
    
    log "Starting dependency update process..."
    log "Strategy: $strategy, Scope: $scope"
    
    # Create backup
    create_backup
    
    # Trap to restore backup on failure
    trap 'error "Update failed! Restoring backup..."; restore_backup; exit 1' ERR
    
    case $scope in
        "all"|"root")
            log "Updating root dependencies..."
            update_dependencies "root" "$strategy"
            run_tests "root"
            ;;& # Continue to next case
        "all"|"backend")
            log "Updating backend dependencies..."
            cd backend
            update_dependencies "backend" "$strategy"
            cd ..
            run_tests "backend"
            ;;& # Continue to next case
        "all"|"frontend")
            log "Updating frontend dependencies..."
            cd frontend
            update_dependencies "frontend" "$strategy"
            cd ..
            run_tests "frontend"
            ;;
    esac
    
    # Final integration test
    if [ "$scope" = "all" ]; then
        log "Running integration tests..."
        npm run build || (error "Build failed after updates"; restore_backup; exit 1)
        success "All updates completed successfully!"
    fi
    
    # Clean up trap
    trap - ERR
    
    success "Dependency update completed successfully!"
    log "Backup available at: $(cat .last-backup-path)"
}

# Help function
show_help() {
    cat << EOF
ShopperSprint Dependency Update Script

Usage: $0 [STRATEGY] [SCOPE]

STRATEGIES:
  security     - Fix security vulnerabilities only (recommended first)
  patch        - Update patch versions (safest)
  minor        - Update minor versions (moderate risk)
  major        - Update major versions (breaking changes possible)
  interactive  - Interactive selection (default)

SCOPES:
  all          - Update all packages (default)
  root         - Update root package.json only
  backend      - Update backend packages only
  frontend     - Update frontend packages only

EXAMPLES:
  $0                           # Interactive update for all packages
  $0 security all              # Fix security issues in all packages
  $0 patch backend             # Update backend patch versions
  $0 interactive frontend      # Interactive frontend updates

ROLLBACK:
  $0 rollback                  # Restore from last backup

EOF
}

# Handle rollback
if [ "$1" = "rollback" ]; then
    restore_backup
    exit 0
fi

# Handle help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
