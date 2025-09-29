# 👥 User Workflows Architecture & Technology Stack

## 🎯 **Overview**

The Friendship School Management System implements sophisticated user workflow patterns designed to provide intuitive, role-based experiences for administrators and teachers. The system features comprehensive user journey mapping, intelligent navigation flows, and context-aware interfaces that adapt to user roles and permissions.

## 🏗️ **User Workflow Architecture Overview**

### **1. User Journey Framework**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTRY LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • Splash Screen & Welcome Experience                      │
│  • Authentication & Login Flow                            │
│  • Role Detection & Initial Routing                       │
│  • Session Management & Security                          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   ROLE-BASED LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • Admin Workflows & Dashboard                            │
│  • Teacher Workflows & Task Management                    │
│  • Permission-Based Feature Access                        │
│  • Context-Aware Navigation                               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  TASK EXECUTION LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  • Student Management Workflows                           │
│  • Academic Administration Tasks                          │
│  • Reporting & Document Generation                        │
│  • Data Entry & Management Operations                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   SESSION MANAGEMENT                      │
├─────────────────────────────────────────────────────────────┤
│  • Auto-logout & Session Extension                        │
│  • Activity Tracking & Monitoring                         │
│  • Security & Access Control                              │
│  • User State Persistence                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Primary User Workflows**

### **1. System Entry & Authentication Workflow**

#### **A. Initial Access Flow**
```typescript
// Entry Point Logic
export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check splash screen preferences
    if (shouldShowSplash()) {
      router.push("/splash")
    } else {
      router.push("/login")
    }
  }, [router])
}

// Splash Screen Workflow
const SplashWorkflow = {
  duration: 800, // milliseconds
  progressAnimation: true,
  autoRedirect: true,
  skipOption: true,
  userPreferences: {
    hasSeenSplash: boolean,
    skipSplash: boolean
  }
}
```

#### **B. Authentication Workflow**
```typescript
// Login Process Flow
const LoginWorkflow = {
  steps: [
    {
      step: 1,
      name: "User Selection",
      description: "Choose from available users or manual entry",
      ui: "Dropdown with user avatars and roles",
      validation: "Username format validation"
    },
    {
      step: 2,
      name: "Credential Entry",
      description: "Enter password with security features",
      ui: "Password input with show/hide toggle",
      validation: "Password strength and format"
    },
    {
      step: 3,
      name: "Authentication",
      description: "Server-side authentication with security checks",
      api: "POST /api/auth/login",
      security: [
        "Account lockout protection",
        "Failed attempt tracking",
        "Session timeout management"
      ]
    },
    {
      step: 4,
      name: "Role-Based Routing",
      description: "Redirect based on user role",
      logic: {
        admin: "/dashboard",
        teacher: "/attendance/daily"
      }
    }
  ]
}
```

### **2. Admin User Workflows**

#### **A. Admin Dashboard Workflow**
```typescript
// Admin Dashboard Access Pattern
const AdminDashboardWorkflow = {
  entry: {
    route: "/dashboard",
    protection: "RoleGuard allowedRoles={['admin']}",
    redirect: "/unauthorized" // if unauthorized
  },
  
  features: {
    overview: {
      description: "System statistics and metrics",
      components: [
        "Student enrollment charts",
        "User activity metrics",
        "System health indicators",
        "Recent activity feed"
      ]
    },
    
    navigation: {
      primary: [
        "ផ្ទាំងគ្រប់គ្រង (Dashboard)",
        "គ្រប់គ្រងអ្នកប្រើប្រាស់ (User Management)",
        "ការគ្រប់គ្រងថ្នាក់ (Academic Management)",
        "របាយការណ៍ (Reports)"
      ],
      
      secondary: [
        "បន្ថែមសិស្សក្នុងថ្នាក់ (Add Students to Class)",
        "មើលថ្នាក់រៀន (View Classes)",
        "ប័ណ្ណសម្គាល់ (ID Cards)",
        "ការគ្រប់គ្រងពិន្ទុ (Grade Management)"
      ]
    }
  }
}
```

