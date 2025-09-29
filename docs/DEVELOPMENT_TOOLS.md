# 🛠️ Development Tools & Technology Stack

## 📋 **Overview**

The Friendship School Management System development environment is built with modern tooling, providing a robust, efficient, and scalable development experience. The toolchain includes comprehensive build tools, development utilities, testing frameworks, and deployment configurations optimized for productivity and maintainability.

## 🏗️ **Core Development Technology Stack**

### **Build & Bundling Tools**
- **Next.js 15.5.2** - Full-stack React framework with built-in tooling
- **TypeScript 5** - Type-safe JavaScript with advanced features
- **PostCSS 8.5** - CSS processing and optimization
- **Autoprefixer 10.4.20** - Automatic vendor prefix management
- **TSX 4.20.3** - TypeScript execution environment

### **Code Quality & Linting**
- **ESLint 9.31.0** - JavaScript/TypeScript linting and code quality
- **ESLint Config Next 15.5.2** - Next.js specific linting rules
- **Prettier** - Code formatting and consistency
- **TypeScript Strict Mode** - Enhanced type checking

### **Styling & UI Development**
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Tailwind Forms 0.5.10** - Form styling plugin
- **Tailwind Typography 0.5.16** - Typography plugin
- **Tailwind Animate 1.0.7** - Animation utilities
- **Shadcn/ui** - Component library with Tailwind integration

### **Database & ORM Tools**
- **Prisma 6.16.2** - Database toolkit and ORM
- **Prisma Client** - Auto-generated type-safe database client
- **Prisma Studio** - Visual database management interface
- **Prisma Migrate** - Database schema migration system

### **Development Utilities**
- **Node.js 18+** - JavaScript runtime environment
- **npm** - Package manager and script runner
- **Git** - Version control system
- **Docker** - Containerization platform

## 📦 **Package Management & Dependencies**

### **Production Dependencies**
```json
{
  "dependencies": {
    // Core Framework
    "next": "^15.5.2",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    
    // TypeScript & Type Definitions
    "@types/bcryptjs": "^2.4.6",
    "@types/formidable": "^3.4.5",
    
    // Database & ORM
    "@prisma/client": "^6.16.2",
    "bcryptjs": "^3.0.2",
    
    // UI Components & Styling
    "@radix-ui/*": "1.x.x", // 20+ Radix UI components
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.16",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    
    // Forms & Validation
    "@hookform/resolvers": "^3.9.1",
    "react-hook-form": "^7.54.1",
    "zod": "^3.24.1",
    
    // Data Visualization
    "chart.js": "^4.4.2",
    "react-chartjs-2": "^5.2.0",
    "recharts": "^2.12.2",
    
    // Date & Time
    "date-fns": "^2.30.0",
    "react-day-picker": "^9.8.1",
    
    // PDF & Document Generation
    "@react-pdf/renderer": "^4.3.0",
    "puppeteer": "^24.16.2",
    "exceljs": "^4.4.0",
    
    // Utilities
    "lucide-react": "^0.454.0",
    "next-themes": "^0.4.4",
    "sonner": "^1.7.1",
    "vaul": "^0.9.6",
    "cmdk": "1.0.4",
    "embla-carousel-react": "8.5.1",
    "input-otp": "1.4.1",
    "react-resizable-panels": "^2.1.7"
  }
}
```

### **Development Dependencies**
```json
{
  "devDependencies": {
    // TypeScript & Type Definitions
    "@types/node": "^24.3.0",
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.8",
    "typescript": "^5",
    
    // Linting & Code Quality
    "eslint": "^9.31.0",
    "eslint-config-next": "^15.5.2",
    
    // Styling & CSS
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5",
    "autoprefixer": "^10.4.20",
    
    // Database Tools
    "prisma": "^6.16.2",
    
    // Development Utilities
    "tsx": "^4.20.3"
  }
}
```

## ⚙️ **Build Configuration**

### **Next.js Configuration**
```javascript
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Allow builds with linting errors
  },
  typescript: {
    ignoreBuildErrors: true,   // Allow builds with TypeScript errors
  },
  images: {
    unoptimized: true,         // Disable image optimization for static export
  },
}

export default nextConfig
```

