const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSequences() {
  console.log('🔧 Fixing auto-increment sequences...\n')
  
  try {
    // List of tables with auto-increment IDs
    const tables = [
      { table: 'Enrollment', idColumn: 'enrollmentId', sequence: 'Enrollment_enrollmentId_seq' },
      { table: 'Student', idColumn: 'studentId', sequence: 'Student_studentId_seq' },
      { table: 'User', idColumn: 'userId', sequence: 'User_userId_seq' },
      { table: 'Course', idColumn: 'courseId', sequence: 'Course_courseId_seq' },
      { table: 'Subject', idColumn: 'subjectId', sequence: 'Subject_subjectId_seq' },
      { table: 'Grade', idColumn: 'gradeId', sequence: 'Grade_gradeId_seq' },
      { table: 'Guardian', idColumn: 'guardianId', sequence: 'Guardian_guardianId_seq' },
      { table: 'FamilyInfo', idColumn: 'familyinfoId', sequence: 'FamilyInfo_familyinfoId_seq' },
      { table: 'Scholarship', idColumn: 'scholarshipId', sequence: 'Scholarship_scholarshipId_seq' },
      { table: 'SchoolYear', idColumn: 'schoolYearId', sequence: 'SchoolYear_schoolYearId_seq' },
      { table: 'Semester', idColumn: 'semesterId', sequence: 'Semester_semesterId_seq' },
      { table: 'Attendance', idColumn: 'attendanceId', sequence: 'Attendance_attendanceId_seq' },
      { table: 'ActivityLog', idColumn: 'id', sequence: 'ActivityLog_id_seq' }
    ]

    for (const { table, idColumn, sequence } of tables) {
      try {
        // Get the current max ID
        const result = await prisma.$queryRawUnsafe(
          `SELECT MAX("${idColumn}") as max_id FROM "${table}"`
        )
        
        const maxId = result[0]?.max_id || 0
        
        // Get current sequence value
        const currentSeq = await prisma.$queryRawUnsafe(
          `SELECT last_value FROM "${sequence}"`
        )
        
        const currentValue = Number(currentSeq[0]?.last_value || 0)
        
        if (maxId > currentValue) {
          // Reset the sequence
          await prisma.$queryRawUnsafe(
            `SELECT setval('"${sequence}"', ${maxId}, true)`
          )
          
          console.log(`✅ ${table}: Fixed sequence (was: ${currentValue}, now: ${maxId})`)
        } else {
          console.log(`✓  ${table}: Sequence OK (${currentValue})`)
        }
      } catch (error) {
        console.log(`⚠️  ${table}: Could not check/fix sequence - ${error.message}`)
      }
    }
    
    console.log('\n🎉 Sequence fix completed!')
    
  } catch (error) {
    console.error('❌ Error fixing sequences:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  fixSequences()
}

module.exports = { fixSequences }