#### **B. User Management Workflow**
```typescript
// Admin User Management Process
const UserManagementWorkflow = {
  access: {
    route: "/dashboard/users",
    permission: "admin-only",
    features: ["CRUD operations", "Role management", "Account security"]
  },
  
  tasks: [
    {
      name: "Create New User",
      steps: [
        "Navigate to User Management",
        "Click 'Add New User' button",
        "Fill user information form",
        "Select role (Admin/Teacher)",
        "Set position and contact info",
        "Generate secure password",
        "Save and confirm creation"
      ],
      validation: [
        "Username uniqueness",
        "Email format validation",
        "Password strength requirements",
        "Role assignment verification"
      ]
    },
    
    {
      name: "Manage User Accounts",
      steps: [
        "View user list with search/filter",
        "Select user for editing",
        "Update user information",
        "Modify role or permissions",
        "Reset password if needed",
        "Activate/deactivate account",
        "Save changes"
      ],
      security: [
        "Account lockout management",
        "Failed login reset",
        "Session monitoring"
      ]
    }
  ]
}
```

#### **C. Academic Management Workflow**
```typescript
// Academic Administration Process
const AcademicManagementWorkflow = {
  access: {
    route: "/dashboard/academic-management",
    permission: "admin-only",
    scope: "Complete academic system management"
  },
  
  management: {
    courses: {
      workflow: [
        "Create new courses",
        "Assign teachers to courses",
        "Set grade levels and sections",
        "Manage course schedules",
        "Track enrollment capacity"
      ]
    },
    
    subjects: {
      workflow: [
        "Add new subjects",
        "Define subject categories",
        "Set credit hours",
        "Assign to courses"
      ]
    },
    
    schoolYears: {
      workflow: [
        "Create academic years",
        "Set start/end dates",
        "Configure semesters",
        "Activate current year"
      ]
    }
  }
}
```

### **3. Teacher User Workflows**

#### **A. Teacher Dashboard Workflow**
```typescript
// Teacher Entry and Navigation
const TeacherWorkflow = {
  entry: {
    defaultRoute: "/attendance/daily",
    navigation: [
      "អវត្តមានប្រចាំថ្ងៃ (Daily Attendance)",
      "ពិន្ទុសិស្ស (Student Grades)",
      "ព័ត៌មានសិស្ស (Student Information)",
      "ចុះឈ្មោះសិស្ស (Student Registration)"
    ]
  },
  
  dailyTasks: [
    {
      name: "Attendance Management",
      route: "/attendance/daily",
      frequency: "Daily",
      steps: [
        "Select school year and course",
        "Choose attendance date",
        "View enrolled students list",
        "Mark attendance (Present/Absent/Late/Excused)",
        "Add absence reasons if needed",
        "Save attendance records"
      ]
    },
    
    {
      name: "Grade Entry",
      route: "/grade/addgrade",
      frequency: "Weekly/Monthly",
      steps: [
        "Select student and subject",
        "Choose grade type (Assignment/Quiz/Exam)",
        "Enter score and max score",
        "Add comments if needed",
        "Save grade record",
        "View grade history"
      ]
    }
  ]
}
```

#### **B. Student Registration Workflow**
```typescript
// Teacher Student Registration Process
const StudentRegistrationWorkflow = {
  access: {
    route: "/register-student",
    permission: "admin, teacher",
    features: ["Complete student onboarding", "PDF generation", "Family information"]
  },
  
  registrationSteps: [
    {
      step: 1,
      name: "Student Information",
      fields: [
        "Personal details (name, DOB, gender)",
        "Contact information",
        "Address and location",
        "Medical information",
        "Emergency contacts"
      ],
      validation: "Required field validation"
    },
    
    {
      step: 2,
      name: "Guardian Information",
      fields: [
        "Primary guardian details",
        "Secondary guardian (optional)",
        "Relationship to student",
        "Contact information",
        "Emergency contact designation"
      ]
    },
    
    {
      step: 3,
      name: "Family Information",
      fields: [
        "Family composition",
        "Family size and income",
        "Poverty card status",
        "Special circumstances"
      ]
    },
    
    {
      step: 4,
      name: "Course Enrollment",
      fields: [
        "Academic year selection",
        "Course and section assignment",
        "Enrollment date",
        "Status confirmation"
      ]
    },
    
    {
      step: 5,
      name: "Document Generation",
      actions: [
        "Generate registration PDF",
        "Create student ID card",
        "Print enrollment confirmation"
      ]
    }
  ]
}
```

## 🎨 **User Interface & Navigation Architecture**

### **1. Layout System**

#### **A. Main Layout Structure**
```typescript
// Main Layout Components
const MainLayout = {
  structure: {
    sidebar: {
      component: "SidebarMenu",
      features: [
        "Role-based menu filtering",
        "Collapsible navigation",
        "Active state highlighting",
        "Keyboard navigation support"
      ]
    },
    
    topbar: {
      component: "TopBar",
      features: [
        "User profile display",
        "Theme toggle",
        "Logout functionality",
        "Session timer",
        "Search functionality"
      ]
    },
    
    content: {
      component: "Main Content Area",
      features: [
        "Responsive design",
        "Scroll management",
        "Loading states",
        "Error boundaries"
      ]
    }
  }
}
```

