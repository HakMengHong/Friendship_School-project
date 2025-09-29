# 🔧 Development Setup Architecture & Technology Stack

## 🎯 **Overview**

The Friendship School Management System development setup is designed for modern, efficient development workflows with comprehensive tooling, automation, and deployment capabilities. The setup supports both local development and production deployment with Docker containerization and cloud-ready configurations.

## 🏗️ **Development Environment Architecture**

### **1. Core Development Stack**

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • Node.js 18+ Runtime Environment                         │
│  • TypeScript 5 Development Language                       │
│  • Next.js 15 App Router Framework                        │
│  • React 18 UI Library                                    │
│  • Tailwind CSS Styling Framework                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL Database                                     │
│  • Prisma ORM & Migration System                          │
│  • Docker Containerized Database                          │
│  • pgAdmin4 Database Management                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    TOOLING LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  • ESLint Code Linting                                     │
│  • Prettier Code Formatting                               │
│  • TypeScript Compiler                                    │
│  • Git Version Control                                    │
│  • Docker Development Environment                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • Docker Multi-Stage Builds                              │
│  • PM2 Process Management                                  │
│  • Linux Server Deployment                                │
│  • Environment Configuration                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Quick Start Development Setup**

### **1. Prerequisites Installation**

#### **A. Required Software**
```bash
# Node.js 18+ (LTS Recommended)
# Download from: https://nodejs.org/

# Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Git
# Download from: https://git-scm.com/

# VS Code (Recommended IDE)
# Download from: https://code.visualstudio.com/
```

#### **B. VS Code Extensions (Recommended)**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### **2. Project Setup Commands**

#### **A. Initial Setup**
```bash
# 1. Clone the repository
git clone <repository-url>
cd Friendship_School-project

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start database services with Docker
docker-compose up -d

# 5. Generate Prisma client
npx prisma generate

# 6. Run database migrations
npx prisma migrate dev

# 7. Add initial users
node scripts/add-teachers.js

# 8. Start development server
npm run dev
```

#### **B. Environment Configuration**
```bash
# .env file configuration
DATABASE_URL="postgresql://postgres:password123@localhost:5432/postgres"
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Custom configurations
PDF_OUTPUT_DIR="./reports"
MAX_FILE_SIZE="10MB"
SESSION_TIMEOUT="1800000"
```

## 🐳 **Docker Development Environment**

### **1. Docker Services Configuration**

#### **A. Docker Compose Setup (`docker-compose.yml`)**
```yaml
version: "3.9"

services:
  postgres:
    image: postgres:latest
    container_name: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  pgadmin4:
    image: dpage/pgadmin4:latest
    container_name: pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8080:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

#### **B. Docker Commands**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset database (WARNING: Deletes all data)
docker-compose down -v && docker-compose up -d

# Check service status
docker-compose ps
```

### **2. Database Access**

#### **A. pgAdmin4 Web Interface**
- **URL**: http://localhost:8080
- **Email**: admin@admin.com
- **Password**: admin123
- **Database Connection**:
  - Host: postgres (or localhost)
  - Port: 5432
  - Username: postgres
  - Password: password123

#### **B. Command Line Access**
```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d postgres

# Or using local psql (if installed)
psql -h localhost -U postgres -d postgres
```

## 📦 **Package Management & Scripts**

### **1. Package.json Configuration**

#### **A. Core Dependencies**
```json
{
  "dependencies": {
    "@prisma/client": "^6.16.2",
    "next": "^15.5.2",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.17",
    "bcryptjs": "^3.0.2",
    "puppeteer": "^24.16.2",
    "exceljs": "^4.4.0",
    "@react-pdf/renderer": "^4.3.0"
  },
  "devDependencies": {
    "@types/node": "^24.3.0",
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.8",
    "eslint": "^9.31.0",
    "eslint-config-next": "^15.5.2",
    "prisma": "^6.16.2",
    "tsx": "^4.20.3"
  }
}
```

#### **B. Development Scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:seed": "tsx prisma/seed.ts",
    "clean:courses": "node scripts/clean-courses.js",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:reset": "docker-compose down -v && docker-compose up -d"
  }
}
```

### **2. Available Development Commands**

#### **A. Development Commands**
```bash
# Development server
npm run dev                 # Start development server (http://localhost:3000)

