# 📊 Attendance Data Generator - User Guide

## 📁 Files

- `add-attendance-auto.js` - Main script to generate attendance data
- `delete-recent-attendance.js` - Delete attendance created by the script
- `review-current-data.js` - Review existing database data

---

## 🎯 What Does This Script Do?

The `add-attendance-auto.js` script automatically generates realistic attendance records for students based on:

- **School days** (Monday-Friday, excluding holidays)
- **Realistic attendance patterns** (85% present, 8% absent, 4% late, 3% permission)
- **Proper date ranges** matching semester schedules
- **Duplicate prevention** (won't create attendance if already exists)

---

## ⚙️ Configuration Options

Edit the `options` object at the top of `add-attendance-auto.js`:

```javascript
const options = {
  verbose: false,                    // Show detailed logs
  specificGrade: [5, 7, 9],         // Array of grades or null for all
  specificSection: null,             // Specific section or null for all
  specificSchoolYear: '2025-2026',  // School year to generate for
  onlySemester: null,                // 1, 2, or null for both
  
  skipWeekends: true,                // Skip Saturday and Sunday
  skipHolidays: [],                  // Add dates like ['2025-12-25']
  
  statusRates: {
    'Present': 0.85,                 // 85% present
    'Absent': 0.08,                  // 8% absent
    'Late': 0.04,                    // 4% late
    'Permission': 0.03               // 3% excused
  }
}
```

---

## 📅 Date Ranges

The script generates attendance for these periods:

**Semester 1** (ឆមាសទី ១):
- November 2025
- December 2025
- January 2026
- February 2026

**Semester 2** (ឆមាសទី ២):
- March 2026
- April 2026
- May 2026
- June 2026
- July 2026

**School Days**: Monday-Friday only (weekends excluded by default)

---

## 🚀 How to Use

### Step 1: Review Current Data

```bash
node scripts/review-current-data.js
```

This shows:
- Existing students and enrollments
- Current courses/classes
- Any existing attendance records

### Step 2: Configure the Script

Edit `add-attendance-auto.js` and set your options:

**Example 1: Generate for specific grades**
```javascript
specificGrade: [5, 7, 9],  // Only grades 5, 7, and 9
specificSection: null,      // All sections
specificSchoolYear: '2025-2026',
onlySemester: null         // Both semesters
```

**Example 2: Test with one grade first**
```javascript
specificGrade: 9,          // Only grade 9
specificSection: "A",      // Only section A
specificSchoolYear: '2025-2026',
onlySemester: 1,           // Only semester 1
verbose: true              // Show detailed logs
```

**Example 3: All students, all grades**
```javascript
specificGrade: null,       // All grades
specificSection: null,     // All sections
specificSchoolYear: '2025-2026',
onlySemester: null        // Both semesters
```

### Step 3: Run the Script

```bash
node scripts/add-attendance-auto.js
```

The script will:
1. ✅ Fetch students, courses, and existing attendance
2. 📅 Generate school days for each month
3. 👥 Create attendance for each student
4. ⏭️ Skip duplicates automatically
5. 📊 Show summary of created records

### Step 4: Review Results

The script outputs:
- Number of students processed
- Attendance records created
- Duplicates skipped
- Total records processed

---

## 🧪 Testing Strategy

### Phase 1: Small Test
```javascript
specificGrade: 9,
specificSection: "A",
onlySemester: 1,
verbose: true
```

Run: `node scripts/add-attendance-auto.js`

**Expected**: ~500-600 records for grade 9A, semester 1

### Phase 2: Single Grade, Both Semesters
```javascript
specificGrade: 9,
specificSection: null,
onlySemester: null,
verbose: false
```

**Expected**: ~2,160 records for all grade 9 students

### Phase 3: All Target Grades
```javascript
specificGrade: [5, 7, 9],
specificSection: null,
onlySemester: null
```

**Expected**: ~10,980 records for grades 5, 7, 9

### Phase 4: All Students (if needed)
```javascript
specificGrade: null,
specificSection: null,
onlySemester: null
```

**Expected**: ~37,260 records for all 207 students

---

## 🗑️ Delete Generated Attendance

If you need to start over or made a mistake:

```bash
node scripts/delete-recent-attendance.js
```

This deletes all attendance records where `recordedBy = 'System'`

⚠️ **Warning**: This cannot be undone!

---

## 📊 Attendance Status Types

| Status | Rate | Example Reasons |
|--------|------|----------------|
| **Present** | 85% | Student attended normally |
| **Absent** | 8% | ឈឺ (sick), ធ្វើការងារ (working), មិនទាន់មកដល់ |
| **Late** | 4% | Student arrived late |
| **Permission** | 3% | សុំច្បាប់ (permission), បុណ្យ (festival), ជួយគ្រួសារ (helping family) |

---

## 🔍 Verify Generated Data

### Check in Database
```sql
-- Total attendance by class
SELECT c.grade, c.section, COUNT(*) as total_attendance
FROM "Attendance" a
JOIN "Course" c ON a."courseId" = c."courseId"
WHERE a."recordedBy" = 'System'
GROUP BY c.grade, c.section
ORDER BY c.grade, c.section;

-- Attendance by status
SELECT status, COUNT(*) as count
FROM "Attendance"
WHERE "recordedBy" = 'System'
GROUP BY status;

-- Attendance by month
SELECT 
  EXTRACT(YEAR FROM "attendanceDate") as year,
  EXTRACT(MONTH FROM "attendanceDate") as month,
  COUNT(*) as count
FROM "Attendance"
WHERE "recordedBy" = 'System'
GROUP BY year, month
ORDER BY year, month;
```

### Check in UI
Go to: `app/attendance/page.tsx`
- Select a class
- Select a date range
- Verify attendance records appear

---

## ⚠️ Important Notes

1. **Duplicate Prevention**: The script checks for existing attendance before creating new records
2. **Weekend Exclusion**: By default, weekends are skipped (can be changed in options)
3. **Realistic Data**: Status distribution creates realistic patterns (mostly present, some absent)
4. **School Year Match**: Attendance is created only for the specified school year
5. **No Manual Records Affected**: Deleting only removes System-generated records

---

## 💡 Tips

1. **Always test with a small subset first** (single grade, single semester)
2. **Review the data** before generating for all students
3. **Use verbose mode** for testing to see detailed progress
4. **Keep backups** before running large data generation
5. **Check attendance reports** after generation to verify correctness

---

## 🆘 Troubleshooting

### Problem: "School year not found"
**Solution**: Check that '2025-2026' exists in the database. Run `review-current-data.js` to verify.

### Problem: "No students enrolled"
**Solution**: Make sure students are enrolled in courses. Check enrollments in the database.

### Problem: Duplicates skipped
**Solution**: This is normal if attendance already exists. Use `delete-recent-attendance.js` to clear and regenerate.

### Problem: Too many/few records
**Solution**: 
- Verify grade/section/semester filters
- Check that students are enrolled
- Ensure date ranges are correct

---

## 📝 Example Workflow

```bash
# 1. Review current state
node scripts/review-current-data.js

# 2. Test with one grade
# Edit add-attendance-auto.js: specificGrade: 9, verbose: true
node scripts/add-attendance-auto.js

# 3. If test looks good, delete test data
node scripts/delete-recent-attendance.js

# 4. Generate for target grades
# Edit add-attendance-auto.js: specificGrade: [5, 7, 9]
node scripts/add-attendance-auto.js

# 5. Verify in UI or database
# Check attendance/page.tsx
```

---

## ✅ Success Criteria

After running the script, you should have:
- ✅ ~180 attendance records per student (one per school day)
- ✅ Realistic status distribution (85% present, 15% other)
- ✅ No duplicates
- ✅ Data visible in attendance reports
- ✅ Attendance for school days only (no weekends)

---

**Created**: 2025-10-29  
**For**: Friendship School Project  
**Script Version**: 1.0

