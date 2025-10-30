# 📚 Attendance Data Generator - User Guide

## 🎯 Overview

This script generates realistic attendance data for the Friendship School management system. It follows the **daily session model** where:

- **Default**: Students are assumed **present** unless marked otherwise
- **Records**: Only created for **non-present** attendance (absent, late, excused)
- **Sessions**: AM (morning), PM (afternoon), or FULL (full day)

---

## 📁 Files

1. **`add-attendance-daily.js`** - Generate attendance data
2. **`delete-attendance-daily.js`** - Delete generated data
3. **`verify-attendance-daily.js`** - Verify data distribution

---

## ⚙️ Configuration

Edit the `options` object in `add-attendance-daily.js`:

```javascript
const options = {
  // Basic filters
  specificGrade: [5, 7, 9],          // Array of grades or null for all
  specificSection: null,              // Specific section or null for all
  specificSchoolYear: '2025-2026',   // Which school year
  onlySemester: null,                 // 1, 2, or null for both
  
  // Attendance options
  skipWeekends: true,                 // Skip Saturday and Sunday
  skipHolidays: [],                   // Array of dates like ['2025-12-25']
  
  // Status distribution (only for NON-PRESENT students)
  nonPresentRate: 0.15,               // 15% of students have non-present status
  
  // How non-present students are distributed (should add up to 1.0)
  statusRates: {
    'absent': 0.60,                   // 60% absent without permission
    'late': 0.25,                     // 25% late
    'excused': 0.15                   // 15% absent with permission
  },
  
  // Session distribution (should add up to 1.0)
  sessionRates: {
    'AM': 0.45,                       // 45% morning only
    'PM': 0.45,                       // 45% afternoon only
    'FULL': 0.10                      // 10% full day
  }
}
```

---

## 🚀 Usage Examples

### Example 1: Generate for ALL Grades (Both Semesters)

```javascript
const options = {
  specificGrade: null,                // All grades
  specificSection: null,              // All sections
  specificSchoolYear: '2025-2026',
  onlySemester: null,                 // Both semesters
  // ... rest of config
}
```

Then run:
```bash
node scripts/add-attendance-daily.js
```

---

### Example 2: Generate for Specific Grades

```javascript
const options = {
  specificGrade: [5, 7, 9],          // Only grades 5, 7, 9
  specificSection: null,              // All sections
  specificSchoolYear: '2025-2026',
  onlySemester: null,                 // Both semesters
  // ... rest of config
}
```

Then run:
```bash
node scripts/add-attendance-daily.js
```

---

### Example 3: Test Run - Single Grade, Single Semester

```javascript
const options = {
  verbose: true,                      // Show detailed logs
  specificGrade: 9,                   // Only grade 9
  specificSection: 'A',               // Only section A
  specificSchoolYear: '2025-2026',
  onlySemester: 1,                    // Only semester 1
  // ... rest of config
}
```

Then run:
```bash
node scripts/add-attendance-daily.js
```

**Expected**: ~170-190 records (12 students × ~85 days × 15% non-present rate)

---

### Example 4: Add Holidays

```javascript
const options = {
  // ... other config
  skipWeekends: true,
  skipHolidays: [
    '2025-12-25',    // Christmas
    '2026-01-01',    // New Year
    '2026-04-14',    // Khmer New Year (Day 1)
    '2026-04-15',    // Khmer New Year (Day 2)
    '2026-04-16'     // Khmer New Year (Day 3)
  ]
}
```

---

## 📊 Understanding the Output

### Expected Record Counts

For the full dataset (Grades 5, 7, 9, both semesters):

| Component | Count |
|-----------|-------|
| Students | 61 (12 + 22 + 27) |
| School Days | ~195 (both semesters) |
| Potential Records | 11,895 |
| **Actual Records** | **~1,780** (15% non-present rate) |

**Formula**: Students × School Days × Non-Present Rate

---

### Status Distribution (from verification)

```
📈 Status Distribution:
   absent          1060 records (60.8%)  ✓
   late             426 records (24.4%)  ✓
   excused          258 records (14.8%)  ✓
   TOTAL           1744 records
```

### Session Distribution (from verification)

```
📅 Session Distribution:
   AM               772 records (44.3%)  ✓
   PM               795 records (45.6%)  ✓
   FULL             177 records (10.1%)  ✓
```

---

## 🔍 Verifying Generated Data

Run the verification script:

```bash
node scripts/verify-attendance-daily.js
```

**Output**:
- Status distribution (absent, late, excused)
- Session distribution (AM, PM, FULL)
- Monthly breakdown
- Sample records with reasons

---

## 🗑️ Deleting Generated Data

To remove ALL system-generated attendance:

```bash
node scripts/delete-attendance-daily.js
```

