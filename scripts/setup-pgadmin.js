#!/usr/bin/env node

/**
 * Setup pgAdmin4 Server Configuration
 * This script helps you configure pgAdmin4 to connect to your PostgreSQL database
 */

console.log('🔧 pgAdmin4 Setup Guide');
console.log('========================\n');

console.log('📋 Manual Setup Steps:');
console.log('1. Open http://localhost:8080 in your browser');
console.log('2. Login with: admin@admin.com / admin123');
console.log('3. Right-click "Servers" → "Register" → "Server..."');
console.log('4. Fill in the connection details:\n');

console.log('   General Tab:');
console.log('   - Name: Friendship School DB\n');

console.log('   Connection Tab:');
console.log('   - Host name/address: postgres');
console.log('   - Port: 5432');
console.log('   - Maintenance database: postgres');
console.log('   - Username: postgres');
console.log('   - Password: password123\n');

console.log('5. Click "Save" to connect\n');

console.log('✅ Once connected, you can:');
console.log('   - Browse your database tables');
console.log('   - Run SQL queries');
console.log('   - View data in tables');
console.log('   - Manage database structure\n');

console.log('🔍 Your database contains:');
console.log('   - Users table (teachers/admin)');
console.log('   - Students table');
console.log('   - Courses table');
console.log('   - Grades table');
console.log('   - Attendance table');
console.log('   - And more...\n');

console.log('💡 Pro tip: You can also use the SQL query tool to run custom queries!');
