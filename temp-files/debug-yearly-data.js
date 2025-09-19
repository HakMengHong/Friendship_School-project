const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugYearlyData() {
  try {
    console.log('🔍 Debugging Yearly Report Data...\n')
    
    // Check what semesters exist
    const semesters = await prisma.semester.findMany({
      select: {
        semesterId: true,
        semester: true,
        semesterCode: true
      }
    })
    console.log('📅 Available Semesters:')
    semesters.forEach(sem => {
      console.log(`  - ID: ${sem.semesterId}, Name: "${sem.semester}", Code: "${sem.semesterCode}"`)
    })
    console.log()
    
    // Check for grades with semester 1 and 2
    const semester1Grades = await prisma.grade.findMany({
      where: {
        semester: {
          semester: 'ឆមាសទី ១'
        }
      },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            class: true
          }
        },
        course: {
          select: {
            courseId: true,
            grade: true,
            section: true
          }
        }
      },
      take: 5
    })
    
    console.log(`📊 Semester 1 Grades Found: ${semester1Grades.length}`)
    if (semester1Grades.length > 0) {
      console.log('Sample Semester 1 grades:')
      semester1Grades.forEach(grade => {
        console.log(`  - Student: ${grade.student.firstName} ${grade.student.lastName} (${grade.student.class})`)
        console.log(`    Course: ${grade.course.grade}${grade.course.section} (ID: ${grade.course.courseId})`)
        console.log(`    Grade: ${grade.grade}`)
        console.log('    ---')
      })
    }
    
    const semester2Grades = await prisma.grade.findMany({
      where: {
        semester: {
          semester: 'ឆមាសទី ២'
        }
      },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            class: true
          }
        },
        course: {
          select: {
            courseId: true,
            grade: true,
            section: true
          }
        }
      },
      take: 5
    })
    
    console.log(`\n📊 Semester 2 Grades Found: ${semester2Grades.length}`)
    if (semester2Grades.length > 0) {
      console.log('Sample Semester 2 grades:')
      semester2Grades.forEach(grade => {
        console.log(`  - Student: ${grade.student.firstName} ${grade.student.lastName} (${grade.student.class})`)
        console.log(`    Course: ${grade.course.grade}${grade.course.section} (ID: ${grade.course.courseId})`)
        console.log(`    Grade: ${grade.grade}`)
        console.log('    ---')
      })
    }
    
    // Check specific course (Grade 5A - courseId 28)
    console.log('\n🎯 Checking Course 28 (Grade 5A) specifically:')
    const course28Grades = await prisma.grade.findMany({
      where: {
        courseId: 28
      },
      include: {
        semester: true,
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    console.log(`📚 Course 28 has ${course28Grades.length} grades`)
    if (course28Grades.length > 0) {
      const sem1Count = course28Grades.filter(g => g.semester.semester === 'ឆមាសទី ១').length
      const sem2Count = course28Grades.filter(g => g.semester.semester === 'ឆមាសទី ២').length
      console.log(`  - Semester 1: ${sem1Count} grades`)
      console.log(`  - Semester 2: ${sem2Count} grades`)
      
      // Show sample grades
      const sampleGrades = course28Grades.slice(0, 3)
      sampleGrades.forEach(grade => {
        console.log(`  - ${grade.student.firstName} ${grade.student.lastName}: ${grade.grade} (${grade.semester.semester})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error debugging yearly data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugYearlyData()
