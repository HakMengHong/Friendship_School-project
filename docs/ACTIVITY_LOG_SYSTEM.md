# Activity Log System Documentation

## Overview
The Activity Log system tracks all important user actions in the Friendship School Management System, providing an audit trail and activity feed visible on the dashboard.

## Architecture

### Database Schema
```prisma
model ActivityLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  action    String
  details   String?
  timestamp DateTime @default(now())
  user      User     @relation("ActivityLogUser", fields: [userId], references: [userId])
}
```

### Components

#### 1. **Activity Logger Utility** (`lib/activity-logger.ts`)
A centralized service for logging activities:

```typescript
import { logActivity, ActivityMessages } from '@/lib/activity-logger'

// Example usage
await logActivity(userId, ActivityMessages.LOGIN, 'Additional details')
```

**Pre-defined Messages:**
- `LOGIN` - ចូលប្រើប្រាស់ប្រព័ន្ធ
- `LOGOUT` - ចេញពីប្រព័ន្ធ
- `ADD_STUDENT` - បន្ថែមសិស្សថ្មី
- `EDIT_STUDENT` - កែប្រែព័ត៌មានសិស្ស
- `DELETE_STUDENT` - លុបសិស្ស
- `RECORD_ATTENDANCE` - កត់ត្រាវត្តមាន
- `UPDATE_ATTENDANCE` - ធ្វើបច្ចុប្បន្នភាពវត្តមាន
- `DELETE_ATTENDANCE` - លុបកំណត់ត្រាវត្តមាន
- `ADD_GRADE` - បញ្ចូលពិន្ទុ
- `EDIT_GRADE` - កែប្រែពិន្ទុ
- `DELETE_GRADE` - លុបពិន្ទុ
- `ADD_USER` - បន្ថែមអ្នកប្រើប្រាស់ថ្មី
- `EDIT_USER` - កែប្រែព័ត៌មានអ្នកប្រើប្រាស់
- `DELETE_USER` - លុបអ្នកប្រើប្រាស់
- `ADD_COURSE` - បង្កើតថ្នាក់រៀនថ្មី
- `EDIT_COURSE` - កែប្រែថ្នាក់រៀន
- `DELETE_COURSE` - លុបថ្នាក់រៀន
- `ADD_SUBJECT` - បន្ថែមមុខវិជ្ជាថ្មី
- `EDIT_SUBJECT` - កែប្រែមុខវិជ្ជា
- `ADD_SEMESTER` - បង្កើតឆមាសថ្មី
- `ADD_SCHOOL_YEAR` - បង្កើតឆ្នាំសិក្សាថ្មី
- `GENERATE_REPORT` - បង្កើតរបាយការណ៍
- `GENERATE_ID_CARD` - បង្កើតអត្តសញ្ញាណប័ណ្ណ
- `EXPORT_DATA` - នាំចេញទិន្នន័យ

#### 2. **Activity Logs API** (`app/api/activity-logs/route.ts`)

**GET Endpoint:**
- Fetches recent activity logs
- Supports filtering by userId
- Returns formatted logs with user info and time ago

**Query Parameters:**
- `limit` (default: 10) - Number of logs to fetch
- `userId` (optional) - Filter by specific user

**POST Endpoint:**
- Creates new activity log
- Requires: userId, action
- Optional: details

#### 3. **Dashboard Display** (`app/dashboard/page.tsx`)
Activity logs are displayed in the "សកម្មភាពថ្មីៗ" (Recent Activities) section with:
- User name
- Action description
- Additional details
- Time ago (វិនាទីមុន, នាទីមុន, ម៉ោងមុន, ថ្ងៃមុន)
- Activity type badge
- Icon based on action type

**Activity Types:**
- 🟢 `add` - បន្ថែម (Add actions)
- 🔵 `edit` - កែប្រែ (Edit actions)
- 🟡 `attendance` - វត្តមាន (Attendance actions)
- 🟣 `announcement` - ប្រកាស (Announcement actions)
- ⚪ `other` - ផ្សេងៗ (Other actions)

## Integration Points

### 1. **Login** (`app/api/auth/login/route.ts`)
```typescript
// Log successful login activity
await logActivity(user.userId, ActivityMessages.LOGIN, `${user.lastname} ${user.firstname}`)
```