**Warning**: This will delete ALL attendance records where `recordedBy = 'System'`

---

## 🎓 Understanding the Data Model

### Attendance Record Structure

```javascript
{
  studentId: 123,                     // Which student
  courseId: 45,                       // Which course/class
  attendanceDate: '2025-11-05',       // Date
  session: 'AM',                      // 'AM', 'PM', or 'FULL'
  status: 'absent',                   // 'absent', 'late', or 'excused'
  reason: 'ឈឺ',                       // Khmer reason text
  recordedBy: 'System',               // Who created it
  semesterId: 1                       // Which semester
}
```

### Status Values

| Status | English | Khmer | When to Use |
|--------|---------|-------|-------------|
| `present` | Present | វត្តមាន | Default (no record needed) |
| `absent` | Absent (Unexcused) | អវត្តមាន(ឥតច្បាប់) | Missing without permission |
| `late` | Late | យឺត | Arrived late |
| `excused` | Absent (Excused) | អវត្តមាន(ច្បាប់) | Missing with permission |

### Session Values

| Session | Khmer | Description |
|---------|-------|-------------|
| `AM` | ពេលព្រឹក | Morning only |
| `PM` | ពេលរសៀល | Afternoon only |
| `FULL` | ពេញមួយថ្ងៃ | Full day |

### Reason Examples

**For 'absent' status**:
- ឈឺ (sick)
- មានធុរៈផ្ទាល់ខ្លួន (personal business)
- ធ្វើការងារ (working)
- ជួយគ្រួសារ (helping family)
- មិនមានមធ្យោបាយធ្វើដំណើរ (no transportation)

**For 'late' status**:
- ចំណាយពេលនៅផ្លូវ (time spent on road)
- រថយន្តខូច (vehicle broke down)
- ភ្លៀងធ្លាក់ (raining)
- គេងលុប (overslept)
- ជួយម្តាយព្រឹក (helping mother in morning)

**For 'excused' status**:
- សុំច្បាប់ (permission requested)
- ទៅពេទ្យ (going to hospital)
- ចូលរួមពិធីលើកទឹកចិត្ត (attending ceremony)
- ចូលរួមការប្រជុំគ្រួសារ (attending family meeting)
- មានរឿងបន្ទាន់ (emergency)

---

## 📅 Semester Date Ranges

### Semester 1 (4 months)
- November 2025
- December 2025
- January 2026
- February 2026

### Semester 2 (5 months)
- March 2026
- April 2026
- May 2026
- June 2026
- July 2026

---

## ⚠️ Important Notes

1. **Default Behavior**: The system assumes students are **present** unless explicitly marked otherwise. This saves database space.

2. **Duplicate Prevention**: The script checks for existing records and skips duplicates. Safe to run multiple times.

3. **Non-Present Rate**: Set to 15% by default, meaning:
   - 85% of students are **present** (no record created)
   - 15% have some non-present status (record created)

4. **Realistic Data**: Uses Khmer reasons that match actual school scenarios.

5. **Session Logic**: Students can be marked for AM only, PM only, or FULL day.

---

## 🔧 Troubleshooting

### Problem: Too Few Records

**Cause**: `nonPresentRate` is too low

**Solution**: Increase in config:
```javascript
nonPresentRate: 0.20,  // Change from 0.15 to 0.20 (20%)
```

### Problem: Wrong Status Distribution

**Cause**: `statusRates` don't add up to 1.0

**Solution**: Ensure they sum to 1.0:
```javascript
statusRates: {
  'absent': 0.60,    // 60%
  'late': 0.25,      // 25%
  'excused': 0.15    // 15%
}                    // Total: 100%
```

### Problem: Duplicate Records Error

**Cause**: Records already exist for same student/date/session

**Solution**: Script automatically skips duplicates. If error persists, delete and regenerate:
```bash
node scripts/delete-attendance-daily.js
node scripts/add-attendance-daily.js
```

---

## 📝 Quick Reference

### Generate Data
```bash
node scripts/add-attendance-daily.js
```

### Verify Data
```bash
node scripts/verify-attendance-daily.js
```

### Delete Data
```bash
node scripts/delete-attendance-daily.js
```

---

## 🎯 Best Practices

1. **Test First**: Always test with a single grade/semester before full generation
2. **Verify**: Run verification script after generation
3. **Backup**: If using real data, backup database first
4. **Adjust Rates**: Tweak `nonPresentRate` and `statusRates` to match your school's reality
5. **Holidays**: Add all school holidays to `skipHolidays` array

---

## 📞 Support

For issues or questions about attendance data generation, review this guide or check the script comments.

---

**Last Updated**: 2025-10-29  
**Script Version**: 1.0 (Daily Session Model)