#### **B. Navigation Patterns**
```typescript
// Navigation Architecture
const NavigationPatterns = {
  sidebar: {
    roleBased: {
      admin: [
        "ផ្ទាំងគ្រប់គ្រង (Dashboard)",
        "គ្រប់គ្រងអ្នកប្រើប្រាស់ (User Management)",
        "ការគ្រប់គ្រងថ្នាក់ (Academic Management)",
        "របាយការណ៍ (Reports)",
        "ប័ណ្ណសម្គាល់ (ID Cards)"
      ],
      
      teacher: [
        "អវត្តមានប្រចាំថ្ងៃ (Daily Attendance)",
        "ពិន្ទុសិស្ស (Student Grades)",
        "ព័ត៌មានសិស្ស (Student Information)",
        "ចុះឈ្មោះសិស្ស (Student Registration)"
      ]
    },
    
    features: {
      badges: ["New", "Live", "Analytics", "Data", "Admin"],
      icons: "Lucide React icons",
      keyboardSupport: true,
      accessibility: "ARIA compliant"
    }
  }
}
```

### **2. Role-Based Access Control**

#### **A. Role Guard Implementation**
```typescript
// Role Guard Component
interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ('admin' | 'teacher' | 'both')[]
  fallback?: React.ReactNode
}

const RoleGuardWorkflow = {
  authentication: {
    check: "Verify user authentication status",
    redirect: "/login if not authenticated"
  },
  
  authorization: {
    check: "Verify user role against allowed roles",
    redirect: "/unauthorized if insufficient permissions"
  },
  
  loading: {
    state: "Show loading spinner during verification",
    timeout: "Handle timeout scenarios"
  }
}
```

#### **B. Permission Matrix**
```typescript
// User Permission Matrix
const PermissionMatrix = {
  admin: {
    dashboard: true,
    userManagement: true,
    academicManagement: true,
    studentRegistration: true,
    gradeManagement: true,
    attendanceManagement: true,
    reportGeneration: true,
    systemAdministration: true
  },
  
  teacher: {
    dashboard: false,
    userManagement: false,
    academicManagement: false,
    studentRegistration: true,
    gradeManagement: true,
    attendanceManagement: true,
    reportGeneration: false,
    systemAdministration: false
  }
}
```

## 🔄 **Session Management & Security Workflows**

### **1. Session Lifecycle**

#### **A. Session Management Flow**
```typescript
// Session Management Architecture
const SessionWorkflow = {
  creation: {
    trigger: "Successful login",
    duration: "30 minutes",
    extension: "Activity-based",
    storage: "HttpOnly cookie"
  },
  
  maintenance: {
    heartbeat: "POST /api/auth/heartbeat",
    interval: "5 minutes",
    autoExtension: true,
    activityTracking: true
  },
  
  termination: {
    automatic: "30-minute timeout",
    manual: "Logout button",
    security: "Account lockout",
    cleanup: "Clear user state"
  }
}
```

#### **B. Auto-Logout System**
```typescript
// Auto-Logout Implementation
const AutoLogoutWorkflow = {
  timer: {
    duration: "30 minutes",
    warning: "5 minutes before logout",
    warningMessage: "Session will expire in 5 minutes",
    extensionOption: true
  },
  
  behavior: {
    warningModal: "Show countdown timer",
    extensionButton: "Extend session",
    autoRedirect: "Redirect to login on timeout",
    messageDisplay: "Khmer language support"
  }
}
```

### **2. Security Workflows**

#### **A. Authentication Security**
```typescript
// Security Measures
const SecurityWorkflow = {
  login: {
    attempts: {
      maxFailed: 5,
      lockoutDuration: "10 minutes",
      tracking: "Per user account"
    },
    
    validation: {
      inputSanitization: true,
      passwordHashing: "bcryptjs",
      sessionSecurity: "HttpOnly cookies"
    }
  },
  
  access: {
    middleware: "Next.js middleware protection",
    roleBased: "Component-level guards",
    api: "Route-level authentication"
  }
}
```

## 📱 **Responsive Design & User Experience**

### **1. Device Adaptation**

