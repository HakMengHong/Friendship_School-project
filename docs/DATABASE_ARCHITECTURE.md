# 🗄️ Database Architecture & Technology Stack

## 📋 **Overview**

The Friendship School Management System database is built on PostgreSQL with Prisma ORM, providing a robust, scalable, and type-safe data layer. The database architecture supports comprehensive school management operations including student enrollment, grade tracking, attendance monitoring, and academic administration with full audit capabilities.

## 🏗️ **Core Technology Stack**

### **Database Engine**
- **PostgreSQL** - Advanced relational database management system
- **Version**: PostgreSQL 13+ (recommended)
- **Features**: ACID compliance, JSON support, full-text search, advanced indexing

### **ORM & Database Toolkit**
- **Prisma ORM 6.16.2** - Type-safe database toolkit
- **Prisma Client** - Auto-generated type-safe database client
- **Prisma Migrate** - Database schema migration system
- **Prisma Studio** - Visual database management interface

### **Connection Management**
- **Connection Pooling** - Optimized database connections
- **Environment Configuration** - Secure connection string management
- **SSL Support** - Encrypted database connections

## 🎯 **Database Schema Architecture**

### **Core Entity Relationships**
```mermaid
erDiagram
    User ||--o{ Course : "teaches"
    User ||--o{ Grade : "grades"
    User ||--o{ ActivityLog : "performs"
    
    Student ||--o{ Guardian : "has"
    Student ||--o| FamilyInfo : "belongs_to"
    Student ||--o{ Scholarship : "receives"
    Student ||--o{ Enrollment : "enrolled_in"
    Student ||--o{ Grade : "receives"
    Student ||--o{ Attendance : "has"
    
    Course ||--o{ Enrollment : "contains"
    Course ||--o{ Grade : "has"
    Course ||--o{ Attendance : "tracks"
    Course }o--|| SchoolYear : "belongs_to"
    Course ||--o{ User : "taught_by"
    
    Subject ||--o{ Grade : "graded_in"
    Semester ||--o{ Grade : "graded_in"
    Semester ||--o{ Attendance : "attended_in"
    Semester ||--o{ Enrollment : "dropped_in"
    
    SchoolYear ||--o{ Course : "contains"
    SchoolYear ||--o{ Attendance : "tracks"
```

### **Entity Overview**
| Entity | Purpose | Key Relationships |
|--------|---------|------------------|
| **User** | System users (admin/teacher) | Teaches courses, grades students, performs actions |
| **Student** | Student information | Has guardians, family info, enrollments, grades |
| **Guardian** | Student guardians | Belongs to student |
| **FamilyInfo** | Family background | Belongs to student (1:1) |
| **Scholarship** | Financial aid | Belongs to student |
| **Course** | Academic courses | Contains students, grades, attendance |
| **Subject** | Subject definitions | Graded in courses |
| **Grade** | Student grades | Links student, course, subject, semester |
| **Enrollment** | Student-course enrollments | Links student to course |
| **Attendance** | Attendance records | Links student to course/semester |
| **SchoolYear** | Academic years | Contains courses |
| **Semester** | Academic semesters | Contains grades, attendance |
| **ActivityLog** | System audit trail | Links to user actions |

## 📊 **Detailed Data Models**

### **1. User Management**
```prisma
model User {
  userId              Int           @id @default(autoincrement())
  username            String        @unique
  password            String        // bcrypt hashed
  lastname            String
  firstname           String
  phonenumber1        String?
  phonenumber2        String?
  role                String        @default("teacher") // admin | teacher
  avatar              String?
  photo               String?
  position            String?
  status              String        @default("active")  // active | inactive
  lastLogin           DateTime?
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  accountLockedUntil  DateTime?
  failedLoginAttempts Int           @default(0)
  lastFailedLogin     DateTime?
  
  // Relationships
  activityLogs        ActivityLog[] @relation("ActivityLogUser")
  coursesAsTeacher1   Course[]      @relation("CourseTeacher1")
  coursesAsTeacher2   Course[]      @relation("CourseTeacher2")
  coursesAsTeacher3   Course[]      @relation("CourseTeacher3")
  grades              Grade[]

  // Indexes
  @@index([role])
  @@index([status])
  @@index([createdAt])
}
```

