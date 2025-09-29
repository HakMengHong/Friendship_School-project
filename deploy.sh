#!/bin/bash

# Friendship School - Ubuntu Server Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="friendship-school"
APP_DIR="/opt/friendship-school"
DOMAIN=""
EMAIL=""

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Install Docker and Docker Compose
install_docker() {
    print_status "Installing Docker and Docker Compose..."
    
    # Update package index
    sudo apt-get update
    
    # Install prerequisites
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up stable repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker and Docker Compose installed successfully"
    print_warning "Please log out and log back in for docker group changes to take effect"
}

# Setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    if [ ! -d "$APP_DIR" ]; then
        sudo mkdir -p "$APP_DIR"
        sudo chown $USER:$USER "$APP_DIR"
        print_success "Created application directory: $APP_DIR"
    else
        print_warning "Application directory already exists: $APP_DIR"
    fi
}

# Clone or update repository
setup_repository() {
    print_status "Setting up repository..."
    
    cd "$APP_DIR"
    
    if [ -d ".git" ]; then
        print_status "Updating existing repository..."
        git pull origin main
    else
        print_status "Please upload your project files to $APP_DIR"
        print_warning "You can use SCP, SFTP, or git clone to upload your project files"
        print_status "Example: scp -r /path/to/your/project/* user@server:$APP_DIR/"
        read -p "Press Enter when you have uploaded your project files..."
    fi
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    cd "$APP_DIR"
    
    if [ ! -f ".env" ]; then
        if [ -f "production.env" ]; then
            cp production.env .env
            print_success "Created .env file from production.env template"
        else
            print_error "No production.env template found. Please create .env file manually."
            exit 1
        fi
    fi
    
    # Generate secure secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update .env file with generated secrets
    sed -i "s/your-production-secret-key-change-this/$NEXTAUTH_SECRET/g" .env
    
    print_success "Environment file configured with secure secrets"
    print_warning "Please review and update .env file with your specific settings"
}

# Deploy application
deploy_application() {
    print_status "Deploying application with Docker..."
    
    cd "$APP_DIR"
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check service status
    docker-compose -f docker-compose.prod.yml ps
    
    print_success "Application deployed successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd "$APP_DIR"
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
    
    print_success "Database setup completed"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Allow necessary ports
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Setup SSL certificate
setup_ssl() {
    if [ -n "$DOMAIN" ]; then
        print_status "Setting up SSL certificate for domain: $DOMAIN"
        
        # Install Certbot
        sudo apt-get install -y certbot python3-certbot-nginx
        
        # Get SSL certificate
        sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_success "SSL certificate configured"
    else
        print_warning "No domain specified. SSL certificate setup skipped."
        print_warning "You can set up SSL later by running: sudo certbot --nginx -d your-domain.com"
    fi
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > "$APP_DIR/backup.sh" << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/friendship-school/backups"
mkdir -p "$BACKUP_DIR"

# Backup database
docker-compose -f /opt/friendship-school/docker-compose.prod.yml exec -T postgres pg_dump -U postgres friendship_school > "$BACKUP_DIR/backup_$DATE.sql"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
EOF
    
    chmod +x "$APP_DIR/backup.sh"
    
    # Setup daily backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -
    
    print_success "Backup script created and scheduled"
}

# Main deployment function
main() {
    print_status "Starting Friendship School deployment..."
    
    # Get user input
    read -p "Enter your domain name (optional, press Enter to skip): " DOMAIN
    if [ -n "$DOMAIN" ]; then
        read -p "Enter your email for SSL certificate: " EMAIL
    fi
    
    # Run deployment steps
    check_root
    install_docker
    setup_app_directory
    setup_repository
    setup_environment
    deploy_application
    setup_database
    configure_firewall
    setup_ssl
    create_backup_script
    
    print_success "Deployment completed successfully!"
    echo
    print_status "Access your application:"
    if [ -n "$DOMAIN" ]; then
        echo "  - Main App: https://$DOMAIN"
        echo "  - pgAdmin: https://$DOMAIN:8080"
    else
        echo "  - Main App: http://$(curl -s ifconfig.me):3000"
        echo "  - pgAdmin: http://$(curl -s ifconfig.me):8080"
    fi
    echo
    print_status "Useful commands:"
    echo "  - View logs: docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f"
    echo "  - Restart app: docker-compose -f $APP_DIR/docker-compose.prod.yml restart app"
    echo "  - Check status: docker-compose -f $APP_DIR/docker-compose.prod.yml ps"
    echo
    print_warning "Please log out and log back in for docker group changes to take effect"
}

# Run main function
main "$@"