### **TypeScript Configuration**
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
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]  // Path mapping for imports
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### **Tailwind CSS Configuration**
```typescript
// tailwind.config.ts
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
        khmer: ["Khmer Busra", "Khmer OS", "Khmer OS System", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      colors: {
        // Custom color palette with CSS variables
        primary: { /* Blue color scale */ },
        secondary: { /* Cyan color scale */ },
        success: { DEFAULT: "#10b981" },
        warning: { DEFAULT: "#f59e0b" },
        // ... additional color definitions
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        // ... additional animations
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        // ... additional animation definitions
      },
    },
  },
  plugins: [
    forms,
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
} satisfies Config;

export default config;
```

### **PostCSS Configuration**
```javascript
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

### **Shadcn/ui Configuration**
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

## 🐳 **Containerization & Deployment**

### **Docker Configuration**
```dockerfile
# Dockerfile - Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
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

# Production image
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

### **Docker Compose Development**
```yaml
# docker-compose.yml
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

## 📜 **Development Scripts**

### **NPM Scripts**
```json
{
  "scripts": {
    // Core Development
    "dev": "next dev",                    // Start development server
    "build": "next build",                // Build for production
    "start": "next start",                // Start production server
    "lint": "next lint",                  // Run ESLint
    
    // Database Management
    "db:seed": "tsx prisma/seed.ts",      // Seed database
    
    // Data Management
    "clean:courses": "node scripts/clean-courses.js",
    "clean:courses:advanced": "node scripts/clean-courses-advanced.js",
    
    // Docker Management
    "docker:up": "docker-compose up -d",           // Start Docker services
    "docker:down": "docker-compose down",          // Stop Docker services
    "docker:logs": "docker-compose logs -f",       // View Docker logs
    "docker:reset": "docker-compose down -v && docker-compose up -d"  // Reset Docker
  }
}
```

### **Development Utility Scripts**
```bash
# Database Management Scripts
scripts/
├── add-teachers.js                    # Add initial admin/teacher users
├── add-single-student.js              # Add one test student
├── add-bulk-students.js               # Add multiple test students
├── create-complete-student.js         # Create student with all fields
├── check-database.js                  # Verify database connectivity
├── review-database.js                 # Analyze database contents
├── truncate-students.js               # Delete all students (immediate)
├── truncate-students-safe.js          # Delete all students (with confirmation)
├── setup-attendance-test-data.js      # Setup attendance test data
├── add-semesters.js                   # Add semester data
├── add-grades-simple.js               # Add sample grades
├── add-grades-existing-data.js        # Add grades for existing students
├── add-sample-grades.js               # Add comprehensive grade samples

# Security & Testing Scripts
├── test-attendance-api.js             # Test attendance API endpoints
├── test-auto-logout.js                # Test auto-logout functionality
├── test-grade-configs.js              # Test grade configuration
├── api-security-demo.js               # Demonstrate API security
├── explain-auth-security.js           # Explain authentication security
├── explain-api-security.js            # Explain API security measures
├── explain-cookies.js                 # Explain cookie implementation
├── security-diagram.js                # Generate security diagrams

# Development & Maintenance
├── check-env.js                       # Check environment variables
├── check-student-count.js             # Check student data counts
├── attendance-db-status.js            # Check attendance database status
├── attendance-module-review.js        # Review attendance module
├── update-class-format.js             # Update class format in database
├── update-attendance-semesterId.js    # Update attendance semester IDs
├── verify-attendance-db-connection.js # Verify attendance DB connection
├── verify-truncation.js               # Verify data truncation
├── generate-secret.js                 # Generate secure secrets
├── setup-pgadmin.js                   # Setup pgAdmin configuration

# Documentation & Explanation
├── README.md                          # Scripts documentation
├── README-GRADE-SCRIPTS.md            # Grade scripts documentation
├── cookie-flow-diagram.js             # Generate cookie flow diagrams
├── explain-nextauth.js                # Explain NextAuth implementation
├── explain-nextauth-usage.js          # Explain NextAuth usage
├── nextauth-implementation-example.js # NextAuth implementation example
```

## 🔧 **Development Workflow**

### **Project Setup**
```bash
# 1. Clone Repository
git clone <repository-url>
cd Friendship_School-project