**Key Features:**
- **Multi-teacher Support**: Courses can have up to 3 teachers
- **Account Security**: Failed login tracking and account lockout
- **Role-based Access**: Admin and teacher roles with different permissions
- **Audit Trail**: All user actions logged in ActivityLog

### **2. Student Management**
```prisma
model Student {
  studentId            Int           @id @default(autoincrement())
  lastName             String
  firstName            String
  gender               String
  dob                  DateTime
  class                String
  photo                String?
  phone                String?
  registrationDate     DateTime?
  status               String?
  religion             String?
  health               String?
  emergencyContact     String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  
  // Extended Information
  classId              Int?
  needsClothes         Boolean?      @default(false)
  needsMaterials       Boolean?      @default(false)
  needsTransport       Boolean?      @default(false)
  previousSchool       String?
  registerToStudy      Boolean?      @default(false)
  studentBirthDistrict String?
  studentDistrict      String?
  studentHouseNumber   String?
  studentProvince      String?
  studentVillage       String?
  transferReason       String?
  vaccinated           Boolean?      @default(false)
  schoolYear           String?
  studentCommune       String?
  
  // Relationships
  attendances          Attendance[]
  enrollments          Enrollment[]
  family               FamilyInfo?
  grades               Grade[]
  guardians            Guardian[]
  scholarships         Scholarship[]
}
```

**Key Features:**
- **Comprehensive Profile**: Personal, academic, and social information
- **Address Tracking**: Detailed address information with commune support
- **Special Needs**: Tracks clothing, materials, and transport needs
- **Health & Vaccination**: Health status and vaccination records
- **Academic History**: Previous school and transfer information

### **3. Guardian Information**
```prisma
model Guardian {
  guardianId    Int      @id @default(autoincrement())
  studentId     Int
  relation      String   // Father, Mother, Guardian, etc.
  phone         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Personal Information
  believeJesus  Boolean? @default(false)
  birthDistrict String?
  childrenCount Int?
  church        String?
  district      String?
  firstName     String?
  houseNumber   String?
  income        Float?
  lastName      String?
  occupation    String?
  province      String?
  village       String?
  commune       String?
  
  // Relationships
  student       Student  @relation(fields: [studentId], references: [studentId])
}
```

**Key Features:**
- **Multiple Guardians**: Students can have multiple guardians
- **Financial Information**: Income tracking for scholarship decisions
- **Religious Background**: Church affiliation and beliefs
- **Contact Information**: Multiple contact methods

### **4. Family Background**
```prisma
model FamilyInfo {
  familyinfoId     Int      @id @default(autoincrement())
  studentId        Int      @unique
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Living Conditions
  canHelpSchool    Boolean? @default(false)
  churchName       String?
  durationInKPC    String?
  helpAmount       Float?
  helpFrequency    String?
  knowSchool       String?
  livingCondition  String?
  livingWith       String?
  organizationHelp String?
  ownHouse         Boolean? @default(false)
  religion         String?
  povertyCard      String?  // Government poverty card tracking
  
  // Relationships
  student          Student  @relation(fields: [studentId], references: [studentId])
}
```

**Key Features:**
- **One-to-One Relationship**: Each student has exactly one family record
- **Socioeconomic Tracking**: Living conditions and financial support
- **Government Integration**: Poverty card tracking for aid programs
- **Community Support**: Organization and church assistance tracking

