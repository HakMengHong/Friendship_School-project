# Scripts Directory

This directory contains essential development and maintenance scripts for the Friendship School Project.

## 📁 **Available Scripts**

### **Database Management**
- `add-teachers.js` - Add initial teacher and admin users to the database
- `check-database.js` - Check database connectivity and basic data

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
