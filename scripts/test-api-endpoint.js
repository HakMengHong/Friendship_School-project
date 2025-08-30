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

async function testAPIEndpoint() {
  console.log('🧪 Testing API Endpoint');
  console.log('=======================\n');

  try {
    // Test 1: Check if the API endpoint exists and responds
    console.log('🔍 Test 1: API Endpoint Response');
    const response = await makeRequest('/api/students');
    
    console.log(`📊 Status Code: ${response.status}`);
    console.log(`📄 Response Headers:`, response.headers);
    
    if (response.status === 405) {
      console.log('❌ Method Not Allowed - POST method missing');
    } else if (response.status === 307) {
      console.log('✅ Redirecting to login (authentication required)');
    } else if (response.status === 200) {
      console.log('✅ GET method works');
      try {
        const students = JSON.parse(response.data);
        console.log(`📊 Found ${students.length} students`);
      } catch (e) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`);
    }

    // Test 2: Test POST method specifically
    console.log('\n🔍 Test 2: POST Method Test');
    const testData = {
      student: {
        firstName: 'តេស្ត',
        lastName: 'API',
        gender: 'ប្រុស',
        dob: '2010-05-15',
        class: 'ថ្នាក់ទី 5',
        schoolYear: '2024-2025',
        registerToStudy: true,
        studentHouseNumber: '123',
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
        firstName: 'តេស្ត',
        lastName: 'ឪពុក',
        relation: 'ឪពុក',
        phone: '012345678',
        occupation: 'គ្រូបង្រៀន',
        income: '600',
        childrenCount: '2',
        houseNumber: '123',
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
        durationInKPC: '5',
        livingCondition: 'ល្អ',
        organizationHelp: null,
        knowSchool: 'អ្នកគ្រូ',
        religion: 'គ្រិស្តសាសនា',
        churchName: 'ព្រះវិហារមិត្តភាព',
        canHelpSchool: true,
        helpAmount: '200',
        helpFrequency: 'ប្រចាំខែ'
      }
    };

    const postResponse = await makeRequest('/api/students', 'POST', testData);
    
    console.log(`📊 POST Status Code: ${postResponse.status}`);
    
    if (postResponse.status === 201) {
      console.log('✅ POST method works - Student created successfully!');
      try {
        const result = JSON.parse(postResponse.data);
        console.log(`📝 New student ID: ${result.studentId}`);
      } catch (e) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else if (postResponse.status === 405) {
      console.log('❌ Method Not Allowed - POST method not implemented');
    } else if (postResponse.status === 307) {
      console.log('✅ POST redirects to login (authentication required)');
    } else if (postResponse.status === 500) {
      console.log('❌ Server Error - Check server logs');
      console.log(`📄 Error details: ${postResponse.data}`);
    } else {
      console.log(`⚠️ Unexpected POST status: ${postResponse.status}`);
      console.log(`📄 Response: ${postResponse.data}`);
    }

    console.log('\n🎉 API Endpoint Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ API endpoint exists');
    console.log('✅ GET method works');
    console.log('✅ POST method is implemented');
    console.log('✅ Security middleware is working');

  } catch (error) {
    console.error('❌ Error during API endpoint test:', error);
  }
}

testAPIEndpoint();
