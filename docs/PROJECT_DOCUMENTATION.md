# Friendship School Project - Complete Documentation

## 📋 **Project Overview**

This is a comprehensive school management system built with Next.js, React, TypeScript, and PostgreSQL. The application provides role-based access control for administrators and teachers, with features for student management, attendance tracking, grade management, enrollment management, and academic administration. The system includes advanced PDF generation capabilities, calendar integration, and a modern responsive UI.

## 🏗️ **Architecture & Technology Stack**

### **Frontend**
- **Next.js 15.5.2** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Radix UI & Shadcn/ui** - Accessible component library
- **React Hook Form & Zod** - Form management and validation
- **Next-themes** - Dark/light mode support
- **Chart.js & Recharts** - Data visualization
- **React Day Picker** - Calendar components
- **Lucide React** - Icon library

### **Backend & Database**
- **Prisma ORM 6.16.2** - Database toolkit and ORM
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **Puppeteer 24.16.2** - Server-side PDF generation
- **ExcelJS 4.4.0** - Excel export functionality
- **@react-pdf/renderer** - PDF document generation

### **Development Tools**
- **GitHub** - Version control
- **Figma** - Design and prototyping
- **Docker Desktop** - Containerization
- **Visual Studio Code** - Development environment
- **TSX** - TypeScript execution

## 🔒 **Security System**

### **Multi-Layer Protection**
1. **Next.js Middleware** - Server-side route protection
2. **Client-side Role Guards** - Component-level protection
3. **API Route Protection** - Backend endpoint security
4. **Cookie-based Authentication** - Persistent sessions

### **Role-Based Access Control (RBAC)**
- **Admin Role**: Full access to all features
- **Teacher Role**: Limited access to specific features
- **Public Routes**: Login, splash, unauthorized pages

### **Protected Routes**
- **Admin-Only**: `/dashboard/*`, `/api/users`, `/api/school-years`, `/grade/gradebook`, `/grade/report`
- **Teacher-Only**: `/student-info`, `/register-student`
- **Shared**: `/attendance/daily`, `/grade/addgrade`

## 📁 **Project Structure**

```
Friendship_School-project/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── enrollments/          # Enrollment management API
│   │   ├── pdf-generate/         # PDF generation endpoints
│   │   └── [other endpoints]     # Student, user, grade APIs
│   ├── dashboard/                # Admin dashboard pages
│   ├── attendance/               # Attendance management
│   ├── grade/                    # Grade management
│   ├── student-info/             # Student information
│   ├── register-student/         # Student registration
│   ├── login/                    # Authentication
│   └── unauthorized/             # Access denied page
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (Shadcn/ui)
│   ├── navigation/               # Navigation components
│   ├── calendar/                 # Calendar and date picker components
│   └── student-info/             # Student-specific components
├── lib/                          # Utility libraries
│   ├── pdf-generators/           # PDF generation system
│   │   ├── core/                 # Core PDF system files
│   │   ├── reports/              # Report generators
│   │   └── id-cards/             # ID card generators
│   └── [other utilities]         # Auth, Prisma, utils
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets and logos
├── scripts/                      # Development and testing scripts
├── hooks/                        # Custom React hooks
├── styles/                       # Global styles
├── middleware.ts                 # Route protection middleware
└── package.json                  # Dependencies and scripts
```

## 🚀 **Key Features**

### **Student Management**
- Student registration with PDF generation
- Student information display and management
- Student enrollment in courses with dedicated enrollment system
- Student removal functionality
- Family information and guardian management
- Scholarship tracking and financial aid management

### **Attendance System**
- Daily attendance tracking
- Attendance reports and analytics
- Course-based attendance management

### **Grade Management**
- Grade entry and editing
- Gradebook management with specialized reports
- Government-style grade reports (monthly, semester, yearly)
- Individual student gradebook reports
- Subject and semester organization
- Advanced grade calculation and analytics

### **Academic Administration**
- School year management
- Course creation and management
- Subject management
- User account management
- Enrollment management system
- Activity logging and audit trails

### **Data Export & Reports**
- Advanced PDF generation system with specialized templates
- Government-style report formatting
- Excel export for reports and analytics
- Chart visualization with Chart.js and Recharts
- Student ID cards and teacher ID cards
- Bulk document generation capabilities

## 🔧 **Development Setup**

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- Git

### **Installation**
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

### **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (if needed)
node scripts/add-teachers.js
node scripts/add-school-data.js
```

## 🧪 **Testing**

### **Security Testing**
```bash
# Test route protection
node scripts/test-security-comprehensive.js

# Test authentication flow
node scripts/test-auth-flow.js

