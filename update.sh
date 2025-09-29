#!/bin/bash

# Friendship School - Update Script
# This script updates the application to the latest version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/friendship-school"

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if application directory exists
check_app_directory() {
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application directory not found: $APP_DIR"
        print_error "Please run the deployment script first"
        exit 1
    fi
}

# Create backup before update
create_backup() {
    print_status "Creating backup before update..."
    
    cd "$APP_DIR"
    
    if [ -f "backup.sh" ]; then
        ./backup.sh
        print_success "Backup created successfully"
    else
        print_warning "Backup script not found, skipping backup"
    fi
}

# Update application code
update_code() {
    print_status "Updating application code..."
    
    cd "$APP_DIR"
    
    if [ -d ".git" ]; then
        print_status "Pulling latest changes from Git..."
        git pull origin main
        print_success "Code updated from Git repository"
    else
        print_warning "Not a Git repository. Please manually update your code."
        print_warning "You can use SCP, SFTP, or copy files to update the application."
        read -p "Press Enter when you have updated your code..."
    fi
}

# Rebuild and restart application
restart_application() {
    print_status "Rebuilding and restarting application..."
    
    cd "$APP_DIR"
    
    # Stop services
    docker-compose -f docker-compose.prod.yml down
    
    # Rebuild and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    print_success "Application restarted successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd "$APP_DIR"
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
    
    print_success "Database migrations completed"
}

# Check application health
check_health() {
    print_status "Checking application health..."
    
    cd "$APP_DIR"
    
    # Check if services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "All services are running"
    else
        print_error "Some services are not running. Check logs:"
        docker-compose -f docker-compose.prod.yml ps
        exit 1
    fi
    
    # Check application endpoint
    if curl -f -s http://localhost:3000/api/auth/heartbeat > /dev/null; then
        print_success "Application is responding to health checks"
    else
        print_warning "Application health check failed. Check logs:"
        docker-compose -f docker-compose.prod.yml logs app
    fi
}

# Clean up old Docker images
cleanup() {
    print_status "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    print_success "Cleanup completed"
}

# Main update function
main() {
    print_status "Starting Friendship School update..."
    
    check_app_directory
    create_backup
    update_code
    restart_application
    run_migrations
    check_health
    cleanup
    
    print_success "Update completed successfully!"
    echo
    print_status "Application status:"
    docker-compose -f "$APP_DIR/docker-compose.prod.yml" ps
    echo
    print_status "Recent logs:"
    docker-compose -f "$APP_DIR/docker-compose.prod.yml" logs --tail=20
}

# Run main function
main "$@"
