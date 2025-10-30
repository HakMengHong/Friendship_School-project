# Activity Log Integration Guide

## Complete Activity Messages List

The activity logging system now includes **50+ predefined activities** organized into 9 categories:

---

## 📋 All Available Activity Messages

### 1. **Authentication & Session** (2 activities)
- ✅ `LOGIN` - ចូលប្រើប្រាស់ប្រព័ន្ធ (Already Integrated)
- ✅ `LOGOUT` - ចេញពីប្រព័ន្ធ (Already Integrated)

### 2. **Students Management** (5 activities)
- ⏳ `ADD_STUDENT` - បន្ថែមសិស្សថ្មី
- ⏳ `EDIT_STUDENT` - កែប្រែព័ត៌មានសិស្ស
- ⏳ `DELETE_STUDENT` - លុបសិស្ស
- ⏳ `VIEW_STUDENT` - មើលព័ត៌មានសិស្ស
- ⏳ `SEARCH_STUDENT` - ស្វែងរកសិស្ស

### 3. **Attendance Management** (4 activities)
- ✅ `RECORD_ATTENDANCE` - កត់ត្រាវត្តមាន (Already Integrated)
- ⏳ `UPDATE_ATTENDANCE` - ធ្វើបច្ចុប្បន្នភាពវត្តមាន
- ⏳ `DELETE_ATTENDANCE` - លុបកំណត់ត្រាវត្តមាន
- ⏳ `VIEW_ATTENDANCE` - មើលរបាយការណ៍វត្តមាន

### 4. **Grades Management** (5 activities)
- ✅ `ADD_GRADE` - បញ្ចូលពិន្ទុ (Already Integrated)
- ✅ `EDIT_GRADE` - កែប្រែពិន្ទុ (Already Integrated)
- ⏳ `DELETE_GRADE` - លុបពិន្ទុ
- ⏳ `IMPORT_GRADES` - នាំចូលពិន្ទុពី Excel
- ⏳ `VIEW_GRADEBOOK` - មើលបញ្ជីពិន្ទុ

### 5. **Users Management** (6 activities)
- ⏳ `ADD_USER` - បន្ថែមអ្នកប្រើប្រាស់ថ្មី
- ⏳ `EDIT_USER` - កែប្រែព័ត៌មានអ្នកប្រើប្រាស់
- ⏳ `DELETE_USER` - លុបអ្នកប្រើប្រាស់
- ⏳ `UPDATE_PROFILE` - ធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប
- ⏳ `CHANGE_PASSWORD` - ផ្លាស់ប្តូរលេខសម្ងាត់
- ⏳ `UPLOAD_PROFILE_PHOTO` - ផ្ទុកឡើងរូបភាពប្រវត្តិរូប

### 6. **Courses Management** (4 activities)
- ⏳ `ADD_COURSE` - បង្កើតថ្នាក់រៀនថ្មី
- ⏳ `EDIT_COURSE` - កែប្រែថ្នាក់រៀន
- ⏳ `DELETE_COURSE` - លុបថ្នាក់រៀន
- ⏳ `ASSIGN_TEACHER` - ចាត់តាំងគ្រូបង្រៀន

### 7. **Enrollment Management** (3 activities)
- ⏳ `ENROLL_STUDENT` - ចុះឈ្មោះសិស្សចូលថ្នាក់
- ⏳ `DROP_STUDENT` - ដកសិស្សចេញពីថ្នាក់
- ⏳ `UPDATE_ENROLLMENT` - ធ្វើបច្ចុប្បន្នភាពការចុះឈ្មោះ

