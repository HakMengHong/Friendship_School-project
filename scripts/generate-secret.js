#!/usr/bin/env node

const crypto = require('crypto');

// Generate a secure 32-byte random secret
const secret = crypto.randomBytes(32).toString('hex');

console.log('🔐 Generated Secure NEXTAUTH_SECRET:');
console.log('=====================================');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('');
console.log('📋 Copy this line and replace it in your .env file');
console.log('⚠️  Keep this secret secure and never share it publicly!');