# 2. Install Dependencies
npm install

# 3. Environment Setup
cp .env.example .env
# Edit .env with your database credentials

# 4. Database Setup
npm run docker:up                    # Start PostgreSQL with Docker
npx prisma generate                  # Generate Prisma client
npx prisma migrate dev               # Run database migrations
npm run db:seed                      # Seed initial data

# 5. Development Server
npm run dev                          # Start development server
```

### **Development Commands**
```bash
# Development
npm run dev                          # Start dev server (localhost:3000)
npm run build                        # Build for production
npm run start                        # Start production server
npm run lint                         # Run ESLint

# Database Management
npx prisma studio                    # Open database management UI
npx prisma migrate dev               # Create and apply migrations
npx prisma migrate reset             # Reset database (development)
npx prisma generate                  # Generate Prisma client

# Docker Services
npm run docker:up                    # Start PostgreSQL + pgAdmin
npm run docker:down                  # Stop Docker services
npm run docker:logs                  # View service logs
npm run docker:reset                 # Reset and restart services

# Data Management
node scripts/add-teachers.js         # Add initial users
node scripts/add-bulk-students.js    # Add test students
node scripts/check-database.js       # Verify database
node scripts/truncate-students-safe.js # Clear test data
```

### **Code Quality Workflow**
```bash
# Linting & Formatting
npm run lint                         # Check code quality
npx eslint . --fix                  # Fix auto-fixable issues
npx prettier --write .              # Format all files

# Type Checking
npx tsc --noEmit                    # Type check without emitting
npx tsc --watch                     # Watch mode type checking

