# 📁 Project Structure Architecture & Technology Stack

## 🎯 **Overview**

The Friendship School Management System follows a well-organized, modular architecture built on Next.js 15 App Router with a clear separation of concerns. The project structure is designed for scalability, maintainability, and developer productivity with modern development practices.

## 🏗️ **Core Architecture Principles**

### **1. Modular Design Philosophy**
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
- **Component-Based Architecture**: Reusable, composable React components
- **Feature-Based Organization**: Related functionality grouped together
- **Scalable Structure**: Easy to extend and maintain as the system grows

### **2. Technology-Driven Organization**
- **Next.js App Router**: Modern file-based routing system
- **TypeScript**: Type-safe development with strict configuration
- **Component Library**: Shadcn/ui with Radix UI primitives
- **Utility-First CSS**: Tailwind CSS with custom design system

## 📂 **Complete Project Structure**

```
Friendship_School-project/
├── 📁 app/                          # Next.js App Router (47 pages)
│   ├── 📁 api/                      # API Routes & Backend Logic
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts       # Login API
│   │   │   └── users/route.ts       # User management API
│   │   ├── 📁 students/             # Student management APIs
│   │   │   ├── route.ts             # CRUD operations
│   │   │   ├── [id]/route.ts        # Individual student operations
│   │   │   └── enrolled/route.ts    # Enrolled students API
│   │   ├── 📁 enrollments/          # Enrollment management
│   │   │   ├── route.ts             # Enrollment CRUD
│   │   │   └── [id]/route.ts        # Individual enrollment operations
│   │   ├── 📁 pdf-generate/         # PDF generation endpoints
│   │   │   ├── generate-pdf/route.ts        # Generic PDF generation
│   │   │   ├── generate-student-registration/route.ts
│   │   │   ├── generate-student-id-card/route.ts
│   │   │   ├── generate-teacher-id-card/route.ts
│   │   │   ├── generate-bulk-student-id-cards/route.ts
│   │   │   ├── generate-attendance-report/route.ts
│   │   │   ├── generate-grade-report/route.ts
│   │   │   ├── generate-gradebook-report/route.ts
│   │   │   └── generate-student-list-report/route.ts
│   │   ├── 📁 courses/              # Course management API
│   │   ├── 📁 grades/               # Grade management API
│   │   ├── 📁 attendance/           # Attendance tracking API
│   │   ├── 📁 users/                # User management API
│   │   ├── 📁 school-years/         # Academic year management
│   │   ├── 📁 semesters/            # Semester management
│   │   ├── 📁 subjects/             # Subject management
│   │   ├── 📁 export-excel/         # Excel export functionality
│   │   └── 📁 activity-logs/        # Audit trail logging
│   ├── 📁 dashboard/                # Admin dashboard pages
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── users/page.tsx           # User management
│   │   ├── academic-management/page.tsx
│   │   ├── add-student-class/page.tsx
│   │   ├── view-student-class/page.tsx
│   │   └── id-cards/page.tsx        # ID card generation
│   ├── 📁 attendance/               # Attendance management
│   │   ├── daily/page.tsx           # Daily attendance
│   │   └── report/page.tsx          # Attendance reports
│   ├── 📁 grade/                    # Grade management
│   │   ├── addgrade/page.tsx        # Grade entry
│   │   ├── gradebook/page.tsx       # Gradebook reports
│   │   └── report/page.tsx          # Grade reports
│   ├── 📁 student-info/             # Student information
│   │   ├── page.tsx                 # Student list
│   │   └── list/page.tsx            # Detailed student list
│   ├── 📁 register-student/         # Student registration
│   │   └── page.tsx                 # Registration form
│   ├── 📁 login/                    # Authentication
│   │   └── page.tsx                 # Login page
│   ├── 📁 unauthorized/             # Access control
│   │   └── page.tsx                 # Unauthorized access page
│   ├── 📁 splash/                   # Landing page
│   │   └── page.tsx                 # Splash screen
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── not-found.tsx                # 404 page
├── 📁 components/                   # Reusable UI components (55+ components)
│   ├── 📁 ui/                       # Base UI components (Shadcn/ui)
│   │   ├── button.tsx               # Button component
│   │   ├── card.tsx                 # Card component
│   │   ├── input.tsx                # Input component
│   │   ├── select.tsx               # Select component
│   │   ├── table.tsx                # Table component
│   │   ├── dialog.tsx               # Modal dialog
│   │   ├── toast.tsx                # Toast notifications
│   │   ├── badge.tsx                # Badge component
│   │   ├── avatar.tsx               # Avatar component
│   │   ├── calendar.tsx             # Calendar component
│   │   ├── date-picker.tsx          # Date picker
│   │   ├── dropdown-menu.tsx        # Dropdown menu
│   │   ├── form.tsx                 # Form components
│   │   ├── label.tsx                # Label component
│   │   ├── popover.tsx              # Popover component
│   │   ├── progress.tsx             # Progress bar
│   │   ├── scroll-area.tsx          # Scrollable area
│   │   ├── sheet.tsx                # Side sheet
│   │   ├── skeleton.tsx             # Loading skeleton
│   │   ├── switch.tsx               # Toggle switch
│   │   ├── tabs.tsx                 # Tab component
│   │   ├── textarea.tsx             # Textarea component
│   │   ├── tooltip.tsx              # Tooltip component
│   │   ├── role-guard.tsx           # Role-based access control
│   │   ├── theme-toggle.tsx         # Dark/light mode toggle
│   │   └── [30+ other UI components]
│   ├── 📁 navigation/               # Navigation components
│   │   ├── top-bar.tsx              # Top navigation bar
│   │   ├── sidebar.tsx              # Side navigation
│   │   ├── breadcrumb.tsx           # Breadcrumb navigation
│   │   └── mobile-nav.tsx           # Mobile navigation
│   ├── 📁 calendar/                 # Calendar and date components
│   │   ├── index.ts                 # Calendar exports
│   │   ├── custom-date-picker.tsx   # Custom date picker
│   │   ├── khmer_calendar.tsx       # Khmer calendar component
│   │   └── calendar-utils.ts        # Calendar utilities
│   ├── 📁 student-info/             # Student-specific components
│   │   ├── student-card.tsx         # Student information card
│   │   ├── student-form.tsx         # Student registration form
│   │   ├── student-list.tsx         # Student list component
│   │   ├── student-search.tsx       # Student search component
│   │   ├── guardian-info.tsx        # Guardian information
│   │   ├── family-info.tsx          # Family information
│   │   └── scholarship-info.tsx     # Scholarship information
│   ├── 📁 charts/                   # Chart components
│   │   ├── bar-chart.tsx            # Bar chart component
│   │   ├── pie-chart.tsx            # Pie chart component
│   │   ├── line-chart.tsx           # Line chart component
│   │   └── chart-utils.ts           # Chart utilities
│   └── 📁 forms/                    # Form components
│       ├── student-form.tsx         # Student registration form
│       ├── grade-form.tsx           # Grade entry form
│       ├── attendance-form.tsx      # Attendance form
│       └── form-validation.ts       # Form validation logic
├── 📁 lib/                          # Utility libraries & core logic
│   ├── 📁 pdf-generators/           # PDF generation system
│   │   ├── 📁 core/                 # Core PDF system files
│   │   │   ├── types.ts             # Type definitions & interfaces
│   │   │   ├── utils.ts             # Shared utilities & helpers
│   │   │   └── pdf-manager.ts       # Central PDF manager
│   │   ├── 📁 reports/              # Report generators
│   │   │   ├── student-registration.ts      # Student registration forms
│   │   │   ├── student-list-report.ts      # Class lists & rosters
│   │   │   ├── attendance-report.ts        # Attendance tracking
│   │   │   ├── grade-report-monthly.ts     # Monthly grade reports
│   │   │   ├── grade-report-semester.ts    # Semester reports
│   │   │   ├── grade-report-yearly.ts      # Annual reports
│   │   │   ├── gradebook-report-monthly.ts # Monthly gradebook
│   │   │   ├── gradebook-report-semester.ts# Semester gradebook
│   │   │   └── gradebook-report-yearly.ts  # Annual gradebook
│   │   ├── 📁 id-cards/             # ID card generators
│   │   │   ├── student-id-card.ts   # Front student ID cards
│   │   │   ├── student-id-card-back.ts # Back student ID cards
│   │   │   └── teacher-id-card.ts   # Teacher ID cards
│   │   ├── 📁 docs/                 # Documentation
│   │   │   ├── README.md            # System documentation
│   │   │   ├── GRADE_REPORTS_REFACTORING.md
│   │   │   └── DIRECTORY_REVIEW.md
│   │   └── index.ts                 # Main exports
│   ├── 📁 auth/                     # Authentication utilities
│   │   ├── auth-service.ts          # Authentication service
│   │   └── session-manager.ts       # Session management
│   ├── 📁 api/                      # API utilities
│   │   ├── api-auth.ts              # API authentication
│   │   ├── api-client.ts            # API client utilities
│   │   └── request-validator.ts     # Request validation
│   ├── 📁 database/                 # Database utilities
│   │   ├── prisma.ts                # Prisma client
│   │   ├── queries.ts               # Database queries
│   │   └── migrations.ts            # Migration utilities
│   ├── 📁 utils/                    # General utilities
│   │   ├── utils.ts                 # Utility functions
│   │   ├── cn.ts                    # Class name utility
│   │   ├── date-utils.ts            # Date manipulation
│   │   ├── format-utils.ts          # Formatting utilities
│   │   ├── validation.ts            # Validation utilities
│   │   └── constants.ts             # Application constants
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── use-student-info.ts      # Student data hook
│   │   ├── use-client-time.ts       # Client time hook
│   │   ├── use-is-mobile.ts         # Mobile detection hook
│   │   ├── use-toast.ts             # Toast notification hook
│   │   └── use-auth.ts              # Authentication hook
│   └── 📁 types/                    # TypeScript type definitions
│       ├── auth.ts                  # Authentication types
│       ├── student.ts               # Student types
│       ├── grade.ts                 # Grade types
│       ├── attendance.ts            # Attendance types
│       └── api.ts                   # API types
├── 📁 prisma/                       # Database schema and migrations
│   ├── schema.prisma                # Database schema
│   ├── 📁 migrations/               # Database migrations
│   │   ├── 20240919162822_remove_announcement_table/
│   │   ├── 20240926144727_add_poverty_card_to_family_info/
│   │   ├── 20240926164859_add_missing_fields_and_indexes/
│   │   ├── 20240927155348_add_enrollment_improvements/
│   │   └── 20240927160044_link_dropsemester_to_semester_model/
│   ├── seed.ts                      # Database seeding
│   └── client.ts                    # Prisma client configuration
├── 📁 scripts/                      # Development and maintenance scripts
│   ├── 📁 README.md                 # Scripts documentation
│   ├── add-teachers.js              # Add teacher users
│   ├── check-database.js            # Database connectivity check
│   ├── add-single-student.js        # Add single student
│   ├── add-bulk-students.js         # Add multiple students
│   ├── create-complete-student.js   # Create complete student record
│   ├── truncate-students-safe.js    # Safe student data removal
│   ├── truncate-students.js         # Student data removal
│   ├── clean-courses.js             # Course cleanup
│   ├── clean-courses-advanced.js    # Advanced course cleanup
│   ├── test-security-comprehensive.js # Security testing
│   ├── test-auth-flow.js            # Authentication testing
│   ├── test-role-guard.js           # Role guard testing
│   └── verify-complete-database.js  # Database verification
├── 📁 hooks/                        # Custom React hooks (root level)
│   ├── use-toast.ts                 # Toast notifications
│   ├── use-auth.ts                  # Authentication state
│   ├── use-student-info.ts          # Student data management
│   ├── use-client-time.ts           # Client-side time
│   └── use-is-mobile.ts             # Mobile device detection
├── 📁 public/                       # Static assets and logos
│   ├── 📁 images/                   # Image assets
│   │   ├── logos/                   # School logos
│   │   ├── icons/                   # Icon assets
│   │   └── backgrounds/             # Background images
│   ├── 📁 fonts/                    # Custom fonts
│   │   ├── KhmerBusra/              # Khmer font files
│   │   └── Inter/                   # Inter font files
│   ├── favicon.ico                  # Site favicon
│   └── robots.txt                   # SEO robots file
├── 📁 docs/                         # Project documentation
│   ├── PROJECT_DOCUMENTATION.md     # Main project documentation
│   ├── FRONTEND_ARCHITECTURE.md     # Frontend architecture
│   ├── BACKEND_ARCHITECTURE.md      # Backend architecture
│   ├── DATABASE_ARCHITECTURE.md     # Database architecture
│   ├── SECURITY_SYSTEM_ARCHITECTURE.md # Security architecture
│   ├── PROJECT_STRUCTURE_ARCHITECTURE.md # This file
│   ├── KEY_FEATURES_ARCHITECTURE.md # Key features documentation
│   ├── DEVELOPMENT_SETUP_ARCHITECTURE.md # Development setup
│   ├── DEVELOPMENT_TOOLS.md         # Development tools
│   └── REORGANIZATION_SUMMARY.md    # Project reorganization
├── 📁 temp-files/                   # Temporary files (70+ cleaned files)
│   ├── test-*.pdf                   # Test PDF files
│   ├── test-*.js                    # Test JavaScript files
│   ├── test-*.html                  # Test HTML files
│   └── debug-scripts/               # Debug and calculation scripts
├── 📁 reports/                      # Sample reports and outputs
│   ├── sample-reports/              # Sample generated reports
│   ├── test-outputs/                # Test generation outputs
│   └── documentation/               # Report documentation
├── 📄 Configuration Files
│   ├── package.json                 # Dependencies and scripts
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.ts           # Tailwind CSS configuration
│   ├── next.config.mjs              # Next.js configuration
│   ├── postcss.config.mjs           # PostCSS configuration
│   ├── components.json              # Shadcn/ui configuration
│   ├── .eslintrc.json               # ESLint configuration
│   ├── .gitignore                   # Git ignore rules
│   ├── .env.example                 # Environment variables template
│   ├── middleware.ts                # Next.js middleware
│   ├── Dockerfile                   # Docker configuration
│   ├── docker-compose.yml           # Docker Compose services
│   ├── deploy.sh                    # Deployment script
│   └── ecosystem.config.js          # PM2 configuration
├── 📄 Documentation Files
│   ├── README.md                    # Main project README
│   ├── DOCKER_SETUP.md              # Docker setup guide
│   ├── LINUX_DEPLOYMENT_GUIDE.md    # Linux deployment guide
│   ├── CLEANUP_SUMMARY.md           # Project cleanup summary
│   ├── LEGACY_REMOVAL_SUMMARY.md    # Legacy feature removal
│   └── grade-calculation-system.md  # Grade calculation documentation
└── 📄 Other Files
    ├── .next/                       # Next.js build output
    ├── node_modules/                # Dependencies
    └── package-lock.json            # Dependency lock file
```

