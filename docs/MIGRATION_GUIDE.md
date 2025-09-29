# ID Card Routes Migration Guide

## Overview
The individual ID card generation routes have been consolidated into a single unified route: `/api/pdf-generate/generate-id-cards`

## File Changes
- `route-utils.ts` has been renamed to `utils.ts` for better naming consistency

## Old Routes (To Be Deprecated)
- `/api/pdf-generate/generate-bulk-student-id-card` (single student)
- `/api/pdf-generate/generate-bulk-student-id-cards-back` (student backs)
- `/api/pdf-generate/generate-bulk-teacher-id-cards` (bulk teachers)

## New Unified Route
- `/api/pdf-generate/generate-id-cards` (handles all ID card generation)

## API Changes

### Student ID Cards

#### Single Student ID Card
**Old:**
```typescript
POST /api/pdf-generate/generate-bulk-student-id-card
{
  "studentId": 123
}
```

**New:**
```typescript
POST /api/pdf-generate/generate-id-cards
{
  "type": "student",
  "variant": "single",
  "studentIds": [123]
}
```

#### Bulk Student ID Cards (Front)
**Old:**
```typescript
POST /api/pdf-generate/generate-bulk-student-id-cards
{
  "studentIds": [1, 2, 3, 4],
  "schoolYear": "2024-2025"
}
```

**New:**
```typescript
POST /api/pdf-generate/generate-id-cards
{
  "type": "student",
  "variant": "bulk",
  "studentIds": [1, 2, 3, 4],
  "schoolYear": "2024-2025"
}
```

#### Bulk Student ID Cards (Back)
**Old:**
```typescript
POST /api/pdf-generate/generate-bulk-student-id-cards-back
{
  "studentIds": [1, 2, 3, 4],
  "schoolYear": "2024-2025"
}
```

**New:**
```typescript
POST /api/pdf-generate/generate-id-cards
{
  "type": "student",
  "variant": "back",
  "studentIds": [1, 2, 3, 4],
  "schoolYear": "2024-2025"
}
```

#### Class-based Generation
**Old:**
```typescript
POST /api/pdf-generate/generate-bulk-student-id-cards
{
  "classId": "1A",
  "schoolYear": "2024-2025"
}
```

**New:**
```typescript
POST /api/pdf-generate/generate-id-cards
{
  "type": "student",
  "variant": "bulk", // or "back"
  "classId": "1A",
  "schoolYear": "2024-2025"
}
```

### Teacher ID Cards

#### Single Teacher ID Card
**Old:**
```typescript
POST /api/pdf-generate/generate-teacher-id-card
{
  "userId": 123
}
```

**New:**
```typescript
POST /api/pdf-generate/generate-id-cards
{
  "type": "teacher",
  "variant": "single",
  "userIds": [123]
}
```

#### Bulk Teacher ID Cards
**Old:**
```typescript
POST /api/pdf-generate/generate-bulk-teacher-id-cards
{
  "userIds": [1, 2, 3, 4],
  "schoolYear": "2024-2025"
}
```

**New:**
```typescript
POST /api/pdf-generate/generate-id-cards
{
  "type": "teacher",
  "variant": "bulk",
  "userIds": [1, 2, 3, 4],
  "schoolYear": "2024-2025"
}
```

## Request Parameters

### Common Parameters
- `type`: `"student" | "teacher"` - Type of ID card to generate
- `variant`: `"single" | "bulk" | "back"` - Generation variant
- `schoolYear`: `string` (optional) - School year, defaults to "2024-2025"

### Student-specific Parameters
- `studentIds`: `number[]` (optional) - Array of student IDs
- `classId`: `string` (optional) - Class identifier
- `courseId`: `number` (optional) - Course ID

### Teacher-specific Parameters
- `userIds`: `number[]` - Array of user IDs

## Validation Rules

### Student ID Cards
- For `single` variant: exactly 1 studentId required
- For `bulk` variant: maximum 4 studentIds allowed
- At least one of `studentIds`, `classId`, or `courseId` must be provided

### Teacher ID Cards
- For `single` variant: exactly 1 userId required
- For `bulk` variant: maximum 4 userIds allowed
- `userIds` array is required

## Error Responses

All error responses follow the same format:
```typescript
{
  "error": "Error message",
  "details": "Additional error details" // optional
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `404` - Not Found (no students/teachers found)
- `500` - Internal Server Error

## Migration Steps

1. **Update Frontend Calls**: Replace all old route calls with new unified route
2. **Test Functionality**: Verify all ID card generation works correctly
3. **Remove Old Routes**: Delete the old route files after migration is complete
4. **Update Documentation**: Update any API documentation

## Benefits of New Route

1. **Unified API**: Single endpoint for all ID card generation
2. **Consistent Error Handling**: Standardized error responses
3. **Better Validation**: Comprehensive input validation
4. **Reduced Code Duplication**: Shared utilities and logic
5. **Easier Maintenance**: Single codebase to maintain
6. **Better Performance**: Optimized data fetching and processing