# Database operations
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Run database migrations
npx prisma studio          # Open Prisma Studio GUI
npx prisma db seed         # Seed database with initial data

# Code quality
npm run lint               # Run ESLint
npm run build              # Build for production
npm run start              # Start production server

# Docker operations
npm run docker:up          # Start Docker services
npm run docker:down        # Stop Docker services
npm run docker:logs        # View Docker logs
npm run docker:reset       # Reset Docker services
```

#### **B. Utility Scripts**
```bash
# User management
node scripts/add-teachers.js              # Add teacher users
node scripts/check-database.js            # Check database connectivity

# Student management
node scripts/add-single-student.js        # Add single student
node scripts/add-bulk-students.js         # Add multiple students
node scripts/create-complete-student.js   # Create complete student record

# Data cleanup
node scripts/truncate-students-safe.js    # Safe student data removal
node scripts/clean-courses.js             # Course cleanup
node scripts/clean-courses-advanced.js    # Advanced course cleanup

# Testing and verification
node scripts/test-security-comprehensive.js # Security testing
node scripts/test-auth-flow.js            # Authentication testing
node scripts/verify-complete-database.js  # Database verification
```

## ⚙️ **Configuration Files**

### **1. TypeScript Configuration (`tsconfig.json`)**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### **2. Tailwind CSS Configuration (`tailwind.config.ts`)**

```typescript
import type { Config } from "tailwindcss";
import forms from '@tailwindcss/forms';

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        khmer: ["Khmer Busra", "Khmer OS", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          50: "#eff6ff",
          100: "#dbeafe",
          // ... full color palette
        },
        // ... other color configurations
      },
      // ... other theme extensions
    },
  },
  plugins: [
    forms,
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
} satisfies Config;

export default config;
```

### **3. Next.js Configuration (`next.config.mjs`)**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optional: Custom configurations
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  // Optional: Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
```

### **4. Shadcn/ui Configuration (`components.json`)**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## 🗄️ **Database Development Setup**

### **1. Prisma Configuration**

#### **A. Prisma Schema (`prisma/schema.prisma`)**
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  userId    String   @id @default(cuid())
  username  String   @unique
  password  String
  firstname String
  lastname  String
  role      String   // 'admin' | 'teacher'
  position  String?
  avatar    String?
  phonenumber1 String?
  phonenumber2 String?
  lastLogin DateTime?
  photo     String?
  status    String   @default("active")
  failedLoginAttempts Int @default(0)
  accountLockedUntil DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  courses      Course[]
  activityLogs ActivityLog[]

  @@map("users")
  @@index([username])
  @@index([role])
  @@index([status])
}

// ... other models
```

#### **B. Database Migration Commands**
```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### **2. Database Development Workflow**

#### **A. Schema Changes**
```bash
# 1. Modify prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name describe_changes

# 3. Generate updated client
npx prisma generate

# 4. Update TypeScript types
npm run build
```

#### **B. Data Seeding**
```bash
# Seed with initial data
npx prisma db seed

# Or run custom seed script
node scripts/add-teachers.js
node scripts/add-school-data.js
```

## 🔧 **Development Tools & Automation**

### **1. Code Quality Tools**

#### **A. ESLint Configuration**
```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### **B. Prettier Configuration (`.prettierrc`)**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### **C. Git Hooks (`.husky/pre-commit`)**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
```

### **2. Development Automation Scripts**

#### **A. Setup Scripts**
```bash
#!/bin/bash
# setup-dev.sh

echo "🚀 Setting up development environment..."

# Install dependencies
npm install

# Start Docker services
docker-compose up -d

# Wait for database to be ready
sleep 10

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Add initial data
node scripts/add-teachers.js

echo "✅ Development environment ready!"
echo "🌐 Application: http://localhost:3000"
echo "🗄️ Database Admin: http://localhost:8080"
```

#### **B. Database Reset Script**
```bash
#!/bin/bash
# reset-db.sh

echo "⚠️ Resetting database..."

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Start services
docker-compose up -d

# Wait for database
sleep 10

# Run migrations
npx prisma migrate dev

# Add initial data
node scripts/add-teachers.js

echo "✅ Database reset complete!"
```

