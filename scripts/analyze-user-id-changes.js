#!/usr/bin/env node

/**
 * Analyze User ID Changes Script
 * 
 * This script will analyze the implications of changing user IDs
 * and show what would be affected
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Desired user ID mapping
const DESIRED_MAPPING = {
  1: 'យឿនសុខរ៉ែន',
  2: 'តៃស៊ីណៃ', 
  3: 'សួនយាងស្រេង',
  4: 'ថនប៉ុនណារិទ្ធ',
  5: 'អ៊ាងស្រីណូ',
  6: 'ចាន់ខេមា',
  7: 'ហេងសុនី',
  8: 'ស្រូយចាន់នាត',
  9: 'ស៊ីមសំណាង',
  10: 'ស្រូយស៊ីណាត',
  11: 'admin'
};

// Current user mapping
const CURRENT_MAPPING = {
  1: 'admin',
  2: 'យឿនសុខរ៉ែន',
  3: 'តៃស៊ីណៃ',
  5: 'ថនប៉ុនណារិទ្ធ',
  6: 'អ៊ាងស្រីណូ',
  7: 'ចាន់ខេមា',
  8: 'ហេងសុនី',
  9: 'ស្រូយចាន់នាត',
  10: 'ស៊ីមសំណាង',
  11: 'ស្រូយស៊ីណាត',
  12: 'សួនយាងស្រេង'
};

async function analyzeCurrentUsers() {
  console.log('🔍 ANALYZING CURRENT USER STRUCTURE');
  console.log('=' .repeat(60));
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { userId: 'asc' }
    });
    
    console.log('📊 Current User Mapping:');
    users.forEach(user => {
      console.log(`   ID ${user.userId}: ${user.username} (${user.firstname} ${user.lastname})`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Error analyzing users:', error);
    throw error;
  }
}

async function checkRelatedData() {
  console.log('\n🔗 CHECKING RELATED DATA');
  console.log('=' .repeat(60));
  
  try {
    // Check courses that reference users
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { teacherId1: { not: null } },
          { teacherId2: { not: null } },
          { teacherId3: { not: null } }
        ]
      }
    });
    
    console.log(`📚 Courses with teacher assignments: ${courses.length}`);
    courses.forEach(course => {
      console.log(`   Course ${course.courseId}: ${course.courseName}`);
      if (course.teacherId1) console.log(`     Teacher 1: User ID ${course.teacherId1}`);
      if (course.teacherId2) console.log(`     Teacher 2: User ID ${course.teacherId2}`);
      if (course.teacherId3) console.log(`     Teacher 3: User ID ${course.teacherId3}`);
    });
    
    // Check grades that reference users
    const grades = await prisma.grade.findMany({
      where: { userId: { not: null } },
      select: { userId: true },
      distinct: ['userId']
    });
    
    console.log(`\n📊 Grades with user references: ${grades.length} unique users`);
    grades.forEach(grade => {
      console.log(`   User ID ${grade.userId} has grades`);
    });
    
    // Check activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: { 
        userId: { 
          not: null 
        } 
      },
      select: { userId: true },
      distinct: ['userId']
    });
    
    console.log(`\n📝 Activity logs with user references: ${activityLogs.length} unique users`);
    activityLogs.forEach(log => {
      console.log(`   User ID ${log.userId} has activity logs`);
    });
    
    return { courses, grades, activityLogs };
    
  } catch (error) {
    console.error('❌ Error checking related data:', error);
    throw error;
  }
}

function showDesiredMapping() {
  console.log('\n🎯 DESIRED USER ID MAPPING');
  console.log('=' .repeat(60));
  
  console.log('📋 Desired User ID Sequence:');
  Object.entries(DESIRED_MAPPING).forEach(([id, username]) => {
    console.log(`   ID ${id}: ${username}`);
  });
}

function showImplications() {
  console.log('\n⚠️ IMPLICATIONS OF CHANGING USER IDs');
  console.log('=' .repeat(60));
  
  console.log('🚨 WARNING: Changing primary key IDs is risky and complex!');
  console.log('');
  console.log('📋 What would be affected:');
  console.log('   • Course teacher assignments (teacherId1, teacherId2, teacherId3)');
  console.log('   • Grade records (userId field)');
  console.log('   • Activity logs (userId field)');
  console.log('   • Any other foreign key references');
  console.log('');
  console.log('💡 RECOMMENDED ALTERNATIVES:');
  console.log('   1. Keep current IDs but update display order in UI');
  console.log('   2. Add a "displayOrder" field to User table');
  console.log('   3. Use username or name for identification instead of ID');
  console.log('   4. Create a new "userSequence" field for ordering');
  console.log('');
  console.log('🔧 If you still want to change IDs, you would need to:');
  console.log('   1. Create a temporary mapping table');
  console.log('   2. Update all foreign key references');
  console.log('   3. Recreate users in new order');
  console.log('   4. Update all related records');
  console.log('   5. Handle potential data conflicts');
}

async function main() {
  try {
    await analyzeCurrentUsers();
    await checkRelatedData();
    showDesiredMapping();
    showImplications();
    
    console.log('\n🤔 RECOMMENDATION:');
    console.log('Instead of changing user IDs, consider:');
    console.log('1. Adding a "displayOrder" field to the User table');
    console.log('2. Updating your application to sort users by this field');
    console.log('3. This is much safer and easier to maintain');
    
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

module.exports = { analyzeCurrentUsers, checkRelatedData, DESIRED_MAPPING, CURRENT_MAPPING };
