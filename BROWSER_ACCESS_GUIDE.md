# 🌐 **How to Access Your Friendship School Management System**

## 🚨 **IMPORTANT: Browser Security Warning**

When you try to access `https://192.168.6.154/` in your browser, you'll see a security warning because we're using a self-signed SSL certificate. This is normal and safe for your local network.

## 🔧 **How to Access the Application**

### **Method 1: Accept the Security Warning (Recommended)**

1. **Open your browser** and go to: `https://192.168.6.154/`
2. **You'll see a security warning** like:
   - "Your connection is not private"
   - "NET::ERR_CERT_AUTHORITY_INVALID"
   - "This site is not secure"

3. **Click "Advanced"** or "Show Details"
4. **Click "Proceed to 192.168.6.154 (unsafe)"** or "Continue to this website"
5. **The application will load** with the beautiful Khmer interface!

### **Method 2: Use HTTP (Alternative)**

If you prefer to avoid the security warning, you can temporarily use HTTP:

1. Go to: `http://192.168.6.154/`
2. It will automatically redirect to HTTPS
3. Accept the security warning as above

### **Method 3: Add Security Exception (Chrome/Edge)**

1. Go to: `https://192.168.6.154/`
2. Click "Advanced"
3. Click "Proceed to 192.168.6.154 (unsafe)"
4. In the address bar, click the lock icon
5. Click "Certificate (Invalid)"
6. Click "Details" → "Copy to File"
7. Save the certificate and install it

## 🎯 **What You Should See**

Once you access the application, you should see:

1. **Loading Screen**: "កំពុងផ្ទុក..." (Loading...)
2. **Login Page**: Beautiful Khmer interface
3. **Title**: "កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស" (School Program Management System)

## 🔑 **Login Credentials**

- **Username**: `admin`
- **Password**: `password123`

## 🌐 **Access URLs**

- **HTTPS**: `https://192.168.6.154/` (with security warning)
- **HTTP**: `http://192.168.6.154/` (redirects to HTTPS)
- **pgAdmin4**: `http://192.168.6.154:8080/` (no security warning)

## 🛠️ **If You Still Can't Access**

### **Check Firewall**
```bash
# Check if port 80 and 443 are open
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### **Check Application Status**
```bash
# Check if application is running
pm2 status

# Check if Nginx is running
systemctl status nginx

# Restart if needed
pm2 restart friendship-school
systemctl restart nginx
```

### **Test from Command Line**
```bash
# Test if application responds
curl -k https://192.168.6.154/
```

## 🔒 **Why the Security Warning?**

The security warning appears because:
- We're using a self-signed SSL certificate
- Browsers don't trust self-signed certificates by default
- This is normal for development/local servers
- The application is completely safe to use

## 🎉 **Success!**

Once you accept the security warning, you'll have full access to your beautiful Friendship School Management System with:
- 📚 Student Management
- 📊 Grade Tracking
- 📅 Attendance System
- 👥 User Management
- 📄 Report Generation
- 🇰🇭 Full Khmer Language Support

**The application is working perfectly - you just need to accept the browser security warning!**