#### **A. Responsive Workflows**
```typescript
// Responsive Design Patterns
const ResponsiveWorkflow = {
  mobile: {
    navigation: "Collapsible sidebar",
    forms: "Single column layout",
    tables: "Horizontal scroll",
    touch: "Touch-friendly interactions"
  },
  
  tablet: {
    navigation: "Expandable sidebar",
    forms: "Two-column layout",
    tables: "Optimized spacing",
    gestures: "Swipe navigation"
  },
  
  desktop: {
    navigation: "Full sidebar",
    forms: "Multi-column layout",
    tables: "Full data display",
    keyboard: "Full keyboard support"
  }
}
```

### **2. User Experience Enhancements**

#### **A. UX Features**
```typescript
// User Experience Features
const UXWorkflow = {
  loading: {
    states: "Skeleton loading",
    progress: "Progress indicators",
    feedback: "Loading messages"
  },
  
  feedback: {
    success: "Toast notifications",
    errors: "Error messages with actions",
    warnings: "Warning dialogs",
    confirmation: "Confirmation modals"
  },
  
  accessibility: {
    keyboard: "Full keyboard navigation",
    screenReader: "ARIA labels and descriptions",
    contrast: "High contrast mode",
    language: "Khmer language support"
  }
}
```

## 🔧 **Technology Stack for User Workflows**

### **1. Frontend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.0.0 | Component-based UI |
| **Next.js** | ^15.5.2 | App Router and routing |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^3.4.17 | Responsive styling |
| **Radix UI** | Latest | Accessible components |
| **Lucide React** | ^0.454.0 | Icon system |

### **2. State Management**

```typescript
// State Management Patterns
const StateManagement = {
  authentication: {
    storage: "Cookie-based sessions",
    state: "React useState hooks",
    persistence: "Automatic session restoration"
  },
  
  navigation: {
    routing: "Next.js App Router",
    state: "URL-based state",
    history: "Browser history API"
  },
  
  forms: {
    management: "React Hook Form",
    validation: "Zod schemas",
    persistence: "Local storage for drafts"
  }
}
```

### **3. User Interface Components**

```typescript
// UI Component Architecture
const UIComponents = {
  layout: [
    "MainLayout",
    "SidebarMenu", 
    "TopBar",
    "RoleGuard"
  ],
  
  forms: [
    "StudentRegistrationForm",
    "UserManagementForm",
    "GradeEntryForm",
    "AttendanceForm"
  ],
  
  navigation: [
    "BreadcrumbNavigation",
    "TabNavigation",
    "PaginationControls",
    "SearchFilters"
  ],
  
  feedback: [
    "ToastNotifications",
    "LoadingSpinners",
    "ErrorBoundaries",
    "ConfirmationModals"
  ]
}
```

## 📊 **User Workflow Analytics**

### **1. User Behavior Tracking**

```typescript
// Analytics Implementation
const UserAnalytics = {
  tracking: {
    pageViews: "Route-based tracking",
    userActions: "Button clicks and form submissions",
    sessionDuration: "Time spent in system",
    featureUsage: "Feature adoption metrics"
  },
  
  metrics: {
    loginSuccess: "Authentication success rate",
    taskCompletion: "Workflow completion rates",
    errorRates: "User error frequency",
    performance: "Page load times"
  }
}
```

### **2. Performance Metrics**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load Time** | < 2s | Time to first contentful paint |
| **Navigation Speed** | < 500ms | Route transition time |
| **Form Submission** | < 1s | API response time |
| **Authentication** | < 200ms | Login processing time |
| **PDF Generation** | < 3s | Document creation time |

## 🔮 **Future User Workflow Enhancements**

### **1. Planned Improvements**

- **Progressive Web App**: Offline capability and mobile app experience
- **Advanced Analytics**: User behavior insights and optimization
- **Personalization**: Customizable dashboards and preferences
- **Workflow Automation**: Automated task sequences and notifications
- **Multi-language Support**: Additional language options beyond Khmer

### **2. User Experience Evolution**

```typescript
// Future UX Enhancements
const FutureUX = {
  ai: {
    smartSuggestions: "AI-powered form completion",
    predictiveSearch: "Intelligent search results",
    automatedReports: "Smart report generation"
  },
  
  collaboration: {
    realTimeUpdates: "Live collaboration features",
    notifications: "Push notifications",
    messaging: "In-app communication"
  },
  
  accessibility: {
    voiceControl: "Voice navigation support",
    advancedScreenReader: "Enhanced accessibility",
    gestureControl: "Touch gesture navigation"
  }
}
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**User Roles**: Admin, Teacher  
**Workflow Categories**: Authentication, Management, Reporting, Security