### **5. Academic Structure**
```prisma
model Course {
  courseId     Int          @id @default(autoincrement())
  schoolYearId Int
  teacherId1   Int?
  teacherId2   Int?
  teacherId3   Int?
  grade        String       // Grade level (1-12)
  section      String       // Section (A, B, C, etc.)
  courseName   String
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  // Relationships
  attendances  Attendance[]
  schoolYear   SchoolYear   @relation(fields: [schoolYearId], references: [schoolYearId])
  teacher1     User?        @relation("CourseTeacher1", fields: [teacherId1], references: [userId])
  teacher2     User?        @relation("CourseTeacher2", fields: [teacherId2], references: [userId])
  teacher3     User?        @relation("CourseTeacher3", fields: [teacherId3], references: [userId])
  enrollments  Enrollment[]
  grades       Grade[]

  // Performance Indexes
  @@index([schoolYearId, grade, section])
  @@index([teacherId1])
  @@index([teacherId2])
  @@index([teacherId3])
}

model Subject {
  subjectId   Int      @id @default(autoincrement())
  subjectName String   // Mathematics, Khmer, English, etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  grades      Grade[]
}

model SchoolYear {
  schoolYearId   Int          @id @default(autoincrement())
  schoolYearCode String       @unique // 2024-2025, etc.
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  // Relationships
  attendances    Attendance[]
  courses        Course[]
}

model Semester {
  semesterId   Int          @id @default(autoincrement())
  semester     String       // First Semester, Second Semester
  semesterCode String       @unique // S1-2024, S2-2024
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  // Relationships
  attendances  Attendance[]
  enrollments  Enrollment[]
  grades       Grade[]
}
```

**Key Features:**
- **Multi-teacher Courses**: Up to 3 teachers per course
- **Flexible Grading**: Grade and section organization
- **Academic Year Management**: School year and semester tracking
- **Subject-based Grading**: Separate subject definitions

### **6. Enrollment System**
```prisma
model Enrollment {
  enrollmentId Int       @id @default(autoincrement())
  courseId     Int
  studentId    Int
  drop         Boolean   @default(false)
  dropSemesterId Int?
  dropDate     DateTime?
  dropReason   String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @default(now()) @updatedAt
  
  // Relationships
  course       Course    @relation(fields: [courseId], references: [courseId])
  student      Student   @relation(fields: [studentId], references: [studentId])
  dropSemester Semester? @relation(fields: [dropSemesterId], references: [semesterId])

  // Constraints & Indexes
  @@unique([studentId, courseId])  // Prevent duplicate enrollments
  @@index([studentId, courseId])
  @@index([drop])
  @@index([dropDate])
  @@index([dropSemesterId])
}
```

**Key Features:**
- **Drop Tracking**: Comprehensive student drop management
- **Semester-based Drops**: Track which semester student dropped
- **Duplicate Prevention**: Unique constraint on student-course pairs
- **Audit Trail**: Creation and update timestamps

### **7. Grade Management**
```prisma
model Grade {
  gradeId      Int       @id @default(autoincrement())
  courseId     Int
  studentId    Int
  subjectId    Int
  semesterId   Int
  gradeDate    String    // Date of grade entry
  grade        Float     // Numeric grade value
  gradeComment String?
  userId       Int?      // Teacher who entered the grade
  lastEdit     DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  // Relationships
  course       Course    @relation(fields: [courseId], references: [courseId])
  semester     Semester  @relation(fields: [semesterId], references: [semesterId])
  student      Student   @relation(fields: [studentId], references: [studentId])
  subject      Subject   @relation(fields: [subjectId], references: [subjectId])
  user         User?     @relation(fields: [userId], references: [userId])

  // Performance Indexes
  @@index([studentId, courseId])
  @@index([gradeDate])
  @@index([courseId, studentId, subjectId])
}
```

**Key Features:**
- **Multi-dimensional Grading**: Student, Course, Subject, Semester
- **Teacher Tracking**: Records which teacher entered the grade
- **Edit History**: Last edit timestamp for audit purposes
- **Flexible Date Format**: String-based grade dates for various formats

### **8. Attendance Tracking**
```prisma
model Attendance {
  studentId      Int
  session        AttendanceSession  // AM, PM, FULL
  status         String            // Present, Absent, Late, Excused
  reason         String?
  recordedBy     String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  attendanceDate DateTime
  attendanceId   Int               @id @default(autoincrement())
  courseId       Int
  semesterId     Int?
  schoolYearId   Int?
  
  // Relationships
  course         Course            @relation(fields: [courseId], references: [courseId])
  schoolYear     SchoolYear?       @relation(fields: [schoolYearId], references: [schoolYearId])
  semester       Semester?         @relation(fields: [semesterId], references: [semesterId])
  student        Student           @relation(fields: [studentId], references: [studentId])
}

enum AttendanceSession {
  AM
  PM
  FULL
}
```

