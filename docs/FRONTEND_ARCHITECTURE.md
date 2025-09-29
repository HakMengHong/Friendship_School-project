# 🎨 Frontend Architecture & Technology Stack

## 📋 **Overview**

The Friendship School Management System frontend is built with modern React technologies, focusing on performance, accessibility, and user experience. The architecture follows Next.js App Router patterns with a component-based design system.

## 🏗️ **Core Technology Stack**

### **Framework & Runtime**
- **Next.js 15.5.2** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript 5** - Type-safe development
- **Node.js 18+** - Runtime environment

### **Styling & UI**
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/ui** - Pre-built component library
- **Lucide React** - Modern icon library
- **Next-themes** - Dark/light mode support

### **Forms & Validation**
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### **Data Visualization**
- **Chart.js 4.4.2** - Chart library
- **React Chart.js 2** - React wrapper for Chart.js
- **Recharts 2.12.2** - Composable charting library

### **Date & Time**
- **React Day Picker** - Calendar component
- **Date-fns** - Date utility library

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TSX** - TypeScript execution

## 🎯 **Architecture Patterns**

### **1. App Router Architecture**
```
app/
├── (auth)/              # Route groups
│   ├── login/
│   └── unauthorized/
├── dashboard/           # Admin routes
├── attendance/          # Feature routes
├── grade/              # Feature routes
├── student-info/       # Feature routes
├── layout.tsx          # Root layout
├── page.tsx            # Home page
└── globals.css         # Global styles
```

### **2. Component Architecture**
```
components/
├── ui/                 # Base UI components (Shadcn/ui)
├── layout/             # Layout components
├── navigation/         # Navigation components
├── calendar/           # Calendar components
├── student-info/       # Feature-specific components
└── [feature]/          # Other feature components
```

### **3. Custom Hooks Pattern**
```
hooks/
├── use-toast.ts        # Toast notifications
├── use-mobile.tsx      # Mobile detection
├── useStudentInfo.ts   # Student data management
└── use-client-time.ts  # Client-side time
```

## 🎨 **Design System**

### **Color Palette**
```css
/* Primary Colors */
--primary: 217 91% 60%        /* Modern Blue */
--secondary: 262 83% 58%      /* Complementary Purple */
--accent: 188 94% 67%         /* Vibrant Cyan */

/* Status Colors */
--success: 142 76% 36%        /* Green */
--warning: 38 92% 50%         /* Orange */
--destructive: 0 84% 60%      /* Red */
--info: 199 89% 48%           /* Blue */

/* Neutral Colors */
--background: 0 0% 100%       /* White */
--foreground: 222 47% 11%     /* Dark Gray */
--muted: 210 40% 98%          /* Light Gray */
--border: 214 32% 91%         /* Border Gray */
```

### **Typography**
- **Primary Font**: Inter (Google Fonts) - Modern, clean
- **Khmer Font**: Khmer Busra - Traditional Khmer support
- **Font Weights**: 300, 400, 500, 600, 700

### **Spacing System**
- **Base Unit**: 4px (0.25rem)
- **Scale**: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### **Border Radius**
- **Small**: 4px (rounded-sm)
- **Medium**: 8px (rounded-md)
- **Large**: 12px (rounded-lg)
- **Extra Large**: 16px (rounded-xl)

## 🧩 **Component Library**

### **Base UI Components (Shadcn/ui)**
The system uses 55+ pre-built components from Shadcn/ui:

#### **Layout Components**
- `Card` - Container with header, content, footer
- `Separator` - Visual divider
- `AspectRatio` - Maintain aspect ratios
- `Resizable` - Resizable panels