## 🎯 **Directory Structure Analysis**

### **1. App Router Structure (`/app`)**

The `/app` directory follows Next.js 15 App Router conventions with clear separation:

#### **A. API Routes (`/app/api`)**
```
/api/
├── auth/                    # Authentication endpoints
├── students/                # Student management (CRUD)
├── enrollments/             # Enrollment system
├── pdf-generate/            # PDF generation (10+ endpoints)
├── courses/                 # Course management
├── grades/                  # Grade management
├── attendance/              # Attendance tracking
├── users/                   # User management
├── school-years/            # Academic year management
├── semesters/               # Semester management
├── subjects/                # Subject management
├── export-excel/            # Excel export
└── activity-logs/           # Audit trail
```

#### **B. Page Routes (`/app/[feature]`)**
```
/dashboard/                  # Admin dashboard (6 pages)
/attendance/                 # Attendance management (2 pages)
/grade/                      # Grade management (3 pages)
/student-info/               # Student information (2 pages)
/register-student/           # Student registration
/login/                      # Authentication
/unauthorized/               # Access control
/splash/                     # Landing page
```

### **2. Component Architecture (`/components`)**

#### **A. UI Components (`/components/ui`)**
- **55+ Shadcn/ui Components**: Button, Card, Input, Select, Table, Dialog, etc.
- **Custom Components**: RoleGuard, ThemeToggle, custom form components
- **Accessibility**: Full ARIA compliance via Radix UI primitives

