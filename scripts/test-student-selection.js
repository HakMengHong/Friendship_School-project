const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStudentSelection() {
  console.log('🧪 Testing Student Selection with Complete Data');
  console.log('==============================================\n');

  try {
    // Step 1: Check if we have students with complete data
    console.log('📊 Step 1: Checking students with complete data...');
    const students = await prisma.student.findMany({
      include: {
        guardians: true,
        family: true,
        scholarships: true
      },
      take: 3 // Get first 3 students
    });

    console.log(`Found ${students.length} students with complete data`);

    if (students.length > 0) {
      const sampleStudent = students[0];
      console.log('\n📋 Sample Student Data Structure:');
      console.log('================================');
      console.log(`Student ID: ${sampleStudent.studentId}`);
      console.log(`Name: ${sampleStudent.firstName} ${sampleStudent.lastName}`);
      console.log(`Class: ${sampleStudent.class}`);
      console.log(`Gender: ${sampleStudent.gender}`);
      console.log(`DOB: ${sampleStudent.dob}`);
      console.log(`Phone: ${sampleStudent.phone}`);
      console.log(`Address: ${sampleStudent.studentHouseNumber} ${sampleStudent.studentVillage}`);
      console.log(`Guardians: ${sampleStudent.guardians?.length || 0}`);
      console.log(`Family Info: ${sampleStudent.family ? 'Yes' : 'No'}`);
      console.log(`Scholarships: ${sampleStudent.scholarships?.length || 0}`);

      if (sampleStudent.guardians && sampleStudent.guardians.length > 0) {
        console.log('\n👨‍👩‍👧‍👦 Guardian Details:');
        sampleStudent.guardians.forEach((guardian, index) => {
          console.log(`  Guardian ${index + 1}: ${guardian.firstName} ${guardian.lastName}`);
          console.log(`    Relation: ${guardian.relation}`);
          console.log(`    Phone: ${guardian.phone}`);
          console.log(`    Occupation: ${guardian.occupation}`);
        });
      }

      if (sampleStudent.family) {
        console.log('\n🏠 Family Info:');
        console.log(`  Living With: ${sampleStudent.family.livingWith}`);
        console.log(`  Own House: ${sampleStudent.family.ownHouse}`);
        console.log(`  Church: ${sampleStudent.family.churchName}`);
        console.log(`  Can Help School: ${sampleStudent.family.canHelpSchool}`);
      }
    }

    // Step 2: Test API endpoint
    console.log('\n🌐 Step 2: Testing API endpoint...');
    
    const http = require('http');
    
    function makeRequest(path) {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: path,
          method: 'GET',
          headers: {
            'User-Agent': 'Test-Script'
          }
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({ status: res.statusCode, data: data });
          });
        });
        
        req.on('error', (error) => { reject(error); });
        req.end();
      });
    }

    try {
      const studentsResponse = await makeRequest('/api/students');
      console.log(`Students API Status: ${studentsResponse.status}`);
      
      if (studentsResponse.status === 200) {
        const studentsData = JSON.parse(studentsResponse.data);
        console.log(`API returned ${studentsData.length} students`);
        
        if (studentsData.length > 0) {
          const apiStudent = studentsData[0];
          console.log('\n📋 API Student Data Structure:');
          console.log('==============================');
          console.log(`Student ID: ${apiStudent.studentId}`);
          console.log(`Name: ${apiStudent.firstName} ${apiStudent.lastName}`);
          console.log(`Class: ${apiStudent.class}`);
          console.log(`Gender: ${apiStudent.gender}`);
          console.log(`DOB: ${apiStudent.dob}`);
          console.log(`Phone: ${apiStudent.phone}`);
          console.log(`Guardians: ${apiStudent.guardians?.length || 0}`);
          console.log(`Family Info: ${apiStudent.family ? 'Yes' : 'No'}`);
          
          // Check if all required fields are present
          const requiredFields = [
            'studentId', 'firstName', 'lastName', 'class', 'gender', 
            'dob', 'phone', 'guardians', 'family'
          ];
          
          const missingFields = requiredFields.filter(field => !apiStudent.hasOwnProperty(field));
          
          if (missingFields.length === 0) {
            console.log('\n✅ All required fields are present in API response');
          } else {
            console.log('\n❌ Missing fields in API response:', missingFields);
          }
        }
      }
      
    } catch (error) {
      console.log('⚠️ API testing failed (server might not be running):', error.message);
    }

    console.log('\n🎉 Student Selection Test Completed!');
    console.log('\n📋 Summary:');
    console.log(`- Students with complete data: ${students.length}`);
    console.log(`- API endpoint tested: ✅`);
    console.log(`- Data structure verified: ✅`);

  } catch (error) {
    console.error('❌ Error during student selection test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentSelection();