## 🚀 **Production Deployment Setup**

### **1. Docker Production Build**

#### **A. Multi-Stage Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Create necessary directories
RUN mkdir -p /app/logs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
```

#### **B. Production Environment Variables**
```bash
# Production .env
DATABASE_URL="postgresql://user:password@prod-db:5432/school_db"
NEXTAUTH_SECRET="production-secret-key-very-long-and-secure"
NEXTAUTH_URL="https://school.example.com"
NODE_ENV="production"

# Optional production settings
PDF_OUTPUT_DIR="/app/reports"
MAX_FILE_SIZE="50MB"
SESSION_TIMEOUT="1800000"
LOG_LEVEL="info"
```

### **2. PM2 Process Management**

#### **A. PM2 Ecosystem Configuration (`ecosystem.config.js`)**
```javascript
module.exports = {
  apps: [
    {
      name: 'friendship-school',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=4096'
    }
  ]
};
```

#### **B. PM2 Commands**
```bash
# Start application
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart friendship-school

# Stop application
pm2 stop friendship-school

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## 🔍 **Development Testing & Validation**

### **1. Database Testing Scripts**

#### **A. Database Connectivity Test**
```javascript
// scripts/check-database.js
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database connectivity...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🎓 Students: ${studentCount}`);
    
    // Test relations
    const usersWithCourses = await prisma.user.findMany({
      include: { courses: true }
    });
    
    console.log('✅ Database relations working correctly');
    console.log('🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
```

#### **B. Security Testing Script**
```javascript
// scripts/test-security-comprehensive.js
const fetch = require('node-fetch');

async function testSecurity() {
  console.log('🔒 Running comprehensive security tests...');
  
  const tests = [
    {
      name: 'Authentication Required',
      url: 'http://localhost:3000/dashboard',
      expectedStatus: 302 // Redirect to login
    },
    {
      name: 'API Protection',
      url: 'http://localhost:3000/api/students',
      expectedStatus: 401 // Unauthorized
    }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASSED`);
      } else {
        console.log(`❌ ${test.name}: FAILED (got ${response.status}, expected ${test.expectedStatus})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
}

testSecurity();
```

### **2. Development Validation Checklist**

#### **A. Pre-Development Checklist**
- [ ] Node.js 18+ installed
- [ ] Docker Desktop running
- [ ] Git repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Database services started (`docker-compose up -d`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database migrated (`npx prisma migrate dev`)

#### **B. Post-Development Checklist**
- [ ] Code linting passes (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] Database connectivity verified
- [ ] Security tests passing
- [ ] All features working correctly
- [ ] Documentation updated
- [ ] Tests passing (if applicable)

## 📊 **Development Performance Metrics**

### **1. Build Performance**

| Operation | Time | Notes |
|-----------|------|-------|
| **Initial Build** | ~45s | First build with all dependencies |
| **Incremental Build** | ~8s | Subsequent builds |
| **TypeScript Check** | ~3s | Type checking only |
| **Linting** | ~2s | ESLint execution |
| **Docker Build** | ~2-3min | Production Docker image |

### **2. Development Server Performance**

| Metric | Value | Notes |
|--------|-------|-------|
| **Startup Time** | ~5s | Development server startup |
| **Hot Reload** | ~1s | File change detection |
| **Page Load** | ~200ms | Initial page load |
| **API Response** | ~100ms | Average API response time |

## 🔮 **Future Development Enhancements**

### **1. Planned Development Tools**

- **Jest Testing Framework**: Unit and integration testing
- **Cypress E2E Testing**: End-to-end testing automation
- **Storybook**: Component development and documentation
- **GitHub Actions CI/CD**: Automated testing and deployment
- **Sentry Error Tracking**: Production error monitoring
- **Performance Monitoring**: Application performance insights

### **2. Development Workflow Improvements**

- **Automated Testing**: Pre-commit testing hooks
- **Code Coverage**: Test coverage reporting
- **Automated Deployment**: CI/CD pipeline setup
- **Environment Management**: Multiple environment support
- **Database Seeding**: Automated test data generation
- **Performance Profiling**: Development performance tools

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Development Stack**: Modern Full-Stack with Docker & TypeScript  
**Setup Time**: ~10 minutes (with Docker)
