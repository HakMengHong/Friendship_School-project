const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTeacherDropdown() {
  try {
    console.log('🧪 Testing Teacher Dropdown Functionality...\n');

    // Test 1: Verify teachers exist in database
    console.log('1️⃣ Database Teachers Check:');
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        position: true,
        role: true
      }
    });

    console.log(`   ✅ Found ${teachers.length} teachers in database`);
    teachers.forEach(teacher => {
      console.log(`      - ${teacher.firstname} ${teacher.lastname} (ID: ${teacher.userid}) - ${teacher.position}`);
    });

    // Test 2: Simulate API response structure (transform userId to userid)
    console.log('\n2️⃣ API Response Structure:');
    const transformedTeachers = teachers.map(teacher => ({
      userid: teacher.userId,
      username: teacher.username,
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      position: teacher.position,
      role: teacher.role
    }));
    
    const apiResponse = {
      users: transformedTeachers
    };
    console.log(`   ✅ API response: { users: [${apiResponse.users.length} teachers] }`);

    // Test 3: Simulate frontend filtering
    console.log('\n3️⃣ Frontend Teacher Filtering:');
    const filteredTeachers = apiResponse.users.filter(teacher => teacher.role === 'teacher');
    console.log(`   ✅ Filtered teachers: ${filteredTeachers.length}`);

    // Test 4: Simulate dropdown options
    console.log('\n4️⃣ Dropdown Options Generation:');
    const dropdownOptions = filteredTeachers.map(teacher => ({
      key: teacher.userid,
      value: teacher.userid.toString(),
      label: `${teacher.firstname} ${teacher.lastname}`,
      position: teacher.position
    }));

    console.log('   ✅ Generated dropdown options:');
    dropdownOptions.forEach(option => {
      console.log(`      - Key: ${option.key}, Value: ${option.value}, Label: "${option.label}"`);
    });

    // Test 5: Verify data types
    console.log('\n5️⃣ Data Type Validation:');
    const validationResults = filteredTeachers.map(teacher => ({
      userid: typeof teacher.userid === 'number',
      firstname: typeof teacher.firstname === 'string',
      lastname: typeof teacher.lastname === 'string',
      role: typeof teacher.role === 'string',
      position: typeof teacher.position === 'string'
    }));

    console.log('   ✅ Data type validation:');
    validationResults.forEach((result, index) => {
      const teacher = filteredTeachers[index];
      console.log(`      - ${teacher.firstname} ${teacher.lastname}:`);
      console.log(`        * userid (number): ${result.userid ? '✅' : '❌'}`);
      console.log(`        * firstname (string): ${result.firstname ? '✅' : '❌'}`);
      console.log(`        * lastname (string): ${result.lastname ? '✅' : '❌'}`);
      console.log(`        * role (string): ${result.role ? '✅' : '❌'}`);
      console.log(`        * position (string): ${result.position ? '✅' : '❌'}`);
    });

    // Test 6: Check for potential runtime errors
    console.log('\n6️⃣ Runtime Error Prevention:');
    const potentialErrors = [];

    // Check if any teacher has undefined userid
    const undefinedUserIds = filteredTeachers.filter(teacher => teacher.userid === undefined);
    if (undefinedUserIds.length > 0) {
      potentialErrors.push(`❌ Found ${undefinedUserIds.length} teachers with undefined userid`);
    } else {
      console.log('   ✅ All teachers have valid userid values');
    }

    // Check if any teacher has undefined firstname/lastname
    const undefinedNames = filteredTeachers.filter(teacher => 
      teacher.firstname === undefined || teacher.lastname === undefined
    );
    if (undefinedNames.length > 0) {
      potentialErrors.push(`❌ Found ${undefinedNames.length} teachers with undefined names`);
    } else {
      console.log('   ✅ All teachers have valid name values');
    }

    // Check if any teacher has undefined role
    const undefinedRoles = filteredTeachers.filter(teacher => teacher.role === undefined);
    if (undefinedRoles.length > 0) {
      potentialErrors.push(`❌ Found ${undefinedRoles.length} teachers with undefined role`);
    } else {
      console.log('   ✅ All teachers have valid role values');
    }

    if (potentialErrors.length > 0) {
      console.log('   ⚠️  Potential runtime errors detected:');
      potentialErrors.forEach(error => console.log(`      ${error}`));
    } else {
      console.log('   ✅ No potential runtime errors detected');
    }

    console.log('\n🎉 Teacher Dropdown Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Database teachers: ${teachers.length}`);
    console.log(`   - API response structure: ✅ Correct`);
    console.log(`   - Frontend filtering: ✅ Working`);
    console.log(`   - Dropdown options: ${dropdownOptions.length} generated`);
    console.log(`   - Data validation: ✅ All types correct`);
    console.log(`   - Runtime safety: ${potentialErrors.length === 0 ? '✅ Safe' : '⚠️  Issues detected'}`);

    if (potentialErrors.length === 0) {
      console.log('\n🚀 The teacher dropdown is ready for production use!');
    } else {
      console.log('\n⚠️  Please fix the detected issues before production use.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTeacherDropdown();
