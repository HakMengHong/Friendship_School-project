const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function reviewDatabase() {
  console.log('\n' + '='.repeat(70))
  console.log('📊 DATABASE REVIEW - Current Data Analysis')
  console.log('='.repeat(70) + '\n')

  try {
    // 1. Check School Years
    console.log('📅 SCHOOL YEARS:')
    console.log('-'.repeat(70))
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { schoolYearId: 'desc' }
    })
    
    if (schoolYears.length === 0) {
      console.log('   ❌ No school years found!')
    } else {
      schoolYears.forEach((sy, index) => {
        console.log(`   ${index + 1}. ${sy.schoolYearCode} (ID: ${sy.schoolYearId})`)
      })
    }
    console.log(`   Total: ${schoolYears.length} school year(s)\n`)

    // 2. Check Semesters
    console.log('📚 SEMESTERS:')
    console.log('-'.repeat(70))
    const semesters = await prisma.semester.findMany({
      orderBy: { semesterId: 'asc' }
    })
    
    if (semesters.length === 0) {
      console.log('   ❌ No semesters found!')
    } else {
      semesters.forEach((sem, index) => {
        console.log(`   ${index + 1}. ${sem.semester || sem.semesterCode} (ID: ${sem.semesterId})`)
      })
    }
    console.log(`   Total: ${semesters.length} semester(s)\n`)

    // 3. Check Subjects
    console.log('📖 SUBJECTS:')
    console.log('-'.repeat(70))
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectName: 'asc' }
    })
    
    if (subjects.length === 0) {
      console.log('   ❌ No subjects found!')
    } else {
      // Group by grade level if possible or just list all
      console.log(`   Total subjects: ${subjects.length}`)
      console.log('   Subject list:')
      subjects.forEach((subject, index) => {
        console.log(`      ${index + 1}. ${subject.subjectName} (ID: ${subject.subjectId})`)
      })
    }
    console.log('')

    // 4. Check Courses
    console.log('🏫 COURSES (Classes):')
    console.log('-'.repeat(70))
    const courses = await prisma.course.findMany({
      include: {
        schoolYear: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: [
        { schoolYear: { schoolYearCode: 'desc' } },
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })
    
    if (courses.length === 0) {
      console.log('   ❌ No courses found!')
    } else {
      // Group by school year
      const coursesByYear = {}
      courses.forEach(course => {
        const year = course.schoolYear.schoolYearCode
        if (!coursesByYear[year]) {
          coursesByYear[year] = []
        }
        coursesByYear[year].push(course)
      })
      
      Object.entries(coursesByYear).forEach(([year, yearCourses]) => {
        console.log(`   📅 ${year}:`)
        yearCourses.forEach(course => {
          console.log(`      - ថ្នាក់ទី ${course.grade}${course.section} (${course.courseName})`)
          console.log(`        Students enrolled: ${course._count.enrollments}`)
        })
      })
    }
    console.log(`   Total: ${courses.length} course(s)\n`)

    // 5. Check Students and Enrollments
    console.log('👥 STUDENTS & ENROLLMENTS:')
    console.log('-'.repeat(70))
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                schoolYear: true
              }
            }
          }
        }
      }
    })
    
    if (students.length === 0) {
      console.log('   ❌ No students found!')
    } else {
      const enrolledStudents = students.filter(s => s.enrollments.length > 0)
      const notEnrolledStudents = students.filter(s => s.enrollments.length === 0)
      
      console.log(`   Total students: ${students.length}`)
      console.log(`   ✅ Enrolled: ${enrolledStudents.length}`)
      console.log(`   ⚠️  Not enrolled: ${notEnrolledStudents.length}`)
      
      if (enrolledStudents.length > 0) {
        console.log('\n   Students by grade level:')
        
        // Group by grade and section
        const byGrade = {}
        enrolledStudents.forEach(student => {
          student.enrollments.forEach(enrollment => {
            const grade = enrollment.course.grade
            const section = enrollment.course.section
            const key = `Grade ${grade}${section}`
            if (!byGrade[key]) {
              byGrade[key] = []
            }
            byGrade[key].push(student)
          })
        })
        
        Object.entries(byGrade).sort().forEach(([gradeSection, studs]) => {
          console.log(`      ${gradeSection}: ${studs.length} students`)
          // Show first 3 students as examples
          studs.slice(0, 3).forEach(s => {
            console.log(`         - ${s.lastName} ${s.firstName}`)
          })
          if (studs.length > 3) {
            console.log(`         ... and ${studs.length - 3} more`)
          }
        })
      }
      
      if (notEnrolledStudents.length > 0) {
        console.log('\n   ⚠️  Students NOT enrolled (will be skipped by grade script):')
        notEnrolledStudents.slice(0, 5).forEach(s => {
          console.log(`      - ${s.lastName} ${s.firstName}`)
        })
        if (notEnrolledStudents.length > 5) {
          console.log(`      ... and ${notEnrolledStudents.length - 5} more`)
        }
      }
    }
    console.log('')

    // 6. Check Teachers
    console.log('👨‍🏫 TEACHERS:')
    console.log('-'.repeat(70))
    const teachers = await prisma.user.findMany({
      where: {
        role: 'teacher'
      }
    })
    
    const activeTeachers = teachers.filter(t => t.status === 'active')
    const inactiveTeachers = teachers.filter(t => t.status !== 'active')
    
    if (teachers.length === 0) {
      console.log('   ❌ No teachers found!')
      console.log('   ⚠️  WARNING: Grade script requires at least one active teacher!')
    } else {
      console.log(`   Total teachers: ${teachers.length}`)
      console.log(`   ✅ Active: ${activeTeachers.length}`)
      console.log(`   ⚠️  Inactive: ${inactiveTeachers.length}`)
      
      if (activeTeachers.length > 0) {
        console.log('\n   Active teachers:')
        activeTeachers.forEach(t => {
          console.log(`      - ${t.firstname} ${t.lastname} (${t.username})`)
        })
      } else {
        console.log('\n   ⚠️  WARNING: No active teachers! Grade script will fail!')
      }
    }
    console.log('')

    // 7. Check Existing Grades
    console.log('📊 EXISTING GRADES:')
    console.log('-'.repeat(70))
    const grades = await prisma.grade.findMany({
      include: {
        student: true,
        subject: true,
        course: true,
        semester: true
      }
    })
    
    if (grades.length === 0) {
      console.log('   ✅ No grades found - database is clean for grade generation')
    } else {
      console.log(`   ⚠️  Found ${grades.length} existing grades`)
      
      // Group by semester and course
      const gradesBySemester = {}
      grades.forEach(grade => {
        const semesterName = grade.semester.semester || grade.semester.semesterCode
        if (!gradesBySemester[semesterName]) {
          gradesBySemester[semesterName] = {}
        }
        const courseName = grade.course.courseName
        if (!gradesBySemester[semesterName][courseName]) {
          gradesBySemester[semesterName][courseName] = []
        }
        gradesBySemester[semesterName][courseName].push(grade)
      })
      
      console.log('\n   Grades by semester and class:')
      Object.entries(gradesBySemester).forEach(([semester, courses]) => {
        console.log(`\n   ${semester}:`)
        Object.entries(courses).forEach(([courseName, courseGrades]) => {
          const studentCount = new Set(courseGrades.map(g => g.studentId)).size
          console.log(`      ${courseName}: ${courseGrades.length} grades for ${studentCount} students`)
        })
      })
    }
    console.log('')

    // 8. Summary and Recommendations
    console.log('='.repeat(70))
    console.log('💡 SUMMARY & RECOMMENDATIONS:')
    console.log('='.repeat(70))
    
    const issues = []
    const warnings = []
    const readyToGo = []
    
    // Check prerequisites
    if (schoolYears.length === 0) {
      issues.push('❌ No school years - Cannot run grade script')
    } else {
      readyToGo.push(`✅ School years available: ${schoolYears.map(sy => sy.schoolYearCode).join(', ')}`)
    }
    
    if (semesters.length === 0) {
      issues.push('❌ No semesters - Cannot run grade script')
    } else {
      readyToGo.push(`✅ Semesters available: ${semesters.map(s => s.semester || s.semesterCode).join(', ')}`)
    }
    
    if (subjects.length === 0) {
      issues.push('❌ No subjects - Cannot run grade script')
    } else {
      readyToGo.push(`✅ ${subjects.length} subjects available`)
    }
    
    if (activeTeachers.length === 0) {
      issues.push('❌ No active teachers - Cannot run grade script')
    } else {
      readyToGo.push(`✅ ${activeTeachers.length} active teacher(s) available`)
    }
    
    const enrolledStudents = students.filter(s => s.enrollments.length > 0)
    if (enrolledStudents.length === 0) {
      issues.push('❌ No enrolled students - No grades will be generated')
    } else {
      readyToGo.push(`✅ ${enrolledStudents.length} students enrolled and ready`)
    }
    
    if (students.filter(s => s.enrollments.length === 0).length > 0) {
      warnings.push(`⚠️  ${students.filter(s => s.enrollments.length === 0).length} students not enrolled - will be skipped`)
    }
    
    if (grades.length > 0) {
      warnings.push(`⚠️  ${grades.length} grades already exist - script will skip duplicates`)
    }
    
    console.log('')
    if (issues.length > 0) {
      console.log('🚫 ISSUES (Must fix before running):')
      issues.forEach(issue => console.log(`   ${issue}`))
      console.log('')
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS (Review but not critical):')
      warnings.forEach(warning => console.log(`   ${warning}`))
      console.log('')
    }
    
    if (readyToGo.length > 0) {
      console.log('✅ READY:')
      readyToGo.forEach(item => console.log(`   ${item}`))
      console.log('')
    }
    
    // Final recommendation
    if (issues.length === 0) {
      console.log('🎉 DATABASE IS READY!')
      console.log('')
      console.log('📝 Recommended next steps:')
      console.log('')
      console.log('   1. Test with a small subset first:')
      console.log('      Edit add-grades-auto.js and set:')
      console.log('         specificGrade: 9')
      console.log('         specificSection: "A"')
      console.log('         verbose: true')
      console.log('')
      console.log('   2. Run the test:')
      console.log('      node scripts/add-grades-auto.js')
      console.log('')
      console.log('   3. If test looks good, run for all students:')
      console.log('      Set specificGrade and specificSection back to null')
      console.log('      node scripts/add-grades-auto.js')
      console.log('')
      
      // Suggest specific configuration based on data
      const latestYear = schoolYears[0]?.schoolYearCode
      if (latestYear) {
        console.log('   📅 Suggested configuration:')
        console.log(`      specificSchoolYear: '${latestYear}'`)
      }
      
      // Show which grades are available
      const availableGrades = [...new Set(courses.map(c => c.grade))].sort((a, b) => parseInt(a) - parseInt(b))
      if (availableGrades.length > 0) {
        console.log(`      Available grades: ${availableGrades.join(', ')}`)
      }
      
      // Show estimated grades to be created
      const gradesPerStudent = subjects.length * semesters.length * 4 // 4 months average
      const estimatedTotal = enrolledStudents.length * gradesPerStudent
      console.log('')
      console.log(`   📊 Estimated grades to create: ~${estimatedTotal.toLocaleString()}`)
      console.log(`      (${enrolledStudents.length} students × ${subjects.length} subjects × ${semesters.length} semesters × ~4 months)`)
      
    } else {
      console.log('⛔ DATABASE NOT READY!')
      console.log('')
      console.log('   Please fix the issues above before running the grade script.')
    }
    
    console.log('')
    console.log('='.repeat(70))
    
  } catch (error) {
    console.error('\n❌ Error reviewing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the review
if (require.main === module) {
  reviewDatabase()
    .then(() => {
      console.log('\n✅ Review completed successfully!\n')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Review failed:', error)
      process.exit(1)
    })
}

module.exports = { reviewDatabase }

