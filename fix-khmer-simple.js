const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'app', 'register-student', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Starting Khmer text fix...');
console.log('📄 Processing file:', filePath);

// Start with the most critical replacements - grade labels first
const gradeReplacements = [
  // Grade labels in the gradeMap - using exact strings from the file
  ['"1": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ¡"', '"1": "ថ្នាក់ទី ១"'],
  ['"2": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ¢"', '"2": "ថ្នាក់ទី ២"'],
  ['"3": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ£"', '"3": "ថ្នាក់ទី ៣"'],
  ['"4": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ¤"', '"4": "ថ្នាក់ទី ៤"'],
  ['"5": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ¥"', '"5": "ថ្នាក់ទី ៥"'],
  ['"6": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ¦"', '"6": "ថ្នាក់ទី ៦"'],
  ['"7": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ§"', '"7": "ថ្នាក់ទី ៧"'],
  ['"8": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ¨"', '"8": "ថ្នាក់ទី ៨"'],
  ['"9": "ážáŸ\'áž"áž¶áž€áŸ‹áž\'áž¸ áŸ©"', '"9": "ថ្នាក់ទី ៩"'],
];

// Apply grade replacements
console.log('🔧 Fixing grade labels...');
let replacementCount = 0;
for (const [search, replace] of gradeReplacements) {
  const beforeCount = content.split(search).length - 1;
  content = content.split(search).join(replace);
  const afterCount = content.split(search).length - 1;
  const replaced = beforeCount - afterCount;
  if (replaced > 0) {
    console.log(`  ✅ Replaced ${replaced} instances of grade label`);
    replacementCount += replaced;
  }
}

// Simple age format replacements
const ageReplacements = [
  ['áž†áŸ\'áž"áž¶áŸ†', 'ឆ្នាំ'],
  ['ážáŸ‚', 'ខែ'],
  ['ážáŸ\'áž„áŸƒ', 'ថ្ងៃ'],
];

console.log('🔧 Fixing age format...');
for (const [search, replace] of ageReplacements) {
  const beforeCount = content.split(search).length - 1;
  content = content.split(search).join(replace);
  const afterCount = content.split(search).length - 1;
  const replaced = beforeCount - afterCount;
  if (replaced > 0) {
    console.log(`  ✅ Replaced ${replaced} instances of "${search}"`);
    replacementCount += replaced;
  }
}

// Success/error message title
const titleReplacements = [
  ['title: "áž‡áŸ„áž‚áž‡áŸáž™"', 'title: "ជោគជ័យ"'],
];

console.log('🔧 Fixing toast titles...');
for (const [search, replace] of titleReplacements) {
  const beforeCount = content.split(search).length - 1;
  content = content.split(search).join(replace);
  const afterCount = content.split(search).length - 1;
  const replaced = beforeCount - afterCount;
  if (replaced > 0) {
    console.log(`  ✅ Replaced ${replaced} instances of toast title`);
    replacementCount += replaced;
  }
}

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('');
console.log('✅ Khmer text encoding has been fixed!');
console.log(`🔄 Total replacements applied: ${replacementCount}`);
console.log('📄 File updated successfully');

if (replacementCount === 0) {
  console.log('ℹ️  No encoded text patterns found - they may have already been fixed');
}
