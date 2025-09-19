# 🐳 Docker Setup Guide

This guide will help you set up the Friendship School Management System using Docker for the database and pgAdmin.

## 📋 **Prerequisites**

- Docker Desktop installed and running
- Node.js 18+ installed on your local machine
- Git

## 🚀 **Quick Start with Docker**

### **1. Start Database Services**

```bash
# Start PostgreSQL and pgAdmin4
docker-compose up -d

# Check if services are running
docker-compose ps
```

### **2. Configure Environment Variables**

Create a `.env` file in your project root:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password123@localhost:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random"
NEXTAUTH_URL="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
```

### **3. Install Dependencies and Setup Database**

```bash
# Install Node.js dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Add initial users
node scripts/add-teachers.js

# Check database connectivity
node scripts/check-database.js
```

### **4. Start the Application**

```bash
# Start the development server
npm run dev
```

## 🔧 **Access Points**

- **Application**: http://localhost:3000
- **pgAdmin4**: http://localhost:8080
  - Email: admin@admin.com
  - Password: admin123

## 📊 **Database Management**

### **Using pgAdmin4**

1. Open http://localhost:8080
2. Login with admin@admin.com / admin123
3. Add new server:
   - Host: postgres (or localhost)
   - Port: 5432
   - Username: postgres
   - Password: password123

### **Using Command Line**

```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d postgres

# Or using local psql (if installed)
psql -h localhost -U postgres -d postgres
```

## 🛠️ **Useful Docker Commands**

```bash
# View logs
docker-compose logs postgres
docker-compose logs pgadmin4

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Restart services
docker-compose restart

# View running containers
docker ps
```

## 🔄 **Development Workflow**

1. **Start Docker services**: `docker-compose up -d`
2. **Start development server**: `npm run dev`
3. **Make changes to your code**
4. **Database changes**: Run `npx prisma migrate dev`
5. **Stop services when done**: `docker-compose down`

## 🚨 **Troubleshooting**

### **Port Already in Use**
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Or change ports in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### **Reset Everything**
```bash
# Stop and remove everything
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Start fresh
docker-compose up -d
```

## 📝 **Notes**

- The PostgreSQL data is persisted in a Docker volume
- pgAdmin4 provides a web interface for database management
- All database credentials are defined in docker-compose.yml
- The application connects to the database using the DATABASE_URL environment variable

---

**Happy coding! 🎉**
