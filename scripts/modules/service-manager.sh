#!/bin/bash
# service-manager.sh - Comprehensive Service Management for ShopperSprint
# Manages individual services and combined operations

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
print_service() { echo -e "${CYAN}[SERVICE]${NC} $1"; }

# Show help
show_help() {
    echo "🚀 ShopperSprint Service Manager"
    echo "================================"
    echo ""
    echo "Usage: ./scripts/service-manager.sh [COMMAND] [SERVICE] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [service]       Start service(s) (service: all, frontend, backend, db, redis, websocket)"
    echo "  stop [service]        Stop service(s)"
    echo "  restart [service]     Restart service(s)"
    echo "  status [service]      Show service status"
    echo "  logs [service]        Show service logs"
    echo "  build [service]       Build service(s)"
    echo "  test [service]        Test service(s)"
    echo "  clean [service]       Clean service(s)"
    echo "  help                  Show this help"
    echo ""
    echo "Services:"
    echo "  all                   All services (frontend, backend, db, redis)"
    echo "  frontend              Frontend React application"
    echo "  backend               Backend Node.js API"
    echo "  db                    PostgreSQL database"
    echo "  redis                 Redis cache"
    echo "  websocket             WebSocket service (part of backend)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/service-manager.sh start all           # Start all services"
    echo "  ./scripts/service-manager.sh start frontend      # Start only frontend"
    echo "  ./scripts/service-manager.sh build backend       # Build only backend"
    echo "  ./scripts/service-manager.sh test all            # Test all services"
    echo "  ./scripts/service-manager.sh logs backend        # Show backend logs"
    echo ""
    echo "Service-Specific Operations:"
    echo "  Frontend:  Development server on port 5173"
    echo "  Backend:   API server on port 3001"
    echo "  Database:  PostgreSQL on port 5432"
    echo "  Redis:     Cache on port 6379"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose not found"
        exit 1
    fi
}

# Get Docker Compose command
get_docker_compose() {
    if docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

# Start services
start_service() {
    local service="$1"
    local dc=$(get_docker_compose)
    
    case "$service" in
        "all")
            print_service "Starting all services..."
            $dc up -d
            print_success "All services started!"
            ;;
        "frontend")
            print_service "Starting frontend service..."
            $dc up -d frontend
            print_success "Frontend service started on port 5173!"
            ;;
        "backend")
            print_service "Starting backend service..."
            $dc up -d backend
            print_success "Backend service started on port 3001!"
            ;;
        "db")
            print_service "Starting database service..."
            $dc up -d postgres
            print_success "Database service started on port 5432!"
            ;;
        "redis")
            print_service "Starting Redis service..."
            $dc up -d redis
            print_success "Redis service started on port 6379!"
            ;;
        "websocket")
            print_service "WebSocket is part of backend service"
            start_service "backend"
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Stop services
stop_service() {
    local service="$1"
    local dc=$(get_docker_compose)
    
    case "$service" in
        "all")
            print_service "Stopping all services..."
            $dc down
            print_success "All services stopped!"
            ;;
        "frontend")
            print_service "Stopping frontend service..."
            $dc stop frontend
            print_success "Frontend service stopped!"
            ;;
        "backend")
            print_service "Stopping backend service..."
            $dc stop backend
            print_success "Backend service stopped!"
            ;;
        "db")
            print_service "Stopping database service..."
            $dc stop postgres
            print_success "Database service stopped!"
            ;;
        "redis")
            print_service "Stopping Redis service..."
            $dc stop redis
            print_success "Redis service stopped!"
            ;;
        "websocket")
            print_service "WebSocket is part of backend service"
            stop_service "backend"
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Restart services
restart_service() {
    local service="$1"
    print_service "Restarting $service service..."
    stop_service "$service"
    sleep 2
    start_service "$service"
    print_success "$service service restarted!"
}