### 8. **Academic Setup** (9 activities)
- ⏳ `ADD_SUBJECT` - បន្ថែមមុខវិជ្ជាថ្មី
- ⏳ `EDIT_SUBJECT` - កែប្រែមុខវិជ្ជា
- ⏳ `DELETE_SUBJECT` - លុបមុខវិជ្ជា
- ⏳ `ADD_SEMESTER` - បង្កើតឆមាសថ្មី
- ⏳ `EDIT_SEMESTER` - កែប្រែឆមាស
- ⏳ `DELETE_SEMESTER` - លុបឆមាស
- ⏳ `ADD_SCHOOL_YEAR` - បង្កើតឆ្នាំសិក្សាថ្មី
- ⏳ `EDIT_SCHOOL_YEAR` - កែប្រែឆ្នាំសិក្សា
- ⏳ `DELETE_SCHOOL_YEAR` - លុបឆ្នាំសិក្សា

### 9. **Reports & PDF Generation** (9 activities)
- ⏳ `GENERATE_REPORT` - បង្កើតរបាយការណ៍
- ⏳ `GENERATE_GRADE_REPORT` - បង្កើតរបាយការណ៍ពិន្ទុ
- ⏳ `GENERATE_ATTENDANCE_REPORT` - បង្កើតរបាយការណ៍វត្តមាន
- ⏳ `GENERATE_STUDENT_LIST` - បង្កើតបញ្ជីឈ្មោះសិស្ស
- ⏳ `GENERATE_GRADEBOOK` - បង្កើតសៀវភៅពិន្ទុ
- ⏳ `GENERATE_ID_CARD` - បង្កើតប័ណ្ណសំគាល់
- ⏳ `GENERATE_STUDENT_ID_CARD` - បង្កើតប័ណ្ណសំគាល់សិស្ស
- ⏳ `GENERATE_TEACHER_ID_CARD` - បង្កើតប័ណ្ណសំគាល់គ្រូ
- ⏳ `GENERATE_REGISTRATION_FORM` - បង្កើតទម្រង់ចុះឈ្មោះ

### 10. **Data Operations** (4 activities)
- ⏳ `EXPORT_DATA` - នាំចេញទិន្នន័យ
- ⏳ `IMPORT_DATA` - នាំចូលទិន្នន័យ
- ⏳ `BACKUP_DATABASE` - បម្រុងទុកទិន្នន័យ
- ⏳ `RESTORE_DATABASE` - ស្តារទិន្នន័យ

### 11. **System Administration** (4 activities)
- ⏳ `VIEW_DASHBOARD` - មើលផ្ទាំងគ្រប់គ្រង
- ⏳ `VIEW_STATISTICS` - មើលស្ថិតិ
- ⏳ `SYSTEM_SETTINGS` - កំណត់ការប្រព័ន្ធ
- ⏳ `VIEW_ACTIVITY_LOG` - មើលកំណត់ត្រាសកម្មភាព

---

## 🔌 Integration Points by API Route

### ✅ **Already Integrated (5 activities)**

#### 1. `app/api/auth/login/route.ts`
```typescript
// After successful login
await logActivity(user.userId, ActivityMessages.LOGIN, `${user.lastname} ${user.firstname}`)
```

#### 2. `app/api/auth/logout/route.ts`
```typescript
// Before clearing session
await logActivity(userId, ActivityMessages.LOGOUT, `${username} ចេញពីប្រព័ន្ធ`)
```

**Client-side Integration:**
- `components/navigation/top-bar.tsx` - Manual logout button
- `components/AutoLogoutTimer.tsx` - Auto-logout on timeout

#### 3. `app/api/attendance/route.ts`
```typescript
// POST - After creating attendance
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

#### 4. `app/api/grades/route.ts`
```typescript
// POST - After creating grade
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.ADD_GRADE,
    `បញ្ចូលពិន្ទុ ${newGrade.student.lastName} ${newGrade.student.firstName} - ${newGrade.subject.subjectName}: ${grade}`
  )
}

