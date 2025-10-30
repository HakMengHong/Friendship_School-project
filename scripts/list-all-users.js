#!/usr/bin/env node

/**
 * List All Users Script
 * 
 * This script will display all users in the database with their details
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// List all users
async function listAllUsers() {
  console.log('👥 LISTING ALL USERS');
  console.log('=' .repeat(60));
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { userId: 'asc' }
    });
    
    console.log(`📊 Total Users: ${users.length}`);
    console.log('');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('📋 User Details:');
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. User ID: ${user.userId}`);
      console.log(`    Username: ${user.username}`);
      console.log(`    Name: ${user.firstname} ${user.lastname}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Status: ${user.status}`);
      console.log(`    Phone 1: ${user.phonenumber1 || 'N/A'}`);
      console.log(`    Phone 2: ${user.phonenumber2 || 'N/A'}`);
      console.log(`    Position: ${user.position || 'N/A'}`);
      console.log(`    Avatar: ${user.avatar || 'N/A'}`);
      console.log(`    Photo: ${user.photo || 'N/A'}`);
      console.log(`    Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}`);
      console.log(`    Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`    Updated: ${new Date(user.updatedAt).toLocaleString()}`);
      
      if (user.accountLockedUntil) {
        console.log(`    🔒 Account Locked Until: ${new Date(user.accountLockedUntil).toLocaleString()}`);
      }
      
      if (user.failedLoginAttempts > 0) {
        console.log(`    ⚠️ Failed Login Attempts: ${user.failedLoginAttempts}`);
        if (user.lastFailedLogin) {
          console.log(`    Last Failed Login: ${new Date(user.lastFailedLogin).toLocaleString()}`);
        }
      }
      
      console.log('');
    });
    
    // Summary by role
    const roleSummary = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Summary by Role:');
    Object.entries(roleSummary).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} user(s)`);
    });
    
    console.log('');
    
    // Summary by status
    const statusSummary = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Summary by Status:');
    Object.entries(statusSummary).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} user(s)`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await listAllUsers();
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { listAllUsers };
