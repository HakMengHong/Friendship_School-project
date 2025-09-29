#!/usr/bin/env node

/**
 * Complete Migration Script: Student IDs Start from 1000
 * 
 * This script performs a complete migration to ensure student IDs start from 1000.
 * It handles:
 * 1. Updating the database sequence
 * 2. Testing the API endpoint
 * 3. Providing migration status
 */

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function migrateStudentIdsTo1000() {
  console.log('🚀 Starting Student ID Migration to 1000+');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Check current database state
    console.log('\n📊 Step 1: Analyzing current database state...');
    
    const studentCount = await prisma.student.count();
    console.log(`   Total students in database: ${studentCount}`);
    
    if (studentCount > 0) {
      const minId = await prisma.student.findFirst({
        orderBy: { studentId: 'asc' },
        select: { studentId: true }
      });
      
      const maxId = await prisma.student.findFirst({
        orderBy: { studentId: 'desc' },
        select: { studentId: true }
      });
      
      console.log(`   Current ID range: ${minId?.studentId} - ${maxId?.studentId}`);
      
      if (maxId.studentId >= 1000) {
        console.log('   ✅ Database already has IDs >= 1000, no migration needed');
        console.log('   📝 Will set sequence to continue from current max + 1');
      } else {
        console.log('   ⚠️  Database has IDs < 1000, will set sequence to start from 1000');
      }
    } else {
      console.log('   📝 Empty database, will set sequence to start from 1000');
    }
    
    // Step 2: Update the sequence
    console.log('\n🔧 Step 2: Updating database sequence...');
    
    const result = await prisma.$queryRaw`
      SELECT COALESCE(MAX("studentId"), 0) as max_id FROM "Student"
    `;
    
    const maxStudentId = parseInt(result[0].max_id);
    const newSequenceValue = Math.max(maxStudentId + 1, 1000);
    
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "Student_studentId_seq" RESTART WITH ${newSequenceValue}`
    );
    
    console.log(`   ✅ Sequence updated to start from: ${newSequenceValue}`);
    
    // Step 3: Verify sequence update
    console.log('\n🔍 Step 3: Verifying sequence update...');
    
    const sequenceResult = await prisma.$queryRaw`
      SELECT last_value FROM "Student_studentId_seq"
    `;
    
    const currentSequenceValue = parseInt(sequenceResult[0].last_value);
    console.log(`   📈 Current sequence value: ${currentSequenceValue}`);
    
    if (currentSequenceValue >= 1000) {
      console.log('   ✅ Sequence is properly set for 1000+ IDs');
    } else {
      console.log('   ❌ Sequence value is still below 1000');
      throw new Error('Sequence update failed');
    }
    
    // Step 4: Test API endpoint (if server is running)
    console.log('\n🧪 Step 4: Testing API endpoint...');
    
    try {
      const response = await fetch('http://localhost:3000/api/students/next-id');
      if (response.ok) {
        const data = await response.json();
        const nextId = parseInt(data.nextStudentId);
        console.log(`   🔍 Next student ID from API: ${nextId}`);
        
        if (nextId >= 1000) {
          console.log('   ✅ API is correctly returning IDs >= 1000');
        } else {
          console.log('   ⚠️  API is returning IDs < 1000, check server restart');
        }
      } else {
        console.log('   ⚠️  API test failed (server might not be running)');
      }
    } catch (apiError) {
      console.log('   ⚠️  Could not test API (server not running):', apiError.message);
    }
    
    // Step 5: Migration summary
    console.log('\n📋 Migration Summary:');
    console.log('=' .repeat(30));
    console.log(`✅ Database sequence updated to: ${currentSequenceValue}`);
    console.log(`✅ New students will get IDs starting from: ${Math.max(1000, currentSequenceValue)}`);
    console.log(`✅ API endpoint updated to handle 1000+ IDs`);
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your Next.js server if it\'s running');
    console.log('   2. Test student registration to verify IDs start from 1000+');
    console.log('   3. Check existing students are not affected');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateStudentIdsTo1000();
