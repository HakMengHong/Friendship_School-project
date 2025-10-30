# Activity Messages Quick Reference

## 🎯 Quick Copy-Paste Guide

### Import Statement
```typescript
import { logActivity, ActivityMessages } from '@/lib/activity-logger'
```

---

## 📚 All 50+ Activity Messages

### 🔐 Authentication & Session
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `LOGIN` | ចូលប្រើប្រាស់ប្រព័ន្ធ | ✅ Integrated |
| `LOGOUT` | ចេញពីប្រព័ន្ធ | ✅ Integrated |

### 👥 Students Management
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `ADD_STUDENT` | បន្ថែមសិស្សថ្មី | ⏳ Pending |
| `EDIT_STUDENT` | កែប្រែព័ត៌មានសិស្ស | ⏳ Pending |
| `DELETE_STUDENT` | លុបសិស្ស | ⏳ Pending |
| `VIEW_STUDENT` | មើលព័ត៌មានសិស្ស | ⏳ Pending |
| `SEARCH_STUDENT` | ស្វែងរកសិស្ស | ⏳ Pending |

### 📋 Attendance Management
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `RECORD_ATTENDANCE` | កត់ត្រាវត្តមាន | ✅ Integrated |
| `UPDATE_ATTENDANCE` | ធ្វើបច្ចុប្បន្នភាពវត្តមាន | ⏳ Pending |
| `DELETE_ATTENDANCE` | លុបកំណត់ត្រាវត្តមាន | ⏳ Pending |
| `VIEW_ATTENDANCE` | មើលរបាយការណ៍វត្តមាន | ⏳ Pending |

### 📊 Grades Management
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `ADD_GRADE` | បញ្ចូលពិន្ទុ | ✅ Integrated |
| `EDIT_GRADE` | កែប្រែពិន្ទុ | ✅ Integrated |
| `DELETE_GRADE` | លុបពិន្ទុ | ⏳ Pending |
| `IMPORT_GRADES` | នាំចូលពិន្ទុពី Excel | ⏳ Pending |
| `VIEW_GRADEBOOK` | មើលបញ្ជីពិន្ទុ | ⏳ Pending |

### 👤 Users Management
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `ADD_USER` | បន្ថែមអ្នកប្រើប្រាស់ថ្មី | ⏳ Pending |
| `EDIT_USER` | កែប្រែព័ត៌មានអ្នកប្រើប្រាស់ | ⏳ Pending |
| `DELETE_USER` | លុបអ្នកប្រើប្រាស់ | ⏳ Pending |
| `UPDATE_PROFILE` | ធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប | ⏳ Pending |
| `CHANGE_PASSWORD` | ផ្លាស់ប្តូរលេខសម្ងាត់ | ⏳ Pending |
| `UPLOAD_PROFILE_PHOTO` | ផ្ទុកឡើងរូបភាពប្រវត្តិរូប | ⏳ Pending |

### 📚 Courses Management
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `ADD_COURSE` | បង្កើតថ្នាក់រៀនថ្មី | ⏳ Pending |
| `EDIT_COURSE` | កែប្រែថ្នាក់រៀន | ⏳ Pending |
| `DELETE_COURSE` | លុបថ្នាក់រៀន | ⏳ Pending |
| `ASSIGN_TEACHER` | ចាត់តាំងគ្រូបង្រៀន | ⏳ Pending |

### 📝 Enrollment Management
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `ENROLL_STUDENT` | ចុះឈ្មោះសិស្សចូលថ្នាក់ | ⏳ Pending |
| `DROP_STUDENT` | ដកសិស្សចេញពីថ្នាក់ | ⏳ Pending |
| `UPDATE_ENROLLMENT` | ធ្វើបច្ចុប្បន្នភាពការចុះឈ្មោះ | ⏳ Pending |

### 🎓 Academic Setup
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `ADD_SUBJECT` | បន្ថែមមុខវិជ្ជាថ្មី | ⏳ Pending |
| `EDIT_SUBJECT` | កែប្រែមុខវិជ្ជា | ⏳ Pending |
| `DELETE_SUBJECT` | លុបមុខវិជ្ជា | ⏳ Pending |
| `ADD_SEMESTER` | បង្កើតឆមាសថ្មី | ⏳ Pending |
| `EDIT_SEMESTER` | កែប្រែឆមាស | ⏳ Pending |
| `DELETE_SEMESTER` | លុបឆមាស | ⏳ Pending |
| `ADD_SCHOOL_YEAR` | បង្កើតឆ្នាំសិក្សាថ្មី | ⏳ Pending |
| `EDIT_SCHOOL_YEAR` | កែប្រែឆ្នាំសិក្សា | ⏳ Pending |
| `DELETE_SCHOOL_YEAR` | លុបឆ្នាំសិក្សា | ⏳ Pending |

### 📄 Reports & PDF Generation
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `GENERATE_REPORT` | បង្កើតរបាយការណ៍ | ⏳ Pending |
| `GENERATE_GRADE_REPORT` | បង្កើតរបាយការណ៍ពិន្ទុ | ⏳ Pending |
| `GENERATE_ATTENDANCE_REPORT` | បង្កើតរបាយការណ៍វត្តមាន | ⏳ Pending |
| `GENERATE_STUDENT_LIST` | បង្កើតបញ្ជីឈ្មោះសិស្ស | ⏳ Pending |
| `GENERATE_GRADEBOOK` | បង្កើតសៀវភៅពិន្ទុ | ⏳ Pending |
| `GENERATE_ID_CARD` | បង្កើតប័ណ្ណសំគាល់ | ⏳ Pending |
| `GENERATE_STUDENT_ID_CARD` | បង្កើតប័ណ្ណសំគាល់សិស្ស | ⏳ Pending |
| `GENERATE_TEACHER_ID_CARD` | បង្កើតប័ណ្ណសំគាល់គ្រូ | ⏳ Pending |
| `GENERATE_REGISTRATION_FORM` | បង្កើតទម្រង់ចុះឈ្មោះ | ⏳ Pending |

