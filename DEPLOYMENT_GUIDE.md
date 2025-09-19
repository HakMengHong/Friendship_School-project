# 🚀 Server Deployment Guide

## Environment Variables Configuration

When deploying your Friendship School Management System to a server, you need to update the environment variables to point to your server's IP address or domain name.

### 📋 Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@your-server-ip:5432/database_name"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://your-server-ip:3000"

# Alternative with domain name
# NEXTAUTH_URL="https://yourdomain.com"
```

### 🌐 Server Configuration Examples

#### Option 1: Using Server IP Address
```env
# For server with IP: 192.168.1.100
DATABASE_URL="postgresql://postgres:password123@192.168.1.100:5432/friendship_school"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://192.168.1.100:3000"
```

#### Option 2: Using Domain Name
```env
# For server with domain: school.yourdomain.com
DATABASE_URL="postgresql://postgres:password123@school.yourdomain.com:5432/friendship_school"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://school.yourdomain.com"
```

#### Option 3: Using Docker (Recommended)
```env
# For Docker deployment
DATABASE_URL="postgresql://postgres:password123@postgres:5432/friendship_school"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 🔧 Step-by-Step Deployment Process

#### 1. **Prepare Your Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Git
sudo apt install git -y
```

#### 2. **Clone and Setup Project**
```bash
# Clone your repository
git clone https://github.com/HakMengHong/Friendship_School-project.git
cd Friendship_School-project

# Install dependencies
npm install

# Create environment file
nano .env
```

#### 3. **Configure Environment Variables**
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/friendship_school"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://YOUR_SERVER_IP:3000"
```

#### 4. **Setup Database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Add initial users
node scripts/add-teachers.js
```

#### 5. **Build and Start Application**
```bash
# Build the application
npm run build

# Start the application
npm start
```

### 🐳 Docker Deployment (Recommended)

#### 1. **Update docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password123@postgres:5432/friendship_school
      - NEXTAUTH_SECRET=your-super-secret-key-here
      - NEXTAUTH_URL=http://YOUR_SERVER_IP:3000
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=friendship_school
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@admin.com
      - PGADMIN_DEFAULT_PASSWORD=admin123
    ports:
      - "8080:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### 2. **Deploy with Docker**
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 🔒 Security Considerations

#### 1. **Generate Strong Secrets**
```bash
# Generate a strong NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. **Use HTTPS in Production**
```env
# For production with SSL certificate
NEXTAUTH_URL="https://yourdomain.com"
```

#### 3. **Database Security**
```env
# Use strong database credentials
DATABASE_URL="postgresql://strong_user:very_strong_password@your-server-ip:5432/friendship_school"
```

### 🌍 Different Deployment Scenarios

#### **Local Network Deployment**
```env
# For access within local network (192.168.1.x)
NEXTAUTH_URL="http://192.168.1.100:3000"
```

#### **Internet Access Deployment**
```env
# For public internet access
NEXTAUTH_URL="https://school.yourdomain.com"
```

#### **Cloud Server Deployment**
```env
# For cloud providers (AWS, DigitalOcean, etc.)
NEXTAUTH_URL="https://your-server-ip:3000"
# or with domain
NEXTAUTH_URL="https://yourdomain.com"
```

### 🔧 Troubleshooting

#### **Common Issues:**

1. **CORS Errors**
   - Ensure `NEXTAUTH_URL` matches your actual server URL
   - Check if port 3000 is open in firewall

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

3. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check if `NEXTAUTH_URL` is correct
   - Clear browser cookies and try again

#### **Testing Your Deployment:**
```bash
# Test database connection
node scripts/check-database.js

# Test API endpoints
curl http://YOUR_SERVER_IP:3000/api/auth/users

# Test application
curl http://YOUR_SERVER_IP:3000
```

### 📝 Environment Variables Summary

| Variable | Local Development | Server Deployment |
|----------|------------------|-------------------|
| `DATABASE_URL` | `postgresql://postgres:password123@localhost:5432/postgres` | `postgresql://postgres:password123@your-server-ip:5432/friendship_school` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `http://your-server-ip:3000` or `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | `your-secret-key-here` | `your-super-secret-key-here` |

### 🚀 Quick Start Commands

```bash
# 1. Clone repository
git clone https://github.com/HakMengHong/Friendship_School-project.git
cd Friendship_School-project

# 2. Create environment file
cp .env.example .env
# Edit .env with your server details

# 3. Install and setup
npm install
npx prisma generate
npx prisma migrate dev
node scripts/add-teachers.js

# 4. Build and start
npm run build
npm start
```

### 📞 Support

If you encounter any issues during deployment, check:
1. Server logs: `npm run dev` or `docker-compose logs`
2. Database connection: `node scripts/check-database.js`
3. Environment variables: Ensure all required variables are set
4. Network access: Verify ports 3000 and 5432 are accessible

---

**Remember:** Always use HTTPS in production and keep your secrets secure! 🔒