**Key Features:**
- **Session-based Tracking**: Morning, afternoon, or full day
- **Status Management**: Present, absent, late, excused
- **Multi-level Linking**: Student, course, semester, school year
- **Reason Tracking**: Optional reason for absence/lateness

### **9. Audit & Activity Logging**
```prisma
model ActivityLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  action    String   // login, create_student, update_grade, etc.
  details   String?  // Additional details in JSON format
  timestamp DateTime @default(now())
  
  // Relationships
  user      User     @relation("ActivityLogUser", fields: [userId], references: [userId])
}
```

**Key Features:**
- **Comprehensive Logging**: All user actions tracked
- **User Attribution**: Links actions to specific users
- **Flexible Details**: JSON details for complex actions
- **Timestamp Tracking**: Precise action timing

## 🔧 **Database Configuration**

### **Prisma Configuration**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **Connection Management**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### **Environment Configuration**
```bash
# Environment Variables
DATABASE_URL="postgresql://username:password@localhost:5432/friendship_school"
# Production example:
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
```

## 📈 **Performance Optimization**

### **Database Indexing Strategy**
```sql
-- Primary Performance Indexes
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_status ON "User"(status);
CREATE INDEX idx_user_created_at ON "User"("createdAt");

-- Course-related Indexes
CREATE INDEX idx_course_schoolyear_grade_section ON "Course"("schoolYearId", grade, section);
CREATE INDEX idx_course_teacher1 ON "Course"("teacherId1");
CREATE INDEX idx_course_teacher2 ON "Course"("teacherId2");
CREATE INDEX idx_course_teacher3 ON "Course"("teacherId3");

-- Grade-related Indexes
CREATE INDEX idx_grade_student_course ON "Grade"("studentId", "courseId");
CREATE INDEX idx_grade_date ON "Grade"("gradeDate");
CREATE INDEX idx_grade_course_student_subject ON "Grade"("courseId", "studentId", "subjectId");

-- Enrollment Indexes
CREATE INDEX idx_enrollment_student_course ON "Enrollment"("studentId", "courseId");
CREATE INDEX idx_enrollment_drop ON "Enrollment"(drop);
CREATE INDEX idx_enrollment_drop_date ON "Enrollment"("dropDate");
CREATE INDEX idx_enrollment_drop_semester ON "Enrollment"("dropSemesterId");

-- Attendance Indexes
CREATE INDEX idx_attendance_student_date ON "Attendance"("studentId", "attendanceDate");
CREATE INDEX idx_attendance_course_date ON "Attendance"("courseId", "attendanceDate");
CREATE INDEX idx_attendance_semester ON "Attendance"("semesterId");
CREATE INDEX idx_attendance_school_year ON "Attendance"("schoolYearId");
```

### **Query Optimization Patterns**
```typescript
// Optimized Queries
const optimizedQueries = {
  // Student with all related data
  studentWithRelations: {
    include: {
      guardians: true,
      family: true,
      scholarships: true,
      enrollments: {
        include: {
          course: {
            include: {
              schoolYear: true,
              teacher1: true,
              teacher2: true,
              teacher3: true
            }
          }
        }
      },
      grades: {
        include: {
          subject: true,
          semester: true,
          course: true
        }
      },
      attendances: {
        include: {
          course: true,
          semester: true
        }
      }
    }
  },

  // Course with enrolled students
  courseWithStudents: {
    include: {
      enrollments: {
        where: { drop: false },
        include: {
          student: true
        }
      },
      schoolYear: true,
      teacher1: true,
      teacher2: true,
      teacher3: true
    }
  },

  // Grades for specific course and semester
  courseGrades: {
    where: {
      courseId: courseId,
      semesterId: semesterId
    },
    include: {
      student: true,
      subject: true,
      user: true
    },
    orderBy: [
      { student: { firstName: 'asc' } },
      { subject: { subjectName: 'asc' } }
    ]
  }
}
```

## 🔄 **Migration Management**

### **Migration History**
```bash
# Migration Timeline
2025-08-14: Initial schema creation
2025-08-14: Attendance model updates
2025-08-27: Failed login tracking
2025-09-08: Teacher foreign keys
2025-09-18: Semester to attendance
2025-09-18: School year to attendance
2025-09-19: Remove announcement table
2025-09-26: Add poverty card to family info
2025-09-26: Add missing fields and indexes
2025-09-27: Enrollment improvements
2025-09-27: Link drop semester to semester model
```

