const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSemestersAndEnrollments() {
  try {
    console.log('📅 Starting to add semesters and enrollments...\n');

    // Add Semesters
    console.log('📅 Adding Semesters...');
    const semesters = [
      { semester: 'Semester 1', semesterCode: 'S1-2024-2025' },
      { semester: 'Semester 2', semesterCode: 'S2-2024-2025' },
      { semester: 'Semester 1', semesterCode: 'S1-2023-2024' },
      { semester: 'Semester 2', semesterCode: 'S2-2023-2024' }
    ];

    const createdSemesters = [];
    for (const semester of semesters) {
      try {
        const existing = await prisma.semester.findUnique({
          where: { semesterCode: semester.semesterCode }
        });
        
        if (existing) {
          createdSemesters.push(existing);
          console.log(`✅ Semester found: ${existing.semester} (${existing.semesterCode})`);
        } else {
          const created = await prisma.semester.create({
            data: semester
          });
          createdSemesters.push(created);
          console.log(`➕ Semester created: ${created.semester} (${created.semesterCode})`);
        }
      } catch (error) {
        console.error(`❌ Error creating semester ${semester.semesterCode}:`, error.message);
      }
    }

    // Get students and courses for enrollment
    console.log('\n👥 Getting students and courses for enrollment...');
    const students = await prisma.student.findMany({
      where: { schoolYear: { in: ['2023-2024', '2024-2025'] } }
    });
    
    const courses = await prisma.course.findMany({
      include: { schoolYear: true }
    });

    console.log(`   Found ${students.length} students and ${courses.length} courses`);

    // Create enrollments
    console.log('\n📝 Creating enrollments...');
    let enrollmentCount = 0;
    
    for (const student of students) {
      try {
        // Find a course that matches the student's grade and school year
        const matchingCourse = courses.find(course => 
          course.grade === student.class && 
          course.schoolYear.schoolYearCode === student.schoolYear
        );

        if (matchingCourse) {
          // Check if enrollment already exists
          const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
              studentId: student.studentId,
              courseId: matchingCourse.courseId
            }
          });

          if (!existingEnrollment) {
            await prisma.enrollment.create({
              data: {
                studentId: student.studentId,
                courseId: matchingCourse.courseId,
                drop: false
              }
            });
            enrollmentCount++;
            console.log(`✅ Enrolled ${student.firstName} ${student.lastName} in Grade ${student.class} (${student.schoolYear})`);
          } else {
            console.log(`ℹ️  ${student.firstName} ${student.lastName} already enrolled in Grade ${student.class}`);
          }
        } else {
          console.log(`⚠️  No matching course found for ${student.firstName} ${student.lastName} (Grade ${student.class}, ${student.schoolYear})`);
        }
      } catch (error) {
        console.error(`❌ Error enrolling student ${student.firstName} ${student.lastName}:`, error.message);
      }
    }

    // Create some sample grades
    console.log('\n📊 Creating sample grades...');
    let gradeCount = 0;
    
    // Get some students and subjects for grades
    const sampleStudents = students.slice(0, 10); // First 10 students
    const sampleSubjects = await prisma.subject.findMany({
      where: {
        subjectName: {
          in: ['គណិតវិទ្យា', 'ភាសា​ខ្មែរ', 'អង់គ្លេស', 'វិទ្យាសាស្រ្ត']
        }
      }
    });

    for (const student of sampleStudents) {
      for (const subject of sampleSubjects) {
        try {
          // Find matching course and semester
          const matchingCourse = courses.find(course => 
            course.grade === student.class && 
            course.schoolYear.schoolYearCode === student.schoolYear
          );

          if (matchingCourse && createdSemesters.length > 0) {
            const semester = createdSemesters[0]; // Use first semester
            
            // Check if grade already exists
            const existingGrade = await prisma.grade.findFirst({
              where: {
                studentId: student.studentId,
                subjectId: subject.subjectId,
                courseId: matchingCourse.courseId,
                semesterId: semester.semesterId
              }
            });

            if (!existingGrade) {
              const gradeValue = Math.floor(Math.random() * 20) + 80; // Random grade 80-100
              const gradeCode = `G${student.studentId}-${subject.subjectId}-${matchingCourse.courseId}-${semester.semesterId}`;
              
              await prisma.grade.create({
                data: {
                  studentId: student.studentId,
                  subjectId: subject.subjectId,
                  courseId: matchingCourse.courseId,
                  semesterId: semester.semesterId,
                  gradeDate: new Date(),
                  grade: gradeValue,
                  gradeType: 'exam',
                  gradeCode: gradeCode,
                  user: 'admin'
                }
              });
              gradeCount++;
              console.log(`✅ Grade ${gradeValue} for ${student.firstName} ${student.lastName} in ${subject.subjectName}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error creating grade for ${student.firstName} ${student.lastName} in ${subject.subjectName}:`, error.message);
        }
      }
    }

    // Create some sample attendance records
    console.log('\n✅ Creating sample attendance records...');
    let attendanceCount = 0;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const student of students.slice(0, 15)) { // First 15 students
      try {
        // Create attendance for today
        await prisma.attendance.create({
          data: {
            studentId: student.studentId,
            date: today,
            session: 'FULL',
            status: 'present',
            recordedBy: 'admin'
          }
        });
        attendanceCount++;
        
        // Create attendance for yesterday
        await prisma.attendance.create({
          data: {
            studentId: student.studentId,
            date: yesterday,
            session: 'FULL',
            status: 'present',
            recordedBy: 'admin'
          }
        });
        attendanceCount++;
        
      } catch (error) {
        console.error(`❌ Error creating attendance for ${student.firstName} ${student.lastName}:`, error.message);
      }
    }

    console.log('\n🎉 Semesters and enrollments creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Semesters: ${createdSemesters.length}`);
    console.log(`   - Enrollments: ${enrollmentCount}`);
    console.log(`   - Grades: ${gradeCount}`);
    console.log(`   - Attendance records: ${attendanceCount}`);

  } catch (error) {
    console.error('❌ Error in addSemestersAndEnrollments function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSemestersAndEnrollments();