// PUT - After updating grade
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.EDIT_GRADE,
    `កែប្រែពិន្ទុ ${updatedGrade.student.lastName} ${updatedGrade.student.firstName} - ${updatedGrade.subject.subjectName}: ${grade}`
  )
}
```

---

### ⏳ **Pending Integration (45 activities)**

#### **Students API** (`app/api/students/route.ts`, `app/api/students/[id]/route.ts`)

**POST - Create Student:**
```typescript
// After successful student creation
await logActivity(
  currentUserId, // Get from session/auth
  ActivityMessages.ADD_STUDENT,
  `បន្ថែមសិស្ស ${result.lastName} ${result.firstName} - ថ្នាក់ទី${result.class}`
)
```

**PUT - Update Student:**
```typescript
// After successful student update
await logActivity(
  currentUserId,
  ActivityMessages.EDIT_STUDENT,
  `កែប្រែព័ត៌មានសិស្ស ${updatedStudent.lastName} ${updatedStudent.firstName}`
)
```

**DELETE - Delete Student:**
```typescript
// After successful student deletion (if implemented)
await logActivity(
  currentUserId,
  ActivityMessages.DELETE_STUDENT,
  `លុបសិស្ស ${student.lastName} ${student.firstName}`
)
```

#### **Attendance API** (`app/api/attendance/route.ts`)

**PUT - Update Attendance:**
```typescript
// After updating attendance
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.UPDATE_ATTENDANCE,
    `ធ្វើបច្ចុប្បន្នភាព វត្តមាន ${student.lastName} ${student.firstName} - ${status}`
  )
}
```

**DELETE - Delete Attendance:**
```typescript
// After deleting attendance
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.DELETE_ATTENDANCE,
    `លុបកំណត់ត្រាវត្តមាន ${student.lastName} ${student.firstName}`
  )
}
```

#### **Grades API** (`app/api/grades/route.ts`, `app/api/grades/import-excel/route.ts`)

**DELETE - Delete Grade:**
```typescript
// After deleting grade
if (userId) {
  await logActivity(
    userId,
    ActivityMessages.DELETE_GRADE,
    `លុបពិន្ទុ ${grade.student.lastName} ${grade.student.firstName} - ${grade.subject.subjectName}`
  )
}
```

**POST - Import Grades from Excel:**
```typescript
// After successful import
await logActivity(
  userId,
  ActivityMessages.IMPORT_GRADES,
  `នាំចូលពិន្ទុពី Excel - ${importedCount} ពិន្ទុ`
)
```

#### **Users API** (`app/api/users/route.ts`, `app/api/users/[id]/route.ts`)

**POST - Create User:**
```typescript
// After successful user creation
await logActivity(
  currentUserId,
  ActivityMessages.ADD_USER,
  `បន្ថែមអ្នកប្រើប្រាស់ ${newUser.lastname} ${newUser.firstname} - តួនាទី: ${newUser.role}`
)
```

**PUT - Update User:**
```typescript
// After successful user update
await logActivity(
  currentUserId,
  ActivityMessages.EDIT_USER,
  `កែប្រែព័ត៌មានអ្នកប្រើប្រាស់ ${updatedUser.lastname} ${updatedUser.firstname}`
)

// If password changed
if (password) {
  await logActivity(
    userId,
    ActivityMessages.CHANGE_PASSWORD,
    `ផ្លាស់ប្តូរលេខសម្ងាត់`
  )
}

