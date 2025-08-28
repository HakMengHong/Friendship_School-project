# Failed Login Attempt Tracking Feature

## 🎯 **Overview**

This feature automatically tracks failed login attempts and implements security measures to protect user accounts from brute force attacks.

## 🔒 **Security Features**

### **1. Failed Attempt Tracking**
- Tracks the number of failed login attempts per user
- Stores timestamp of last failed attempt
- Resets counter on successful login

### **2. Progressive Security Measures**

#### **Attempts 1-2: Warning**
- Shows remaining attempts count
- No lockout period

#### **Attempts 3-4: Temporary Lockout**
- 15-minute temporary lockout
- Shows lockout expiration time
- Prevents further login attempts during lockout

#### **Attempt 5: Account Deactivation**
- Account status changed to `inactive`
- Permanent deactivation until admin intervention
- Requires admin to reactivate account

## 📊 **Database Schema Changes**

### **New Fields Added to User Model**
```prisma
model User {
  // ... existing fields ...
  failedLoginAttempts Int    @default(0)    // Number of failed attempts
  lastFailedLogin      DateTime?           // Timestamp of last failed attempt
  accountLockedUntil   DateTime?           // Temporary lockout expiration
  // ... existing fields ...
}
```

## 🔧 **API Endpoints**

### **1. Login Endpoint** (`POST /api/auth/login`)
Enhanced with failed attempt tracking:

```typescript
// Response examples:

// Failed attempt 1-2
{
  "error": "ឈ្មោះឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ។ នៅសល់ 3 ដង។"
}

// Temporary lockout (attempts 3-4)
{
  "error": "គណនីត្រូវបានចាក់សោដោយសារព្យាយាមចូលខុសច្រើនដង។ សូមព្យាយាមម្តងទៀតនៅពេល: 27/8/2025, 4:30:15 PM"
}

// Account deactivated (attempt 5)
{
  "error": "គណនីត្រូវបានបិទដោយសារព្យាយាមចូលខុសច្រើនដង។ សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ។"
}
```

### **2. Reset Login Attempts** (`POST /api/users/[id]/reset-login-attempts`)
Admin endpoint to reset failed attempts and reactivate accounts:

```typescript
// Request
POST /api/users/1/reset-login-attempts

// Response
{
  "message": "បានកំណត់ឡើងវិញនូវការព្យាយាមចូលខុសរបស់អ្នកប្រើប្រាស់",
  "user": {
    "id": 1,
    "username": "teacher1",
    "firstname": "Teacher",
    "lastname": "One",
    "status": "active"
  }
}
```

## 🧪 **Testing**

### **1. Manual Testing**
1. Go to login page: `http://localhost:3000/login`
2. Use test credentials:
   - Username: `teacher1`
   - Password: `wrongpassword` (intentionally wrong)
3. Try logging in 5 times to see the progression

### **2. Automated Testing**
Run the test script:
```bash
node scripts/test-failed-login.js
```

### **3. Test Users**
```bash
# Add test users
node scripts/add-test-users.js

# Test credentials:
# Username: admin, Password: password123
# Username: teacher1, Password: password123
# Username: teacher2, Password: password123
```

## 📋 **User Experience Flow**

### **Attempt 1**
- User enters wrong password
- Error: "ឈ្មោះឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ។ នៅសល់ 4 ដង។"

### **Attempt 2**
- User enters wrong password again
- Error: "ឈ្មោះឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ។ នៅសល់ 3 ដង។"

### **Attempt 3**
- User enters wrong password
- Error: "គណនីត្រូវបានចាក់សោដោយសារព្យាយាមចូលខុសច្រើនដង។ សូមព្យាយាមម្តងទៀតនៅពេល: [timestamp]"
- Account locked for 15 minutes

### **Attempt 4**
- User tries during lockout period
- Same lockout message with expiration time

### **Attempt 5**
- After lockout expires, user enters wrong password
- Error: "គណនីត្រូវបានបិទដោយសារព្យាយាមចូលខុសច្រើនដង។ សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ។"
- Account permanently deactivated

## 🔧 **Admin Management**

### **Reactivating Deactivated Accounts**
1. Access admin dashboard
2. Go to user management
3. Find deactivated user
4. Use reset login attempts API
5. Account becomes active again

### **Monitoring Failed Attempts**
- Check `failedLoginAttempts` field in database
- Monitor `lastFailedLogin` timestamps
- Review `accountLockedUntil` for temporary lockouts

## 🛡️ **Security Benefits**

1. **Prevents Brute Force Attacks**: Limits attempts to 5 per account
2. **Progressive Response**: Escalating security measures
3. **Temporary Lockouts**: Prevents rapid-fire attempts
4. **Account Protection**: Permanent deactivation after threshold
5. **Admin Control**: Ability to reactivate accounts when needed

## 📝 **Configuration**

### **Current Settings**
- **Max Failed Attempts**: 5
- **Temporary Lockout Duration**: 15 minutes (after 3+ attempts)
- **Lockout Threshold**: 3 failed attempts

### **Customization**
To modify these settings, update the values in `app/api/auth/login/route.ts`:

```typescript
// Change these constants as needed
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_THRESHOLD = 3
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
```

## 🚀 **Deployment Notes**

1. **Database Migration**: Ensure the new schema is applied
2. **Prisma Client**: Regenerate after schema changes
3. **Testing**: Verify functionality in staging environment
4. **Monitoring**: Set up alerts for multiple account deactivations

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Prisma Client Errors**: Run `npx prisma generate`
2. **Database Connection**: Check DATABASE_URL in .env
3. **Migration Issues**: Run `npx prisma migrate reset --force`

### **Reset All Failed Attempts**
```sql
-- SQL command to reset all failed attempts
UPDATE "User" SET 
  "failedLoginAttempts" = 0,
  "lastFailedLogin" = NULL,
  "accountLockedUntil" = NULL,
  "status" = 'active'
WHERE "status" = 'inactive' AND "failedLoginAttempts" >= 5;
```

---

**Last Updated**: August 27, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