### 💾 Data Operations
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `EXPORT_DATA` | នាំចេញទិន្នន័យ | ⏳ Pending |
| `IMPORT_DATA` | នាំចូលទិន្នន័យ | ⏳ Pending |
| `BACKUP_DATABASE` | បម្រុងទុកទិន្នន័យ | ⏳ Pending |
| `RESTORE_DATABASE` | ស្តារទិន្នន័យ | ⏳ Pending |

### ⚙️ System Administration
| Constant | Khmer Message | Status |
|----------|---------------|--------|
| `VIEW_DASHBOARD` | មើលផ្ទាំងគ្រប់គ្រង | ⏳ Pending |
| `VIEW_STATISTICS` | មើលស្ថិតិ | ⏳ Pending |
| `SYSTEM_SETTINGS` | កំណត់ការប្រព័ន្ធ | ⏳ Pending |
| `VIEW_ACTIVITY_LOG` | មើលកំណត់ត្រាសកម្មភាព | ⏳ Pending |

---

## 💡 Usage Examples

### Basic Usage
```typescript
await logActivity(userId, ActivityMessages.ADD_STUDENT, 'បន្ថែមសិស្ស ស្រូយ ស៊ីណាត')
```

### With Student Info
```typescript
await logActivity(
  userId,
  ActivityMessages.EDIT_STUDENT,
  `កែប្រែព័ត៌មានសិស្ស ${student.lastName} ${student.firstName}`
)
```

### With Multiple Details
```typescript
await logActivity(
  userId,
  ActivityMessages.ADD_GRADE,
  `បញ្ចូលពិន្ទុ ${student.lastName} ${student.firstName} - ${subject.subjectName}: ${grade}`
)
```

### With Count
```typescript
await logActivity(
  userId,
  ActivityMessages.GENERATE_STUDENT_ID_CARD,
  `បង្កើតប័ណ្ណសំគាល់សិស្ស - ${studentIds.length} សិស្ស`
)
```

---

## 📈 Integration Progress

```
Progress: █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%

✅ Completed: 5
⏳ Pending: 45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 50 activities
```

---

## 🔍 Find Activity by Feature

**Want to log student creation?**
→ Use `ActivityMessages.ADD_STUDENT`

**Want to log attendance recording?**
→ Use `ActivityMessages.RECORD_ATTENDANCE`

**Want to log grade entry?**
→ Use `ActivityMessages.ADD_GRADE`

**Want to log PDF generation?**
→ Use `ActivityMessages.GENERATE_*` (specific type)

**Want to log user management?**
→ Use `ActivityMessages.*_USER`

**Want to log course management?**
→ Use `ActivityMessages.*_COURSE`

---

## 📋 Copy-Paste Templates

### Student Operations
```typescript
// Add
await logActivity(userId, ActivityMessages.ADD_STUDENT, `បន្ថែមសិស្ស ${lastName} ${firstName} - ថ្នាក់ទី${class}`)

// Edit
await logActivity(userId, ActivityMessages.EDIT_STUDENT, `កែប្រែព័ត៌មានសិស្ស ${lastName} ${firstName}`)

// Delete
await logActivity(userId, ActivityMessages.DELETE_STUDENT, `លុបសិស្ស ${lastName} ${firstName}`)
```

### Attendance Operations
```typescript
// Record
await logActivity(userId, ActivityMessages.RECORD_ATTENDANCE, `កត់ត្រាវត្តមាន ${lastName} ${firstName} - ${status}`)

// Update
await logActivity(userId, ActivityMessages.UPDATE_ATTENDANCE, `ធ្វើបច្ចុប្បន្នភាពវត្តមាន ${lastName} ${firstName} - ${status}`)

// Delete
await logActivity(userId, ActivityMessages.DELETE_ATTENDANCE, `លុបកំណត់ត្រាវត្តមាន ${lastName} ${firstName}`)
```

### Grade Operations
```typescript
// Add
await logActivity(userId, ActivityMessages.ADD_GRADE, `បញ្ចូលពិន្ទុ ${lastName} ${firstName} - ${subjectName}: ${grade}`)

// Edit
await logActivity(userId, ActivityMessages.EDIT_GRADE, `កែប្រែពិន្ទុ ${lastName} ${firstName} - ${subjectName}: ${grade}`)

// Delete
await logActivity(userId, ActivityMessages.DELETE_GRADE, `លុបពិន្ទុ ${lastName} ${firstName} - ${subjectName}`)

// Import
await logActivity(userId, ActivityMessages.IMPORT_GRADES, `នាំចូលពិន្ទុពី Excel - ${count} ពិន្ទុ`)
```

### PDF Generation
```typescript
// ID Cards
await logActivity(userId, ActivityMessages.GENERATE_STUDENT_ID_CARD, `បង្កើតប័ណ្ណសំគាល់សិស្ស - ${count} សិស្ស`)

// Reports
await logActivity(userId, ActivityMessages.GENERATE_GRADE_REPORT, `បង្កើតរបាយការណ៍ពិន្ទុ ${reportType} - ${className}`)
```

---

**Last Updated:** October 26, 2025  
**Version:** 1.0  
**See Also:** `ACTIVITY_LOG_INTEGRATION_GUIDE.md` for detailed integration instructions