#### **B. Feature Components (`/components/[feature]`)**
```
/navigation/                 # Navigation components (4 components)
/calendar/                   # Calendar system (3 components)
/student-info/               # Student-specific (7 components)
/charts/                     # Chart components (4 components)
/forms/                      # Form components (4 components)
```

### **3. Library Structure (`/lib`)**

#### **A. PDF Generation System (`/lib/pdf-generators`)**
```
pdf-generators/
├── core/                    # Core system (3 files)
├── reports/                 # Report generators (8 files)
├── id-cards/                # ID card generators (3 files)
├── docs/                    # Documentation (3 files)
└── index.ts                 # Main exports
```

#### **B. Utility Libraries (`/lib/[category]`)**
```
/auth/                       # Authentication utilities
/api/                        # API utilities
/database/                   # Database utilities
/utils/                      # General utilities
/hooks/                      # Custom React hooks
/types/                      # TypeScript definitions
```

### **4. Database Structure (`/prisma`)**

#### **A. Schema Organization**
- **11 Models**: User, Student, Guardian, FamilyInfo, Scholarship, Course, Subject, Grade, Enrollment, SchoolYear, Semester, Attendance, ActivityLog
- **1 Enum**: AttendanceSession
- **Multiple Indexes**: Performance optimization
- **Relationships**: Complex foreign key relationships

