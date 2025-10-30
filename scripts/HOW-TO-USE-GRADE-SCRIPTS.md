# 📚 How to Use Grade Scripts

## 🆕 New Automated Script: `add-grades-auto.js`

This is the **recommended script** for adding grades to your current database. It automatically detects all your data and works with it.

---

## ✨ Features

✅ **Auto-detects** subjects from your database  
✅ **Auto-detects** grade levels from enrolled students  
✅ **Auto-detects** school years  
✅ **Flexible configuration** - customize what grades to add  
✅ **Prevents duplicates** - won't create grades that already exist  
✅ **Realistic data** - uses performance levels for variety  
✅ **Fixed year logic** - correctly handles Nov-Feb as school year transition  

---

## 🚀 Basic Usage

### Add grades for ALL students in current school year:
```bash
node scripts/add-grades-auto.js
```

This will:
- Use school year `2025-2026`
- Process all enrolled students
- Add grades for both semesters
- Use all subjects from database
- Generate 4 monthly grades per semester

---

## ⚙️ Configuration Options

Edit the `options` object in the script to customize behavior:

### 1. **Verbose Mode** - See every grade being created
```javascript
const options = {
  verbose: true, // Show detailed output for each grade
  // ... other options
}
```

**Output example:**
```
👤 នី ស្រីឡែន - ថ្នាក់ទី 9A
  ✅ គណិតវិទ្យា: 75.5/100 (11/25)
  ✅ អង់គ្លេស: 38.2/50 (11/25)
  ...
```

---

### 2. **Process Specific Grade Level Only**
```javascript
const options = {
  verbose: false,
  specificGrade: 9, // Only add grades for grade 9 students
  // ... other options
}
```

**Use cases:**
- `specificGrade: 5` - Only grade 5 students
- `specificGrade: 7` - Only grade 7 students
- `specificGrade: 9` - Only grade 9 students
- `specificGrade: null` - All grades (default)

---

### 3. **Process Specific Section Only**
```javascript
const options = {
  verbose: false,
  specificGrade: null,
  specificSection: 'A', // Only section A
  // ... other options
}
```

**Use cases:**
- `specificSection: 'A'` - Only section A
- `specificSection: 'B'` - Only section B
- `specificSection: null` - All sections (default)

---

### 4. **Combine Grade and Section**
```javascript
const options = {
  verbose: false,
  specificGrade: 9,
  specificSection: 'A', // Only grade 9A
  // ... other options
}
```

---

### 5. **Process Specific Semester Only**
```javascript
const options = {
  verbose: false,
  specificGrade: null,
  specificSection: null,
  specificSchoolYear: '2025-2026',
  onlySemester: 1 // Only semester 1 (Nov-Feb)
}
```

**Use cases:**
- `onlySemester: 1` - Only semester 1 (ឆមាសទី ១)
- `onlySemester: 2` - Only semester 2 (ឆមាសទី ២)
- `onlySemester: null` - Both semesters (default)

---

### 6. **Specific School Year**
```javascript
const options = {
  verbose: false,
  specificSchoolYear: '2024-2025', // Use specific year
  // ... other options
}
```

---

## 📅 Semester Schedule

The script automatically uses the correct months for each semester:

### Semester 1 (ឆមាសទី ១):
- **November 2025** → `11/25`
- **December 2025** → `12/25`
- **January 2026** → `01/26` ← Year changes!
- **February 2026** → `02/26`

### Semester 2 (ឆមាសទី ២):
- **March 2026** → `03/26`
- **April 2026** → `04/26`
- **May 2026** → `05/26`
- **June 2026** → `06/26`
- **July 2026** → `07/26`

---

## 📊 Grade Scoring System

The script uses **realistic score distributions**:

### Subject Max Scores by Grade Level:

#### Grade 5-6: **10 points per subject**
All subjects use 10-point scale

#### Grade 7-8:
- **គណិតវិទ្យា, ភាសាខ្មែរ**: 100 points
- **Other subjects**: 50 points

#### Grade 9:
- **គណិតវិទ្យា**: 100 points
- **តែងសេចក្តី**: 60 points
- **អង់គ្លេស**: 50 points
- **សរសេរតាមអាន**: 40 points
- **រូបវិទ្យា, ជីវវិទ្យា, សីលធម៌-ពលរដ្ឋវិទ្យា**: 35 points
- **ភូមិវិទ្យា**: 32 points
- **ប្រវត្តិវិទ្យា**: 33 points
- **គីមីវិទ្យា, ផែនដីវិទ្យា**: 25 points

---

## 🎯 Performance Levels

Students are randomly assigned performance levels:

