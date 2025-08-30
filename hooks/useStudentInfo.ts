import { useState, useEffect } from 'react';

interface Student {
  studentId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | Date;
  class: string;
  photo?: string;
  phone?: string;
  registrationDate?: string | Date;
  status?: string;
  religion?: string;
  health?: string;
  emergencyContact?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  classId?: number;
  needsClothes?: boolean;
  needsMaterials?: boolean;
  needsTransport?: boolean;
  previousSchool?: string;
  registerToStudy?: boolean;
  studentBirthDistrict?: string;
  studentDistrict?: string;
  studentHouseNumber?: string;
  studentProvince?: string;
  studentVillage?: string;
  transferReason?: string;
  vaccinated?: boolean;
  schoolYear?: string;
}

interface SchoolYear {
  schoolYearId: number;
  schoolYearCode: string;
  createdAt: string;
}

export const useStudentInfo = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch school years
  const fetchSchoolYears = async () => {
    try {
      const response = await fetch('/api/school-years');
      if (!response.ok) throw new Error('Failed to fetch school years');
      const data = await response.json();
      setSchoolYears(data);
    } catch (err) {
      console.error('Failed to fetch school years:', err);
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...students];

    if (selectedSchoolYear) {
      filtered = filtered.filter(student => student.schoolYear === selectedSchoolYear);
    }

    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    }

    if (selectedStatus) {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(term) ||
        student.lastName.toLowerCase().includes(term) ||
        student.phone?.toLowerCase().includes(term) ||
        student.emergencyContact?.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedSchoolYear('');
    setSelectedClass('');
    setSearchTerm('');
    setSelectedStatus('');
    setFilteredStudents(students);
  };

  // Initialize data
  useEffect(() => {
    fetchStudents();
    fetchSchoolYears();
    fetchClasses();
  }, []);

  // Apply filters when filter states change
  useEffect(() => {
    applyFilters();
  }, [selectedSchoolYear, selectedClass, searchTerm, selectedStatus, students]);

  return {
    students,
    filteredStudents,
    schoolYears,
    classes,
    loading,
    error,
    selectedSchoolYear,
    setSelectedSchoolYear,
    selectedClass,
    setSelectedClass,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    refetch: fetchStudents,
  };
};
