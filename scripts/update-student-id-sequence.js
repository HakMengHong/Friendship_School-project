#!/usr/bin/env node

/**
 * Update Student ID Sequence to Start from 1000
 * 
 * This script ensures that new student IDs will start from 1000.
 * It handles both empty databases and databases with existing students.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateStudentIdSequence() {
  try {
    console.log('🔄 Updating Student ID sequence to start from 1000...');
    
    // Get the maximum student ID from the database
    const result = await prisma.$queryRaw`
      SELECT COALESCE(MAX("studentId"), 0) as max_id FROM "Student"
    `;
    
    const maxStudentId = parseInt(result[0].max_id);
    console.log(`📊 Current maximum student ID: ${maxStudentId}`);
    
    let newSequenceValue;
    
    if (maxStudentId < 1000) {
      // No students or all IDs are less than 1000, start from 1000
      newSequenceValue = 1000;
      console.log('✅ Setting sequence to start from 1000');
    } else {
      // There are students with IDs >= 1000, continue from max + 1
      newSequenceValue = maxStudentId + 1;
      console.log(`✅ Setting sequence to continue from ${newSequenceValue}`);
    }
    
    // Update the sequence
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "Student_studentId_seq" RESTART WITH ${newSequenceValue}`
    );
    
    // Verify the sequence value
    const sequenceResult = await prisma.$queryRaw`
      SELECT last_value FROM "Student_studentId_seq"
    `;
    
    const currentSequenceValue = parseInt(sequenceResult[0].last_value);
    console.log(`🎯 Sequence updated successfully!`);
    console.log(`📈 Current sequence value: ${currentSequenceValue}`);
    
    if (currentSequenceValue >= 1000) {
      console.log('✅ Student IDs will now start from 1000 or higher');
    } else {
      console.log('⚠️  Warning: Sequence value is still below 1000');
    }
    
    // Test the next ID generation
    console.log('\n🧪 Testing next student ID generation...');
    const testResponse = await fetch('http://localhost:3000/api/students/next-id');
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`🔍 Next student ID would be: ${testData.nextStudentId}`);
    } else {
      console.log('⚠️  Could not test API (server might not be running)');
    }
    
  } catch (error) {
    console.error('❌ Error updating student ID sequence:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateStudentIdSequence();
