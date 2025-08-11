# Database Cleanup Scripts

This directory contains scripts for cleaning up data in the Friendship School database.

## 🗑️ Course Cleanup Scripts

### 1. Basic Course Cleanup (`clean-courses.js`)

**Simple script to delete all courses from the database.**

```bash
# Run directly
node scripts/clean-courses.js

# Or use npm script
npm run clean:courses
```

**What it does:**
- Deletes all courses from the Course table
- Shows count of deleted courses
- Verifies cleanup completion

**Use case:** When you want to quickly clear all course data.

---

### 2. Advanced Course Cleanup (`clean-courses-advanced.js`)

**Comprehensive script with options for handling related data.**

```bash
# Basic usage (deletes only courses)
npm run clean:courses:advanced -- --confirm

# Cleanup with related data
npm run clean:courses:advanced -- --delete-related-grades --delete-related-enrollments --confirm

# Dry run (see what would be deleted)
npm run clean:courses:advanced -- --delete-related-grades --delete-related-enrollments --dry-run

# Show help
npm run clean:courses:advanced -- --help
```

**Available Flags:**
- `--delete-related-grades` - Delete grades that reference courses
- `--delete-related-enrollments` - Delete enrollments that reference courses
- `--dry-run` - Show what would be deleted without actually deleting
- `--confirm` - Actually perform the deletion
- `--help` or `-h` - Show help message

**Use cases:**
- **Fresh start**: Clear all course-related data
- **Schema migration**: After changing course structure
- **Testing**: Clean environment for development
- **Data reset**: Remove test data

---

## ⚠️ Important Warnings

1. **Data Loss**: These scripts permanently delete data from your database
2. **No Recovery**: Deleted data cannot be recovered
3. **Backup First**: Always backup your database before running cleanup scripts
4. **Production**: Be extremely careful when running on production databases

---

## 🔄 When to Use

### Use Basic Cleanup When:
- You only need to clear courses
- No related data exists
- Quick cleanup is needed

### Use Advanced Cleanup When:
- You have grades or enrollments referencing courses
- You want to see what will be deleted first
- You need to handle complex data relationships
- You want more control over the cleanup process

---

## 📊 What Gets Deleted

### Basic Cleanup:
- ✅ All courses from Course table

### Advanced Cleanup (with flags):
- ✅ All courses from Course table
- ✅ All grades from Grade table (if `--delete-related-grades`)
- ✅ All enrollments from Enrollment table (if `--delete-related-enrollments`)

---

## 🚀 Example Workflows

### Scenario 1: Fresh Database Setup
```bash
# Clear everything to start fresh
npm run clean:courses:advanced -- --delete-related-grades --delete-related-enrollments --confirm
```

### Scenario 2: After Schema Changes
```bash
# Clear courses after changing course structure
npm run clean:courses:advanced -- --confirm
```

### Scenario 3: Development Testing
```bash
# See what would be deleted first
npm run clean:courses:advanced -- --delete-related-grades --delete-related-enrollments --dry-run

# Then actually delete if you're sure
npm run clean:courses:advanced -- --delete-related-grades --delete-related-enrollments --confirm
```

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Permission Denied**: Make sure you have database access
2. **Connection Failed**: Check your database connection string
3. **Foreign Key Errors**: Use advanced cleanup with related data flags
4. **Script Hangs**: Check for long-running database operations

### Getting Help:
```bash
# Show help for advanced script
npm run clean:courses:advanced -- --help

# Check script syntax
node -c scripts/clean-courses.js
```

---

## 📝 Notes

- Scripts use Prisma Client for database operations
- All operations are logged to console
- Scripts automatically disconnect from database when done
- Exit codes: 0 = success, 1 = error
