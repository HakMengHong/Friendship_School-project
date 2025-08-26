'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { GradeManagementDashboard } from "@/components/grade/GradeManagementDashboard"
import { useGradeManagement } from "@/hooks/useGradeManagement"

export default function AddGradeRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <AddGradeRefactoredContent />
    </RoleGuard>
  )
}

function AddGradeRefactoredContent() {
  const {
    // Filter states
    selectedSchoolYear,
    selectedSemester,
    selectedCourse,
    selectedSubject,
    selectedMonth,
    selectedGradeYear,
    searchTerm,
    
    // Data states
    schoolYears,
    semesters,
    courses,
    subjects,
    students,
    grades,
    
    // Form states
    selectedStudent,
    editingGrade,
    score,
    comment,
    
    // Loading states
    loading,
    loadingStudents,
    loadingGrades,
    submitting,
    
    // Options
    months,
    gradeYears,
    
    // Actions
    setSearchTerm,
    setScore,
    setComment,
    
    // Functions
    handleSchoolYearChange,
    handleSemesterChange,
    handleCourseChange,
    handleSubjectChange,
    handleStudentSelect,
    handleScoreSubmit,
    handleEditGrade,
    handleCancelEdit,
    handleGradeDelete,
    getGradeLabel
  } = useGradeManagement()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          ការគ្រប់គ្រងពិន្ទុ
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          បន្ថែម កែប្រែ និងគ្រប់គ្រងពិន្ទុសិស្ស
        </p>
      </div>
      
      <GradeManagementDashboard
        // Filter states
        selectedSchoolYear={selectedSchoolYear}
        selectedSemester={selectedSemester}
        selectedCourse={selectedCourse}
        selectedSubject={selectedSubject}
        selectedMonth={selectedMonth}
        selectedGradeYear={selectedGradeYear}
        searchTerm={searchTerm}
        
        // Data states
        schoolYears={schoolYears}
        semesters={semesters}
        courses={courses}
        subjects={subjects}
        students={students}
        grades={grades}
        
        // Form states
        selectedStudent={selectedStudent}
        editingGrade={editingGrade}
        score={score}
        comment={comment}
        
        // Loading states
        loading={loading}
        loadingStudents={loadingStudents}
        loadingGrades={loadingGrades}
        submitting={submitting}
        
        // Options
        months={months}
        gradeYears={gradeYears}
        
        // Functions
        onSchoolYearChange={handleSchoolYearChange}
        onSemesterChange={handleSemesterChange}
        onCourseChange={handleCourseChange}
        onSubjectChange={handleSubjectChange}
        onMonthChange={setSelectedMonth}
        onGradeYearChange={setSelectedGradeYear}
        onSearchChange={setSearchTerm}
        onStudentSelect={handleStudentSelect}
        onScoreChange={setScore}
        onCommentChange={setComment}
        onSubmit={handleScoreSubmit}
        onCancelEdit={handleCancelEdit}
        onEditGrade={handleEditGrade}
        onDeleteGrade={handleGradeDelete}
        getGradeLabel={getGradeLabel}
      />
    </div>
  )
}
