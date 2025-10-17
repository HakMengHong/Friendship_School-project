# 🌐 **VPN Access Guide for Friendship School Management System**

## 🔍 **Current Network Configuration**

**Server Details:**
- **Public IP**: `116.212.139.149`
- **Private IP**: `192.168.6.154`
- **Domain**: `fs.wedge-kc.mywire.org`

## 🚨 **VPN Access Issue Identified**

The application is currently only accessible from the local network (`192.168.6.154:3000`) but not from external VPN connections due to network configuration.

## 🔧 **Solutions for VPN Access**

### **Option 1: Use Local Network IP (If VPN allows)**
If your VPN allows access to the local network:
- **URL**: `http://192.168.6.154:3000`
- **Status**: ✅ **Working locally**

### **Option 2: Configure Port Forwarding**
If you have access to your router/network configuration:
1. **Port Forward**: Forward external port 3000 to internal `192.168.6.154:3000`
2. **Access via**: `http://116.212.139.149:3000`

### **Option 3: Use Nginx with Domain (Recommended)**
Configure your domain to point to the public IP and use Nginx:
1. **Set up DNS**: Point `fs.wedge-kc.mywire.org` to `116.212.139.149`
2. **Access via**: `https://fs.wedge-kc.mywire.org/`

### **Option 4: SSH Tunnel (Immediate Solution)**
Create an SSH tunnel to access the application:
```bash
# On your local machine, run:
ssh -L 3000:localhost:3000 root@116.212.139.149

# Then access: http://localhost:3000
```

## 🛠️ **Current Working Access Methods**

### **From Server (Local)**
- ✅ **Direct**: `http://localhost:3000`
- ✅ **Local IP**: `http://192.168.6.154:3000`
- ✅ **pgAdmin4**: `http://192.168.6.154:8080/`

### **From External (VPN)**
- ❌ **Public IP**: `http://116.212.139.149:3000` (Blocked)
- ❌ **Domain**: `https://fs.wedge-kc.mywire.org/` (DNS not configured)

## 🔑 **Login Credentials**
- **Username**: `admin`
- **Password**: `password123`

## 📋 **Next Steps**

1. **Immediate Access**: Use SSH tunnel method above
2. **Long-term**: Configure DNS for your domain
3. **Alternative**: Set up port forwarding on your router

## 🆘 **Troubleshooting Commands**

```bash
# Check application status
pm2 status

# Check firewall
ufw status

# Test local access
curl -I http://localhost:3000

# Check listening ports
ss -tlnp | grep :3000
```

## 🎯 **Recommended Action**

**For immediate access via VPN:**
1. Use SSH tunnel: `ssh -L 3000:localhost:3000 root@116.212.139.149`
2. Open browser: `http://localhost:3000`
3. Login with: admin / password123

**For permanent access:**
1. Configure DNS: Point `fs.wedge-kc.mywire.org` to `116.212.139.149`
2. Access via: `https://fs.wedge-kc.mywire.org/`
