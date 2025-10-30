const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Calculate age from date of birth
function calculateAge(dob) {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

async function checkStudentAges() {
  console.log('🔍 Checking student ages...\n')
  
  try {
    const students = await prisma.student.findMany({
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        dob: true,
        class: true,
        enrollments: {
          include: {
            course: true
          }
        }
      }
    })
    
    console.log(`📊 Total students: ${students.length}\n`)
    
    // Find students with suspicious ages
    const suspiciousAges = []
    const invalidDates = []
    
    for (const student of students) {
      if (!student.dob) {
        invalidDates.push({
          id: student.studentId,
          name: `${student.lastName} ${student.firstName}`,
          class: student.class,
          issue: 'No birth date'
        })
        continue
      }
      
      const age = calculateAge(student.dob)
      
      // School students should typically be 4-25 years old
      if (age < 4 || age > 25) {
        suspiciousAges.push({
          id: student.studentId,
          name: `${student.lastName} ${student.firstName}`,
          class: student.class,
          dob: student.dob.toISOString().split('T')[0],
          age: age,
          issue: age < 4 ? 'Too young' : 'Too old'
        })
      }
    }
    
    // Display results
    if (suspiciousAges.length > 0) {
      console.log('⚠️  Students with suspicious ages:\n')
      console.log('ID\tName\t\t\tClass\tDOB\t\tAge\tIssue')
      console.log('─'.repeat(80))
      suspiciousAges.forEach(s => {
        console.log(`${s.id}\t${s.name.padEnd(20)}\t${s.class}\t${s.dob}\t${s.age}\t${s.issue}`)
      })
      console.log('')
    }
    
    if (invalidDates.length > 0) {
      console.log('❌ Students with missing birth dates:\n')
      console.log('ID\tName\t\t\tClass\tIssue')
      console.log('─'.repeat(60))
      invalidDates.forEach(s => {
        console.log(`${s.id}\t${s.name.padEnd(20)}\t${s.class}\t${s.issue}`)
      })
      console.log('')
    }
    
    // Summary
    console.log('\n📋 Summary:')
    console.log(`✅ Normal ages: ${students.length - suspiciousAges.length - invalidDates.length}`)
    console.log(`⚠️  Suspicious ages: ${suspiciousAges.length}`)
    console.log(`❌ Missing dates: ${invalidDates.length}`)
    
    if (suspiciousAges.length > 0 || invalidDates.length > 0) {
      console.log('\n💡 Recommendation:')
      console.log('   Please check and correct these birth dates in the database.')
      console.log('   Typical school ages should be between 4-25 years old.')
      console.log('\n   To fix manually, you can update via the student-info page')
      console.log('   or run SQL updates in the database.')
    }
    
  } catch (error) {
    console.error('❌ Error checking student ages:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  checkStudentAges()
}

module.exports = { checkStudentAges }

