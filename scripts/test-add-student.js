const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAddStudent() {
  console.log('🧪 Testing Student Addition');
  console.log('==========================\n');

  try {
    // Step 1: Check current student count
    console.log('📊 Step 1: Checking current student count...');
    const currentStudents = await prisma.student.findMany();
    console.log(`Current students: ${currentStudents.length}`);

    // Step 2: Add 1 test student
    console.log('\n👤 Step 2: Adding 1 test student...');
    
    const testStudent = await prisma.student.create({
      data: {
        firstName: 'តេស្ត',
        lastName: 'សិស្ស',
        gender: 'ប្រុស',
        dob: new Date('2010-05-15'),
        class: 'ថ្នាក់ទី 5',
        phone: '012345678',
        registrationDate: new Date(),
        status: 'active',
        religion: 'គ្រិស្តសាសនា',
        health: 'ល្អ',
        emergencyContact: '098765432',
        needsClothes: false,
        needsMaterials: false,
        needsTransport: false,
        registerToStudy: true,
        vaccinated: true,
        schoolYear: '2024-2025',
        studentBirthDistrict: 'ភ្នំពេញ',
        studentDistrict: 'ភ្នំពេញ',
        studentProvince: 'ភ្នំពេញ',
        studentVillage: 'ភូមិថ្មី',
        studentHouseNumber: '123'
      }
    });

    console.log('✅ Test student created successfully!');
    console.log(`Student ID: ${testStudent.studentId}`);
    console.log(`Name: ${testStudent.firstName} ${testStudent.lastName}`);
    console.log(`Class: ${testStudent.class}`);

    // Step 3: Add guardian for the test student
    console.log('\n👨‍👩‍👧‍👦 Step 3: Adding guardian...');
    
    const guardian = await prisma.guardian.create({
      data: {
        studentId: testStudent.studentId,
        relation: 'ឪពុក',
        phone: '012345678',
        firstName: 'តេស្ត',
        lastName: 'ឪពុក',
        believeJesus: true,
        birthDistrict: 'ភ្នំពេញ',
        district: 'ភ្នំពេញ',
        province: 'ភ្នំពេញ',
        village: 'ភូមិថ្មី',
        houseNumber: '123',
        occupation: 'គ្រូបង្រៀន',
        income: 500,
        childrenCount: 2,
        church: 'ព្រះវិហារមិត្តភាព'
      }
    });

    console.log('✅ Guardian created successfully!');
    console.log(`Guardian: ${guardian.firstName} ${guardian.lastName}`);

    // Step 4: Add family info
    console.log('\n🏠 Step 4: Adding family info...');
    
    const familyInfo = await prisma.familyInfo.create({
      data: {
        studentId: testStudent.studentId,
        canHelpSchool: true,
        churchName: 'ព្រះវិហារមិត្តភាព',
        durationInKPC: '5 ឆ្នាំ',
        helpAmount: 200,
        helpFrequency: 'ប្រចាំខែ',
        knowSchool: 'អ្នកគ្រូ',
        livingCondition: 'ល្អ',
        livingWith: 'ឪពុកម្តាយ',
        organizationHelp: null,
        ownHouse: true,
        religion: 'គ្រិស្តសាសនា'
      }
    });

    console.log('✅ Family info created successfully!');

    // Step 5: Verify final count
    console.log('\n📊 Step 5: Verifying final counts...');
    const finalStudents = await prisma.student.findMany();
    const finalGuardians = await prisma.guardian.findMany();
    const finalFamilyInfo = await prisma.familyInfo.findMany();
    
    console.log(`Final students: ${finalStudents.length}`);
    console.log(`Final guardians: ${finalGuardians.length}`);
    console.log(`Final family info: ${finalFamilyInfo.length}`);

    // Step 6: Test API endpoints
    console.log('\n🌐 Step 6: Testing API endpoints...');
    
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
      // Test students API
      const studentsResponse = await makeRequest('/api/students');
      console.log(`Students API Status: ${studentsResponse.status}`);
      
      if (studentsResponse.status === 200) {
        const studentsData = JSON.parse(studentsResponse.data);
        console.log(`API returned ${studentsData.length} students`);
        
        // Check if our test student is in the API response
        const testStudentInAPI = studentsData.find(s => 
          s.firstName === 'តេស្ត' && s.lastName === 'សិស្ស'
        );
        
        if (testStudentInAPI) {
          console.log('✅ Test student found in API response!');
        } else {
          console.log('⚠️ Test student not found in API response');
        }
      }
      
      // Test register-student page
      const registerPageResponse = await makeRequest('/register-student');
      console.log(`Register Student Page Status: ${registerPageResponse.status}`);
      
      if (registerPageResponse.status === 200) {
        console.log('✅ Register student page loads successfully');
      } else {
        console.log('❌ Register student page failed to load');
      }
      
    } catch (error) {
      console.log('⚠️ API testing failed (server might not be running):', error.message);
    }

    console.log('\n🎉 Student Addition Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Test student created: ${testStudent.firstName} ${testStudent.lastName}`);
    console.log(`- Guardian added: ${guardian.firstName} ${guardian.lastName}`);
    console.log(`- Family info added: ✅`);
    console.log(`- Total students now: ${finalStudents.length}`);

  } catch (error) {
    console.error('❌ Error during student addition test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAddStudent();
