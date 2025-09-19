# 📊 Grade Addition Scripts

This directory contains scripts to add sample grades for students based on the Cambodian education system requirements.

## 📋 Grade Level Configurations

### Grade 5 (10-point scale)
- **Subjects**: 19 subjects including វិទ្យាសាស្ត្រ, កុំព្យូទ័រ, អប់រំភាយ, etc.
- **Max Score**: 10 points per subject
- **Scale**: A (9-10), B (8-8.9), C (7-7.9), D (6-6.9), F (0-5.9)

### Grade 7 (Mixed scale)
- **Subjects**: 12 subjects with different max scores
- **Max Scores**: 
  - គណិតវិទ្យា, ភាសាខ្មែរ: 100 points
  - Other subjects: 50 points each

### Grade 9 (Mixed scale)
- **Subjects**: 11 subjects with different max scores
- **Max Scores**: 
  - គណិតវិទ្យា: 100 points
  - តែងសេចក្តី: 60 points
  - សរសេរតាមអាន: 40 points
  - Other subjects: 25-35 points each

## 🚀 Available Scripts

### 1. `add-sample-grades.js` - Complete Setup
**Purpose**: Creates everything from scratch including school years, semesters, subjects, courses, and grades.

**Usage**:
```bash
node scripts/add-sample-grades.js
```

**What it does**:
- Creates school year 2024-2025
- Creates semesters (ឆមាសទី ១, ឆមាសទី ២)
- Creates all subjects for all grade levels
- Creates courses for grades 5, 7, 9 with sections A, B, C
- Adds grades for all enrolled students

**When to use**: When you want to set up everything from scratch.

### 2. `add-grades-existing-data.js` - Use Existing Data
**Purpose**: Adds grades using existing school years, semesters, subjects, and courses.

**Usage**:
```bash
node scripts/add-grades-existing-data.js
```

**What it does**:
- Finds existing school year 2024-2025
- Uses existing semesters and subjects
- Uses existing courses and student enrollments
- Adds grades for all enrolled students

**When to use**: When you already have the basic data set up.

### 3. `add-grades-simple.js` - Simple Grade Addition
**Purpose**: Adds grades for all existing students with their current enrollments.

**Usage**:
```bash
node scripts/add-grades-simple.js
```

**What it does**:
- Finds all students with enrollments
- Adds grades based on their enrolled course grade level
- Uses existing semesters and subjects

**When to use**: When you just want to add grades quickly.

## 📅 Semester Configuration

### ឆមាសទី ១ (Semester 1)
- **Period**: November 2024 - February 2025
- **Months**: 11/24, 12/24, 01/25, 02/25

### ឆមាសទី ២ (Semester 2)
- **Period**: March 2025 - July 2025
- **Months**: 03/25, 04/25, 05/25, 06/25, 07/25

## 🎯 Grade Generation Logic

### Performance Levels
- **Excellent** (10%): 80-100% of max score
- **Good** (30%): 60-80% of max score
- **Average** (40%): 60-70% of max score
- **Below Average** (20%): 30-60% of max score

### Grade Comments (in Khmer)
- **Excellent**: ល្អណាស់, ពូកែ, ពិន្ទុខ្ពស់, អស្ចារ្យ
- **Good**: ល្អ, ពិន្ទុល្អ, អាចប្រសើរបាន
- **Average**: ធម្មតា, ពិន្ទុមធ្យម, ត្រូវព្យាយាមបន្ថែម
- **Below Average**: ត្រូវព្យាយាម, ពិន្ទុទាប, ត្រូវរៀនបន្ថែម

## 🔧 Prerequisites

Before running any script, ensure you have:

1. **Database Connection**: PostgreSQL database running
2. **Prisma Setup**: Run `npx prisma generate` and `npx prisma migrate dev`
3. **Basic Data**: At minimum, you need:
   - At least one teacher user
   - Students with enrollments
   - School year, semesters, subjects, and courses (for scripts 2 & 3)

## 📊 Expected Results

After running the scripts, you should have:

- **Grade 5 Students**: 19 subjects × 4 months × 2 semesters = 152 grades per student
- **Grade 7 Students**: 12 subjects × 4-5 months × 2 semesters = 96-120 grades per student
- **Grade 9 Students**: 11 subjects × 4-5 months × 2 semesters = 88-110 grades per student

## 🚨 Important Notes

1. **Duplicate Prevention**: Scripts check for existing grades and skip duplicates
2. **Data Validation**: All grades are validated against the appropriate max scores
3. **Error Handling**: Scripts include comprehensive error handling and logging
4. **Performance**: Grades are generated with realistic performance distributions

## 🔍 Troubleshooting

### Common Issues

1. **"No active teacher found"**
   - Solution: Create a teacher user first
   - Run: `node scripts/add-teachers.js`

2. **"School year not found"**
   - Solution: Use `add-sample-grades.js` to create everything from scratch

3. **"No subjects found"**
   - Solution: Run `add-sample-grades.js` or create subjects manually

4. **"No courses found"**
   - Solution: Create courses for your school year first

### Debug Mode

Add console logging by modifying the scripts:
```javascript
// Add this at the top of any script
const DEBUG = true
if (DEBUG) console.log('Debug info:', data)
```

## 📈 Performance

- **Small Dataset** (< 100 students): ~30 seconds
- **Medium Dataset** (100-500 students): ~2-5 minutes
- **Large Dataset** (500+ students): ~5-15 minutes

## 🎉 Success Indicators

Look for these messages in the console:
- ✅ "Created grade: [Subject] - [Score]/[Max] ([Date])"
- ✅ "Script completed successfully!"
- 📊 "Total grades created: [Number]"

## 🔄 Re-running Scripts

Scripts are safe to run multiple times:
- Existing grades are skipped
- Only new grades are created
- No data is duplicated or corrupted

---

**Happy Grading! 🎓📊**
