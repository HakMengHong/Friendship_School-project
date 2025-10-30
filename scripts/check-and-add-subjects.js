#!/usr/bin/env node

/**
 * Check and Add Subjects Script
 * 
 * This script will:
 * 1. Check what subjects currently exist in the database
 * 2. Add all 29 subjects from the combined list
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// All 29 subjects from the combined list
const ALL_SUBJECTS = [
  'កុំព្យូទ័រ',
  'គណិតវិទ្យា',
  'គីមីវិទ្យា',
  'គេហកិច្ច',
  'គំនូរ',
  'ចំរៀង-របាំ',
  'ជីវវិទ្យា',
  'តែងសេចក្តី',
  'ធរណីមាត្រ',
  'នព្វន្ត',
  'ប្រវត្តិវិទ្យា',
  'ផែនដីវិទ្យា',
  'ភាសាខ្មែរ',
  'ភូមិវិទ្យា',
  'មាត្រាប្រពន្ធ័',
  'មេសូត្រ',
  'រូបវិទ្យា',
  'រឿងនិទាន',
  'រៀនអាន',
  'វិទ្យាសាស្ត្រ',
  'វិទ្យាសាស្ត្រនិងសិក្សាសង្គម',
  'វេយ្យាករណ៏',
  'សរសេរតាមអាន',
  'សីលធម៌-ពលរដ្ឋវិទ្យា',
  'សំណេរ',
  'ហត្ថកម្ម',
  'អក្សរផ្ចង់',
  'អង់គ្លេស',
  'អប់រំភាយ'
];

// Check current subjects in database
async function checkCurrentSubjects() {
  console.log('🔍 Checking current subjects in database...');
  
  try {
    const existingSubjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    });
    
    console.log(`📊 Found ${existingSubjects.length} existing subjects:`);
    existingSubjects.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.subjectName} (ID: ${subject.subjectId})`);
    });
    
    return existingSubjects;
  } catch (error) {
    console.error('❌ Error checking subjects:', error);
    throw error;
  }
}

// Add missing subjects
async function addMissingSubjects(existingSubjects) {
  console.log('\n📝 Adding missing subjects...');
  
  const existingSubjectNames = existingSubjects.map(s => s.subjectName);
  const missingSubjects = ALL_SUBJECTS.filter(subject => !existingSubjectNames.includes(subject));
  
  console.log(`📊 Subjects to add: ${missingSubjects.length}`);
  
  if (missingSubjects.length === 0) {
    console.log('✅ All subjects already exist in database!');
    return [];
  }
  
  console.log('\n📋 Missing subjects:');
  missingSubjects.forEach((subject, index) => {
    console.log(`   ${index + 1}. ${subject}`);
  });
  
  const addedSubjects = [];
  
  for (const subjectName of missingSubjects) {
    try {
      const newSubject = await prisma.subject.create({
        data: {
          subjectName: subjectName
        }
      });
      
      addedSubjects.push(newSubject);
      console.log(`✅ Added: ${newSubject.subjectName} (ID: ${newSubject.subjectId})`);
    } catch (error) {
      console.error(`❌ Error adding subject ${subjectName}:`, error);
    }
  }
  
  return addedSubjects;
}

// Verify final subject count
async function verifySubjects() {
  console.log('\n🔍 Verifying final subject count...');
  
  try {
    const allSubjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    });
    
    console.log(`📊 Total subjects in database: ${allSubjects.length}`);
    console.log(`📊 Expected subjects: ${ALL_SUBJECTS.length}`);
    
    if (allSubjects.length === ALL_SUBJECTS.length) {
      console.log('✅ All subjects successfully added!');
    } else {
      console.log('⚠️ Subject count mismatch - some subjects may be missing');
    }
    
    console.log('\n📋 Final subject list:');
    allSubjects.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.subjectName} (ID: ${subject.subjectId})`);
    });
    
    return allSubjects;
  } catch (error) {
    console.error('❌ Error verifying subjects:', error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting subject check and add process...');
  console.log(`📚 Target: ${ALL_SUBJECTS.length} subjects`);
  console.log('');
  
  try {
    // Step 1: Check current subjects
    const existingSubjects = await checkCurrentSubjects();
    
    // Step 2: Add missing subjects
    const addedSubjects = await addMissingSubjects(existingSubjects);
    
    // Step 3: Verify final count
    const finalSubjects = await verifySubjects();
    
    console.log('\n🎉 Subject management completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Existing subjects: ${existingSubjects.length}`);
    console.log(`   Added subjects: ${addedSubjects.length}`);
    console.log(`   Total subjects: ${finalSubjects.length}`);
    
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

module.exports = {
  checkCurrentSubjects,
  addMissingSubjects,
  verifySubjects,
  ALL_SUBJECTS
};