### **Migration Commands**
```bash
# Development
npx prisma migrate dev --name migration_name

# Production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### **Migration Best Practices**
```typescript
// Migration Guidelines
const migrationBestPractices = {
  development: [
    "Create descriptive migration names",
    "Test migrations on development data",
    "Backup data before major changes",
    "Use transactions for complex changes"
  ],
  
  production: [
    "Deploy migrations during maintenance windows",
    "Monitor migration performance",
    "Have rollback plans ready",
    "Test migrations on staging first"
  ],
  
  dataIntegrity: [
    "Add foreign key constraints",
    "Create indexes for performance",
    "Validate data after migrations",
    "Update related application code"
  ]
}
```

## 🛡️ **Data Integrity & Constraints**

### **Foreign Key Constraints**
```sql
-- Referential Integrity
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_studentId_fkey" 
  FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_courseId_fkey"
  FOREIGN KEY ("studentId", "courseId") REFERENCES "Student"("studentId"), "Course"("courseId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

### **Unique Constraints**
```sql
-- Prevent Duplicates
CREATE UNIQUE INDEX "User_username_key" ON "User"(username);
CREATE UNIQUE INDEX "FamilyInfo_studentId_key" ON "FamilyInfo"("studentId");
CREATE UNIQUE INDEX "SchoolYear_schoolYearCode_key" ON "SchoolYear"("schoolYearCode");
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");
```

### **Data Validation Rules**
```typescript
// Application-level Validation
const validationRules = {
  student: {
    firstName: "required, min 2 characters",
    lastName: "required, min 2 characters",
    gender: "required, enum: male|female",
    dob: "required, valid date, not future",
    class: "required, valid grade level"
  },
  
  user: {
    username: "required, unique, alphanumeric",
    password: "required, min 8 characters, hashed with bcrypt",
    role: "required, enum: admin|teacher",
    status: "required, enum: active|inactive"
  },
  
  grade: {
    grade: "required, number between 0-10",
    gradeDate: "required, valid date format",
    courseId: "required, valid course",
    studentId: "required, valid student",
    subjectId: "required, valid subject"
  }
}
```

## 📊 **Data Relationships & Joins**

### **Common Query Patterns**
```typescript
// Student Enrollment Query
const getStudentEnrollments = async (studentId: number) => {
  return await prisma.enrollment.findMany({
    where: { studentId, drop: false },
    include: {
      course: {
        include: {
          schoolYear: true,
          teacher1: true,
          teacher2: true,
          teacher3: true
        }
      },
      student: true
    }
  });
};

// Course Grade Summary
const getCourseGradeSummary = async (courseId: number, semesterId: number) => {
  return await prisma.grade.groupBy({
    by: ['studentId', 'subjectId'],
    where: {
      courseId,
      semesterId
    },
    _avg: {
      grade: true
    },
    _count: {
      grade: true
    },
    include: {
      student: true,
      subject: true
    }
  });
};

// Attendance Report
const getAttendanceReport = async (courseId: number, startDate: Date, endDate: Date) => {
  return await prisma.attendance.findMany({
    where: {
      courseId,
      attendanceDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      student: true,
      course: true,
      semester: true
    },
    orderBy: [
      { attendanceDate: 'desc' },
      { student: { firstName: 'asc' } }
    ]
  });
};
```

## 🔍 **Data Analysis & Reporting**

### **Analytics Queries**
```sql
-- Student Performance Analysis
SELECT 
  s."firstName" || ' ' || s."lastName" as student_name,
  c.grade,
  c.section,
  AVG(g.grade) as average_grade,
  COUNT(g."gradeId") as total_grades
FROM "Student" s
JOIN "Grade" g ON s."studentId" = g."studentId"
JOIN "Course" c ON g."courseId" = c."courseId"
WHERE g."semesterId" = $1
GROUP BY s."studentId", s."firstName", s."lastName", c.grade, c.section
ORDER BY average_grade DESC;

-- Attendance Statistics
SELECT 
  c.grade,
  c.section,
  COUNT(DISTINCT a."studentId") as total_students,
  COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
  COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_count,
  ROUND(
    COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0 / 
    COUNT(*), 2
  ) as attendance_percentage
FROM "Attendance" a
JOIN "Course" c ON a."courseId" = c."courseId"
WHERE a."attendanceDate" >= $1 AND a."attendanceDate" <= $2
GROUP BY c.grade, c.section
ORDER BY c.grade, c.section;
```

### **Report Generation Data**
```typescript
// Grade Report Data Structure
interface GradeReportData {
  student: {
    studentId: number;
    firstName: string;
    lastName: string;
    class: string;
  };
  course: {
    courseId: number;
    grade: string;
    section: string;
    courseName: string;
  };
  semester: {
    semesterId: number;
    semester: string;
    semesterCode: string;
  };
  subjects: {
    subjectId: number;
    subjectName: string;
    grades: {
      gradeId: number;
      grade: number;
      gradeDate: string;
      gradeComment?: string;
    }[];
    average: number;
  }[];
  overallAverage: number;
  rank: number;
}

// Attendance Report Data Structure
interface AttendanceReportData {
  student: {
    studentId: number;
    firstName: string;
    lastName: string;
    class: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    percentage: number;
  };
  details: {
    date: string;
    status: string;
    reason?: string;
  }[];
}
```

## 🚀 **Scalability & Performance**

### **Connection Pooling**
```typescript
// Production Connection Pool Configuration
const connectionConfig = {
  database: {
    connectionLimit: 20,
    acquireTimeoutMillis: 60000,
    timeout: 60000,
    idleTimeoutMillis: 300000,
    maxUses: 7500
  },
  
  prisma: {
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  }
};
```

### **Caching Strategy**
```typescript
// Database Caching Layers
const cachingStrategy = {
  application: [
    "Student list caching",
    "Course information caching", 
    "Subject list caching",
    "User role caching"
  ],
  
  database: [
    "Query result caching",
    "Index-based optimization",
    "Materialized views for reports",
    "Connection pooling"
  ],
  
  redis: [
    "Session data caching",
    "Frequently accessed data",
    "Report result caching",
    "User authentication cache"
  ]
};
```

## 🔧 **Backup & Recovery**

### **Backup Strategy**
```bash
# Database Backup Commands
# Full backup
pg_dump -h localhost -U username -d friendship_school > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump -h localhost -U username -d friendship_school --schema-only > schema_backup.sql

# Data only
pg_dump -h localhost -U username -d friendship_school --data-only > data_backup.sql

# Restore
psql -h localhost -U username -d friendship_school < backup_file.sql
```

### **Recovery Procedures**
```typescript
// Disaster Recovery Plan
const recoveryProcedures = {
  dataLoss: [
    "1. Stop application services",
    "2. Restore from latest backup",
    "3. Verify data integrity",
    "4. Restart application services",
    "5. Notify stakeholders"
  ],
  
  corruption: [
    "1. Identify corrupted tables",
    "2. Restore specific table from backup",
    "3. Re-run any pending migrations",
    "4. Validate data consistency",
    "5. Monitor system health"
  ],
  
  performance: [
    "1. Analyze slow queries",
    "2. Update database statistics",
    "3. Rebuild indexes if needed",
    "4. Optimize query plans",
    "5. Monitor performance metrics"
  ]
};
```

## 📈 **Monitoring & Maintenance**

### **Database Monitoring**
```sql
-- Performance Monitoring Queries
-- Slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Maintenance Tasks**
```typescript
// Regular Maintenance Schedule
const maintenanceSchedule = {
  daily: [
    "Monitor disk space usage",
    "Check error logs",
    "Verify backup completion",
    "Monitor query performance"
  ],
  
  weekly: [
    "Update database statistics",
    "Analyze slow queries",
    "Check index usage",
    "Review connection pool health"
  ],
  
  monthly: [
    "Full database backup verification",
    "Index optimization review",
    "Growth trend analysis",
    "Security audit review"
  ],
  
  quarterly: [
    "Database version review",
    "Performance baseline update",
    "Disaster recovery testing",
    "Capacity planning review"
  ]
};
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Database**: PostgreSQL 13+  
**ORM**: Prisma 6.16.2  
**Status**: Production Ready ✅
