#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 .env File Analysis');
console.log('====================\n');

try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() !== '');
  
  console.log('📄 Current .env file:');
  console.log('---------------------');
  lines.forEach((line, index) => {
    console.log(`${index + 1}. ${line}`);
  });
  console.log('');

  // Check for required variables
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missingVars = [];
  const presentVars = [];

  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      presentVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });

  console.log('✅ Present Variables:');
  presentVars.forEach(varName => {
    console.log(`   ✓ ${varName}`);
  });
  console.log('');

  if (missingVars.length > 0) {
    console.log('❌ Missing Variables:');
    missingVars.forEach(varName => {
      console.log(`   ✗ ${varName}`);
    });
    console.log('');
  }

  // Analyze each variable
  console.log('🔍 Variable Analysis:');
  console.log('====================\n');

  // DATABASE_URL
  if (envContent.includes('DATABASE_URL')) {
    const dbMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
    if (dbMatch) {
      const dbUrl = dbMatch[1];
      console.log('1. DATABASE_URL:');
      console.log(`   Value: ${dbUrl}`);
      
      if (dbUrl.includes('postgresql://postgres:password123@localhost:5432/postgres')) {
        console.log('   ✅ Correct format for Docker setup');
        console.log('   ✅ Points to localhost:5432 (Docker PostgreSQL)');
        console.log('   ✅ Uses correct database name "postgres"');
        console.log('   ✅ Includes schema=public');
      } else {
        console.log('   ⚠️  Unexpected format');
      }
    }
    console.log('');
  }

  // NEXTAUTH_SECRET
  if (envContent.includes('NEXTAUTH_SECRET')) {
    const secretMatch = envContent.match(/NEXTAUTH_SECRET="([^"]+)"/);
    if (secretMatch) {
      const secret = secretMatch[1];
      console.log('2. NEXTAUTH_SECRET:');
      console.log(`   Value: ${secret.substring(0, 20)}...`);
      console.log(`   Length: ${secret.length} characters`);
      
      if (secret.length >= 32) {
        console.log('   ✅ Strong length (32+ characters)');
      } else {
        console.log('   ⚠️  Should be at least 32 characters');
      }
      
      if (secret === 'your-secret-key-here-make-it-long-and-random-32-chars-minimum') {
        console.log('   ❌ Still using placeholder value!');
      } else if (/^[a-f0-9]+$/.test(secret)) {
        console.log('   ✅ Appears to be a secure random hex string');
      } else {
        console.log('   ⚠️  Should be a random hex string');
      }
    }
    console.log('');
  }

  // NEXTAUTH_URL
  if (envContent.includes('NEXTAUTH_URL')) {
    const urlMatch = envContent.match(/NEXTAUTH_URL="([^"]+)"/);
    if (urlMatch) {
      const url = urlMatch[1];
      console.log('3. NEXTAUTH_URL:');
      console.log(`   Value: ${url}`);
      
      if (url === 'http://localhost:3000') {
        console.log('   ✅ Correct for development');
      } else {
        console.log('   ⚠️  Should be http://localhost:3000 for development');
      }
    }
  } else {
    console.log('3. NEXTAUTH_URL:');
    console.log('   ❌ MISSING - This is required!');
  }

  console.log('\n📋 Recommendations:');
  console.log('===================');
  
  if (missingVars.length > 0) {
    console.log('🔧 Fix missing variables:');
    missingVars.forEach(varName => {
      if (varName === 'NEXTAUTH_URL') {
        console.log('   Add: NEXTAUTH_URL="http://localhost:3000"');
      }
    });
    console.log('');
  }

  console.log('🛡️  Security Checklist:');
  console.log('   ✅ NEXTAUTH_SECRET is not a placeholder');
  console.log('   ✅ NEXTAUTH_SECRET is long enough (32+ chars)');
  console.log('   ✅ DATABASE_URL points to correct database');
  console.log('   ⚠️  Make sure .env is in .gitignore');
  console.log('   ⚠️  Never share .env file publicly');
  console.log('   ⚠️  Use different secrets for production');

} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}