#### **Form Components**
- `Button` - Various button variants and sizes
- `Input` - Text input with validation
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Checkbox` - Boolean input
- `RadioGroup` - Single selection
- `Switch` - Toggle input
- `Slider` - Range input
- `InputOTP` - One-time password input

#### **Navigation Components**
- `DropdownMenu` - Context menus
- `NavigationMenu` - Main navigation
- `Menubar` - Menu bar
- `Breadcrumb` - Navigation breadcrumbs
- `Pagination` - Page navigation
- `Tabs` - Tabbed interface

#### **Feedback Components**
- `Alert` - Status messages
- `AlertDialog` - Modal dialogs
- `Dialog` - Modal dialogs
- `Sheet` - Side panels
- `Drawer` - Mobile drawer
- `Toast` - Notifications
- `Progress` - Loading indicators
- `Skeleton` - Loading placeholders

#### **Data Display**
- `Table` - Data tables
- `Avatar` - User avatars
- `Badge` - Status badges
- `Calendar` - Date picker
- `Chart` - Data visualization
- `Carousel` - Image/content carousel

#### **Overlay Components**
- `Popover` - Floating content
- `HoverCard` - Hover information
- `Tooltip` - Contextual help
- `Command` - Command palette
- `ContextMenu` - Right-click menus

### **Custom Components**

#### **Layout Components**
```typescript
// MainLayout - Root application layout
interface MainLayoutProps {
  children: React.ReactNode
}

// Features:
- Responsive sidebar navigation
- Top bar with user controls
- Auto-logout timer integration
- Gradient background
- Scroll management
```

#### **Navigation Components**
```typescript
// SidebarMenu - Main navigation
interface SidebarMenuProps {
  className?: string
}

// Features:
- Role-based menu items
- Collapsible sidebar
- Active state management
- Responsive design
- Nested menu support

// TopBar - Header navigation
interface TopBarProps {
  className?: string
  user?: UserType | null
}

// Features:
- User profile dropdown
- Theme toggle
- Search functionality
- Settings management
- Real-time notifications
```

#### **Calendar Components**
```typescript
// CustomDatePicker - Custom date selection
interface CustomDatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

// Features:
- Khmer localization
- Portal rendering
- Keyboard navigation
- Month/year navigation
- Custom styling

// KhmerCalendar - Khmer calendar display
interface KhmerCalendarProps {
  compact?: boolean
}

// Features:
- Khmer date formatting
- Real-time clock
- Date selection
- Month navigation
- Responsive design
```

#### **Student Management Components**
```typescript
// StudentTable - Student data display
interface StudentTableProps {
  students: Student[]
  loading?: boolean
  onEdit?: (student: Student) => void
  onDelete?: (studentId: number) => void
}

// Features:
- Sortable columns
- Filtering capabilities
- Pagination
- Bulk actions
- Export functionality
```

## 🎣 **Custom Hooks**

### **Data Management Hooks**

#### **useStudentInfo**
```typescript
interface UseStudentInfoReturn {
  students: Student[]
  filteredStudents: Student[]
  schoolYears: SchoolYear[]
  classes: string[]
  loading: boolean
  error: string | null
  // Filter states
  selectedSchoolYear: string
  setSelectedSchoolYear: (value: string) => void
  selectedClass: string
  setSelectedClass: (value: string) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedStatus: string
  setSelectedStatus: (value: string) => void
  // Actions
  clearFilters: () => void
  refetch: () => Promise<void>
}
```

**Features:**
- Student data fetching and management
- Multi-criteria filtering
- Real-time search
- School year and class filtering
- Error handling and loading states

#### **useClientTime**
```typescript
interface UseClientTimeReturn {
  time: string
  isClient: boolean
}
```

**Features:**
- Real-time Khmer time display
- Client-side rendering detection
- Automatic time updates
- Khmer number conversion

#### **useIsMobile**
```typescript
function useIsMobile(): boolean
```

**Features:**
- Responsive design detection
- Breakpoint management (768px)
- Window resize handling
- SSR compatibility

#### **useToast**
```typescript
interface UseToastReturn {
  toast: (props: ToastProps) => ToastReturn
  dismiss: (toastId?: string) => void
  toasts: Toast[]
}
```

**Features:**
- Toast notification system
- Multiple toast types
- Auto-dismiss functionality
- Position management
- Action support

## 🔐 **Security Components**

### **RoleGuard**
```typescript
interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ('admin' | 'teacher')[]
  fallback?: React.ReactNode
}
```

**Features:**
- Role-based access control
- Client-side protection
- Fallback UI support
- Role validation

### **RoleBasedContent**
```typescript
interface RoleBasedContentProps {
  adminContent?: React.ReactNode
  teacherContent?: React.ReactNode
  fallback?: React.ReactNode
}
```

**Features:**
- Conditional content rendering
- Role-specific UI
- Fallback handling

## 🎨 **Theme System**

### **Theme Provider**
```typescript
// Next-themes integration
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### **Theme Toggle**
```typescript
// ThemeToggle component
interface ThemeToggleProps {
  className?: string
}

// Features:
- Light/dark mode switching
- System theme detection
- Hydration safety
- Smooth transitions
```