# Test role-based access
node scripts/test-role-guard.js
```

### **Database Testing**
```bash
# Check database connectivity
node scripts/check-database.js

# Verify data integrity
node scripts/verify-complete-database.js
```

## 📊 **API Structure**

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
- `POST /api/school-years` - Create school year
- `GET /api/courses` - Get courses
- `POST /api/courses` - Create course
- `GET /api/subjects` - Get subjects
- `POST /api/subjects` - Create subject
- `GET /api/semesters` - Get semesters
- `GET /api/classes` - Get available classes/grades

### **Enrollment Management**
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Create new enrollments
- `DELETE /api/enrollments` - Remove enrollment
- `GET /api/enrollments/[id]` - Get specific enrollment

### **Attendance & Grades**
- `GET /api/attendance` - Get attendance data
- `POST /api/attendance` - Record attendance
- `GET /api/grades` - Get grades
- `POST /api/grades` - Record grades

### **PDF Generation**
- `POST /api/pdf-generate/generate-pdf` - Generate PDF reports
- `POST /api/pdf-generate/generate-grade-report` - Generate grade reports
- `POST /api/pdf-generate/generate-gradebook-report` - Generate gradebook reports
- `POST /api/pdf-generate/generate-attendance-report` - Generate attendance reports
- `POST /api/pdf-generate/generate-student-list-report` - Generate student lists
- `POST /api/pdf-generate/generate-student-id-card` - Generate student ID cards
- `POST /api/pdf-generate/generate-teacher-id-card` - Generate teacher ID cards

### **Data Export**
- `GET /api/export-excel` - Export data to Excel format

## 🔄 **User Workflows**

### **Admin Workflow**
1. Login with admin credentials
2. Access dashboard for comprehensive overview and analytics
3. Manage students, courses, users, and enrollments
4. Generate specialized reports (gradebook, attendance, government-style)
5. Export data and generate ID cards
6. Monitor system activity and user logs

### **Teacher Workflow**
1. Login with teacher credentials
2. Access daily attendance page for course management
3. Record student attendance and manage attendance reports
4. Enter and manage grades for assigned courses
5. View detailed student information and family data
6. Generate individual student reports and gradebooks

## 🛠️ **Maintenance & Updates**

### **Regular Tasks**
- Database backups
- Security updates
- Performance monitoring
- User access reviews

### **Troubleshooting**
- Check middleware logs for route protection issues
- Verify database connectivity
- Review API response codes
- Test authentication flow

## 📈 **Performance Optimization**

### **Implemented Optimizations**
- Server-side rendering (SSR) with Next.js App Router
- Static generation where possible
- Image optimization and lazy loading
- Code splitting and dynamic imports
- Database query optimization with Prisma
- PDF generation optimization with Puppeteer
- Client-side caching for frequently accessed data
- Responsive design with Tailwind CSS

### **Future Optimizations**
- Redis caching layer for API responses
- CDN integration for static assets
- Database connection pooling
- Background job processing for PDF generation
- Progressive Web App (PWA) capabilities

## 🔐 **Security Best Practices**

### **Implemented**
- Password hashing with bcrypt
- Role-based access control
- Server-side route protection
- Input validation and sanitization
- Secure cookie handling

### **Recommendations**
- Regular security audits
- HTTPS enforcement
- Rate limiting implementation
- Session timeout management
- CSRF protection

## 📝 **Code Quality**

### **Standards**
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture
- Separation of concerns

### **Best Practices**
- Consistent naming conventions
- Error handling
- Loading states
- Responsive design
- Accessibility compliance

## 🆕 **Recent Updates & Improvements**

### **Major System Enhancements (2024)**
- **Enrollment Management System**: Dedicated API endpoints and UI for managing student course enrollments
- **Advanced PDF Generation**: Reorganized PDF system with specialized government-style report templates
- **Enhanced Database Schema**: Added family information, guardian details, and scholarship tracking
- **Calendar Integration**: Custom Khmer calendar components and date pickers
- **Improved Security**: Enhanced middleware with session timeout management
- **UI/UX Improvements**: Modern responsive design with dark/light theme support

### **Removed Legacy Features**
- **Announcements System**: Removed legacy announcement functionality
- **Notifications System**: Removed basic notification system
- **Generic Grade Reports**: Replaced with specialized government-style reports

### **Technical Improvements**
- **Dependency Updates**: Updated to Next.js 15.5.2, Prisma 6.16.2, and latest packages
- **Code Organization**: Reorganized PDF generators into logical folder structure
- **Type Safety**: Enhanced TypeScript types and interfaces
- **Error Handling**: Improved error handling and user feedback

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅  
**Next.js Version**: 15.5.2  
**Database**: PostgreSQL with Prisma ORM 6.16.2
