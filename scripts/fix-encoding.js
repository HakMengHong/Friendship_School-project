const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'app', 'register-student', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Starting comprehensive Khmer encoding fix...');

// Function to safely replace text
function safeReplace(text, searchPattern, replacement) {
  try {
    const count = (text.split(searchPattern).length - 1);
    if (count > 0) {
      console.log(`  🔧 Replacing ${count} instances: ${searchPattern.substring(0, 30)}...`);
      return text.split(searchPattern).join(replacement);
    }
    return text;
  } catch (error) {
    console.log(`  ❌ Error replacing pattern: ${error.message}`);
    return text;
  }
}

// Start with character-by-character replacement for common Khmer characters
const unicodeMap = [
  // Basic Khmer characters that appear encoded
  ['áž', 'ក'], ['áž€', 'ក'], ['áž', 'ខ'], ['áž‚', 'គ'], ['áž', 'ឃ'], ['ážƒ', 'ង'],
  ['áž…', 'ច'], ['áž†', 'ឆ'], ['áž‡', 'ជ'], ['ážˆ', 'ឈ'], ['áž‰', 'ញ'],
  ['ážŠ', 'ដ'], ['áž‹', 'ឋ'], ['ážŒ', 'ឌ'], ['áž', 'ឍ'], ['ážŽ', 'ណ'],
  ['áž', 'ត'], ['áž', 'ថ'], ['áž'', 'ទ'], ['áž'', 'ធ'], ['áž"', 'ន'],
  ['áž"', 'ប'], ['áž•', 'ផ'], ['áž–', 'ព'], ['áž—', 'ភ'], ['ážš', 'ម'],
  ['áž™', 'យ'], ['ážš', 'រ'], ['áž›', 'ល'], ['ážœ', 'វ'], ['áž', 'ស'],
  ['ážž', 'ហ'], ['ážŸ', 'ឡ'], ['áž ', 'អ'],
  
  // Vowels
  ['áŸ'', 'ា'], ['áž·', 'ិ'], ['áž¸', 'ី'], ['áž»', 'ុ'], ['áž¼', 'ូ'],
  ['áž¾', 'ើ'], ['áŸ€', 'ៀ'], ['áŸ‚', 'ៃ'], ['áŸƒ', 'ៅ'],
  
  // Numbers
  ['áŸ¡', '១'], ['áŸ¢', '២'], ['áŸ£', '៣'], ['áŸ¤', '៤'], ['áŸ¥', '៥'],
  ['áŸ¦', '៦'], ['áŸ§', '៧'], ['áŸ¨', '៨'], ['áŸ©', '៩'], ['áŸ ', '០'],
  
  // Special characters
  ['áŸ‹', 'ះ'], ['áŸ†', 'ំ'], ['áŸŒ', '៌'], ['áŸ‰', '៉'], ['áŸŠ', '៊'],
  ['áŸ'', '្'], ['áŸáŸ†', 'ះ'], ['áŸ„', 'ៅ'], ['áŸ…', 'ៅ']
];

console.log('🔧 Applying character-by-character fixes...');
let totalReplacements = 0;

for (const [encoded, proper] of unicodeMap) {
  const beforeLength = content.length;
  content = safeReplace(content, encoded, proper);
  const afterLength = content.length;
  if (beforeLength !== afterLength) {
    totalReplacements++;
  }
}

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('');
console.log('✅ Comprehensive Khmer encoding fix completed!');
console.log(`🔄 Character mappings processed: ${unicodeMap.length}`);
console.log(`📝 File updated: ${filePath}`);

// Verify some key patterns
console.log('');
console.log('🔍 Verifying results...');
const testPatterns = ['ថ្នាក់ទី', 'ឆ្នាំ', 'ខែ', 'ថ្ងៃ', 'សិស្ស', 'ព័ត៌មាន'];
for (const pattern of testPatterns) {
  const count = (content.split(pattern).length - 1);
  if (count > 0) {
    console.log(`  ✅ Found ${count} instances of: ${pattern}`);
  }
}