# Build Verification
npm run build                       # Verify production build
npm run start                       # Test production server
```

## 🧪 **Testing & Quality Assurance**

### **Testing Strategy**
```typescript
// Testing Framework Setup (Future Enhancement)
const testingSetup = {
  unit: {
    framework: "Jest + React Testing Library",
    coverage: "80%+ code coverage",
    files: ["**/*.test.ts", "**/*.test.tsx"]
  },
  
  integration: {
    framework: "Playwright",
    coverage: "Critical user flows",
    files: ["e2e/**/*.spec.ts"]
  },
  
  api: {
    framework: "Supertest + Jest",
    coverage: "All API endpoints",
    files: ["api/**/*.test.ts"]
  }
};
```

### **Code Quality Tools**
```typescript
// ESLint Configuration
const eslintConfig = {
  extends: [
    "next/core-web-vitals",
    "next/typescript"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
};

// TypeScript Strict Configuration
const typescriptConfig = {
  strict: true,
  noImplicitAny: true,
  strictNullChecks: true,
  strictFunctionTypes: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true
};
```

## 📊 **Performance Monitoring**

### **Build Performance**
```bash
# Build Analysis
npm run build -- --analyze          # Analyze bundle size
npx next-bundle-analyzer            # Visual bundle analysis

# Performance Monitoring
npm run build -- --profile          # Profile build performance
npm run build -- --debug            # Debug build issues
```

### **Development Performance**
```typescript
// Performance Monitoring Tools
const performanceTools = {
  bundle: {
    analyzer: "webpack-bundle-analyzer",
    monitoring: "next-bundle-analyzer"
  },
  
  runtime: {
    monitoring: "next/analytics",
    profiling: "React DevTools Profiler"
  },
  
  database: {
    query: "Prisma query logging",
    performance: "Database query analysis"
  }
};
```

## 🔍 **Debugging & Development Tools**

### **Development Tools**
```typescript
// Debugging Configuration
const debuggingTools = {
  browser: {
    devtools: "Chrome DevTools",
    react: "React Developer Tools",
    redux: "Redux DevTools Extension"
  },
  
  vscode: {
    extensions: [
      "ES7+ React/Redux/React-Native snippets",
      "Tailwind CSS IntelliSense",
      "Prisma",
      "TypeScript Importer",
      "Auto Rename Tag",
      "Bracket Pair Colorizer"
    ]
  },
  
  database: {
    management: "Prisma Studio",
    queries: "pgAdmin 4",
    monitoring: "Database query logs"
  }
};
```

### **Error Handling & Logging**
```typescript
// Error Handling Setup
const errorHandling = {
  client: {
    logging: "Console.error with context",
    reporting: "Error boundaries",
    monitoring: "Client-side error tracking"
  },
  
  server: {
    logging: "Structured logging",
    monitoring: "Server error tracking",
    debugging: "Stack trace analysis"
  },
  
  database: {
    logging: "Prisma query logs",
    monitoring: "Database connection monitoring",
    errors: "Database error handling"
  }
};
```

## 🚀 **Deployment & CI/CD**

### **Deployment Configuration**
```typescript
// Deployment Setup
const deploymentConfig = {
  production: {
    platform: "Vercel / Docker",
    database: "PostgreSQL (managed)",
    monitoring: "Application monitoring",
    backups: "Automated database backups"
  },
  
  staging: {
    platform: "Vercel Preview",
    database: "PostgreSQL (staging)",
    testing: "Automated testing pipeline"
  },
  
  development: {
    platform: "Local development",
    database: "Docker PostgreSQL",
    tools: "Hot reload, debugging"
  }
};
```

### **Environment Management**
```bash
# Environment Variables
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development|production"

# Docker Environment
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password123"
POSTGRES_DB="postgres"
PGADMIN_DEFAULT_EMAIL="admin@admin.com"
PGADMIN_DEFAULT_PASSWORD="admin123"
```

## 📚 **Documentation & Resources**

### **Project Documentation**
```
docs/
├── PROJECT_DOCUMENTATION.md          # Complete project overview
├── FRONTEND_ARCHITECTURE.md          # Frontend architecture details
├── BACKEND_ARCHITECTURE.md           # Backend architecture details
├── DATABASE_ARCHITECTURE.md          # Database architecture details
├── DEVELOPMENT_TOOLS.md              # Development tools guide (this file)
├── grade-calculation-system.md       # Grade calculation system
├── LEGACY_REMOVAL_SUMMARY.md         # Legacy code removal summary
└── REORGANIZATION_SUMMARY.md         # Project reorganization summary
```

### **Development Resources**
```typescript
// Learning Resources
const developmentResources = {
  nextjs: "https://nextjs.org/docs",
  prisma: "https://www.prisma.io/docs",
  tailwind: "https://tailwindcss.com/docs",
  typescript: "https://www.typescriptlang.org/docs",
  
  tutorials: [
    "Next.js App Router Guide",
    "Prisma Database Toolkit",
    "Tailwind CSS Components",
    "TypeScript Best Practices"
  ],
  
  tools: [
    "VSCode Extensions",
    "Chrome DevTools",
    "Prisma Studio",
    "pgAdmin 4"
  ]
};
```

## 🔧 **Troubleshooting & Maintenance**

### **Common Issues & Solutions**
```typescript
// Troubleshooting Guide
const troubleshooting = {
  build: {
    "TypeScript errors": "Check tsconfig.json and fix type issues",
    "ESLint errors": "Run npm run lint and fix issues",
    "Prisma errors": "Run npx prisma generate"
  },
  
  database: {
    "Connection issues": "Check DATABASE_URL and Docker services",
    "Migration errors": "Run npx prisma migrate reset",
    "Schema issues": "Update schema.prisma and migrate"
  },
  
  development: {
    "Hot reload issues": "Restart development server",
    "Port conflicts": "Change port in next.config.mjs",
    "Docker issues": "Run npm run docker:reset"
  }
};
```

### **Maintenance Tasks**
```bash
# Regular Maintenance
npm update                          # Update dependencies
npm audit                          # Security audit
npm run lint                       # Code quality check
npx prisma migrate dev             # Database updates

# Performance Maintenance
npm run build                      # Verify build performance
npm run docker:reset              # Reset development environment
node scripts/check-database.js    # Verify database health
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Node.js**: 18+  
**Package Manager**: npm  
**Status**: Production Ready ✅