#### **B. Migration Management**
- **5 Migration Files**: Incremental schema changes
- **Version Control**: Tracked schema evolution
- **Data Integrity**: Constraints and validations

### **5. Scripts & Automation (`/scripts`)**

#### **A. Development Scripts**
- **User Management**: add-teachers.js
- **Database Management**: check-database.js, cleanup scripts
- **Student Management**: add-single-student.js, add-bulk-students.js
- **Testing Scripts**: Security testing, authentication testing

#### **B. Maintenance Scripts**
- **Data Cleanup**: truncate-students.js, clean-courses.js
- **Verification**: verify-complete-database.js
- **Testing**: Comprehensive security and functionality tests

## 🏗️ **Architectural Patterns**

### **1. Feature-Based Organization**

Each major feature is organized as a cohesive unit:

```
Feature: Student Management
├── /app/student-info/        # Pages
├── /app/register-student/    # Pages
├── /app/api/students/        # API routes
├── /components/student-info/ # Components
├── /lib/types/student.ts     # Types
└── /hooks/use-student-info.ts # Hooks
```

### **2. Layered Architecture**

```
┌─────────────────────────────────────┐
│           PRESENTATION LAYER         │
│  • React Components                 │
│  • UI Components (Shadcn/ui)        │
│  • Custom Hooks                     │
│  • Client-side Logic                │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│            API LAYER                │
│  • Next.js API Routes              │
│  • Request/Response Handling       │
│  • Authentication & Authorization   │
│  • Input Validation                 │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          BUSINESS LOGIC LAYER       │
│  • Service Functions               │
│  • Business Rules                  │
│  • Data Processing                 │
│  • PDF Generation                  │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│           DATA ACCESS LAYER         │
│  • Prisma ORM                      │
│  • Database Queries                │
│  • Data Validation                 │
│  • Migration Management             │
└─────────────────────────────────────┘
```