### 2. **Attendance Recording** (`app/api/attendance/route.ts`)
```typescript
// Log attendance recording
if (recordedBy) {
  const user = await prisma.user.findFirst({ where: { firstname: recordedBy } })
  if (user) {
    await logActivity(
      user.userId,
      ActivityMessages.RECORD_ATTENDANCE,
      `កត់ត្រាវត្តមាន ${attendance.student.lastName} ${attendance.student.firstName} - ${status}`
    )
  }
}
```

### 3. **Grade Entry** (`app/api/grades/route.ts`)
```typescript
// Log grade addition
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.ADD_GRADE,
    `បញ្ចូលពិន្ទុ ${newGrade.student.lastName} ${newGrade.student.firstName} - ${newGrade.subject.subjectName}: ${grade}`
  )
}

// Log grade update
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.EDIT_GRADE,
    `កែប្រែពិន្ទុ ${updatedGrade.student.lastName} ${updatedGrade.student.firstName} - ${updatedGrade.subject.subjectName}: ${grade}`
  )
}
```

## How to Add Logging to New Features

### Step 1: Import the logger
```typescript
import { logActivity, ActivityMessages } from '@/lib/activity-logger'
```

### Step 2: Add logging after successful action
```typescript
// After creating/updating/deleting data
await logActivity(userId, ActivityMessages.ACTION_TYPE, 'Optional details')
```

### Step 3: (Optional) Add new message type
If you need a new activity type, add it to `ActivityMessages` in `lib/activity-logger.ts`:
```typescript
export const ActivityMessages = {
  // ... existing messages
  NEW_ACTION: 'សកម្មភាពថ្មី',
}
```

## Testing

### Seed Test Data
Run the seed script to create sample activity logs:
```bash
node scripts/seed-activity-logs.js
```

### Manual Testing
1. Login to the system → Should create a login log
2. Record attendance → Should create an attendance log
3. Add/edit grades → Should create grade logs
4. Check the dashboard "សកម្មភាពថ្មីៗ" section to see the logs

## Future Enhancements

### Planned Features
1. **Detailed Activity View** - Click on activity to see full details
2. **Activity Filtering** - Filter by user, date, type
3. **Activity Search** - Search through activity logs
4. **Activity Export** - Export activity logs to CSV/PDF
5. **Real-time Updates** - WebSocket integration for live activity feed
6. **Activity Analytics** - Charts and graphs of user activities
7. **Retention Policy** - Automatic cleanup of old logs

### Additional Integration Points
- Student CRUD operations
- User management
- Course management
- Report generation
- ID card generation
- Data exports

## Troubleshooting

### No activities showing on dashboard
1. Check if activity logs exist in database:
   ```bash
   node scripts/seed-activity-logs.js
   ```
2. Check browser console for API errors
3. Verify API is returning data: `/api/activity-logs?limit=10`

### Activity not being logged
1. Ensure `userId` is being passed to the API
2. Check server console for errors
3. Verify database connection
4. Ensure `logActivity` is being called with correct parameters

## API Examples

### Fetch Recent Activities
```bash
GET /api/activity-logs?limit=20
```

Response:
```json
[
  {
    "id": 1,
    "action": "ចូលប្រើប្រាស់ប្រព័ន្ធ",
    "details": "ស្រូយ ស៊ីណាត",
    "time": "៥ នាទីមុន",
    "type": "other",
    "user": "ស្រូយ ស៊ីណាត",
    "timestamp": "2025-10-26T10:30:00.000Z"
  }
]
```

### Create Activity Log
```bash
POST /api/activity-logs
Content-Type: application/json

{
  "userId": 1,
  "action": "បន្ថែមសិស្សថ្មី",
  "details": "បន្ថែមសិស្ស ស្រូយ ស៊ីណាត"
}
```

## Security Considerations

1. **Authentication Required** - All activity log endpoints should be protected by authentication middleware
2. **User Validation** - Verify userId exists before logging
3. **Data Sanitization** - Sanitize action and details to prevent injection
4. **Rate Limiting** - Prevent abuse of activity logging
5. **Privacy** - Don't log sensitive information (passwords, personal data)

## Performance

- Activity logging is **asynchronous** and won't block main operations
- Failed logs are caught and logged to console without breaking functionality
- Database indexes on `userId` and `timestamp` for fast queries
- Limit query results to prevent memory issues

---

**Last Updated:** October 26, 2025  
**Version:** 1.0  
**Author:** Friendship School Management System Team

