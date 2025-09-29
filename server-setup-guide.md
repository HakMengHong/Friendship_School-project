# 🐧 Ubuntu Server Deployment Guide
## Friendship School Management System
### Domain: https://fs.wedge-kc.mywire.org | IP: 192.168.6.245

---

## 🚀 **Quick Start Commands**

### **1. Upload Files to Server**
```bash
# Copy project files to server
scp -r . user@192.168.6.245:/opt/friendship-school/

# Or use rsync for better performance
rsync -avz --exclude node_modules --exclude .git . user@192.168.6.245:/opt/friendship-school/
```

### **2. Run Deployment Script**
```bash
# SSH into your server
ssh user@192.168.6.245

# Navigate to project directory
cd /opt/friendship-school

# Make script executable
chmod +x server-deployment.sh

# Run deployment script
./server-deployment.sh
```

### **3. Manual Setup Steps**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 🔧 **Configuration Files**

### **Environment Variables (.env)**
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/postgres"
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://fs.wedge-kc.mywire.org"
NODE_ENV="production"
PORT=3000
```

### **Nginx Configuration**
- **File:** `/etc/nginx/sites-available/friendship-school`
- **Domain:** `fs.wedge-kc.mywire.org`
- **Port:** 80 (HTTP) → 443 (HTTPS)

### **Docker Services**
- **PostgreSQL:** Port 5432
- **pgAdmin:** Port 8080
- **Next.js App:** Port 3000 (PM2 managed)

---

## 🌐 **Access Points**

| **Service** | **URL** | **Purpose** |
|-------------|---------|-------------|
| **Main App** | https://fs.wedge-kc.mywire.org | School Management System |
| **pgAdmin** | http://fs.wedge-kc.mywire.org:8080 | Database Administration |
| **Health Check** | https://fs.wedge-kc.mywire.org/health | System Health |

---

## 🔒 **SSL Certificate Setup**

### **Install SSL Certificate**
```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d fs.wedge-kc.mywire.org

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## 📊 **Monitoring & Maintenance**

### **Check System Status**
```bash
# Application status
pm2 status
pm2 logs

# Database status
docker-compose ps

# Nginx status
sudo systemctl status nginx

# System monitoring
./monitor.sh
```

### **Backup Database**
```bash
# Manual backup
./backup.sh

# Automated backups run daily at 2 AM
```

### **Update Application**
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart PM2
pm2 restart all
```

---

## 🛡️ **Security Checklist**

- ✅ **Firewall configured** (UFW)
- ✅ **SSL certificate** (Let's Encrypt)
- ✅ **Rate limiting** (Nginx)
- ✅ **Security headers** (Nginx)
- ✅ **Process management** (PM2)
- ✅ **Automated backups** (Cron)
- ✅ **Database in Docker** (Isolated)

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Port 3000 not accessible**
   ```bash
   # Check if PM2 is running
   pm2 status
   
   # Check if port is open
   sudo netstat -tlnp | grep :3000
   ```

2. **Database connection failed**
   ```bash
   # Check Docker containers
   docker-compose ps
   
   # Check database logs
   docker-compose logs postgres
   ```

3. **Nginx not serving content**
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

---

## 📈 **Performance Optimization**

### **PM2 Cluster Mode**
- **Instances:** Max (CPU cores)
- **Memory limit:** 1GB per instance
- **Auto-restart:** Enabled

### **Nginx Caching**
- **Static files:** 1 year cache
- **API responses:** No cache
- **Gzip compression:** Enabled

### **Database Optimization**
- **Connection pooling:** 20 connections
- **Query optimization:** Prisma built-in
- **Indexes:** Auto-generated

---

## 🔄 **Update Process**

1. **Backup current version**
2. **Pull latest code**
3. **Install dependencies**
4. **Run migrations**
5. **Build application**
6. **Restart services**
7. **Verify functionality**

---

## 📞 **Support**

For issues or questions:
1. Check logs: `pm2 logs` or `docker-compose logs`
2. Monitor system: `./monitor.sh`
3. Check health: `curl https://fs.wedge-kc.mywire.org/health`
