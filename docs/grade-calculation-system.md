# Grade Calculation System Documentation

## Overview

This document provides a comprehensive guide to the grade calculation system used in the Friendship School project. The system implements a 3-tier grade level approach with different calculation methods for different educational levels.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Grade Level Divisions](#grade-level-divisions)
3. [Report Types](#report-types)
4. [Column Calculations](#column-calculations)
5. [Rounding System](#rounding-system)
6. [Data Flow](#data-flow)
7. [Implementation Details](#implementation-details)
8. [Examples](#examples)

## System Architecture

The grade calculation system consists of three main components:

1. **Database Layer**: Stores raw grade data
2. **API Layer**: Performs calculations using 3-tier grade rules
3. **PDF Generator Layer**: Applies rounding and displays results

```
Raw Grades → API Calculations → PDF Display
     ↓              ↓              ↓
  Database    (3-Tier Rules)   (Rounding)
```

## Grade Level Divisions

The system divides students into three distinct grade level groups:

### Grade 1-6 (Elementary)
- **Scale**: 10-point scale (0-10)
- **Calculation Method**: Simple average
- **Formula**: `totalGrade / number_of_subjects`
- **Example**: Grades [8, 7, 9, 6, 8] → Total: 38 → Average: 38÷5 = 7.6

### Grade 7-8 (Middle School)
- **Scale**: 100-point scale (0-100)
- **Calculation Method**: Fixed divisor
- **Formula**: `totalGrade / 14`
- **Example**: Total: 112 → Average: 112÷14 = 8.0

### Grade 9 (High School)
- **Scale**: 100-point scale (0-100)
- **Calculation Method**: Fixed divisor
- **Formula**: `totalGrade / 8.4`
- **Example**: Total: 84 → Average: 84÷8.4 = 10.0

## Report Types

### 1. Monthly Reports (បញ្ជីពិន្ទុប្រចាំខែ)

**Purpose**: Display grades for a specific month

**Columns**:
- ពិន្ទុមុខវិជ្ជា (Individual Subject Grades)
- ពិន្ទុសរុប (Total Grade)
- មធ្យមភាគ (Average Grade)

**Calculation**:
```typescript
// For all grade levels
totalGrade = sum of all subject grades
averageGrade = totalGrade / gradeLevelDivisor
```

### 2. Semester Reports (បញ្ជីពិន្ទុប្រចាំឆមាស)

**Purpose**: Display comprehensive semester performance

**Columns**:
- ពិន្ទុមុខវិជ្ជា (Individual Subject Grades)
- ពិន្ទុសរុបឆមាស (Total Semester Score)
- មធ្យមភាគឆមាស (Semester Average)
- មធ្យមភាគខែប្រចាំឆមាស (Monthly Average in Semester)
- មធ្យមភាគប្រចាំឆមាស (Overall Semester Average)

**Calculation Process**:
1. **Last Month Average**: Calculate using grade-level rules
2. **Previous Months Average**: Calculate each month individually, then average
3. **Overall Semester Average**: `(lastMonthAverage + previousMonthsAverage) / 2`

### 3. Yearly Reports (បញ្ជីពិន្ទុប្រចាំឆ្នាំ)

**Purpose**: Display annual performance combining both semesters

**Semester Structure**:
- **Semester 1**: Months 11/24, 12/24, 01/25, 02/25
- **Semester 2**: Months 04/25, 05/25, 06/25, 07/25, 08/25

**Columns**:
- ពិន្ទុមុខវិជ្ជា (Individual Subject Grades)
- ពិន្ទុសរុបប្រចាំឆ្នាំ (Total Yearly Score)
- មធ្យមភាគប្រចាំឆមាសទី ១ (Semester 1 Average)
- មធ្យមភាគប្រចាំឆមាសទី ២ (Semester 2 Average)
- មធ្យមភាគប្រចាំឆ្នាំ (Yearly Average)

**Calculation Process**:
1. **Subject Averages**: Complex semester logic for each subject
2. **Semester Averages**: Use semester calculation logic for each semester
3. **Yearly Average**: `(sem1Average + sem2Average) / 2`

## Column Calculations

### Individual Subject Grades

**All Grade Levels**:
```typescript
// Monthly Reports
subjectGrade = grade.grade // Direct from database

// Semester Reports  
subjectGrade = grade.grade // Direct from database

// Yearly Reports
subjectGrade = (sem1Grade + sem2Grade) / 2 // Average of both semesters
```

### Total Grade Calculations

**All Grade Levels**:
```typescript
// Monthly Reports
totalGrade = sum of all subject grades

// Semester Reports
totalGrade = sum of grades from last month of semester

// Yearly Reports
totalGrade = sum of all subject averages
```

### Average Grade Calculations

#### Grade 1-6
```typescript
// Monthly
averageGrade = totalGrade / number_of_subjects

// Semester
lastMonthAverage = lastMonthTotal / number_of_subjects
monthAverage = monthTotal / number_of_subjects
overallSemesterAverage = (lastMonthAverage + previousMonthsAverage) / 2

// Yearly - Complex semester logic
// Individual Subject Grade
sem1Grade = [grade(02/25) + (grade(11/24) + grade(12/24) + grade(01/25))/3] / 2
sem2Grade = [grade(08/25) + (grade(04/25) + grade(05/25) + grade(06/25) + grade(07/25))/4] / 2
subjectGrade = (sem1Grade + sem2Grade) / 2

// ពិន្ទុសរុបប្រចាំឆ្នាំ (Total yearly score)
totalGrade = sum of subjectGrade

// មធ្យមភាគប្រចាំឆមាសទី ១ (Semester 1 average)
sem1LastMonthAverage = sem1LastMonthTotal grade(02/25) / number_of_subjects
sem1PreviousMonthsAverage = average of previous months [(grade(11/24) + grade(12/24) + grade(01/25))/3] (using same rule)
sem1Average = (sem1LastMonthAverage + sem1PreviousMonthsAverage) / 2

// មធ្យមភាគប្រចាំឆមាសទី ២ (Semester 2 average)
sem2LastMonthAverage = sem2LastMonthTotal grade(08/25) / number_of_subjects
sem2PreviousMonthsAverage = average of previous months [(grade(04/25) + grade(05/25) + grade(06/25) + grade(07/25))/4] (using same rule)
sem2Average = (sem2LastMonthAverage + sem2PreviousMonthsAverage) / 2

// មធ្យមភាគប្រចាំឆ្នាំ (Yearly average)
yearlyAverage = (sem1Average + sem2Average) / 2
```

#### Grade 7-8
```typescript
// Monthly
averageGrade = totalGrade / 14

// Semester
lastMonthAverage = lastMonthTotal / 14
monthAverage = monthTotal / 14
overallSemesterAverage = (lastMonthAverage + previousMonthsAverage) / 2

// Yearly - Complex semester logic
// Individual Subject Grade
sem1Grade = [grade(02/25) + (grade(11/24) + grade(12/24) + grade(01/25))/3] / 2
sem2Grade = [grade(08/25) + (grade(04/25) + grade(05/25) + grade(06/25) + grade(07/25))/4] / 2
subjectGrade = (sem1Grade + sem2Grade) / 2

// ពិន្ទុសរុបប្រចាំឆ្នាំ (Total yearly score)
totalGrade = sum of subjectGrade

// មធ្យមភាគប្រចាំឆមាសទី ១ (Semester 1 average)
sem1LastMonthAverage = sem1LastMonthTotal grade(02/25) / 14
sem1PreviousMonthsAverage = average of previous months [(grade(11/24) + grade(12/24) + grade(01/25))/3] (using /14 rule)
sem1Average = (sem1LastMonthAverage + sem1PreviousMonthsAverage) / 2

// មធ្យមភាគប្រចាំឆមាសទី ២ (Semester 2 average)
sem2LastMonthAverage = sem2LastMonthTotal grade(08/25) / 14
sem2PreviousMonthsAverage = average of previous months [(grade(04/25) + grade(05/25) + grade(06/25) + grade(07/25))/4] (using /14 rule)
sem2Average = (sem2LastMonthAverage + sem2PreviousMonthsAverage) / 2

// មធ្យមភាគប្រចាំឆ្នាំ (Yearly average)
yearlyAverage = (sem1Average + sem2Average) / 2
```

#### Grade 9
```typescript
// Monthly
averageGrade = totalGrade / 8.4

// Semester
lastMonthAverage = lastMonthTotal / 8.4
monthAverage = monthTotal / 8.4
overallSemesterAverage = (lastMonthAverage + previousMonthsAverage) / 2

// Yearly - Complex semester logic
// Individual Subject Grade
sem1Grade = [grade(02/25) + (grade(11/24) + grade(12/24) + grade(01/25))/3] / 2
sem2Grade = [grade(08/25) + (grade(04/25) + grade(05/25) + grade(06/25) + grade(07/25))/4] / 2
subjectGrade = (sem1Grade + sem2Grade) / 2

// ពិន្ទុសរុបប្រចាំឆ្នាំ (Total yearly score)
totalGrade = sum of subjectGrade

// មធ្យមភាគប្រចាំឆមាសទី ១ (Semester 1 average)
sem1LastMonthAverage = sem1LastMonthTotal grade(02/25) / 8.4
sem1PreviousMonthsAverage = average of previous months [(grade(11/24) + grade(12/24) + grade(01/25))/3] (using /8.4 rule)
sem1Average = (sem1LastMonthAverage + sem1PreviousMonthsAverage) / 2

// មធ្យមភាគប្រចាំឆមាសទី ២ (Semester 2 average)
sem2LastMonthAverage = sem2LastMonthTotal grade(08/25) / 8.4
sem2PreviousMonthsAverage = average of previous months [(grade(04/25) + grade(05/25) + grade(06/25) + grade(07/25))/4] (using /8.4 rule)
sem2Average = (sem2LastMonthAverage + sem2PreviousMonthsAverage) / 2

// មធ្យមភាគប្រចាំឆ្នាំ (Yearly average)
yearlyAverage = (sem1Average + sem2Average) / 2
```

## Rounding System

### Mathematical Rounding Rules

The system applies proper mathematical rounding to 1 decimal place:

- **1.23** → **1.2** (rounds down)
- **1.25** → **1.3** (rounds up)
- **1.24** → **1.2** (rounds down)
- **1.26** → **1.3** (rounds up)

### Implementation

```typescript
const round = (num: number, decimals: number = 1): string => {
  return Number(num.toFixed(decimals)).toFixed(decimals)
}
```

### Application

Rounding is applied at the PDF display level, not during API calculations, to maintain precision during complex calculations.

## Data Flow

### 1. Grade Input
```
Teacher Input → Validation → Database Storage
     ↓              ↓              ↓
  UI Form    (0-100 range)    (Float type)
```

### 2. Grade Processing
```
Database → API Filtering → 3-Tier Calculations → Full Precision Numbers
    ↓           ↓              ↓                    ↓
Raw Grades  (by report type)  (grade level rules)  (no rounding)
```

### 3. Grade Display
```
Full Precision → PDF Generator → Rounding → Display
      ↓              ↓             ↓         ↓
   Numbers      (HTML generation)  (1 decimal)  (PDF)
```

## Implementation Details

### Database Schema

```sql
model Grade {
  gradeId      Int       @id @default(autoincrement())
  studentId    Int       -- Links to Student
  subjectId    Int       -- Links to Subject  
  semesterId   Int       -- Links to Semester
  gradeDate    String    -- Format: "MM/YY" (e.g., "01/25")
  grade        Float     -- The actual grade value (0-100)
  gradeComment String?   -- Optional comments
  courseId     Int       -- Links to Course
  userId       Int?      -- Links to User (teacher)
}
```

### API Calculation Logic

```typescript
// Grade level determination
const gradeNum = parseInt(student.class) || 0

// 3-tier calculation
if (gradeNum >= 1 && gradeNum <= 6) {
  averageGrade = totalGrade / subjects.length
} else if (gradeNum >= 7 && gradeNum <= 8) {
  averageGrade = totalGrade / 14
} else if (gradeNum === 9) {
  averageGrade = totalGrade / 8.4
}
```

### PDF Display Logic

```typescript
// Apply rounding to all displayed values
<td><strong>${round(student.averageGrade)}</strong></td>
<td><strong>${round(student.totalGrade)}</strong></td>
```

## Examples

### Example 1: Grade 5 Student (Elementary)

**Monthly Report**:
- Subject Grades: [8, 7, 9, 6, 8]
- Total Grade: 38
- Average Grade: 38 ÷ 5 = 7.6
- Display: 7.6

**Semester Report**:
- Last Month Total: 38
- Last Month Average: 38 ÷ 5 = 7.6
- Previous Months Average: 7.2
- Overall Semester Average: (7.6 + 7.2) ÷ 2 = 7.4
- Display: 7.4

**Yearly Report** (Complex Calculation):
- **Semester 1**: Months 11/24, 12/24, 01/25, 02/25
- **Semester 2**: Months 04/25, 05/25, 06/25, 07/25, 08/25

For Math subject:
- Semester 1 grades: 11/24=8, 12/24=7, 01/25=9, 02/25=8
- Semester 2 grades: 04/25=8, 05/25=7, 06/25=9, 07/25=8, 08/25=9

**Individual Subject Grade (Math)**:
```
sem1Grade = [8 + (8+7+9)/3] / 2 = [8 + 8] / 2 = 8.0
sem2Grade = [9 + (8+7+9+8)/4] / 2 = [9 + 8] / 2 = 8.5
subjectGrade = (8.0 + 8.5) / 2 = 8.25
```

**Semester 1 Average**:
```
Last Month (02/25): 8 / 1 = 8.0
Previous Months: (8+7+9)/3 = 8.0
sem1Average = (8.0 + 8.0) / 2 = 8.0
```

**Semester 2 Average**:
```
Last Month (08/25): 9 / 1 = 9.0
Previous Months: (8+7+9+8)/4 = 8.0
sem2Average = (9.0 + 8.0) / 2 = 8.5
```

**Yearly Average**:
```
yearlyAverage = (8.0 + 8.5) / 2 = 8.25
```

### Example 2: Grade 7 Student (Middle School)

**Monthly Report**:
- Subject Grades: [85, 90, 78, 92, 88]
- Total Grade: 433
- Average Grade: 433 ÷ 14 = 30.9
- Display: 30.9

**Yearly Report** (Complex Calculation):
For Math subject with grades:
- Semester 1: 11/24=85, 12/24=90, 01/25=78, 02/25=92
- Semester 2: 04/25=88, 05/25=85, 06/25=90, 07/25=78, 08/25=92

**Individual Subject Grade (Math)**:
```
sem1Grade = [92 + (85+90+78)/3] / 2 = [92 + 84.33] / 2 = 88.17
sem2Grade = [92 + (88+85+90+78)/4] / 2 = [92 + 85.25] / 2 = 88.63
subjectGrade = (88.17 + 88.63) / 2 = 88.4
```

**Semester 1 Average**:
```
Last Month (02/25): 92 / 14 = 6.57
Previous Months: (85+90+78)/3 / 14 = 84.33 / 14 = 6.02
sem1Average = (6.57 + 6.02) / 2 = 6.30
```

**Semester 2 Average**:
```
Last Month (08/25): 92 / 14 = 6.57
Previous Months: (88+85+90+78)/4 / 14 = 85.25 / 14 = 6.09
sem2Average = (6.57 + 6.09) / 2 = 6.33
```

**Yearly Average**:
```
yearlyAverage = (6.30 + 6.33) / 2 = 6.32
```

### Example 3: Grade 9 Student (High School)

**Monthly Report**:
- Subject Grades: [85, 90, 78, 92, 88]
- Total Grade: 433
- Average Grade: 433 ÷ 8.4 = 51.5
- Display: 51.5

**Yearly Report** (Complex Calculation):
For Math subject with grades:
- Semester 1: 11/24=85, 12/24=90, 01/25=78, 02/25=92
- Semester 2: 04/25=88, 05/25=85, 06/25=90, 07/25=78, 08/25=92

**Individual Subject Grade (Math)**:
```
sem1Grade = [92 + (85+90+78)/3] / 2 = [92 + 84.33] / 2 = 88.17
sem2Grade = [92 + (88+85+90+78)/4] / 2 = [92 + 85.25] / 2 = 88.63
subjectGrade = (88.17 + 88.63) / 2 = 88.4
```

**Semester 1 Average**:
```
Last Month (02/25): 92 / 8.4 = 10.95
Previous Months: (85+90+78)/3 / 8.4 = 84.33 / 8.4 = 10.04
sem1Average = (10.95 + 10.04) / 2 = 10.50
```

**Semester 2 Average**:
```
Last Month (08/25): 92 / 8.4 = 10.95
Previous Months: (88+85+90+78)/4 / 8.4 = 85.25 / 8.4 = 10.15
sem2Average = (10.95 + 10.15) / 2 = 10.55
```

**Yearly Average**:
```
yearlyAverage = (10.50 + 10.55) / 2 = 10.53
```

## Grade Status Calculation

### Grades 1-6
- ល្អ (Excellent): > 8
- ល្អបង្គួរ (Good): ≥ 6.5
- មធ្យម (Average): ≥ 5
- ខ្សោយ (Poor): < 5

### Grades 7-9
- ល្អ (Excellent): ≥ 40%
- ល្អបង្គួរ (Good): ≥ 32.5%
- មធ្យម (Average): ≥ 25%
- ខ្សោយ (Poor): < 25%

## Key Features

✅ **3-Tier Grade System**: Different calculations for different grade levels  
✅ **Proper Rounding**: Mathematical rounding to 1 decimal place  
✅ **Multiple Report Types**: Monthly, Semester, Yearly  
✅ **Complex Semester Logic**: Last month + previous months averaging  
✅ **Grade Status**: Different thresholds for different grade levels  
✅ **Data Validation**: Grade range, date format validation  
✅ **Consistent Display**: All grades rounded consistently  

## Conclusion

The grade calculation system provides a comprehensive and flexible approach to calculating and displaying student grades across different educational levels. The 3-tier system ensures appropriate calculations for each grade level while maintaining consistency in rounding and display across all report types.

The system is designed to be:
- **Accurate**: Proper mathematical calculations
- **Consistent**: Same rules applied everywhere
- **Flexible**: Different rules for different grade levels
- **User-friendly**: Clear display with proper rounding