| Level | Percentage | Score Range | Comments |
|-------|-----------|-------------|----------|
| **Excellent** | 10% | 80-100% | ល្អណាស់, ពូកែ, ពិន្ទុខ្ពស់ |
| **Good** | 30% | 65-80% | ល្អ, ពិន្ទុល្អ, អាចប្រសើរបាន |
| **Average** | 40% | 60-75% | ធម្មតា, ពិន្ទុមធ្យម, ត្រូវព្យាយាមបន្ថែម |
| **Below Average** | 20% | 42-60% | ត្រូវព្យាយាម, ពិន្ទុទាប |

Each student maintains the same performance level across all subjects for consistency.

---

## 📝 Example Configurations

### Example 1: Add grades for Grade 9A only
```javascript
const options = {
  verbose: true,
  specificGrade: 9,
  specificSection: 'A',
  specificSchoolYear: '2025-2026',
  onlySemester: null // Both semesters
}
```

### Example 2: Add semester 1 grades for all grade 7 students
```javascript
const options = {
  verbose: false,
  specificGrade: 7,
  specificSection: null, // All sections
  specificSchoolYear: '2025-2026',
  onlySemester: 1 // Only semester 1
}
```

### Example 3: Quick test with verbose output for Section B only
```javascript
const options = {
  verbose: true, // See every grade
  specificGrade: null,
  specificSection: 'B',
  specificSchoolYear: '2025-2026',
  onlySemester: 1
}
```

---

## 🔍 What the Script Does

1. **Connects to database** using Prisma
2. **Finds active teacher** to assign as grade creator
3. **Loads school year** (2025-2026 by default)
4. **Loads semesters** from database
5. **Loads all subjects** from database
6. **Finds enrolled students** matching your filters
7. **For each student:**
   - Gets their enrollment and course
   - Determines performance level (consistent per student)
   - **For each subject:**
     - **For each month in semester:**
       - Checks if grade already exists (skips if yes)
       - Generates realistic score based on performance
       - Adds appropriate Khmer comment
       - Creates grade record

---

## 📤 Sample Output

```
🚀 Auto Grade Addition Script
📋 This script automatically detects your data and adds grades

⚙️  Configuration:
   - Verbose: false
   - Specific Grade: All grades
   - Specific Section: All sections
   - School Year: 2025-2026
   - Semester: All semesters

👨‍🏫 Using teacher: សុខ វណ្ណា
📅 School Year: 2025-2026
📚 Semesters: ឆមាសទី ១, ឆមាសទី ២
📖 Found 35 subjects in database
👥 Found 120 students

🎯 Processing 120 students...

👤 នី ស្រីឡែន - ថ្នាក់ទី 9A
  ✅ Created 220 grades (Performance: good)

👤 ជុំ សុភា - ថ្នាក់ទី 9A
  ✅ Created 220 grades (Performance: average)

...

============================================================
🎉 Script completed successfully!
📊 Total grades created: 26400
👥 Students processed: 120
📅 School year: 2025-2026
📚 Semesters: 2
============================================================
```

---

## ⚠️ Important Notes

1. **Duplicate Prevention**: The script checks for existing grades and won't overwrite them
2. **All subjects required**: Make sure all subjects exist in your database first
3. **Teacher required**: At least one active teacher must exist
4. **School year required**: The specified school year must exist
5. **Enrollments required**: Students must be enrolled in courses

---

## 🆚 Comparison with Other Scripts

| Script | Use Case |
|--------|----------|
| **add-grades-auto.js** | ✅ **RECOMMENDED** - Works with your current data automatically |
| `add-grades-simple.js` | ❌ Old version - Only supports grades 5, 7, 9 with hardcoded subjects |
| `add-sample-grades.js` | ❌ Creates everything from scratch - Don't use if you have data |
| `add-grades-existing-data.js` | ⚠️ Similar to auto but less flexible |

---

## 🐛 Troubleshooting

### Error: "No active teacher found"
**Solution**: Create a teacher user with status 'active' first

### Error: "School year 2025-2026 not found"
**Solution**: Change `specificSchoolYear` to match your database or set to `null`

### Script creates 0 grades
**Possible causes:**
1. No enrolled students for the filters you set
2. All grades already exist (script skips duplicates)
3. No subjects in database

**Solution**: Run with `verbose: true` to see detailed output

---

## 💡 Tips

1. **Start small**: Test with one section first using `specificSection: 'A'`
2. **Use verbose mode**: Set `verbose: true` when testing
3. **Check first**: Run a test to see how many students match your filters
4. **Backup database**: Always backup before running on production data
5. **Run semester by semester**: Use `onlySemester` to add grades gradually

---

## 🎓 Next Steps

After adding grades, you can:
- View them in `/grade/addgrade` page
- Generate gradebooks from `/grade/gradebook` page
- Generate report cards from `/grade/report` page
- View student progress in `/student-info` page

---

**Questions? Check the main script file for inline comments and documentation.**

