# Friendship School Management System

A comprehensive school management system built with Next.js, React, TypeScript, and PostgreSQL. Features role-based access control for administrators and teachers, with capabilities for student management, attendance tracking, grade management, and academic administration.

## 🚀 **Quick Start**

### **Option 1: Docker Setup (Recommended)**
```bash
# Clone the repository
git clone <repository-url>
cd Friendship_School-project

# Start PostgreSQL and pgAdmin with Docker
docker-compose up -d

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
# DATABASE_URL="postgresql://postgres:password123@localhost:5432/postgres"
# NEXTAUTH_SECRET="your-secret-key-here"
# NEXTAUTH_URL="http://localhost:3000"

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Add initial users
node scripts/add-teachers.js

# Start development server
npm run dev
```

### **Option 2: Manual PostgreSQL Setup**
```bash
# Clone the repository
git clone <repository-url>
cd Friendship_School-project

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### **Prerequisites**
- Node.js 18+
- Docker Desktop (for Docker setup) OR PostgreSQL database
- Git

### **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Add initial users
node scripts/add-teachers.js

# Check database connectivity
node scripts/check-database.js
```

### **🐳 Docker Services**
- **PostgreSQL**: localhost:5432 (postgres/password123)
- **pgAdmin4**: http://localhost:8080 (admin@admin.com/admin123)
- **Application**: http://localhost:3000

> 📖 **Detailed Docker Setup**: See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete instructions

## 🏗️ **Technology Stack**

### **Frontend**
- **Next.js 15.2.4** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Radix UI & Shadcn/ui** - Accessible component library

### **Backend & Database**
- **Prisma ORM 6.11.1** - Database toolkit and ORM
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **Puppeteer** - Server-side PDF generation
- **ExcelJS** - Excel export functionality

## 🔒 **Security Features**

- **Multi-layer protection** with Next.js middleware
- **Role-based access control** (Admin/Teacher)
- **Server-side route protection**
- **Client-side role guards**
- **Cookie-based authentication**
- **Secure password hashing**

## 📁 **Project Structure**

```
Friendship_School-project/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   ├── dashboard/                # Admin dashboard pages
│   ├── attendance/               # Attendance management
│   ├── grade/                    # Grade management
│   ├── student-info/             # Student information
│   ├── register-student/         # Student registration
│   ├── login/                    # Authentication
│   └── unauthorized/             # Access denied page
├── components/                   # Reusable UI components
├── lib/                          # Utility libraries
├── prisma/                       # Database schema
├── public/                       # Static assets
├── scripts/                      # Development scripts
├── middleware.ts                 # Route protection
└── package.json                  # Dependencies
```

## 🎯 **Key Features**

### **Student Management**
- Student registration with PDF generation
- Student information display and management
- Student enrollment in courses
- Student removal functionality

### **Attendance System**
- Daily attendance tracking
- Attendance reports and analytics
- Course-based attendance management

### **Grade Management**
- Grade entry and editing
- Gradebook management
- Grade reports and analytics
- Subject and semester organization

### **Academic Administration**
- School year management
- Course creation and management
- Subject management
- User account management

### **Data Export**
- PDF generation for student records
- Excel export for reports
- Chart visualization for analytics

## 🔧 **Development**

### **Available Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
```

### **Environment Variables**
Create a `.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### **For Server Deployment:**
```env
# Change NEXTAUTH_URL to your server IP or domain
DATABASE_URL="postgresql://username:password@your-server-ip:5432/database_name"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://YOUR_SERVER_IP:3000"
# or with domain name
NEXTAUTH_URL="https://yourdomain.com"
```

> 📖 **Detailed Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete server setup instructions

## 🧪 **Testing**

### **Security Testing**
```bash
# Test route protection
node scripts/test-security-comprehensive.js
```

### **Database Testing**
```bash
# Check database connectivity
node scripts/check-database.js
```

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get available users

### **Student Management**
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Remove student

### **Academic Management**
- `GET /api/school-years` - Get school years
- `GET /api/courses` - Get courses
- `GET /api/subjects` - Get subjects
- `GET /api/semesters` - Get semesters

### **Attendance & Grades**
- `GET /api/attendance` - Get attendance data
- `POST /api/attendance` - Record attendance
- `GET /api/grades` - Get grades
- `POST /api/grades` - Record grades

## 🔄 **User Workflows**

### **Admin Workflow**
1. Login with admin credentials
2. Access dashboard for overview
3. Manage students, courses, and users
4. View reports and analytics
5. Export data as needed

### **Teacher Workflow**
1. Login with teacher credentials
2. Access daily attendance page
3. Record student attendance
4. Manage grades for assigned courses
5. View student information

## 📚 **Documentation**

For detailed documentation, see:
- [Complete Project Documentation](./PROJECT_DOCUMENTATION.md)
- [Scripts Documentation](./scripts/README.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
