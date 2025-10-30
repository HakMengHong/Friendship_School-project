#!/usr/bin/env node

/**
 * Combined Subjects List
 * 
 * This script extracts and combines all unique subjects from all grade levels
 * to create a comprehensive subject list
 */

// Extract all subjects from the grade configurations
const GRADE_CONFIGS = {
  // Grade 5 - 10 point scale
  5: {
    maxScore: 10,
    subjects: [
      'វិទ្យាសាស្ត្រ',
      'កុំព្យូទ័រ',
      'អប់រំភាយ',
      'ហត្ថកម្ម',
      'អង់គ្លេស',
      'ចំរៀង-របាំ',
      'គំនូរ',
      'សីលធម៌-ពលរដ្ឋវិទ្យា',
      'វិទ្យាសាស្ត្រនិងសិក្សាសង្គម',
      'ធរណីមាត្រ',
      'មាត្រាប្រពន្ធ័',
      'នព្វន្ត',
      'អក្សរផ្ចង់',
      'សំណេរ',
      'វេយ្យាករណ៏',
      'រឿងនិទាន',
      'មេសូត្រ',
      'សរសេរតាមអាន',
      'រៀនអាន'
    ]
  },
  // Grade 7 - 100 point scale with different max scores per subject
  7: {
    maxScore: 100,
    subjects: [
      { name: 'គណិតវិទ្យា', maxScore: 100 },
      { name: 'អង់គ្លេស', maxScore: 50 },
      { name: 'កុំព្យូទ័រ', maxScore: 50 },
      { name: 'សីលធម៌-ពលរដ្ឋវិទ្យា', maxScore: 50 },
      { name: 'រូបវិទ្យា', maxScore: 50 },
      { name: 'គីមីវិទ្យា', maxScore: 50 },
      { name: 'ជីវវិទ្យា', maxScore: 50 },
      { name: 'ផែនដីវិទ្យា', maxScore: 50 },
      { name: 'ភាសាខ្មែរ', maxScore: 100 },
      { name: 'ប្រវត្តិវិទ្យា', maxScore: 50 },
      { name: 'គេហកិច្ច', maxScore: 50 },
      { name: 'ភូមិវិទ្យា', maxScore: 50 }
    ]
  },
  // Grade 9 - 100 point scale with different max scores per subject
  9: {
    maxScore: 100,
    subjects: [
      { name: 'តែងសេចក្តី', maxScore: 60 },
      { name: 'សរសេរតាមអាន', maxScore: 40 },
      { name: 'គណិតវិទ្យា', maxScore: 100 },
      { name: 'រូបវិទ្យា', maxScore: 35 },
      { name: 'គីមីវិទ្យា', maxScore: 25 },
      { name: 'ជីវវិទ្យា', maxScore: 35 },
      { name: 'ផែនដីវិទ្យា', maxScore: 25 },
      { name: 'សីលធម៌-ពលរដ្ឋវិទ្យា', maxScore: 35 },
      { name: 'ភូមិវិទ្យា', maxScore: 32 },
      { name: 'ប្រវត្តិវិទ្យា', maxScore: 33 },
      { name: 'អង់គ្លេស', maxScore: 50 }
    ]
  }
}

// Function to extract all unique subjects
function getAllUniqueSubjects() {
  const allSubjects = new Set()
  
  // Collect all unique subjects from all grade levels
  Object.values(GRADE_CONFIGS).forEach(config => {
    if (Array.isArray(config.subjects)) {
      config.subjects.forEach(subject => {
        if (typeof subject === 'string') {
          allSubjects.add(subject)
        } else if (typeof subject === 'object' && subject.name) {
          allSubjects.add(subject.name)
        }
      })
    }
  })
  
  return Array.from(allSubjects).sort()
}

// Function to get subject with translations
function getSubjectsWithTranslations() {
  const subjects = getAllUniqueSubjects()
  
  const subjectTranslations = {
    'វិទ្យាសាស្ត្រ': 'Science',
    'កុំព្យូទ័រ': 'Computer',
    'អប់រំភាយ': 'Physical Education',
    'ហត្ថកម្ម': 'Handicraft',
    'អង់គ្លេស': 'English',
    'ចំរៀង-របាំ': 'Music-Dance',
    'គំនូរ': 'Drawing',
    'សីលធម៌-ពលរដ្ឋវិទ្យា': 'Ethics-Civics',
    'វិទ្យាសាស្ត្រនិងសិក្សាសង្គម': 'Science and Social Studies',
    'ធរណីមាត្រ': 'Geometry',
    'មាត្រាប្រពន្ធ័': 'Mathematics',
    'នព្វន្ត': 'Arithmetic',
    'អក្សរផ្ចង់': 'Calligraphy',
    'សំណេរ': 'Composition',
    'វេយ្យាករណ៏': 'Grammar',
    'រឿងនិទាន': 'Story',
    'មេសូត្រ': 'Reading',
    'សរសេរតាមអាន': 'Writing',
    'រៀនអាន': 'Reading',
    'គណិតវិទ្យា': 'Mathematics',
    'រូបវិទ្យា': 'Physics',
    'គីមីវិទ្យា': 'Chemistry',
    'ជីវវិទ្យា': 'Biology',
    'ផែនដីវិទ្យា': 'Geography',
    'ភាសាខ្មែរ': 'Khmer Language',
    'ប្រវត្តិវិទ្យា': 'History',
    'គេហកិច្ច': 'Home Economics',
    'ភូមិវិទ្យា': 'Geography',
    'តែងសេចក្តី': 'Essay Writing'
  }
  
  return subjects.map(subject => ({
    khmer: subject,
    english: subjectTranslations[subject] || 'No translation available'
  }))
}

// Main function to display all subjects
function main() {
  console.log('📚 ALL SUBJECTS - COMBINED LIST')
  console.log('=' .repeat(50))
  
  const subjects = getSubjectsWithTranslations()
  
  console.log(`\n📊 Total Unique Subjects: ${subjects.length}`)
  console.log('\n📋 Complete Subject List:\n')
  
  subjects.forEach((subject, index) => {
    console.log(`${(index + 1).toString().padStart(2, '0')}. ${subject.khmer}`)
    console.log(`    English: ${subject.english}`)
    console.log('')
  })
  
  console.log('📝 Subject Categories:')
  console.log('   • Language Arts: ភាសាខ្មែរ, អង់គ្លេស, សំណេរ, វេយ្យាករណ៏, តែងសេចក្តី, សរសេរតាមអាន, មេសូត្រ, រៀនអាន, រឿងនិទាន, អក្សរផ្ចង់')
  console.log('   • Mathematics: គណិតវិទ្យា, មាត្រាប្រពន្ធ័, នព្វន្ត, ធរណីមាត្រ')
  console.log('   • Sciences: វិទ្យាសាស្ត្រ, រូបវិទ្យា, គីមីវិទ្យា, ជីវវិទ្យា, ផែនដីវិទ្យា, វិទ្យាសាស្ត្រនិងសិក្សាសង្គម')
  console.log('   • Social Studies: ប្រវត្តិវិទ្យា, ភូមិវិទ្យា, សីលធម៌-ពលរដ្ឋវិទ្យា')
  console.log('   • Arts & Skills: គំនូរ, ចំរៀង-របាំ, ហត្ថកម្ម, គេហកិច្ច')
  console.log('   • Technology: កុំព្យូទ័រ')
  console.log('   • Physical Education: អប់រំភាយ')
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  getAllUniqueSubjects,
  getSubjectsWithTranslations,
  GRADE_CONFIGS
}
