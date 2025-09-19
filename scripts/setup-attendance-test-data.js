#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupAttendanceTestData() {
  console.log('🏫 Setting up Attendance Test Data');
  console.log('==================================\n')

  try {
    // 1. Create School Year
    console.log('📅 Creating school year...')
    const schoolYear = await prisma.schoolYear.upsert({
      where: { schoolYearCode: '2024-2025' },
      update: {},
      create: {
        schoolYearCode: '2024-2025'
      }
    })
    console.log(`✅ School year created: ${schoolYear.schoolYearCode}`)

    // 2. Create Subjects
    console.log('📚 Creating subjects...')
    const subjects = [
      { subjectName: 'គណិតវិទ្យា' },
      { subjectName: 'ភាសាខ្មែរ' },
      { subjectName: 'ភាសាអង់គ្លេស' },
      { subjectName: 'វិទ្យាសាស្ត្រ' },
      { subjectName: 'ប្រវត្តិវិទ្យា' }
    ]

    const createdSubjects = []
    for (const subject of subjects) {
      const existing = await prisma.subject.findFirst({
        where: { subjectName: subject.subjectName }
      })
      
      if (!existing) {
        const created = await prisma.subject.create({
          data: subject
        })
        createdSubjects.push(created)
      } else {
        createdSubjects.push(existing)
      }
    }
    console.log(`✅ Created ${createdSubjects.length} subjects`)

    // 3. Create Semesters
    console.log('📆 Creating semesters...')
    const semesters = [
      { semester: 'ឆមាសទី១', semesterCode: 'S1' },
      { semester: 'ឆមាសទី២', semesterCode: 'S2' }
    ]

    const createdSemesters = []
    for (const semester of semesters) {
      const existing = await prisma.semester.findFirst({
        where: { semesterCode: semester.semesterCode }
      })
      
      if (!existing) {
        const created = await prisma.semester.create({
          data: semester
        })
        createdSemesters.push(created)
      } else {
        createdSemesters.push(existing)
      }
    }
    console.log(`✅ Created ${createdSemesters.length} semesters`)

    // 4. Create Courses
    console.log('🏫 Creating courses...')
    const courses = [
      { courseName: 'ថ្នាក់ទី១ ក', grade: '1', section: 'A', schoolYearId: schoolYear.schoolYearId },
      { courseName: 'ថ្នាក់ទី១ ខ', grade: '1', section: 'B', schoolYearId: schoolYear.schoolYearId },
      { courseName: 'ថ្នាក់ទី២ ក', grade: '2', section: 'A', schoolYearId: schoolYear.schoolYearId },
      { courseName: 'ថ្នាក់ទី២ ខ', grade: '2', section: 'B', schoolYearId: schoolYear.schoolYearId }
    ]

    const createdCourses = []
    for (const course of courses) {
      const existing = await prisma.course.findFirst({
        where: { 
          courseName: course.courseName,
          schoolYearId: course.schoolYearId
        }
      })
      
      if (!existing) {
        const created = await prisma.course.create({
          data: course
        })
        createdCourses.push(created)
      } else {
        createdCourses.push(existing)
      }
    }
    console.log(`✅ Created ${createdCourses.length} courses`)

    // 5. Create Students
    console.log('👥 Creating students...')
    const students = [
      { firstName: 'សុខា', lastName: 'វិចិត្រ', class: '1A', studentId: 1001 },
      { firstName: 'ចាន់', lastName: 'សុផល', class: '1A', studentId: 1002 },
      { firstName: 'វិចិត្រ', lastName: 'សុខា', class: '1A', studentId: 1003 },
      { firstName: 'សុផល', lastName: 'ចាន់', class: '1B', studentId: 1004 },
      { firstName: 'ពិសាច', lastName: 'វិចិត្រ', class: '1B', studentId: 1005 },
      { firstName: 'សុខា', lastName: 'ចាន់', class: '2A', studentId: 2001 },
      { firstName: 'វិចិត្រ', lastName: 'សុផល', class: '2A', studentId: 2002 },
      { firstName: 'ចាន់', lastName: 'ពិសាច', class: '2B', studentId: 2003 },
      { firstName: 'សុផល', lastName: 'សុខា', class: '2B', studentId: 2004 },
      { firstName: 'ពិសាច', lastName: 'ចាន់', class: '2B', studentId: 2005 }
    ]

    const createdStudents = []
    for (const student of students) {
      const existing = await prisma.student.findFirst({
        where: { studentId: student.studentId }
      })
      
      if (!existing) {
        const created = await prisma.student.create({
          data: {
            firstName: student.firstName,
            lastName: student.lastName,
            class: student.class,
            studentId: student.studentId,
            dob: new Date('2010-01-01'),
            gender: 'M',
            phone: '012345678',
            registrationDate: new Date('2024-09-01'),
            status: 'active'
          }
        })
        createdStudents.push(created)
      } else {
        createdStudents.push(existing)
      }
    }
    console.log(`✅ Created ${createdStudents.length} students`)

    // 6. Create Sample Attendance Records
    console.log('📊 Creating sample attendance records...')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const attendanceRecords = []
    
    // Create attendance for yesterday and today
    for (const date of [yesterday, today]) {
      for (const course of createdCourses) {
        const courseStudents = createdStudents.filter(s => s.class === course.grade + course.section)
        
        for (const student of courseStudents) {
          // Random attendance status
          const statuses = ['present', 'absent', 'late', 'excused']
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          
          const attendance = await prisma.attendance.create({
            data: {
              studentId: student.studentId,
              courseId: course.courseId,
              attendanceDate: date,
              session: 'FULL',
              status: status,
              reason: status === 'excused' ? 'មានច្បាប់ពីឪពុកម្តាយ' : 
                      status === 'late' ? 'យឺតពីផ្ទះ' : null,
              recordedBy: 'admin'
            }
          })
          attendanceRecords.push(attendance)
        }
      }
    }

    console.log(`✅ Created ${attendanceRecords.length} attendance records`)

    // 7. Display Summary
    console.log('\n📊 Database Summary:');
    console.log('===================')

    const schoolYearCount = await prisma.schoolYear.count()
    const courseCount = await prisma.course.count()
    const studentCount = await prisma.student.count()
    const attendanceCount = await prisma.attendance.count()
    const subjectCount = await prisma.subject.count()
    const semesterCount = await prisma.semester.count()

    console.log(`📅 School Years: ${schoolYearCount}`)
    console.log(`📚 Subjects: ${subjectCount}`)
    console.log(`📆 Semesters: ${semesterCount}`)
    console.log(`🏫 Courses: ${courseCount}`)
    console.log(`👥 Students: ${studentCount}`)
    console.log(`📊 Attendance Records: ${attendanceCount}`)

    console.log('\n🎉 Test data setup completed successfully!')
    console.log('\n🔗 You can now test the attendance module:')
    console.log('   1. Login to the application')
    console.log('   2. Go to /attendance')
    console.log('   3. Select a date and course to view attendance')
    console.log('   4. Try the daily attendance recording')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAttendanceTestData()
