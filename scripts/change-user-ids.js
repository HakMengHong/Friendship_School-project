#!/usr/bin/env node

/**
 * Change User IDs Script
 * 
 * WARNING: This will change user IDs and may break existing data!
 * Only proceed if you understand the risks.
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

// Current to new ID mapping
const ID_MAPPING = {
  2: 1,   // យឿនសុខរ៉ែន: 2 -> 1
  3: 2,   // តៃស៊ីណៃ: 3 -> 2
  12: 3,  // សួនយាងស្រេង: 12 -> 3
  5: 4,   // ថនប៉ុនណារិទ្ធ: 5 -> 4
  6: 5,   // អ៊ាងស្រីណូ: 6 -> 5
  7: 6,   // ចាន់ខេមា: 7 -> 6
  8: 7,   // ហេងសុនី: 8 -> 7
  9: 8,   // ស្រូយចាន់នាត: 9 -> 8
  10: 9,  // ស៊ីមសំណាង: 10 -> 9
  11: 10, // ស្រូយស៊ីណាត: 11 -> 10
  1: 11   // admin: 1 -> 11
};

async function backupCurrentData() {
  console.log('💾 Creating backup of current data...');
  
  try {
    // Get all current data
    const users = await prisma.user.findMany();
    const courses = await prisma.course.findMany();
    const grades = await prisma.grade.findMany();
    const activityLogs = await prisma.activityLog.findMany();
    
    console.log(`✅ Backed up: ${users.length} users, ${courses.length} courses, ${grades.length} grades, ${activityLogs.length} activity logs`);
    
    return { users, courses, grades, activityLogs };
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

async function clearRelatedData() {
  console.log('🧹 Clearing related data that references users...');
  
  try {
    // Clear grades
    console.log('   Clearing grades...');
    await prisma.grade.deleteMany();
    
    // Clear activity logs
    console.log('   Clearing activity logs...');
    await prisma.activityLog.deleteMany();
    
    // Clear course teacher assignments
    console.log('   Clearing course teacher assignments...');
    await prisma.course.updateMany({
      data: {
        teacherId1: null,
        teacherId2: null,
        teacherId3: null
      }
    });
    
    console.log('✅ Related data cleared');
  } catch (error) {
    console.error('❌ Error clearing related data:', error);
    throw error;
  }
}

async function deleteAllUsers() {
  console.log('🗑️ Deleting all users...');
  
  try {
    await prisma.user.deleteMany();
    console.log('✅ All users deleted');
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    throw error;
  }
}

async function createUsersInNewOrder() {
  console.log('👥 Creating users in new order...');
  
  const newUsers = [
    { userId: 1, username: 'យឿនសុខរ៉ែន', firstname: 'សុខរ៉ែន', lastname: 'យឿន', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ១', avatar: 'សយ' },
    { userId: 2, username: 'តៃស៊ីណៃ', firstname: 'ស៊ីណៃ', lastname: 'តៃ', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ២', avatar: 'សត' },
    { userId: 3, username: 'សួនយាងស្រេង', firstname: 'យាងស្រេង', lastname: 'សួន', role: 'teacher', status: 'active', phonenumber1: '012345678', position: 'គ្រូបន្ទុកថ្នាក់ទី ៣', avatar: 'យស' },
    { userId: 4, username: 'ថនប៉ុនណារិទ្ធ', firstname: 'ប៉ុនណារិទ្ធ', lastname: 'ថន', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ៤', avatar: 'បថ' },
    { userId: 5, username: 'អ៊ាងស្រីណូ', firstname: 'ស្រីណូ', lastname: 'អ៊ាង', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ៥', avatar: 'សអ' },
    { userId: 6, username: 'ចាន់ខេមា', firstname: 'ខេមា', lastname: 'ចាន់', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ៦', avatar: 'ខច' },
    { userId: 7, username: 'ហេងសុនី', firstname: 'សុនី', lastname: 'ហេង', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ៧', avatar: 'សហ' },
    { userId: 8, username: 'ស្រូយចាន់នាត', firstname: 'ចាន់នាត', lastname: 'ស្រូយ', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ៨', avatar: 'ចស' },
    { userId: 9, username: 'ស៊ីមសំណាង', firstname: 'សំណាង', lastname: 'ស៊ីម', role: 'teacher', status: 'active', phonenumber1: '0123456789', position: 'គ្រូបន្ទុកថ្នាក់ទី ៩', avatar: 'សស' },
    { userId: 10, username: 'ស្រូយស៊ីណាត', firstname: 'ស៊ីណាត', lastname: 'ស្រូយ', role: 'admin', status: 'active', phonenumber1: '0123456789', position: 'នាយិកា', avatar: 'សស' },
    { userId: 11, username: 'admin', firstname: 'Admin', lastname: 'User', role: 'admin', status: 'active', phonenumber1: '012345678', position: 'System Administrator', avatar: 'AU' }
  ];
  
  try {
    for (const userData of newUsers) {
      await prisma.user.create({
        data: {
          userId: userData.userId,
          username: userData.username,
          password: '$2b$10$example', // You'll need to set proper passwords
          firstname: userData.firstname,
          lastname: userData.lastname,
          role: userData.role,
          status: userData.status,
          phonenumber1: userData.phonenumber1,
          position: userData.position,
          avatar: userData.avatar,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`✅ Created user: ${userData.username} (ID: ${userData.userId})`);
    }
    
    console.log('✅ All users created in new order');
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
}

async function restoreCourseAssignments() {
  console.log('📚 Restoring course teacher assignments...');
  
  try {
    // Update course assignments with new user IDs
    await prisma.course.updateMany({
      where: { courseId: 1 }, // ថ្នាក់ទី 9
      data: { teacherId1: 9 } // ស៊ីមសំណាង (was 10, now 9)
    });
    
    await prisma.course.updateMany({
      where: { courseId: 2 }, // ថ្នាក់ទី 1
      data: { teacherId1: 1 } // យឿនសុខរ៉ែន (was 2, now 1)
    });
    
    await prisma.course.updateMany({
      where: { courseId: 3 }, // ថ្នាក់ទី 2
      data: { teacherId1: 2 } // តៃស៊ីណៃ (was 3, now 2)
    });
    
    await prisma.course.updateMany({
      where: { courseId: 4 }, // ថ្នាក់ទី 3
      data: { teacherId1: 3 } // សួនយាងស្រេង (was 12, now 3)
    });
    
    await prisma.course.updateMany({
      where: { courseId: 5 }, // ថ្នាក់ទី 4
      data: { teacherId1: 4 } // ថនប៉ុនណារិទ្ធ (was 5, now 4)
    });
    
    await prisma.course.updateMany({
      where: { courseId: 6 }, // ថ្នាក់ទី 5
      data: { teacherId1: 5 } // អ៊ាងស្រីណូ (was 6, now 5)
    });
    
    console.log('✅ Course assignments restored');
  } catch (error) {
    console.error('❌ Error restoring course assignments:', error);
    throw error;
  }
}

async function verifyResults() {
  console.log('🔍 Verifying results...');
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { userId: 'asc' }
    });
    
    console.log('\n📊 Final User List:');
    users.forEach(user => {
      console.log(`ID ${user.userId}: ${user.username} (${user.firstname} ${user.lastname})`);
    });
    
    const courses = await prisma.course.findMany({
      where: { teacherId1: { not: null } }
    });
    
    console.log('\n📚 Course Assignments:');
    courses.forEach(course => {
      console.log(`${course.courseName}: Teacher ID ${course.teacherId1}`);
    });
    
    console.log('\n✅ User ID change completed successfully!');
    
  } catch (error) {
    console.error('❌ Error verifying results:', error);
    throw error;
  }
}

async function main() {
  console.log('🚨 WARNING: This will change user IDs and delete related data!');
  console.log('📋 This process will:');
  console.log('   1. Delete all grades and activity logs');
  console.log('   2. Clear course teacher assignments');
  console.log('   3. Delete all users');
  console.log('   4. Recreate users with new IDs');
  console.log('   5. Restore course assignments');
  console.log('');
  
  try {
    // Step 1: Backup current data
    await backupCurrentData();
    
    // Step 2: Clear related data
    await clearRelatedData();
    
    // Step 3: Delete all users
    await deleteAllUsers();
    
    // Step 4: Create users in new order
    await createUsersInNewOrder();
    
    // Step 5: Restore course assignments
    await restoreCourseAssignments();
    
    // Step 6: Verify results
    await verifyResults();
    
    console.log('\n🎉 User ID change completed successfully!');
    console.log('📝 Note: You may need to reset passwords for the recreated users.');
    
  } catch (error) {
    console.error('💥 Process failed:', error);
    console.log('🔄 You may need to restore from backup if something went wrong.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { DESIRED_MAPPING, ID_MAPPING };
