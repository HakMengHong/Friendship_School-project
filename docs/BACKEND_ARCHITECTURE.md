# 🔧 Backend Architecture & Technology Stack

## 📋 **Overview**

The Friendship School Management System backend is built with Next.js API Routes, Prisma ORM, and PostgreSQL, providing a robust, scalable, and type-safe server-side architecture. The system follows RESTful API patterns with comprehensive data validation, security measures, and advanced PDF generation capabilities.

## 🏗️ **Core Technology Stack**

### **Runtime & Framework**
- **Next.js 15.5.2** - Full-stack React framework with API Routes
- **Node.js 18+** - JavaScript runtime environment
- **TypeScript 5** - Type-safe development

### **Database & ORM**
- **PostgreSQL** - Relational database management system
- **Prisma ORM 6.16.2** - Type-safe database toolkit
- **Prisma Client** - Auto-generated database client

### **Authentication & Security**
- **bcryptjs 3.0.2** - Password hashing and verification
- **Cookie-based Sessions** - Secure session management
- **Role-based Access Control (RBAC)** - Admin/Teacher permissions

### **PDF Generation**
- **Puppeteer 24.16.2** - Headless Chrome for PDF generation
- **@react-pdf/renderer 4.3.0** - React-based PDF creation
- **ExcelJS 4.4.0** - Excel file generation and manipulation

### **Development Tools**
- **ESLint** - Code linting and formatting
- **TSX** - TypeScript execution environment
- **Prisma Studio** - Database management interface

## 🎯 **Architecture Patterns**

### **1. API Routes Architecture**
```
app/api/
├── auth/                    # Authentication endpoints
│   ├── login/              # User login
│   └── users/              # User management
├── students/               # Student CRUD operations
│   └── [id]/              # Individual student operations
├── courses/                # Course management
│   └── [id]/              # Individual course operations
├── enrollments/            # Student enrollment system
│   └── [id]/              # Individual enrollment operations
├── subjects/               # Subject management
│   └── [id]/              # Individual subject operations
├── grades/                 # Grade management
├── attendance/             # Attendance tracking
├── users/                  # User administration
├── school-years/           # Academic year management
├── semesters/              # Semester management
├── classes/                # Class/grade management
├── activity-logs/          # Audit logging
├── export-excel/           # Excel export functionality
└── pdf-generate/           # PDF generation system
    ├── generate-pdf/       # Generic PDF generation
    ├── generate-grade-report/        # Grade reports
    ├── generate-gradebook-report/    # Gradebook reports
    ├── generate-attendance-report/   # Attendance reports
    ├── generate-student-list-report/ # Student lists
    ├── generate-student-id-card/     # Student ID cards
    └── generate-teacher-id-card/     # Teacher ID cards
```

### **2. Database Architecture**
```
Database Schema (PostgreSQL)
├── User                    # System users (admin/teacher)
├── Student                 # Student information
├── Guardian                # Student guardians
├── FamilyInfo              # Family background
├── Scholarship             # Financial aid tracking
├── Course                  # Academic courses
├── Subject                 # Subject definitions
├── Grade                   # Student grades
├── Enrollment              # Student-course enrollments
├── Attendance              # Attendance records
├── SchoolYear              # Academic years
├── Semester                # Academic semesters
└── ActivityLog             # System audit trail
```

### **3. Service Layer Architecture**
```
lib/
├── prisma.ts              # Database connection
├── auth-service.ts        # Authentication logic
├── pdf-generators/        # PDF generation system
│   ├── core/              # Core PDF utilities
│   ├── reports/           # Report generators
│   └── id-cards/          # ID card generators
└── utils.ts               # Shared utilities
```

## 🔐 **Security Architecture**

### **Authentication System**
```typescript
// Multi-layer authentication
interface AuthFlow {
  1: "Client Login Request"
  2: "Server Validation (bcrypt)"
  3: "Session Creation (Cookie)"
  4: "Middleware Protection"
  5: "Role-based Access"
}

// Password Security
- bcryptjs hashing with salt rounds
- Secure password comparison
- Account lockout after failed attempts
- Session timeout management (30 minutes)
```

### **Authorization Levels**
```typescript
// Role-based Access Control
enum UserRole {
  ADMIN = "admin",      // Full system access
  TEACHER = "teacher"   // Limited feature access
}

// Permission Matrix
const permissions = {
  admin: [
    "user_management",
    "student_management", 
    "course_management",
    "grade_management",
    "attendance_management",
    "report_generation",
    "system_settings"
  ],
  teacher: [
    "student_view",
    "attendance_management",
    "grade_management",
    "basic_reports"
  ]
}
```