### **CSS Variables**
```css
/* Light Theme */
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 217 91% 60%;
  --secondary: 262 83% 58%;
  /* ... */
}

/* Dark Theme */
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --secondary: 262 83% 58%;
  /* ... */
}
```

## 📱 **Responsive Design**

### **Breakpoints**
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### **Mobile-First Approach**
- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized navigation for mobile

### **Responsive Components**
- Collapsible sidebar on mobile
- Responsive tables with horizontal scroll
- Mobile-optimized forms
- Adaptive card layouts

## ⚡ **Performance Optimizations**

### **Code Splitting**
- Dynamic imports for route-based splitting
- Component-level lazy loading
- Bundle optimization

### **Image Optimization**
- Next.js Image component
- Lazy loading
- Responsive images
- WebP format support

### **Caching Strategies**
- Static generation where possible
- Client-side caching for API data
- Browser caching for static assets

### **Bundle Optimization**
- Tree shaking for unused code
- Minimal bundle size
- Efficient imports

## 🌐 **Internationalization**

### **Khmer Language Support**
- Khmer font integration (Khmer Busra)
- Khmer date formatting
- Khmer number conversion
- RTL support considerations

### **Date Localization**
```typescript
// Khmer month names
const monthNames = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 
  'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 
  'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
]

// Khmer day names
const dayNames = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'ស', 'ស']
```

## 🔧 **Development Workflow**

### **Component Development**
1. **Design System First** - Use Shadcn/ui components as base
2. **TypeScript** - Full type safety
3. **Props Interface** - Clear component contracts
4. **Accessibility** - ARIA labels and keyboard navigation
5. **Responsive** - Mobile-first design

### **State Management**
- React hooks for local state
- Context API for global state
- Custom hooks for complex logic
- Server state with SWR/React Query patterns

### **Styling Guidelines**
- Tailwind CSS utility classes
- CSS variables for theming
- Component-scoped styles
- Consistent spacing and typography

## 📊 **Data Flow Architecture**

### **Component Communication**
```
Parent Component
    ↓ (props)
Child Component
    ↓ (callbacks)
Parent Component

Global State (Context)
    ↓ (hooks)
Components
```

### **API Integration**
```
Component
    ↓ (fetch/useEffect)
API Route
    ↓ (Prisma)
Database
    ↓ (response)
Component State
```

## 🧪 **Testing Strategy**

### **Component Testing**
- Unit tests for individual components
- Integration tests for component interactions
- Accessibility testing
- Visual regression testing

### **E2E Testing**
- User workflow testing
- Cross-browser testing
- Mobile device testing
- Performance testing

## 🚀 **Future Enhancements**

### **Planned Features**
- **PWA Support** - Progressive Web App capabilities
- **Offline Support** - Service worker integration
- **Advanced Charts** - More visualization options
- **Real-time Updates** - WebSocket integration
- **Advanced Animations** - Framer Motion integration

### **Performance Improvements**
- **Virtual Scrolling** - For large data sets
- **Image Optimization** - Advanced image handling
- **Bundle Splitting** - More granular code splitting
- **Caching Layer** - Redis integration

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Framework**: Next.js 15.5.2  
**UI Library**: Shadcn/ui + Radix UI  
**Styling**: Tailwind CSS 3.4.17  
**Status**: Production Ready ✅
