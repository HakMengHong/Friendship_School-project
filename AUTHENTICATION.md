# Authentication System

## Overview

The login system has been updated to connect to the real PostgreSQL database instead of using mock data from `auth.ts`. The new system provides secure authentication with password hashing and proper user management.

## Architecture

### Database Connection
- **Database**: PostgreSQL via Prisma ORM
- **Password Security**: bcryptjs for password hashing
- **User Storage**: Real database with proper user management

### API Routes
- `/api/auth/login` - Handle user authentication
- `/api/auth/users` - Fetch all active users for dropdown

### Client-Side
- Updated login page to use API routes
- Real-time user dropdown from database
- Proper error handling and user feedback

## How It Works

### 1. Login Process
1. User enters username and password
2. Frontend sends credentials to `/api/auth/login`
3. Server validates credentials against database
4. Password is verified using bcrypt
5. User data is returned (without password)
6. User is redirected to appropriate dashboard

### 2. User Dropdown
1. On page load, frontend fetches users from `/api/auth/users`
2. Only active users (admin/teacher) are displayed
3. Users are sorted by role and name
4. Real-time filtering as user types

### 3. Security Features
- **Password Hashing**: All passwords are hashed with bcrypt
- **Input Validation**: Server-side validation of credentials
- **Status Checking**: Only active users can log in
- **Error Handling**: Proper error messages for failed attempts

## Database Schema

### User Model
```prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  password     String   // Hashed with bcrypt
  lastname     String
  firstname    String
  phonenumber1 String?
  phonenumber2 String?
  role         String   @default("teacher") // "teacher" or "admin"
  avatar       String?
  photo        String?
  position     String?
  status       String   @default("active")
  lastLogin    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  assignedClasses Class[] @relation("ClassTeacher")
}
```

## Current Users

The database contains 7 users:

### Admin
- **ស្រួយ ស៊ីណាត** (ស្រួយស៊ីណាត) - admin

### Teachers
- **ហាក់ ម៉េងហុង** (ហាក់ម៉េងហុង) - teacher
- **ហេង សុនី** (ហេងសុនី) - teacher
- **វ៉ាន់ សុផល** (វ៉ាន់សុផល) - teacher
- **គឹម សុខា** (គឹមសុខា) - teacher
- **ម៉ៅ សុធារី** (ម៉ៅសុធារី) - teacher
- **ស្រួយ ចាន់នាត** (ស្រួយចាន់នាត) - teacher

## Testing

### Default Password
All users have the default password: `password`

### Test Script
Run `node scripts/test-db.js` to test database connection and view users.

## Files Modified

### New Files
- `lib/auth-service.ts` - Database-connected authentication service
- `app/api/auth/login/route.ts` - Login API endpoint
- `app/api/auth/users/route.ts` - Users API endpoint
- `scripts/test-db.js` - Database testing script

### Modified Files
- `app/login/page.tsx` - Updated to use API routes instead of mock data

## Future Improvements

1. **Session Management**: Implement proper JWT or session-based authentication
2. **Password Reset**: Add password reset functionality
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Audit Logging**: Log all login attempts and user actions
5. **Multi-factor Authentication**: Add 2FA for enhanced security
6. **Password Policy**: Enforce strong password requirements
7. **Account Lockout**: Implement account lockout after failed attempts

## Usage

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Select a user from the dropdown or type username
4. Enter password: `password`
5. Click login to access the appropriate dashboard

The system now provides a secure, database-connected authentication experience with proper user management and security features. 