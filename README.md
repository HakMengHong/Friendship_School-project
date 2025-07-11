# Friendship School Project

## Author

Created and maintained by **hakmenghong**

## Overview

Friendship School Project is a modern, responsive school management dashboard built with Next.js, React, and Tailwind CSS. It is designed for Cambodian schools and educators to manage student information, grades, attendance, and more, with a beautiful and accessible UI.

## Features

- ✨ **Comprehensive dark mode support** (all pages and components)
- 🎨 **Theme toggle button** (light/dark, top bar)
- 📋 **Student management**
  - Student info, registration, and profile
  - List, search, and filter students
- 📝 **Grades & Scores**
  - Add, view, and report student grades
  - Score input, gradebook, and analytics
- 📆 **Absence & Attendance**
  - Daily and report-based absence tracking
  - Attendance statistics and reporting
- 🗓️ **Schedule management**
- 📑 **Reports**
  - Student list, grades, scores, absence, and more
  - Export to PDF, Excel, CSV
- 🖥️ **Modern UI components**
  - Cards, tables, modals, forms, sidebar, top bar
- 📱 **Responsive design** (mobile, tablet, desktop)
- 🏷️ **No hardcoded colors**
  - All UI uses theme-aware Tailwind classes and CSS variables
- 🌏 **Khmer language support**
- 🔒 **Accessible, keyboard-friendly UI**

---

## Current State

- **All data is currently mock/hardcoded in the frontend.**
- **Authentication uses localStorage and is not secure.**
- **No real database or backend API is connected yet.**
- **UI and UX are production-ready and easy to extend.**

---

## Database Schema & Models (Latest)

- **Schema is now fully documented with comments for every model, enum, and important field.**
- **New models added:**
  - `Announcement` (school news/events)
  - `ActivityLog` (audit/history of user actions)
  - `File` (uploads, e.g., student photos, documents)
  - `Class` (school classes/groups)
  - `Scholarship`, `Guardian`, `FamilyInfo` (student support)
- **Enums for type safety:**
  - `GradeType` (exam, quiz, assignment, etc.)
  - `AttendanceSession` (AM, PM, FULL)
- **Existing models improved:**
  - All models now have clear field explanations and relations
  - `Grade` and `Attendance` use enums for type safety
- **Schema is ready for collaborative development and future migrations.**

---

## Roadmap: Next Steps

1. **Backend Integration**
   - Set up a database (PostgreSQL recommended)
   - Use Prisma ORM for schema and migrations
   - Create API routes in `/app/api/` for students, grades, attendance, and authentication

2. **Authentication**
   - Replace localStorage with JWT-based authentication
   - Add secure login/logout endpoints

3. **Data Fetching**
   - Replace all hardcoded/mock data with API calls
   - Use React hooks for data fetching and state management

4. **Validation & Error Handling**
   - Add Zod schemas for input validation
   - Improve error and loading state handling in the UI

5. **Testing**
   - Add unit and integration tests for critical components and API routes

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Usage Notes

- **Theme Toggle:**  
  Use the sun/moon button in the top bar to switch between light and dark mode instantly.
- **Modern Forms:**  
  All forms and modals are styled for both light and dark mode.
- **No hardcoded colors:**  
  All UI elements use theme-aware Tailwind classes and CSS variables.

---

## Contributing

- Please open issues or pull requests for bugs, improvements, or new features.
- When backend/API is added, see the `/prisma` and `/app/api/` folders for schema and endpoint documentation.

---

## License

MIT