### **API Security Features**
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **CSRF Protection** - SameSite cookie attributes
- **Session Management** - Secure cookie handling
- **Rate Limiting** - Built-in Next.js protections
- **Error Handling** - Sanitized error responses

## 📊 **Database Architecture**

### **Core Entity Relationships**
```sql
-- User Management
User (1) ←→ (N) Course [as teacher]
User (1) ←→ (N) Grade [as grader]
User (1) ←→ (N) ActivityLog [as actor]

-- Student Management  
Student (1) ←→ (N) Guardian
Student (1) ←→ (1) FamilyInfo
Student (1) ←→ (N) Scholarship
Student (N) ←→ (N) Course [via Enrollment]
Student (1) ←→ (N) Grade
Student (1) ←→ (N) Attendance

-- Academic Structure
SchoolYear (1) ←→ (N) Course
Course (1) ←→ (N) Enrollment
Course (1) ←→ (N) Grade
Course (1) ←→ (N) Attendance
Subject (1) ←→ (N) Grade
Semester (1) ←→ (N) Grade
Semester (1) ←→ (N) Attendance
```

### **Database Indexing Strategy**
```sql
-- Performance Indexes
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_user_status ON User(status);
CREATE INDEX idx_student_course ON Grade(studentId, courseId);
CREATE INDEX idx_attendance_date ON Attendance(attendanceDate);
CREATE INDEX idx_enrollment_unique ON Enrollment(studentId, courseId);
CREATE INDEX idx_course_grade_section ON Course(schoolYearId, grade, section);
```

### **Data Validation & Constraints**
```typescript
// Prisma Schema Constraints
model Student {
  studentId    Int    @id @default(autoincrement())
  lastName     String
  firstName    String
  gender       String
  dob          DateTime
  class        String
  
  @@index([firstName, lastName])
  @@index([class])
  @@index([schoolYear])
}

model Enrollment {
  enrollmentId Int     @id @default(autoincrement())
  courseId     Int
  studentId    Int
  drop         Boolean
  
  @@unique([studentId, courseId])  // Prevent duplicate enrollments
  @@index([studentId, courseId])
  @@index([drop])
}
```

## 🚀 **API Architecture**

### **RESTful API Design**
```typescript
// Standard CRUD Operations
interface APIEndpoint {
  GET    "/api/resource"           // List all resources
  GET    "/api/resource/[id]"      // Get specific resource
  POST   "/api/resource"           // Create new resource
  PUT    "/api/resource/[id]"      // Update specific resource
  DELETE "/api/resource/[id]"      // Delete specific resource
}

// Query Parameters
interface QueryParams {
  page?: number          // Pagination
  limit?: number         // Results per page
  sort?: string          // Sort field
  order?: 'asc' | 'desc' // Sort direction
  filter?: Record<string, any> // Filter criteria
}
```

### **API Response Standards**
```typescript
// Success Response
interface SuccessResponse<T> {
  data: T
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// Error Response
interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}

// Example API Response
const apiResponse = {
  // Success
  success: {
    data: [...students],
    message: "Students fetched successfully",
    meta: { total: 150, page: 1, limit: 20 }
  },
  
  // Error
  error: {
    error: "VALIDATION_ERROR",
    message: "Invalid input data",
    statusCode: 400,
    details: { field: "email", reason: "Invalid format" }
  }
}
```

### **Key API Endpoints**

#### **Authentication APIs**
```typescript
POST /api/auth/login
// Request: { username: string, password: string }
// Response: { user: User, token?: string }

GET /api/auth/users
// Response: { users: User[] }
```

#### **Student Management APIs**
```typescript
GET /api/students
// Response: Student[] with relations

POST /api/students
// Request: StudentCreateData
// Response: { student: Student }

PUT /api/students/[id]
// Request: StudentUpdateData
// Response: { student: Student }

DELETE /api/students/[id]
// Response: { message: string }
```

#### **Enrollment Management APIs**
```typescript
GET /api/enrollments
// Response: Enrollment[] with course and student data

POST /api/enrollments
// Request: { courseId: number, studentIds: number[] }
// Response: { message: string, enrollments: Enrollment[] }

DELETE /api/enrollments?enrollmentId=123
// Response: { message: string, removedEnrollment: Enrollment }
```

#### **Grade Management APIs**
```typescript
GET /api/grades?courseId=123&semesterId=456
// Response: Grade[] with student and subject data

POST /api/grades
// Request: GradeCreateData[]
// Response: { grades: Grade[], message: string }
```