### **3. Component Composition Pattern**

```typescript
// Component composition example
<RoleGuard allowedRoles={['admin']}>
  <DashboardLayout>
    <StudentManagementSection>
      <StudentSearch />
      <StudentList />
      <StudentForm />
    </StudentManagementSection>
  </DashboardLayout>
</RoleGuard>
```

## 🔧 **Configuration Architecture**

### **1. TypeScript Configuration (`tsconfig.json`)**

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### **2. Tailwind CSS Configuration (`tailwind.config.ts`)**

```typescript
// Custom design system
fontFamily: {
  khmer: ["Khmer Busra", "Khmer OS", "system-ui", "sans-serif"],
  sans: ["Inter", "system-ui", "sans-serif"]
},
colors: {
  primary: { /* Custom color palette */ },
  secondary: { /* Custom color palette */ }
},
// Custom animations, spacing, and utilities
```

### **3. Next.js Configuration (`next.config.mjs`)**

```javascript
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```

### **4. Shadcn/ui Configuration (`components.json`)**

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## 📦 **Dependency Management**

### **1. Core Dependencies**

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Framework** | next | ^15.5.2 | React framework |
| **Runtime** | react | ^18.0.0 | UI library |
| **Language** | typescript | ^5 | Type safety |
| **Styling** | tailwindcss | ^3.4.17 | CSS framework |
| **Database** | @prisma/client | ^6.16.2 | Database ORM |
| **Security** | bcryptjs | ^3.0.2 | Password hashing |
| **PDF** | puppeteer | ^24.16.2 | PDF generation |
| **Charts** | recharts | ^2.12.2 | Data visualization |

