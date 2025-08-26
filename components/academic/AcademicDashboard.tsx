'use client'

import { SubjectManager } from './SubjectManager'
import { SchoolYearManager } from './SchoolYearManager'
import { CourseManager } from './CourseManager'
import { TeacherAssignment } from './TeacherAssignment'
import { useAcademicManagement } from '@/hooks/useAcademicManagement'

export function AcademicDashboard() {
  const {
    // Data
    subjects,
    filteredSubjects,
    schoolYears,
    courses,
    teachers,
    
    // Form state
    showSubjectForm,
    showYearForm,
    showCourseForm,
    newSubject,
    newSchoolYear,
    newCourse,
    
    // UI state
    submitting,
    searchTerm,
    viewMode,
    errors,
    
    // Actions
    setShowSubjectForm,
    setShowYearForm,
    setShowCourseForm,
    setNewSubject,
    setNewSchoolYear,
    setNewCourse,
    setSearchTerm,
    setViewMode,
    setErrors,
    
    // Functions
    handleAddSubject,
    handleAddSchoolYear,
    handleAddCourse,
    handleDeleteSubject,
    handleUpdateTeacherAssignment,
    handleRemoveTeacherAssignment
  } = useAcademicManagement()

  return (
    <div className="space-y-8">
      {/* School Year Management Section */}
      <SchoolYearManager
        schoolYears={schoolYears}
        showYearForm={showYearForm}
        newSchoolYear={newSchoolYear}
        submitting={submitting}
        errors={errors}
        onSetShowYearForm={setShowYearForm}
        onSetNewSchoolYear={setNewSchoolYear}
        onSetErrors={setErrors}
        onAddSchoolYear={handleAddSchoolYear}
      />
      
      {/* Subject Management Section */}
      <SubjectManager
        subjects={subjects}
        filteredSubjects={filteredSubjects}
        showSubjectForm={showSubjectForm}
        newSubject={newSubject}
        submitting={submitting}
        searchTerm={searchTerm}
        viewMode={viewMode}
        errors={errors}
        onSetShowSubjectForm={setShowSubjectForm}
        onSetNewSubject={setNewSubject}
        onSetSearchTerm={setSearchTerm}
        onSetViewMode={setViewMode}
        onSetErrors={setErrors}
        onAddSubject={handleAddSubject}
        onDeleteSubject={handleDeleteSubject}
      />
      
      {/* Course Management Section */}
      <CourseManager
        courses={courses}
        schoolYears={schoolYears}
        teachers={teachers}
        showCourseForm={showCourseForm}
        newCourse={newCourse}
        submitting={submitting}
        errors={errors}
        onSetShowCourseForm={setShowCourseForm}
        onSetNewCourse={setNewCourse}
        onSetErrors={setErrors}
        onAddCourse={handleAddCourse}
      />
      
      {/* Teacher Assignment Section */}
      <TeacherAssignment
        courses={courses}
        teachers={teachers}
        submitting={submitting}
        onUpdateTeacherAssignment={handleUpdateTeacherAssignment}
        onRemoveTeacherAssignment={handleRemoveTeacherAssignment}
      />
    </div>
  )
}
