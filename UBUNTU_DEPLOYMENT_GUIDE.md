# Ubuntu Server Deployment Guide
## Friendship School Management System

This guide will help you deploy the Friendship School project to your Ubuntu server.

### 🖥️ Server Requirements

- **OS**: Ubuntu 20.04 LTS or newer
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB free space
- **CPU**: 2 cores minimum
- **Network**: Internet connection for package installation

### 📋 Prerequisites

1. **Docker & Docker Compose**
2. **Git**
3. **Nginx** (if not using Docker)
4. **Domain name** (optional but recommended)

---

## 🚀 Quick Deployment (Recommended)

### Step 1: Prepare Your Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### Step 2: Clone and Setup Project

```bash
# Create application directory
sudo mkdir -p /opt/friendship-school
sudo chown $USER:$USER /opt/friendship-school
cd /opt/friendship-school

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/friendship-school-project.git .

# Or upload your project files using SCP/SFTP
```

### Step 3: Configure Environment

```bash
# Create production environment file
cp production.env .env

# Edit the environment file
nano .env
```

**Update these values in `.env`:**
```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@postgres:5432/friendship_school"

# Authentication (GENERATE SECURE SECRET)
NEXTAUTH_SECRET="your-super-secure-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.com"  # or http://your-server-ip

# Database Settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=friendship_school

# pgAdmin Settings
PGADMIN_EMAIL=admin@your-domain.com
PGADMIN_PASSWORD=YOUR_PGADMIN_PASSWORD

# Application Settings
NODE_ENV=production
PORT=3000
```

### Step 4: Deploy with Docker

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Setup Database

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# (Optional) Seed initial data
docker-compose -f docker-compose.prod.yml exec app npm run db:seed
```

### Step 6: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22  # SSH
sudo ufw enable
```

---

## 🔧 Manual Deployment (Alternative)

If you prefer not to use Docker, follow these steps:

### Step 1: Install Node.js and Dependencies

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE friendship_school;
CREATE USER friendship_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE friendship_school TO friendship_user;
\q
```

### Step 3: Deploy Application

```bash
# Navigate to project directory
cd /opt/friendship-school

# Install dependencies
npm install

# Build application
npm run build

# Run migrations
npx prisma migrate deploy
```

### Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'friendship-school',
    script: 'npm',
    args: 'start',
    cwd: '/opt/friendship-school',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 Nginx Configuration

### Option 1: Docker Nginx (Recommended)

The Docker setup includes Nginx configuration. Update `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Option 2: System Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/friendship-school
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/friendship-school /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Check application status
curl http://localhost:3000/api/auth/heartbeat

# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# View application logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Backup Database

```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres friendship_school > /opt/friendship-school/backups/backup_$DATE.sql
find /opt/friendship-school/backups -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/friendship-school/backup.sh
```

### Update Application

```bash
# Pull latest changes
cd /opt/friendship-school
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo netstat -tlnp | grep :3000
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml logs postgres
   docker-compose -f docker-compose.prod.yml restart postgres
   ```

3. **Application Not Starting**
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   docker-compose -f docker-compose.prod.yml restart app
   ```

4. **Permission Issues**
   ```bash
   sudo chown -R $USER:$USER /opt/friendship-school
   chmod +x *.sh
   ```

### Useful Commands

```bash
# View all containers
docker ps -a

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app

# View resource usage
docker stats

# Clean up unused containers/images
docker system prune -a
```

---

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify environment variables in `.env`
3. Ensure all ports are accessible
4. Check firewall settings
5. Verify domain DNS settings

---

## 🎯 Access Points

After successful deployment:

- **Main Application**: `https://your-domain.com` or `http://your-server-ip`
- **pgAdmin**: `https://your-domain.com:8080` or `http://your-server-ip:8080`
- **API Health**: `https://your-domain.com/api/auth/heartbeat`

---

**🎉 Congratulations! Your Friendship School Management System is now deployed!**
