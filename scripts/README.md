# Scripts Directory

This directory contains essential development and maintenance scripts for the Friendship School Project.

## 📁 **Available Scripts**

### **Database Management**
- `add-teachers.js` - Add initial teacher and admin users to the database
- `check-database.js` - Check database connectivity and basic data
- `add-single-student.js` - Add a single test student with complete data
- `add-bulk-students.js` - Add 20 students for each grade (5, 7, 9) with school year 2024-2025
- `update-class-format.js` - Update existing class values from Khmer format to simple numbers
- `create-complete-student.js` - Create a single student with ALL required fields from registration form
- `truncate-students.js` - Delete all students and related data (immediate execution)
- `truncate-students-safe.js` - Delete all students with confirmation prompts (recommended)
- `truncate-students.sql` - SQL script for direct database truncation

### **Development & Testing**
- `README.md` - This documentation file

## 🚀 **Usage**

### **Database Setup**
```bash
# Add initial users (run once after database setup)
node scripts/add-teachers.js

# Check database connectivity
node scripts/check-database.js
```

### **Student Data Management**
```bash
# Add test students
node scripts/add-single-student.js          # Add one test student
node scripts/add-bulk-students.js           # Add 60 students (20 each for grades 5, 7, 9)
node scripts/create-complete-student.js     # Create one student with ALL required fields

# Delete all students (with confirmation prompts - RECOMMENDED)
node scripts/truncate-students-safe.js

# Delete all students (immediate execution - use with caution)
node scripts/truncate-students.js

# Or use SQL directly (requires database access)
psql -d your_database -f scripts/truncate-students.sql
```

## 📝 **Notes**

- All scripts require a running database connection
- Ensure environment variables are properly configured
- Run scripts from the project root directory
- Some scripts may modify database data - use with caution

## 🔧 **Adding New Scripts**

When adding new scripts:
1. Follow the naming convention: `action-description.js`
2. Add proper error handling
3. Include usage documentation
4. Test thoroughly before committing

---

**Last Updated**: December 2024
