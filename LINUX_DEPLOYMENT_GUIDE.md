# 🐧 Linux Server Deployment Guide
# Friendship School Management System

## 🎯 **Overview**

This guide will help you deploy your Friendship School Management System on a Linux server with various deployment options, from simple VPS to enterprise-grade cloud solutions.

## 🚀 **Deployment Options**

### **Option 1: Docker Deployment (Recommended)**

#### **Prerequisites**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y
```

#### **Deployment Steps**
```bash
# Clone your repository
git clone https://github.com/HakMengHong/Friendship_School-project.git
cd Friendship_School-project

# Create production environment file
cat > .env << EOF
DATABASE_URL="postgresql://postgres:password123@postgres:5432/postgres"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
EOF

# Start database services
docker-compose up -d

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Add initial users
node scripts/add-teachers.js

# Build the application
npm run build

# Start production server
npm start
```

### **Option 2: PM2 Process Manager**

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'friendship-school',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/project',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### **Option 3: Nginx Reverse Proxy**

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/friendship-school << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/friendship-school /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Option 4: SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 **Production Optimizations**

### **1. Environment Configuration**

```bash
# Create production environment
cat > .env.production << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/friendship_school_prod"

# Security
NEXTAUTH_SECRET="your-super-secure-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"

# Application
NODE_ENV="production"
PORT=3000

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"

# Optional: Email service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EOF
```

### **2. Database Optimization**

```bash
# PostgreSQL configuration for production
sudo nano /etc/postgresql/14/main/postgresql.conf

# Add these optimizations:
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### **3. System Monitoring**

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Create monitoring script
cat > monitor.sh << EOF
#!/bin/bash
echo "=== System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory Usage:"
free -h
echo "Disk Usage:"
df -h
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)"
echo "=== Application Status ==="
pm2 status
echo "=== Database Status ==="
docker-compose ps
EOF

chmod +x monitor.sh
```

## 🌐 **Cloud Deployment Options**

### **1. DigitalOcean Droplet**

```bash
# Create a new droplet (Ubuntu 20.04 LTS)
# Minimum specs: 2GB RAM, 1 CPU, 50GB SSD

# Connect via SSH
ssh root@your-droplet-ip

# Follow the Docker deployment steps above
```

### **2. AWS EC2**

```bash
# Launch EC2 instance (t3.small or larger)
# AMI: Ubuntu Server 20.04 LTS

# Security Group Rules:
# - SSH (22) from your IP
# - HTTP (80) from anywhere
# - HTTPS (443) from anywhere
# - Custom TCP (3000) from anywhere (if not using reverse proxy)

# Connect and deploy
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### **3. Google Cloud Platform**

```bash
# Create VM instance
gcloud compute instances create friendship-school \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-small \
    --zone=us-central1-a

# Connect and deploy
gcloud compute ssh friendship-school --zone=us-central1-a
```

### **4. Azure VM**

```bash
# Create resource group
az group create --name friendship-school-rg --location eastus

# Create VM
az vm create \
    --resource-group friendship-school-rg \
    --name friendship-school-vm \
    --image UbuntuLTS \
    --size Standard_B1s \
    --admin-username azureuser \
    --generate-ssh-keys

# Connect and deploy
ssh azureuser@your-vm-ip
```

## 🔒 **Security Hardening**

### **1. Firewall Configuration**

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **2. Fail2Ban Setup**

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure for Nginx
sudo cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl restart fail2ban
```

### **3. Database Security**

```bash
# Secure PostgreSQL
sudo -u postgres psql
ALTER USER postgres PASSWORD 'your-strong-password';
CREATE USER app_user WITH PASSWORD 'app-password';
GRANT ALL PRIVILEGES ON DATABASE postgres TO app_user;
\q

# Update connection string
DATABASE_URL="postgresql://app_user:app-password@localhost:5432/postgres"
```

## 📊 **Backup Strategy**

### **1. Database Backup**

```bash
# Create backup script
cat > backup-db.sh << EOF
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec postgres pg_dump -U postgres postgres > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
EOF

chmod +x backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

### **2. Application Backup**

```bash
# Create application backup script
cat > backup-app.sh << EOF
#!/bin/bash
APP_DIR="/path/to/your/project"
BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
EOF

chmod +x backup-app.sh
```

## 🚀 **Performance Optimization**

### **1. Enable Gzip Compression**

```bash
# Add to Nginx configuration
sudo nano /etc/nginx/sites-available/friendship-school

# Add these lines inside server block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### **2. Enable Caching**

```bash
# Add caching headers to Nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### **3. Database Indexing**

```sql
-- Connect to database and add indexes
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_attendance_date ON attendances("attendanceDate");
CREATE INDEX idx_grades_student ON grades("studentId");
CREATE INDEX idx_grades_course ON grades("courseId");
```

## 📈 **Monitoring & Logging**

### **1. Application Logs**

```bash
# Create log directory
mkdir -p /var/log/friendship-school

# Configure PM2 logging
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### **2. System Monitoring**

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Create system monitoring script
cat > system-monitor.sh << EOF
#!/bin/bash
echo "=== System Status $(date) ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)"
echo "Memory Usage:"
free -h
echo "Disk Usage:"
df -h
echo "Network Usage:"
nethogs -d 1 -t
EOF

chmod +x system-monitor.sh
```

## 🔄 **Deployment Automation**

### **1. Deployment Script**

```bash
# Create deployment script
cat > deploy.sh << EOF
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Restart PM2
pm2 restart friendship-school

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh
```

### **2. GitHub Actions CI/CD**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/your/project
          ./deploy.sh
```

## 🎯 **Quick Start Commands**

### **Complete Setup (Ubuntu/Debian)**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install git nodejs npm nginx certbot python3-certbot-nginx -y

# 3. Clone and setup project
git clone https://github.com/HakMengHong/Friendship_School-project.git
cd Friendship_School-project

# 4. Configure environment
cp .env.example .env
# Edit .env with your production values

# 5. Start services
docker-compose up -d
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# 6. Start application
npm install -g pm2
pm2 start npm --name "friendship-school" -- start
pm2 save
pm2 startup

# 7. Configure Nginx (optional)
sudo nano /etc/nginx/sites-available/friendship-school
# Add your domain configuration

# 8. Setup SSL (optional)
sudo certbot --nginx -d yourdomain.com
```

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID
   ```

2. **Database connection failed**
   ```bash
   docker-compose logs postgres
   docker-compose restart postgres
   ```

3. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   chmod +x scripts/*.sh
   ```

4. **Out of memory**
   ```bash
   # Check memory usage
   free -h
   # Add swap if needed
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📞 **Support**

If you encounter any issues during deployment:

1. Check the logs: `pm2 logs friendship-school`
2. Verify database connection: `node scripts/check-database.js`
3. Check system resources: `htop`
4. Review Nginx configuration: `sudo nginx -t`

---

**Happy deploying! 🚀**

Your Friendship School Management System is now ready for production use on Linux servers!