### **2. Development Dependencies**

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | ^9.31.0 | Code linting |
| prisma | ^6.16.2 | Database toolkit |
| tsx | ^4.20.3 | TypeScript execution |

## 🚀 **Build & Deployment Architecture**

### **1. Docker Configuration**

```dockerfile
# Multi-stage build
FROM node:18-alpine AS base
FROM base AS deps        # Dependencies
FROM base AS builder     # Build application
FROM base AS runner      # Production runtime
```

### **2. Docker Compose Services**

```yaml
services:
  postgres:              # PostgreSQL database
  pgadmin4:             # Database administration
  # Application runs on host
```

### **3. Environment Configuration**

```bash
# Development
DATABASE_URL="postgresql://postgres:password123@localhost:5432/postgres"
NEXTAUTH_SECRET="development-secret"
NEXTAUTH_URL="http://localhost:3000"

# Production
DATABASE_URL="postgresql://user:pass@prod-db:5432/school_db"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://school.example.com"
```

## 📊 **Project Statistics**

### **1. File Organization**

| Directory | Files | Purpose |
|-----------|-------|---------|
| `/app` | 47 pages | Next.js App Router pages |
| `/components` | 55+ components | Reusable UI components |
| `/lib` | 25+ utilities | Core business logic |
| `/prisma` | 5 migrations | Database schema |
| `/scripts` | 15+ scripts | Development automation |
| `/docs` | 10+ docs | Project documentation |

### **2. Technology Distribution**

| Technology | Usage | Percentage |
|------------|-------|------------|
| **TypeScript** | All code | 100% |
| **React** | Frontend | 90% |
| **Next.js** | Framework | 100% |
| **Tailwind CSS** | Styling | 100% |
| **Prisma** | Database | 100% |
| **Shadcn/ui** | UI Components | 95% |

## 🔄 **Development Workflow**

### **1. Feature Development**

```bash
# 1. Create feature branch
git checkout -b feature/student-enrollment

# 2. Implement feature
# - Add API routes (/app/api/enrollments/)
# - Create components (/components/enrollment/)
# - Add types (/lib/types/enrollment.ts)
# - Update database schema (prisma/schema.prisma)

# 3. Test and validate
npm run lint
npm run build
node scripts/test-feature.js

# 4. Commit and merge
git commit -m "feat: add student enrollment system"
git push origin feature/student-enrollment
```

### **2. Database Changes**

```bash
# 1. Update schema
# Edit prisma/schema.prisma

# 2. Generate migration
npx prisma migrate dev --name add_enrollment_table

# 3. Update Prisma client
npx prisma generate

# 4. Test migration
node scripts/check-database.js
```

## 📈 **Scalability Considerations**

### **1. Horizontal Scaling**

- **API Routes**: Stateless design enables easy scaling
- **Database**: PostgreSQL supports read replicas
- **Components**: Modular design allows feature scaling
- **Assets**: CDN-ready static assets

### **2. Performance Optimization**

- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Component-level lazy loading
- **Database Indexing**: Optimized database queries
- **Caching**: API response caching strategies

### **3. Maintainability**

- **TypeScript**: Compile-time error prevention
- **Component Library**: Consistent UI patterns
- **Documentation**: Comprehensive project docs
- **Testing**: Automated testing scripts

## 🔮 **Future Architecture Enhancements**

### **1. Planned Improvements**

- **Microservices**: Split into domain-specific services
- **GraphQL**: API layer modernization
- **State Management**: Redux Toolkit integration
- **Testing**: Jest + Testing Library setup
- **CI/CD**: GitHub Actions workflow

### **2. Architecture Evolution**

```
Current: Monolithic Next.js App
    ↓
Phase 1: Modular Monolith
    ↓
Phase 2: Microservices Architecture
    ↓
Phase 3: Cloud-Native Architecture
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Architecture Pattern**: Modular Monolith with Feature-Based Organization