// If photo uploaded
if (photoUrl) {
  await logActivity(
    userId,
    ActivityMessages.UPLOAD_PROFILE_PHOTO,
    `ផ្ទុកឡើងរូបភាពប្រវត្តិរូប`
  )
}
```

**DELETE - Delete User:**
```typescript
// After successful user deletion
await logActivity(
  currentUserId,
  ActivityMessages.DELETE_USER,
  `លុបអ្នកប្រើប្រាស់ ${existingUser.lastname} ${existingUser.firstname}`
)
```

#### **Courses API** (`app/api/courses/route.ts`, `app/api/courses/[id]/route.ts`)

**POST - Create Course:**
```typescript
// After successful course creation
await logActivity(
  currentUserId,
  ActivityMessages.ADD_COURSE,
  `បង្កើតថ្នាក់ ${newCourse.courseName}`
)
```

**PUT - Update Course:**
```typescript
// After successful course update
await logActivity(
  currentUserId,
  ActivityMessages.EDIT_COURSE,
  `កែប្រែថ្នាក់ ${updatedCourse.courseName}`
)
```

**DELETE - Delete Course:**
```typescript
// After successful course deletion
await logActivity(
  currentUserId,
  ActivityMessages.DELETE_COURSE,
  `លុបថ្នាក់ ${course.courseName}`
)
```

#### **Enrollments API** (`app/api/enrollments/route.ts`, `app/api/enrollments/[id]/route.ts`)

**POST - Enroll Student:**
```typescript
// After successful enrollment
await logActivity(
  currentUserId,
  ActivityMessages.ENROLL_STUDENT,
  `ចុះឈ្មោះសិស្ស ${student.lastName} ${student.firstName} ចូលថ្នាក់ ${course.courseName}`
)
```

**PUT - Drop Student:**
```typescript
// After marking student as dropped
if (body.drop) {
  await logActivity(
    currentUserId,
    ActivityMessages.DROP_STUDENT,
    `ដកសិស្ស ${enrollment.student.lastName} ${enrollment.student.firstName} ចេញពីថ្នាក់ - ${body.dropReason}`
  )
}
```

#### **Subjects API** (`app/api/subjects/route.ts`, `app/api/subjects/[id]/route.ts`)

**POST - Create Subject:**
```typescript
// After successful subject creation
await logActivity(
  currentUserId,
  ActivityMessages.ADD_SUBJECT,
  `បន្ថែមមុខវិជ្ជា ${newSubject.subjectName}`
)
```

**PUT - Update Subject:**
```typescript
// After successful subject update
await logActivity(
  currentUserId,
  ActivityMessages.EDIT_SUBJECT,
  `កែប្រែមុខវិជ្ជា ${updatedSubject.subjectName}`
)
```

**DELETE - Delete Subject:**
```typescript
// After successful subject deletion
await logActivity(
  currentUserId,
  ActivityMessages.DELETE_SUBJECT,
  `លុបមុខវិជ្ជា ${subject.subjectName}`
)
```

#### **School Years API** (`app/api/school-years/route.ts`, `app/api/school-years/[id]/route.ts`)

**POST - Create School Year:**
```typescript
// After successful school year creation
await logActivity(
  currentUserId,
  ActivityMessages.ADD_SCHOOL_YEAR,
  `បង្កើតឆ្នាំសិក្សា ${newSchoolYear.schoolYearCode}`
)
```

**PUT - Update School Year:**
```typescript
// After successful school year update
await logActivity(
  currentUserId,
  ActivityMessages.EDIT_SCHOOL_YEAR,
  `កែប្រែឆ្នាំសិក្សា ${updatedSchoolYear.schoolYearCode}`
)
```

**DELETE - Delete School Year:**
```typescript
// After successful school year deletion
await logActivity(
  currentUserId,
  ActivityMessages.DELETE_SCHOOL_YEAR,
  `លុបឆ្នាំសិក្សា ${schoolYear.schoolYearCode}`
)
```

#### **PDF Generation APIs** (`app/api/pdf-generate/*`)

**Generate ID Cards:**
```typescript
// app/api/pdf-generate/generate-id-cards/route.ts
if (request.type === 'student') {
  await logActivity(
    currentUserId,
    ActivityMessages.GENERATE_STUDENT_ID_CARD,
    `បង្កើតប័ណ្ណសំគាល់សិស្ស - ${studentIds.length} សិស្ស`
  )
} else if (request.type === 'teacher') {
  await logActivity(
    currentUserId,
    ActivityMessages.GENERATE_TEACHER_ID_CARD,
    `បង្កើតប័ណ្ណសំគាល់គ្រូ - ${teacherIds.length} គ្រូ`
  )
}
```

**Generate Grade Reports:**
```typescript
// app/api/pdf-generate/generate-grade-report/route.ts
await logActivity(
  currentUserId,
  ActivityMessages.GENERATE_GRADE_REPORT,
  `បង្កើតរបាយការណ៍ពិន្ទុ ${reportType} - ${className}`
)
```

**Generate Attendance Reports:**
```typescript
// app/api/pdf-generate/generate-attendance-report/route.ts
await logActivity(
  currentUserId,
  ActivityMessages.GENERATE_ATTENDANCE_REPORT,
  `បង្កើតរបាយការណ៍វត្តមាន ${reportType} - ${className || 'ទាំងអស់'}`
)
```

**Generate Student Lists:**
```typescript
// app/api/pdf-generate/generate-student-list-report/route.ts
await logActivity(
  currentUserId,
  ActivityMessages.GENERATE_STUDENT_LIST,
  `បង្កើតបញ្ជីសិស្ស ${className}`
)
```

**Generate Gradebook:**
```typescript
// app/api/pdf-generate/generate-gradebook-report/route.ts
await logActivity(
  currentUserId,
  ActivityMessages.GENERATE_GRADEBOOK,
  `បង្កើតសៀវភៅពិន្ទុ ${reportType} - ${className}`
)
```

**Generate Registration Form:**
```typescript
// app/api/pdf-generate/generate-student-registration/route.ts
await logActivity(
  currentUserId,
  ActivityMessages.GENERATE_REGISTRATION_FORM,
  `បង្កើតទម្រង់ចុះឈ្មោះសិស្ស ${student.lastName} ${student.firstName}`
)
```

---

## 🛠️ Implementation Steps

### Step 1: Get Current User ID
Most APIs need the current user's ID. You'll need to:

1. **Option A: Pass userId in request body**
```typescript
const { userId, ...otherData } = await request.json()
```

2. **Option B: Get from session/cookies**
```typescript
import { getCurrentUser } from '@/lib/auth-service'
const currentUser = await getCurrentUser(request)
const userId = currentUser?.id
```

3. **Option C: Add to middleware**
```typescript
// In middleware.ts, add userId to request headers
request.headers.set('x-user-id', user.id.toString())

// In API route
const userId = parseInt(request.headers.get('x-user-id') || '0')
```

### Step 2: Import Activity Logger
```typescript
import { logActivity, ActivityMessages } from '@/lib/activity-logger'
```

### Step 3: Add Logging After Successful Operations
```typescript
// Always wrap in try-catch or use after successful response
await logActivity(userId, ActivityMessages.ACTION_TYPE, 'Details')
```

### Step 4: Test Integration
1. Perform the action (e.g., create student)
2. Check dashboard "សកម្មភាពថ្មីៗ" section
3. Verify activity appears with correct details

---

## 📊 Integration Progress

- ✅ **Completed:** 5/50 activities (10%)
- ⏳ **Pending:** 45/50 activities (90%)

### Priority Integration Order

**High Priority (Core Features):**
1. Student CRUD operations (5 activities)
2. Attendance update/delete (2 activities)
3. Grade delete (1 activity)
4. User management (6 activities)
5. Course management (4 activities)

**Medium Priority (Academic Setup):**
6. Enrollment management (3 activities)
7. Subject management (3 activities)
8. School year management (3 activities)

**Low Priority (Reports & Advanced):**
9. PDF generation (9 activities)
10. Data operations (4 activities)
11. System admin views (4 activities)

---

## 🎯 Next Steps

1. **Get User ID Strategy:** Decide how to pass/retrieve current user ID in APIs
2. **Prioritize Integration:** Start with high-priority activities
3. **Test Each Integration:** Verify logs appear on dashboard
4. **Update Documentation:** Mark completed activities as ✅
5. **Add More Activities:** Identify any missing operations as system grows

---

**Last Updated:** October 26, 2025  
**Total Activities:** 50+  
**Integrated:** 5  
**Remaining:** 45

