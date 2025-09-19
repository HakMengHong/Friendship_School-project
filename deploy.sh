#!/bin/bash

# Friendship School Management System - Production Deployment Script
# This script automates the deployment process on a Linux server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="friendship-school"
PROJECT_DIR="/opt/friendship-school"
BACKUP_DIR="/backups/friendship-school"
LOG_FILE="/var/log/friendship-school/deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Create log directory
sudo mkdir -p /var/log/friendship-school
sudo chown $USER:$USER /var/log/friendship-school

log "Starting deployment of $PROJECT_NAME..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ first."
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    error "Git is not installed. Please install Git first."
fi

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    log "Creating project directory: $PROJECT_DIR"
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
fi

# Create backup directory
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Backup current deployment if it exists
if [ -f "package.json" ]; then
    log "Creating backup of current deployment..."
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" .
    success "Backup created: $BACKUP_NAME.tar.gz"
fi

# Clone or pull latest code
if [ -d ".git" ]; then
    log "Pulling latest changes from Git..."
    git pull origin main
else
    log "Cloning repository..."
    git clone https://github.com/HakMengHong/Friendship_School-project.git .
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f "env.production.example" ]; then
        log "Creating .env file from template..."
        cp env.production.example .env
        warning "Please update .env file with your production values before continuing."
        warning "Edit the file: nano .env"
        read -p "Press Enter after updating .env file..."
    else
        error ".env file not found and no template available."
    fi
fi

# Install dependencies
log "Installing Node.js dependencies..."
npm install

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate

# Start database services
log "Starting database services..."
docker-compose -f docker-compose.prod.yml up -d postgres pgadmin4

# Wait for database to be ready
log "Waiting for database to be ready..."
sleep 10

# Run database migrations
log "Running database migrations..."
npx prisma migrate deploy

# Add initial users if they don't exist
log "Setting up initial users..."
if [ -f "scripts/add-teachers.js" ]; then
    node scripts/add-teachers.js || warning "Failed to add initial users (may already exist)"
fi

# Build the application
log "Building application for production..."
npm run build

# Stop existing application if running
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q $PROJECT_NAME; then
        log "Stopping existing application..."
        pm2 stop $PROJECT_NAME
        pm2 delete $PROJECT_NAME
    fi
fi

# Start application with PM2
log "Starting application with PM2..."
if command -v pm2 &> /dev/null; then
    pm2 start npm --name $PROJECT_NAME -- start
    pm2 save
    success "Application started with PM2"
else
    warning "PM2 not installed. Starting application directly..."
    npm start &
    success "Application started directly"
fi

# Setup Nginx if available
if command -v nginx &> /dev/null; then
    log "Configuring Nginx..."
    if [ -f "nginx.conf" ]; then
        sudo cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
        sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        success "Nginx configured and reloaded"
    else
        warning "Nginx configuration file not found"
    fi
fi

# Setup SSL with Let's Encrypt if domain is configured
if [ -n "$NEXTAUTH_URL" ] && [[ $NEXTAUTH_URL == https://* ]]; then
    DOMAIN=$(echo $NEXTAUTH_URL | sed 's|https://||' | sed 's|/.*||')
    if command -v certbot &> /dev/null; then
        log "Setting up SSL certificate for $DOMAIN..."
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || warning "SSL setup failed"
    fi
fi

# Setup monitoring
log "Setting up monitoring..."
if command -v pm2 &> /dev/null; then
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 30
fi

# Setup backup cron job
log "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/friendship-school"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker exec friendship-postgres pg_dump -U postgres friendship_school > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /opt/friendship-school .

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Final status check
log "Performing final status check..."

# Check if application is running
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q $PROJECT_NAME; then
        success "Application is running with PM2"
    else
        error "Application failed to start with PM2"
    fi
fi

# Check if database is accessible
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    success "Database services are running"
else
    error "Database services are not running"
fi

# Check if application responds
if curl -f http://localhost:3000/api/auth/heartbeat > /dev/null 2>&1; then
    success "Application is responding to requests"
else
    warning "Application may not be responding to requests"
fi

# Display final information
echo ""
success "Deployment completed successfully!"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "  • Project Directory: $PROJECT_DIR"
echo -e "  • Application URL: http://localhost:3000"
echo -e "  • Database: PostgreSQL (Docker)"
echo -e "  • pgAdmin: http://localhost:8080"
echo -e "  • Logs: /var/log/friendship-school/"
echo -e "  • Backups: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo -e "  1. Update your domain DNS to point to this server"
echo -e "  2. Configure SSL certificate if using a domain"
echo -e "  3. Update .env file with production values"
echo -e "  4. Test all functionality"
echo -e "  5. Setup monitoring and alerting"
echo ""
echo -e "${GREEN}🎉 Your Friendship School Management System is now live!${NC}"