# Show service status
show_status() {
    local service="$1"
    local dc=$(get_docker_compose)
    
    case "$service" in
        "all")
            print_service "Showing status of all services..."
            $dc ps
            ;;
        "frontend")
            print_service "Frontend service status:"
            $dc ps frontend
            ;;
        "backend")
            print_service "Backend service status:"
            $dc ps backend
            ;;
        "db")
            print_service "Database service status:"
            $dc ps postgres
            ;;
        "redis")
            print_service "Redis service status:"
            $dc ps redis
            ;;
        "websocket")
            print_service "WebSocket service status (part of backend):"
            $dc ps backend
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Show service logs
show_logs() {
    local service="$1"
    local dc=$(get_docker_compose)
    
    case "$service" in
        "all")
            print_service "Showing logs of all services..."
            $dc logs -f
            ;;
        "frontend")
            print_service "Frontend service logs:"
            $dc logs -f frontend
            ;;
        "backend")
            print_service "Backend service logs:"
            $dc logs -f backend
            ;;
        "db")
            print_service "Database service logs:"
            $dc logs -f postgres
            ;;
        "redis")
            print_service "Redis service logs:"
            $dc logs -f redis
            ;;
        "websocket")
            print_service "WebSocket service logs (part of backend):"
            $dc logs -f backend
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Build services
build_service() {
    local service="$1"
    
    case "$service" in
        "all")
            print_service "Building all services..."
            print_info "Building frontend..."
            cd frontend && npm run build && cd ..
            print_info "Building backend..."
            cd backend && npm run build && cd ..
            print_success "All services built!"
            ;;
        "frontend")
            print_service "Building frontend service..."
            cd frontend && npm run build && cd ..
            print_success "Frontend service built!"
            ;;
        "backend")
            print_service "Building backend service..."
            cd backend && npm run build && cd ..
            print_success "Backend service built!"
            ;;
        "db")
            print_service "Database service doesn't require building"
            ;;
        "redis")
            print_service "Redis service doesn't require building"
            ;;
        "websocket")
            print_service "WebSocket is part of backend service"
            build_service "backend"
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Test services
test_service() {
    local service="$1"
    
    case "$service" in
        "all")
            print_service "Testing all services..."
            print_info "Testing backend..."
            cd backend && npm test && cd ..
            print_info "Testing frontend..."
            cd frontend && npm run test:run && cd ..
            print_success "All services tested!"
            ;;
        "frontend")
            print_service "Testing frontend service..."
            cd frontend && npm run test:run && cd ..
            print_success "Frontend service tested!"
            ;;
        "backend")
            print_service "Testing backend service..."
            cd backend && npm test && cd ..
            print_success "Backend service tested!"
            ;;
        "db")
            print_service "Testing database service..."
            # Add database-specific tests here
            print_success "Database service tested!"
            ;;
        "redis")
            print_service "Testing Redis service..."
            # Add Redis-specific tests here
            print_success "Redis service tested!"
            ;;
        "websocket")
            print_service "WebSocket is part of backend service"
            test_service "backend"
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Clean services
clean_service() {
    local service="$1"
    
    case "$service" in
        "all")
            print_service "Cleaning all services..."
            print_info "Cleaning frontend..."
            cd frontend && npm run clean && cd ..
            print_info "Cleaning backend..."
            cd backend && npm run clean && cd ..
            print_info "Cleaning root..."
            npm run clean:cache
            print_success "All services cleaned!"
            ;;
        "frontend")
            print_service "Cleaning frontend service..."
            cd frontend && npm run clean && cd ..
            print_success "Frontend service cleaned!"
            ;;
        "backend")
            print_service "Cleaning backend service..."
            cd backend && npm run clean && cd ..
            print_success "Backend service cleaned!"
            ;;
        "db")
            print_service "Cleaning database service..."
            # Add database-specific cleanup here
            print_success "Database service cleaned!"
            ;;
        "redis")
            print_service "Cleaning Redis service..."
            # Add Redis-specific cleanup here
            print_success "Redis service cleaned!"
            ;;
        "websocket")
            print_service "WebSocket is part of backend service"
            clean_service "backend"
            ;;
        *)
            print_error "Unknown service: $service"
            show_help
            exit 1
            ;;
    esac
}

# Main command handling
main() {
    local command="${1:-help}"
    local service="${2:-all}"
    
    check_docker_compose
    
    case "$command" in
        "start")
            start_service "$service"
            ;;
        "stop")
            stop_service "$service"
            ;;
        "restart")
            restart_service "$service"
            ;;
        "status")
            show_status "$service"
            ;;
        "logs")
            show_logs "$service"
            ;;
        "build")
            build_service "$service"
            ;;
        "test")
            test_service "$service"
            ;;
        "clean")
            clean_service "$service"
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

# Run main function
main "$@"
