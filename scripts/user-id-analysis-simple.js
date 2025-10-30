#!/usr/bin/env node

/**
 * Simple User ID Analysis
 * 
 * Shows current user mapping and provides safer alternatives
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Your desired mapping
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

async function showCurrentUsers() {
  console.log('👥 CURRENT USER MAPPING');
  console.log('=' .repeat(50));
  
  const users = await prisma.user.findMany({
    orderBy: { userId: 'asc' }
  });
  
  users.forEach(user => {
    console.log(`ID ${user.userId}: ${user.username} (${user.firstname} ${user.lastname})`);
  });
  
  return users;
}

async function showDesiredMapping() {
  console.log('\n🎯 YOUR DESIRED MAPPING');
  console.log('=' .repeat(50));
  
  Object.entries(DESIRED_MAPPING).forEach(([id, username]) => {
    console.log(`ID ${id}: ${username}`);
  });
}

async function checkCourseAssignments() {
  console.log('\n📚 COURSE TEACHER ASSIGNMENTS');
  console.log('=' .repeat(50));
  
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { teacherId1: { not: null } },
        { teacherId2: { not: null } },
        { teacherId3: { not: null } }
      ]
    }
  });
  
  console.log(`Found ${courses.length} courses with teacher assignments:`);
  courses.forEach(course => {
    console.log(`\n${course.courseName} (ID: ${course.courseId}):`);
    if (course.teacherId1) console.log(`  Teacher 1: User ID ${course.teacherId1}`);
    if (course.teacherId2) console.log(`  Teacher 2: User ID ${course.teacherId2}`);
    if (course.teacherId3) console.log(`  Teacher 3: User ID ${course.teacherId3}`);
  });
}

function showRecommendations() {
  console.log('\n💡 RECOMMENDATIONS');
  console.log('=' .repeat(50));
  
  console.log('🚨 WARNING: Changing user IDs is VERY RISKY!');
  console.log('');
  console.log('❌ Problems with changing IDs:');
  console.log('   • Breaks all course teacher assignments');
  console.log('   • Breaks all grade records');
  console.log('   • Breaks all activity logs');
  console.log('   • Can cause data corruption');
  console.log('   • Very complex to implement safely');
  console.log('');
  console.log('✅ BETTER ALTERNATIVES:');
  console.log('');
  console.log('1. 🎯 Add a "displayOrder" field to User table:');
  console.log('   - Add displayOrder: Int to User model');
  console.log('   - Set displayOrder values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11');
  console.log('   - Sort users by displayOrder in your app');
  console.log('');
  console.log('2. 🎯 Use username for identification:');
  console.log('   - Keep current IDs as they are');
  console.log('   - Use usernames for display and logic');
  console.log('   - Much safer and easier');
  console.log('');
  console.log('3. 🎯 Create a user sequence mapping:');
  console.log('   - Add a "userSequence" field');
  console.log('   - Map your desired order to this field');
  console.log('   - Use for display purposes only');
}

async function main() {
  try {
    await showCurrentUsers();
    await showDesiredMapping();
    await checkCourseAssignments();
    showRecommendations();
    
    console.log('\n🤔 MY RECOMMENDATION:');
    console.log('Keep the current user IDs as they are.');
    console.log('Instead, add a "displayOrder" field to control the display sequence.');
    console.log('This is much safer and easier to maintain.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
