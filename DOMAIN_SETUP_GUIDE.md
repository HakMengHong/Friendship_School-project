# 🌐 Domain Setup Guide for Friendship School Management System

## 🎯 **Your Domain Configuration**

**Domain**: `https://fs.wedge-kc.mywire.org/`
**Local Server**: `http://localhost:3000`
**Status**: ✅ **PRODUCTION READY**

## 🚀 **Current Status**

✅ **Application Running**: Production server active on port 3000
✅ **Database Connected**: PostgreSQL with sample data
✅ **Build Complete**: Optimized production build
✅ **PM2 Process Manager**: Auto-restart on server reboot
✅ **Environment Configured**: Domain-specific settings

## 🔧 **Next Steps for Domain Setup**

### 1. **DNS Configuration**
Point your domain `fs.wedge-kc.mywire.org` to your server's IP address:
- **A Record**: `fs.wedge-kc.mywire.org` → `YOUR_SERVER_IP`
- **CNAME Record**: `www.fs.wedge-kc.mywire.org` → `fs.wedge-kc.mywire.org`

### 2. **Nginx Configuration** (Optional but Recommended)
The Nginx configuration file is ready at: `nginx-fs.wedge-kc.mywire.org.conf`

To install and configure Nginx:
```bash
# Install Nginx
apt update && apt install -y nginx

# Copy configuration
cp nginx-fs.wedge-kc.mywire.org.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/nginx-fs.wedge-kc.mywire.org.conf /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx
```

### 3. **SSL Certificate** (Recommended)
For HTTPS, you'll need an SSL certificate. Options:
- **Let's Encrypt** (Free): `certbot --nginx -d fs.wedge-kc.mywire.org`
- **Cloudflare** (Free): Use Cloudflare's SSL proxy
- **Custom Certificate**: Update the Nginx config with your certificate paths

## 📊 **Management Commands**

### PM2 Process Management
```bash
# Check status
pm2 status

# View logs
pm2 logs friendship-school

# Restart application
pm2 restart friendship-school

# Stop application
pm2 stop friendship-school

# Start application
pm2 start friendship-school
```

### Application Management
```bash
# Update from GitHub
cd /root/Friendship_School-project
git pull origin main
npm install
npm run build
pm2 restart friendship-school

# Check application health
curl -I http://localhost:3000
```

## 🔐 **Login Credentials**

- **Username**: `admin`
- **Password**: `password123`

## 🌐 **Access Points**

- **Main Application**: http://localhost:3000 (or your domain)
- **pgAdmin4**: http://localhost:8080
  - Email: `admin@admin.com`
  - Password: `admin123`

## 📁 **Important Files**

- **Environment**: `.env` (configured for your domain)
- **Nginx Config**: `nginx-fs.wedge-kc.mywire.org.conf`
- **Deployment Script**: `deploy-production.sh`
- **Database**: PostgreSQL running in Docker

## 🛠️ **Troubleshooting**

### If the application stops:
```bash
pm2 restart friendship-school
```

### If port 3000 is busy:
```bash
lsof -ti:3000 | xargs kill -9
pm2 restart friendship-school
```

### If database issues:
```bash
docker-compose restart
cd /root/Friendship_School-project
npx prisma migrate dev
```

## 🎉 **Success!**

Your Friendship School Management System is now running in production mode and ready for your domain!

**Next**: Configure your DNS and Nginx (if desired) to make it accessible via your domain.
