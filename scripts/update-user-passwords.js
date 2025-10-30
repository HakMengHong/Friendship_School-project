#!/usr/bin/env node

/**
 * Update User Passwords Script
 * 
 * This script will update all user passwords to "password"
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAllPasswords() {
  console.log('🔐 UPDATING ALL USER PASSWORDS');
  console.log('=' .repeat(50));
  
  try {
    // Hash the password "password"
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log('✅ Password hashed successfully');
    
    // Update all users with the new password
    const result = await prisma.user.updateMany({
      data: {
        password: hashedPassword
      }
    });
    
    console.log(`✅ Updated passwords for ${result.count} users`);
    
    // Verify the update
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true
      },
      orderBy: { userId: 'asc' }
    });
    
    console.log('\n📊 Users with updated passwords:');
    users.forEach(user => {
      console.log(`   ID ${user.userId}: ${user.username} (${user.firstname} ${user.lastname}) - ${user.role}`);
    });
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Username: [any username from above]');
    console.log('   Password: password');
    
    console.log('\n✅ All user passwords updated to "password"');
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    throw error;
  }
}

async function main() {
  try {
    await updateAllPasswords();
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

module.exports = { updateAllPasswords };
