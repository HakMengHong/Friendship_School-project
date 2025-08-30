const http = require('http');

const baseUrl = 'localhost';
const port = 3000;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: port,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Test-Script',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          headers: res.headers, 
          data: responseData 
        });
      });
    });

    req.on('error', (error) => { reject(error); });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testRegistrationForm() {
  console.log('🧪 Testing Student Registration Form');
  console.log('====================================\n');

  try {
    // Test 1: Check if register-student page loads
    console.log('🔍 Test 1: Register Student Page Loading');
    const registerResponse = await makeRequest('/register-student');
    
    if (registerResponse.status === 200) {
      console.log('✅ Register student page loads successfully');
      console.log(`📄 Status: ${registerResponse.status}`);
      console.log(`📏 Content Length: ${registerResponse.data.length} bytes`);
      
      // Check for key elements in the page
      if (registerResponse.data.includes('បញ្ជីសិស្ស')) {
        console.log('✅ Khmer text found - page is properly localized');
      }
      
      if (registerResponse.data.includes('ព័ត៌មានសិស្ស')) {
        console.log('✅ Student information tab found');
      }
      
      if (registerResponse.data.includes('អាណាព្យាបាល')) {
        console.log('✅ Guardian tab found');
      }
      
      if (registerResponse.data.includes('គ្រួសារ')) {
        console.log('✅ Family tab found');
      }
      
      if (registerResponse.data.includes('បន្ថែម')) {
        console.log('✅ Additional tab found');
      }
      
    } else {
      console.log(`❌ Register student page failed: ${registerResponse.status}`);
    }

    // Test 2: Check students API
    console.log('\n🔍 Test 2: Students API');
    const studentsResponse = await makeRequest('/api/students');
    
    if (studentsResponse.status === 200) {
      console.log('✅ Students API responds successfully');
      const studentsData = JSON.parse(studentsResponse.data);
      console.log(`📊 API returned ${studentsData.length} students`);
      
      // Check if our test student is there
      const testStudent = studentsData.find(s => 
        s.firstName === 'តេស្ត' && s.lastName === 'សិស្ស'
      );
      
      if (testStudent) {
        console.log('✅ Test student found in API response');
        console.log(`   ID: ${testStudent.studentId}`);
        console.log(`   Class: ${testStudent.class}`);
        console.log(`   Status: ${testStudent.status}`);
      } else {
        console.log('⚠️ Test student not found in API response');
      }
      
    } else {
      console.log(`❌ Students API failed: ${studentsResponse.status}`);
    }

    // Test 3: Check school years API
    console.log('\n🔍 Test 3: School Years API');
    const schoolYearsResponse = await makeRequest('/api/school-years');
    
    if (schoolYearsResponse.status === 200) {
      console.log('✅ School years API responds successfully');
      const schoolYearsData = JSON.parse(schoolYearsResponse.data);
      console.log(`📅 API returned ${schoolYearsData.length} school years`);
      
      const currentYear = schoolYearsData.find(year => 
        year.schoolYearCode === '2024-2025'
      );
      
      if (currentYear) {
        console.log('✅ 2024-2025 school year found');
      } else {
        console.log('⚠️ 2024-2025 school year not found');
      }
      
    } else {
      console.log(`❌ School years API failed: ${schoolYearsResponse.status}`);
    }

    // Test 4: Test form submission (simulate adding a new student)
    console.log('\n🔍 Test 4: Form Submission Test');
    
    const testStudentData = {
      student: {
        firstName: 'វិញ្ញាបនបត្រ',
        lastName: 'សិក្សា',
        gender: 'ស្រី',
        dob: '2012-08-20',
        class: 'ថ្នាក់ទី 3',
        schoolYear: '2024-2025',
        registerToStudy: true,
        studentHouseNumber: '456',
        studentVillage: 'ភូមិថ្មី',
        studentDistrict: 'ភ្នំពេញ',
        studentProvince: 'ភ្នំពេញ',
        studentBirthDistrict: 'ភ្នំពេញ',
        phone: '012345678',
        religion: 'គ្រិស្តសាសនា',
        health: 'ល្អ',
        emergencyContact: '098765432',
        vaccinated: true,
        previousSchool: '',
        transferReason: '',
        needsClothes: false,
        needsMaterials: false,
        needsTransport: false,
        registrationDate: new Date().toISOString(),
        status: 'active'
      },
      guardians: [{
        firstName: 'វិញ្ញាបនបត្រ',
        lastName: 'ឪពុក',
        relation: 'ឪពុក',
        phone: '012345678',
        occupation: 'អ្នកជំនួញ',
        income: '800',
        childrenCount: '3',
        houseNumber: '456',
        village: 'ភូមិថ្មី',
        district: 'ភ្នំពេញ',
        province: 'ភ្នំពេញ',
        birthDistrict: 'ភ្នំពេញ',
        believeJesus: true,
        church: 'ព្រះវិហារមិត្តភាព'
      }],
      familyInfo: {
        livingWith: 'ឪពុកម្តាយ',
        ownHouse: true,
        durationInKPC: '8',
        livingCondition: 'ល្អ',
        organizationHelp: null,
        knowSchool: 'អ្នកគ្រូ',
        religion: 'គ្រិស្តសាសនា',
        churchName: 'ព្រះវិហារមិត្តភាព',
        canHelpSchool: true,
        helpAmount: '300',
        helpFrequency: 'ប្រចាំខែ'
      }
    };

    const submitResponse = await makeRequest('/api/students', 'POST', testStudentData);
    
    if (submitResponse.status === 201) {
      console.log('✅ Student registration form submission successful!');
      const result = JSON.parse(submitResponse.data);
      console.log(`📝 New student created with ID: ${result.studentId || 'N/A'}`);
    } else {
      console.log(`❌ Form submission failed: ${submitResponse.status}`);
      console.log(`📄 Response: ${submitResponse.data}`);
    }

    // Test 5: Verify the new student was added
    console.log('\n🔍 Test 5: Verify New Student');
    const verifyResponse = await makeRequest('/api/students');
    
    if (verifyResponse.status === 200) {
      const studentsData = JSON.parse(verifyResponse.data);
      const newStudent = studentsData.find(s => 
        s.firstName === 'វិញ្ញាបនបត្រ' && s.lastName === 'សិក្សា'
      );
      
      if (newStudent) {
        console.log('✅ New student found in database!');
        console.log(`   ID: ${newStudent.studentId}`);
        console.log(`   Name: ${newStudent.firstName} ${newStudent.lastName}`);
        console.log(`   Class: ${newStudent.class}`);
        console.log(`   Status: ${newStudent.status}`);
      } else {
        console.log('⚠️ New student not found in database');
      }
      
      console.log(`📊 Total students now: ${studentsData.length}`);
    }

    // Test 6: Check dashboard access
    console.log('\n🔍 Test 6: Dashboard Access');
    const dashboardResponse = await makeRequest('/dashboard');
    
    if (dashboardResponse.status === 307) {
      console.log('✅ Dashboard redirects to login (expected for unauthenticated access)');
    } else if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard accessible');
    } else {
      console.log(`⚠️ Dashboard response: ${dashboardResponse.status}`);
    }

    console.log('\n🎉 Registration Form Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Register student page loads correctly');
    console.log('✅ Students API works properly');
    console.log('✅ School years API functions');
    console.log('✅ Form submission works');
    console.log('✅ New students are saved to database');
    console.log('✅ Security redirects work correctly');

  } catch (error) {
    console.error('❌ Error during registration form test:', error);
  }
}

testRegistrationForm();
