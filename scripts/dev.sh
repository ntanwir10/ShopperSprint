#!/bin/bash
# dev.sh - Complete development environment manager
# Replaces: local-servers.sh, local-db.sh, docker-dev.sh

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

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Create .env.docker if it doesn't exist
create_docker_env() {
    if [[ ! -f .env.docker ]]; then
        print_info "Creating .env.docker for containerized development..."
        cat > .env.docker << 'EOF'
# Docker Development Environment
POSTGRES_DB=shoppersprint
POSTGRES_USER=shoppersprint
POSTGRES_PASSWORD=devpassword123
REDIS_PASSWORD=devpassword123
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-key
DB_HOST=postgres
DB_PORT=5432
DB_USER=shoppersprint
DB_PASSWORD=devpassword123
DB_NAME=shoppersprint
REDIS_URL=redis://:devpassword123@redis:6379
PORT=3001
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3001/api
VITE_BACKEND_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
EOF
        print_success "Created .env.docker"
    fi
}

# Start development environment
start() {
    local mode="${1:-hybrid}"
    
    print_info "Starting development environment in $mode mode..."
    check_docker
    
    if [[ "$mode" == "docker" ]]; then
        # Full Docker mode
        create_docker_env
        print_info "Starting full containerized environment..."
        docker-compose --env-file .env.docker up -d --profile dev
    else
        # Hybrid mode (default)
        print_info "Starting hybrid environment (infrastructure in Docker, apps locally)..."
        docker-compose up -d postgres redis
        
        # Start apps locally in background
        print_info "Starting backend..."
        cd ./backend && npm run dev &
        echo $! > ../.backend.pid
        cd ..
        
        print_info "Starting frontend..."
        cd ./frontend && npm run dev &
        echo $! > ../.frontend.pid
        cd ..
    fi
    
    print_success "Development environment started!"
    status
}

# Stop development environment
stop() {
    print_info "Stopping development environment..."
    
    # Stop Docker containers
    docker-compose down --profile dev 2>/dev/null || true
    
    # Stop local processes
    if [[ -f .backend.pid ]]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm -f .backend.pid
    fi
    
    if [[ -f .frontend.pid ]]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm -f .frontend.pid
    fi
    
    print_success "Development environment stopped!"
}

# Show status
status() {
    print_info "Development Environment Status:"
    docker-compose ps
    
    echo ""
    print_info "Access URLs:"
    echo "  🎨 Frontend:  http://localhost:5173"
    echo "  ⚙️  Backend:   http://localhost:3001"
    echo "  🗄️  Database:  localhost:5432"
    echo "  🔴 Redis:     localhost:6379"
}

# Database operations
db_reset() {
    print_info "Resetting database..."
    docker-compose exec postgres psql -U shoppersprint -d shoppersprint -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    print_success "Database reset complete!"
}

db_seed() {
    print_info "Seeding database..."
    cd backend && npm run db:seed
    cd ..
    print_success "Database seeded!"
}

# Show logs
logs() {
    local service="$1"
    if [[ -n "$service" ]]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Health check
health() {
    print_info "Checking service health..."
    
    # Check database
    if docker-compose exec postgres pg_isready -U shoppersprint >/dev/null 2>&1; then
        echo "✅ Database: Healthy"
    else
        echo "❌ Database: Unhealthy"
    fi
    
    # Check Redis
    if docker-compose exec redis redis-cli ping >/dev/null 2>&1; then
        echo "✅ Redis: Healthy"
    else
        echo "❌ Redis: Unhealthy"
    fi
    
    # Check backend
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Backend: Healthy"
    else
        echo "❌ Backend: Unhealthy"
    fi
    
    # Check frontend
    if curl -f http://localhost:5173 >/dev/null 2>&1; then
        echo "✅ Frontend: Healthy"
    else
        echo "❌ Frontend: Unhealthy"
    fi
}

# Show help
help() {
    echo "🚀 Development Environment Manager"
    echo ""
    echo "Usage: ./dev.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [hybrid|docker]  Start development environment"
    echo "  stop                   Stop development environment"
    echo "  restart [hybrid|docker] Restart development environment"
    echo "  status                 Show service status"
    echo "  logs [service]         Show logs"
    echo "  health                 Check service health"
    echo "  db reset               Reset database"
    echo "  db seed                Seed database"
    echo "  help                   Show this help"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start         # Start hybrid mode (default)"
    echo "  ./dev.sh start docker  # Start full Docker mode"
    echo "  ./dev.sh logs backend  # Show backend logs"
    echo "  ./dev.sh db reset      # Reset database"
}

# Main command handling
case "${1:-help}" in
    start)
        start "$2"
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start "$2"
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    health)
        health
        ;;
    db)
        case "$2" in
            reset) db_reset ;;
            seed) db_seed ;;
            *) echo "Usage: ./dev.sh db [reset|seed]" ;;
        esac
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