#### **PDF Generation APIs**
```typescript
POST /api/pdf-generate/generate-grade-report
// Request: {
//   reportType: 'monthly' | 'semester' | 'yearly',
//   academicYear: string,
//   month?: string,
//   year?: string,
//   semester?: string,
//   class: string,
//   section?: string
// }
// Response: PDF Buffer with headers

POST /api/pdf-generate/generate-student-id-card
// Request: { studentIds: number[], format?: string }
// Response: PDF Buffer for ID cards
```

## 📄 **PDF Generation System**

### **Architecture Overview**
```typescript
// PDF Generation Flow
interface PDFGenerationFlow {
  1: "API Request with Report Parameters"
  2: "Data Fetching from Database"
  3: "Template Selection Based on Report Type"
  4: "Data Processing and Formatting"
  5: "PDF Generation (Puppeteer/React-PDF)"
  6: "Buffer Return with Proper Headers"
}

// Report Types
enum ReportType {
  STUDENT_REGISTRATION = 'student-registration',
  GRADE_REPORT_MONTHLY = 'grade-report-monthly',
  GRADE_REPORT_SEMESTER = 'grade-report-semester',
  GRADE_REPORT_YEARLY = 'grade-report-yearly',
  ATTENDANCE_REPORT = 'attendance-report',
  STUDENT_LIST_REPORT = 'student-list-report',
  STUDENT_ID_CARD = 'student-id-card',
  TEACHER_ID_CARD = 'teacher-id-card'
}
```

### **PDF Generator Structure**
```typescript
// Core PDF Manager
class PDFManager {
  async generatePDF(
    reportType: ReportType,
    data: any,
    options?: ReportOptions
  ): Promise<PDFResult>
  
  getAvailableReportTypes(): ReportType[]
  getReportMetadata(type: ReportType): ReportMetadata
  updateConfig(config: Partial<PDFGeneratorConfig>): void
}

// Specialized Generators
interface PDFGenerator {
  generate(data: any, options?: ReportOptions): Promise<Buffer>
  validate(data: any): boolean
  getMetadata(): ReportMetadata
}
```

### **Government-Style Reports**
```typescript
// Monthly Grade Report Features
interface MonthlyGradeReport {
  format: 'A4' | 'Letter'
  orientation: 'landscape'
  features: [
    'National motto and school branding',
    'Two-row table header with subject columns',
    'Grade threshold system (≥5 for "ល្អ")',
    'Proper ranking and calculations',
    'Khmer language support',
    'Professional government formatting'
  ]
}

// Report Templates
const reportTemplates = {
  monthly: {
    layout: 'A4 Landscape',
    branding: 'Government Style',
    language: 'Khmer + English',
    threshold: 5.0
  },
  semester: {
    layout: 'A4 Portrait',
    branding: 'School Style',
    language: 'Khmer',
    calculations: 'Semester Averages'
  },
  yearly: {
    layout: 'A4 Portrait',
    branding: 'Annual Summary',
    language: 'Khmer',
    features: 'Trend Analysis'
  }
}
```

## 🔄 **Data Flow Architecture**

### **Request Processing Flow**
```typescript
// API Request Flow
interface RequestFlow {
  1: "Client Request"
  2: "Next.js Middleware (Route Protection)"
  3: "API Route Handler"
  4: "Input Validation (Zod)"
  5: "Business Logic Processing"
  6: "Database Operations (Prisma)"
  7: "Response Formatting"
  8: "Client Response"
}

// Database Query Flow
interface QueryFlow {
  1: "Prisma Client Query"
  2: "SQL Generation"
  3: "PostgreSQL Execution"
  4: "Result Processing"
  5: "Type-safe Return"
}
```

