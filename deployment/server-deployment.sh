#!/bin/bash
# Ubuntu Server Deployment Script for fs.wedge-kc.mywire.org
# IP: 192.168.6.245

set -e

echo "🚀 Starting Friendship School deployment on Ubuntu Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# 3. Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# 4. Install Node.js
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed successfully"
else
    print_status "Node.js already installed"
fi

# 5. Install PM2
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed successfully"
else
    print_status "PM2 already installed"
fi

# 6. Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    print_status "Nginx installed successfully"
else
    print_status "Nginx already installed"
fi

# 7. Install Certbot for SSL
print_status "Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    print_status "Certbot installed successfully"
else
    print_status "Certbot already installed"
fi

# 8. Install UFW firewall
print_status "Installing UFW firewall..."
if ! command -v ufw &> /dev/null; then
    sudo apt install ufw -y
    print_status "UFW installed successfully"
else
    print_status "UFW already installed"
fi

# 9. Configure firewall
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
print_status "Firewall configured"

# 10. Create project directory
PROJECT_DIR="/opt/friendship-school"
print_status "Setting up project directory at $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# 11. Create environment file
print_status "Creating production environment file..."
cat > $PROJECT_DIR/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:password123@localhost:5432/postgres"

# Authentication
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://fs.wedge-kc.mywire.org"

# Application Settings
NODE_ENV="production"
PORT=3000
EOF

# 12. Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'friendship-school',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://postgres:password123@localhost:5432/postgres'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# 13. Create logs directory
mkdir -p $PROJECT_DIR/logs

# 14. Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo cp nginx-server.conf /etc/nginx/sites-available/friendship-school
sudo ln -sf /etc/nginx/sites-available/friendship-school /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 15. Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# 16. Start Nginx
print_status "Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# 17. Create monitoring script
print_status "Creating monitoring script..."
cat > $PROJECT_DIR/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Friendship School System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Application Status ==="
pm2 status
echo ""
echo "=== Database Status ==="
docker-compose ps
echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l
EOF

chmod +x $PROJECT_DIR/monitor.sh

# 18. Create backup script
print_status "Creating backup script..."
cat > $PROJECT_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Creating database backup..."
docker exec postgres pg_dump -U postgres postgres > $BACKUP_DIR/db_backup_$DATE.sql

echo "Creating application backup..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /opt/friendship-school .

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x $PROJECT_DIR/backup.sh

# 19. Setup cron jobs
print_status "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/friendship-school/backup.sh") | crontab -

print_status "🎉 Server setup completed!"
print_status "Next steps:"
print_status "1. Copy your project files to $PROJECT_DIR"
print_status "2. Run: cd $PROJECT_DIR && npm install"
print_status "3. Run: npx prisma generate && npx prisma migrate deploy"
print_status "4. Run: npm run build"
print_status "5. Run: pm2 start ecosystem.config.js"
print_status "6. Run: sudo certbot --nginx -d fs.wedge-kc.mywire.org"
print_status ""
print_status "Your application will be available at:"
print_status "HTTP: http://fs.wedge-kc.mywire.org"
print_status "HTTPS: https://fs.wedge-kc.mywire.org (after SSL setup)"
print_status "pgAdmin: http://fs.wedge-kc.mywire.org:8080"
