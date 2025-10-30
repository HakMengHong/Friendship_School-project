import { prisma } from '@/lib/prisma'

/**
 * Log user activity to the database
 * @param userId - The ID of the user performing the action
 * @param action - Description of the action (in Khmer)
 * @param details - Additional details about the action (optional)
 */
export async function logActivity(
  userId: number,
  action: string,
  details?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || null
      }
    })
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break main functionality
    console.error('Failed to log activity:', error)
  }
}

/**
 * Common activity log messages in Khmer
 */
export const ActivityMessages = {
  // ==========================================
  // Authentication & Session
  // ==========================================
  LOGIN: 'ចូលប្រើប្រាស់ប្រព័ន្ធ',
  LOGOUT: 'ចេញពីប្រព័ន្ធ',
  
  // ==========================================
  // Students Management
  // ==========================================
  ADD_STUDENT: 'បន្ថែមសិស្សថ្មី',
  EDIT_STUDENT: 'កែប្រែព័ត៌មានសិស្ស',
  DELETE_STUDENT: 'លុបសិស្ស',
  VIEW_STUDENT: 'មើលព័ត៌មានសិស្ស',
  SEARCH_STUDENT: 'ស្វែងរកសិស្ស',
  
  // ==========================================
  // Attendance Management
  // ==========================================
  RECORD_ATTENDANCE: 'កត់ត្រាវត្តមាន',
  UPDATE_ATTENDANCE: 'ធ្វើបច្ចុប្បន្នភាពវត្តមាន',
  DELETE_ATTENDANCE: 'លុបកំណត់ត្រាវត្តមាន',
  VIEW_ATTENDANCE: 'មើលរបាយការណ៍វត្តមាន',
  
  // ==========================================
  // Grades Management
  // ==========================================
  ADD_GRADE: 'បញ្ចូលពិន្ទុ',
  EDIT_GRADE: 'កែប្រែពិន្ទុ',
  DELETE_GRADE: 'លុបពិន្ទុ',
  IMPORT_GRADES: 'នាំចូលពិន្ទុពី Excel',
  VIEW_GRADEBOOK: 'មើលបញ្ជីពិន្ទុ',
  
  // ==========================================
  // Users Management
  // ==========================================
  ADD_USER: 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី',
  EDIT_USER: 'កែប្រែព័ត៌មានអ្នកប្រើប្រាស់',
  DELETE_USER: 'លុបអ្នកប្រើប្រាស់',
  UPDATE_PROFILE: 'ធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប',
  CHANGE_PASSWORD: 'ផ្លាស់ប្តូរលេខសម្ងាត់',
  UPLOAD_PROFILE_PHOTO: 'ផ្ទុកឡើងរូបភាពប្រវត្តិរូប',
  
  // ==========================================
  // Courses Management
  // ==========================================
  ADD_COURSE: 'បង្កើតថ្នាក់រៀនថ្មី',
  EDIT_COURSE: 'កែប្រែថ្នាក់រៀន',
  DELETE_COURSE: 'លុបថ្នាក់រៀន',
  ASSIGN_TEACHER: 'ចាត់តាំងគ្រូបង្រៀន',
  
  // ==========================================
  // Enrollment Management
  // ==========================================
  ENROLL_STUDENT: 'ចុះឈ្មោះសិស្សចូលថ្នាក់',
  DROP_STUDENT: 'ដកសិស្សចេញពីថ្នាក់',
  UPDATE_ENROLLMENT: 'ធ្វើបច្ចុប្បន្នភាពការចុះឈ្មោះ',
  
  // ==========================================
  // Academic Setup
  // ==========================================
  ADD_SUBJECT: 'បន្ថែមមុខវិជ្ជាថ្មី',
  EDIT_SUBJECT: 'កែប្រែមុខវិជ្ជា',
  DELETE_SUBJECT: 'លុបមុខវិជ្ជា',
  ADD_SEMESTER: 'បង្កើតឆមាសថ្មី',
  EDIT_SEMESTER: 'កែប្រែឆមាស',
  DELETE_SEMESTER: 'លុបឆមាស',
  ADD_SCHOOL_YEAR: 'បង្កើតឆ្នាំសិក្សាថ្មី',
  EDIT_SCHOOL_YEAR: 'កែប្រែឆ្នាំសិក្សា',
  DELETE_SCHOOL_YEAR: 'លុបឆ្នាំសិក្សា',
  
  // ==========================================
  // Reports & PDF Generation
  // ==========================================
  GENERATE_REPORT: 'បង្កើតរបាយការណ៍',
  GENERATE_GRADE_REPORT: 'បង្កើតរបាយការណ៍ពិន្ទុ',
  GENERATE_ATTENDANCE_REPORT: 'បង្កើតរបាយការណ៍វត្តមាន',
  GENERATE_STUDENT_LIST: 'បង្កើតបញ្ជីឈ្មោះសិស្ស',
  GENERATE_GRADEBOOK: 'បង្កើតសៀវភៅពិន្ទុ',
  GENERATE_ID_CARD: 'បង្កើតប័ណ្ណសំគាល់',
  GENERATE_STUDENT_ID_CARD: 'បង្កើតប័ណ្ណសំគាល់សិស្ស',
  GENERATE_TEACHER_ID_CARD: 'បង្កើតប័ណ្ណសំគាល់គ្រូ',
  GENERATE_REGISTRATION_FORM: 'បង្កើតទម្រង់ចុះឈ្មោះ',
  
  // ==========================================
  // Data Operations
  // ==========================================
  EXPORT_DATA: 'នាំចេញទិន្នន័យ',
  IMPORT_DATA: 'នាំចូលទិន្នន័យ',
  BACKUP_DATABASE: 'បម្រុងទុកទិន្នន័យ',
  RESTORE_DATABASE: 'ស្តារទិន្នន័យ',
  
  // ==========================================
  // System Administration
  // ==========================================
  VIEW_DASHBOARD: 'មើលផ្ទាំងគ្រប់គ្រង',
  VIEW_STATISTICS: 'មើលស្ថិតិ',
  SYSTEM_SETTINGS: 'កំណត់ការប្រព័ន្ធ',
  VIEW_ACTIVITY_LOG: 'មើលកំណត់ត្រាសកម្មភាព',
}

