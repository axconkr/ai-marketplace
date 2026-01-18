#!/bin/bash

# AI Marketplace - Docker Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs|update]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Please create .env file from .env.example"
        exit 1
    fi
}

# Start services
start() {
    log_info "Starting AI Marketplace..."
    check_env

    # Build and start containers
    docker-compose -f docker-compose.prod.yml up -d --build

    log_info "Waiting for services to be ready..."
    sleep 10

    # Check health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "✓ AI Marketplace is running!"
        log_info "Access at: http://localhost"
    else
        log_warn "Service started but health check failed. Check logs with: ./deploy.sh logs"
    fi
}

# Stop services
stop() {
    log_info "Stopping AI Marketplace..."
    docker-compose -f docker-compose.prod.yml down
    log_info "✓ Stopped"
}

# Restart services
restart() {
    log_info "Restarting AI Marketplace..."
    stop
    sleep 2
    start
}

# View logs
logs() {
    docker-compose -f docker-compose.prod.yml logs -f --tail=100
}

# Update application
update() {
    log_info "Updating AI Marketplace..."

    # Pull latest code
    git pull origin main

    # Rebuild and restart
    docker-compose -f docker-compose.prod.yml up -d --build

    log_info "✓ Update complete!"
}

# Show status
status() {
    log_info "Service Status:"
    docker-compose -f docker-compose.prod.yml ps
}

# Main
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    update)
        update
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|update|status}"
        exit 1
        ;;
esac