### **Error Handling Strategy**
```typescript
// Error Handling Layers
interface ErrorHandling {
  validation: "Zod schema validation"
  database: "Prisma error handling"
  business: "Custom business logic errors"
  api: "HTTP status code mapping"
  client: "User-friendly error messages"
}

// Error Types
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

## ⚡ **Performance Optimizations**

### **Database Optimizations**
```typescript
// Query Optimization Strategies
const optimizations = {
  indexing: [
    "Primary key indexes",
    "Foreign key indexes", 
    "Composite indexes for common queries",
    "Partial indexes for filtered data"
  ],
  
  queryOptimization: [
    "Select specific fields only",
    "Use include for related data",
    "Implement pagination",
    "Cache frequently accessed data"
  ],
  
  connectionManagement: [
    "Connection pooling",
    "Query result caching",
    "Batch operations for bulk data"
  ]
}
```

### **API Performance**
```typescript
// Performance Features
const performanceFeatures = {
  caching: [
    "Client-side caching for static data",
    "Server-side caching for computed results",
    "Database query result caching"
  ],
  
  optimization: [
    "Lazy loading for large datasets",
    "Pagination for list endpoints",
    "Compression for large responses",
    "Async processing for heavy operations"
  ],
  
  monitoring: [
    "Query performance tracking",
    "API response time monitoring",
    "Error rate tracking",
    "Resource usage monitoring"
  ]
}
```

## 🔧 **Development Workflow**

### **Database Development**
```bash
# Database Management Commands
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations in development
npx prisma migrate deploy    # Deploy migrations to production
npx prisma studio           # Open database management UI
npx prisma db seed          # Seed database with test data
```

### **API Development**
```typescript
// API Development Pattern
export async function GET(request: NextRequest) {
  try {
    // 1. Input validation
    const params = validateQueryParams(request)
    
    // 2. Database query
    const data = await prisma.model.findMany({
      where: params.filters,
      include: params.includes,
      orderBy: params.sorting,
      skip: params.pagination.skip,
      take: params.pagination.take
    })
    
    // 3. Response formatting
    return NextResponse.json({
      data,
      meta: {
        total: await prisma.model.count(),
        page: params.pagination.page,
        limit: params.pagination.limit
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Testing Strategy**
```typescript
// API Testing Approach
const testingStrategy = {
  unit: [
    "Individual function testing",
    "Database query testing", 
    "Validation logic testing",
    "Error handling testing"
  ],
  
  integration: [
    "API endpoint testing",
    "Database integration testing",
    "Authentication flow testing",
    "PDF generation testing"
  ],
  
  e2e: [
    "Complete user workflow testing",
    "Cross-browser testing",
    "Performance testing",
    "Security testing"
  ]
}
```

## 🛡️ **Security Best Practices**

### **Data Protection**
```typescript
// Security Measures
const securityMeasures = {
  authentication: [
    "bcrypt password hashing",
    "Session-based authentication",
    "Account lockout protection",
    "Session timeout management"
  ],
  
  authorization: [
    "Role-based access control",
    "Route-level protection",
    "API endpoint authorization",
    "Data access restrictions"
  ],
  
  dataProtection: [
    "Input sanitization",
    "SQL injection prevention",
    "XSS protection",
    "CSRF token validation"
  ]
}
```

### **Audit Logging**
```typescript
// Activity Logging System
interface ActivityLog {
  id: number
  userId: number
  action: string
  details?: string
  timestamp: DateTime
  user: User
}

// Logged Activities
const loggedActivities = [
  "User login/logout",
  "Student creation/modification",
  "Grade entry/modification", 
  "Course enrollment changes",
  "Report generation",
  "User management actions",
  "System configuration changes"
]
```

## 🚀 **Deployment & Infrastructure**

### **Production Setup**
```typescript
// Production Configuration
const productionConfig = {
  database: {
    provider: "postgresql",
    connectionPooling: true,
    ssl: true,
    logging: ["error", "warn"]
  },
  
  security: {
    https: true,
    secureCookies: true,
    cors: "configured",
    rateLimit: "enabled"
  },
  
  monitoring: {
    errorTracking: true,
    performanceMonitoring: true,
    logAggregation: true,
    healthChecks: true
  }
}
```

### **Environment Configuration**
```bash
# Environment Variables
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

## 📈 **Scalability Considerations**

### **Horizontal Scaling**
```typescript
// Scaling Strategies
const scalingStrategies = {
  database: [
    "Read replicas for query distribution",
    "Connection pooling",
    "Query optimization",
    "Caching layer implementation"
  ],
  
  application: [
    "Stateless API design",
    "Load balancer compatibility",
    "Container orchestration ready",
    "Microservices migration path"
  ],
  
  infrastructure: [
    "CDN for static assets",
    "Redis for session storage",
    "Background job processing",
    "Auto-scaling capabilities"
  ]
}
```

### **Future Enhancements**
```typescript
// Planned Improvements
const futureEnhancements = {
  performance: [
    "Redis caching layer",
    "Database query optimization",
    "API response compression",
    "Background job processing"
  ],
  
  features: [
    "Real-time notifications",
    "Advanced reporting",
    "Bulk operations",
    "API versioning"
  ],
  
  infrastructure: [
    "Docker containerization",
    "Kubernetes deployment",
    "CI/CD pipeline",
    "Monitoring dashboard"
  ]
}
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Framework**: Next.js 15.5.2  
**Database**: PostgreSQL with Prisma ORM 6.16.2  
**Status**: Production Ready ✅
