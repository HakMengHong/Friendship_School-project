'use client'

import { useState, useEffect, useRef } from "react";
import { RoleGuard } from "@/components/ui/role-guard";

// Type definitions
interface Course {
  courseId: number;
  grade: string;
  section: string;
  courseName: string;
  schoolYear: {
    schoolYearId: number;
    schoolYearCode: string;
  };
}

interface Guardian {
  guardianId: number;
  firstName?: string;
  lastName?: string;
  relation: string;
  phone?: string;
  occupation?: string;
  houseNumber?: string;
  village?: string;
  district?: string;
  province?: string;
  birthDistrict?: string;
  church?: string;
  income?: number;
  childrenCount?: number;
  believeJesus?: boolean;
}

interface FamilyInfo {
  familyinfoId: number;
  canHelpSchool?: boolean;
  churchName?: string;
  durationInKPC?: string;
  helpAmount?: number;
  helpFrequency?: string;
  knowSchool?: string;
  livingCondition?: string;
  livingWith?: string;
  organizationHelp?: string;
  ownHouse?: boolean;
  religion?: string;
  povertyCard?: string;
}

interface Enrollment {
  enrollmentId: number;
  courseId: number;
  studentId: number;
  drop: boolean;
  dropSemesterId?: number;
  dropDate?: string | Date;
  dropReason?: string;
  course?: Course;
  dropSemester?: {
    semesterId: number;
    semester: string;
    semesterCode: string;
  };
}

interface Student {
  studentId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | Date;
  class: string;
  section?: string;
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
  family?: FamilyInfo;
  guardians?: Guardian[];
  enrollments?: Enrollment[];
}

// API response interfaces
interface SchoolYearResponse {
  schoolYearId: number;
  schoolYearCode: string;
  createdAt: string;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  User, 
  Users, 
  BookOpen, 
  Home, 
  HeartPulse, 
  Award, 
  CalendarCheck, 
  Grape, 
  ChevronDown, 
  Calendar,
  Search,
  Phone,
  MapPin,
  GraduationCap,
  AlertCircle,
  X,
  MinusCircle,
  Save,
  RotateCcw,
  Trash2,
  Loader2,
  Upload
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Helpers for displaying grade labels
const getGradeLabel = (value?: string | null) => {
  if (!value) return "-";
  // Don't convert to number to preserve section letter (e.g., "8A" should stay "8A")
  return `ថ្នាក់ទី ${value}`;
};

// Helper to get full class name with section from enrollment
const getStudentFullClass = (student: Student): string => {
  // Try to get class from active enrollment (includes section)
  if (student.enrollments && student.enrollments.length > 0) {
    const activeEnrollment = student.enrollments.find(e => !e.drop);
    if (activeEnrollment?.course) {
      return `${activeEnrollment.course.grade}${activeEnrollment.course.section}`;
    }
  }
  // Fallback to student.class (might not have section)
  return student.class || "-";
};

// Helper to get school year from enrollment
const getStudentSchoolYear = (student: Student): string | undefined => {
  // Try to get school year from active enrollment
  if (student.enrollments && student.enrollments.length > 0) {
    const activeEnrollment = student.enrollments.find(e => !e.drop);
    if (activeEnrollment?.course?.schoolYear) {
      return activeEnrollment.course.schoolYear.schoolYearCode;
    }
  }
  // Fallback to student.schoolYear
  return student.schoolYear;
};

// Helper for displaying course labels (grade + section)
const getCourseLabel = (course: Course) => {
  return `ថ្នាក់ទី ${course.grade}${course.section}`;
};


// Helpers for dates/age
const formatDate = (value?: string | Date | null) => {
  if (!value) return '-';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  
  // Format as DD/MM/YYYY
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const calculateAgeYears = (dob?: string | Date | null): number | null => {
  if (!dob) return null;
  const birth = typeof dob === 'string' ? new Date(dob) : dob;
  if (Number.isNaN(birth.getTime())) return null;
  
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  
  // Return null for invalid ages (negative or unrealistic for school)
  if (years < 0) return null;
  
  return years;
};

// Helper function for displaying status labels
const getStatusLabel = (status?: string | null) => {
  if (!status) return 'គ្មាន';
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'កំពុងសិក្សា';
    case 'inactive':
      return 'បោះបង់ការសិក្សា';
    default:
      return status;
  }
};

// Helper function for translating relations to Khmer
const getRelationLabel = (relation?: string | null) => {
  if (!relation) return '-';
  
  const relationLower = relation.toLowerCase().trim();
  
  switch (relationLower) {
    case 'father':
    case 'dad':
      return 'ឪពុក';
    case 'mother':
    case 'mom':
      return 'ម្តាយ';
    case 'grandfather':
      return 'ជីតា';
    case 'grandmother':
      return 'ជីដូន';
    case 'uncle':
      return 'មីង';
    case 'aunt':
      return 'មីង';
    case 'brother':
      return 'បងប្អូនប្រុស';
    case 'sister':
      return 'បងប្អូនស្រី';
    case 'guardian':
      return 'អាណាព្យាបាល';
    case 'stepfather':
      return 'ឪពុកចុង';
    case 'stepmother':
      return 'ម្តាយចុង';
    default:
      return relation; // Return original if no translation found
  }
};

// Helper function for translating living with to Khmer
const getLivingWithLabel = (livingWith?: string | null) => {
  if (!livingWith) return '-';
  
  const livingLower = livingWith.toLowerCase().trim();
  
  switch (livingLower) {
    case 'parents':
    case 'both parents':
      return 'មាតាបិតា';
    case 'father':
      return 'ឪពុក';
    case 'mother':
      return 'ម្តាយ';
    case 'grandparents':
      return 'ជីតា-ជីដូន';
    case 'grandfather':
      return 'ជីតា';
    case 'grandmother':
      return 'ជីដូន';
    case 'uncle':
      return 'មីង';
    case 'aunt':
      return 'មីង';
    case 'siblings':
      return 'បងប្អូន';
    case 'relatives':
      return 'សាច់ញាតិ';
    case 'guardian':
      return 'អាណាព្យាបាល';
    case 'alone':
      return 'នៅម្នាក់ឯង';
    default:
      return livingWith; // Return original if no translation found
  }
};

// Helper function for translating living condition to Khmer
const getLivingConditionLabel = (condition?: string | null) => {
  if (!condition) return '-';
  
  const conditionLower = condition.toLowerCase().trim();
  
  switch (conditionLower) {
    case 'poor':
    case 'very poor':
      return 'ក្រីក្រ';
    case 'medium':
    case 'average':
    case 'moderate':
      return 'មធ្យម';
    case 'good':
    case 'well':
      return 'ល្អ';
    case 'very good':
    case 'excellent':
      return 'ល្អប្រសើរ';
    case 'rich':
      return 'មាន';
    default:
      return condition; // Return original if no translation found
  }
};

// Helper function for translating religion to Khmer
const getReligionLabel = (religion?: string | null) => {
  if (!religion) return '-';
  
  const religionLower = religion.toLowerCase().trim();
  
  switch (religionLower) {
    case 'buddhism':
    case 'buddhist':
      return 'ព្រះពុទ្ធសាសនា';
    case 'christianity':
    case 'christian':
      return 'គ្រិស្តសាសនា';
    case 'islam':
    case 'muslim':
      return 'សាសនាឥស្លាម';
    case 'hinduism':
    case 'hindu':
      return 'សាសនាហិណ្ឌូ';
    case 'none':
    case 'no religion':
      return 'គ្មានសាសនា';
    case 'other':
      return 'ផ្សេងៗ';
    default:
      return religion; // Return original if no translation found
  }
};

// Helper function for translating duration in KPC to Khmer
const getDurationLabel = (duration?: string | null) => {
  if (!duration) return '-';
  
  const durationLower = duration.toLowerCase().trim();
  
  // Handle year/month patterns
  if (durationLower.includes('year')) {
    const yearMatch = durationLower.match(/(\d+)\s*year/);
    if (yearMatch) {
      return `${yearMatch[1]} ឆ្នាំ`;
    }
  }
  
  if (durationLower.includes('month')) {
    const monthMatch = durationLower.match(/(\d+)\s*month/);
    if (monthMatch) {
      return `${monthMatch[1]} ខែ`;
    }
  }
  
  // Common durations
  switch (durationLower) {
    case '1 year':
      return '១ ឆ្នាំ';
    case '2 years':
      return '២ ឆ្នាំ';
    case '3 years':
      return '៣ ឆ្នាំ';
    case '4 years':
      return '៤ ឆ្នាំ';
    case '5 years':
      return '៥ ឆ្នាំ';
    case '6 months':
      return '៦ ខែ';
    case 'less than 1 year':
    case 'less than a year':
      return 'តិចជាងមួយឆ្នាំ';
    case 'more than 5 years':
      return 'លើសពី៥ឆ្នាំ';
    default:
      // If it's just a number, add "ឆ្នាំ" (years)
      if (/^\d+$/.test(duration.trim())) {
        return `${duration.trim()} ឆ្នាំ`;
      }
      return duration; // Return original if no translation found
  }
};

// Helper function for translating help frequency to Khmer
const getFrequencyLabel = (frequency?: string | null) => {
  if (!frequency) return '-';
  
  const frequencyLower = frequency.toLowerCase().trim();
  
  // Handle patterns with numbers
  if (frequencyLower.includes('year')) {
    const yearMatch = frequencyLower.match(/(\d+)\s*year/);
    if (yearMatch) {
      return `${yearMatch[1]} ឆ្នាំ`;
    }
  }
  
  if (frequencyLower.includes('month')) {
    const monthMatch = frequencyLower.match(/(\d+)\s*month/);
    if (monthMatch) {
      return `${monthMatch[1]} ខែ`;
    }
  }
  
  if (frequencyLower.includes('week')) {
    const weekMatch = frequencyLower.match(/(\d+)\s*week/);
    if (weekMatch) {
      return `${weekMatch[1]} សប្តាហ៍`;
    }
  }
  
  // Common frequencies
  switch (frequencyLower) {
    case 'year':
    case 'yearly':
    case 'per year':
    case 'annual':
    case 'annually':
      return 'ក្នុងមួយឆ្នាំ';
    case 'month':
    case 'monthly':
    case 'per month':
      return 'ក្នុងមួយខែ';
    case 'week':
    case 'weekly':
    case 'per week':
      return 'ក្នុងមួយសប្តាហ៍';
    case 'semester':
    case 'per semester':
      return 'ក្នុងមួយឆមាស';
    case 'term':
    case 'per term':
      return 'ក្នុងមួយនិស្សិត';
    case 'once':
    case 'one time':
      return 'មួយដង';
    case 'daily':
    case 'per day':
      return 'ក្នុងមួយថ្ងៃ';
    default:
      return frequency; // Return original if no translation found
  }
};

const tabs = [
  { id: 'basic', label: 'ការសិក្សា', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'address', label: 'អាសយដ្ឋាន', icon: <MapPin className="h-4 w-4" /> },
  { id: 'family', label: 'គ្រួសារ', icon: <Home className="h-4 w-4" /> },
  { id: 'guardian', label: 'អាណាព្យាបាល', icon: <Users className="h-4 w-4" /> }
];

export default function StudentInfoPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <StudentInfoContent />
    </RoleGuard>
  )
}

function StudentInfoContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByYearClass, setFilterByYearClass] = useState(true);
  const [selectedYear, setSelectedYear] = useState(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studentInfo_selectedYear') || '';
    }
    return '';
  });
  const [selectedClass, setSelectedClass] = useState(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studentInfo_selectedClass') || '';
    }
    return '';
  });
  
  // Drop Study Dialog State
  const [showDropDialog, setShowDropDialog] = useState(false);
  const [dropFormData, setDropFormData] = useState({
    dropCourseId: '',
    dropSemesterId: '',
    dropDate: '',
    dropReason: ''
  });
  const [isDropping, setIsDropping] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showDropFields, setShowDropFields] = useState(false);
  const [currentDropEnrollment, setCurrentDropEnrollment] = useState<Enrollment | null>(null);
  
  // Toast hook
  const { toast } = useToast();

  // Photo upload states
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);

  // Remove Drop Study Dialog State
  const [showRemoveDropDialog, setShowRemoveDropDialog] = useState(false);
  const [selectedDropEnrollment, setSelectedDropEnrollment] = useState<Enrollment | null>(null);

  // Clear selected class when school year changes
  useEffect(() => {
    setSelectedClass('');
  }, [selectedYear]);

  // Save filter state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentInfo_selectedYear', selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentInfo_selectedClass', selectedClass);
    }
  }, [selectedClass]);

  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Database-driven filter values
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Array<{semesterId: number, semester: string, semesterCode: string}>>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Fetch students from API
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/students');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const list = Array.isArray(data) ? data : []; // API returns array directly, not wrapped in students object
        if (isMounted) {
          console.log('🔍 Students loaded:', {
            count: list.length,
            students: list.map(s => ({
              name: `${s.lastName} ${s.firstName}`,
              class: s.class,
              section: s.section,
              schoolYear: s.schoolYear,
              photo: s.photo // Add photo to debug log
            }))
          });
          setStudents(list);
          setFilteredStudents(list);
        }
      } catch {
        // keep empty
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    // Listen for cross-page updates
    function handleUpdated() {
      load();
    }
    function handleStorage(e: StorageEvent) {
      if (e.key === 'studentsUpdatedAt') {
        load();
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('students:updated', handleUpdated as EventListener);
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('students:updated', handleUpdated as EventListener);
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  useEffect(() => {
    let result = students;
    
    console.log('🔍 Filtering Debug:', {
      totalStudents: students.length,
      selectedYear,
      selectedClass,
      coursesCount: courses.length,
      courses: courses.map(c => ({ courseId: c.courseId, grade: c.grade, section: c.section }))
    });
    
    // Apply year and class filters FIRST (this affects both dropdown and student list)
      if (selectedYear && selectedYear !== 'all') {
        result = result.filter(student => (student.schoolYear || '') === selectedYear);
      console.log('After year filter:', result.length);
      }
      if (selectedClass && selectedClass !== 'all') {
      // selectedClass is now a courseId, so we need to find the course and match by grade + section
      const selectedCourse = courses.find(course => course.courseId.toString() === selectedClass);
      console.log('Selected course:', selectedCourse);
      if (selectedCourse) {
        const beforeFilter = result.length;
        result = result.filter(student => {
          // First try exact match with both grade and section
          const exactMatch = student.class === selectedCourse.grade && 
            student.section === selectedCourse.section;
          
          // If no exact match, try just grade match (fallback)
          const gradeMatch = student.class === selectedCourse.grade && 
            (!student.section || !selectedCourse.section);
          
          const matches = exactMatch || gradeMatch;
          
          console.log('Student match check:', {
            studentName: `${student.lastName} ${student.firstName}`,
            studentClass: student.class,
            studentSection: student.section,
            courseGrade: selectedCourse.grade,
            courseSection: selectedCourse.section,
            exactMatch,
            gradeMatch,
            finalMatch: matches
          });
          return matches;
        });
        console.log('After class filter:', beforeFilter, '->', result.length);
      }
    }
    
    // Apply search term filter to the already filtered results
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.firstName?.toLowerCase().includes(term) || 
        student.lastName?.toLowerCase().includes(term) ||
        (student.studentId && student.studentId.toString().includes(term))
      );
    }
    
    // Sort results by Khmer alphabetical order
    result.sort((a, b) => {
      // Khmer alphabet order: consonants + independent vowels
      const khmerOrder = 'កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអអាឥឦឧឨឩឪឫឬឭឮឯឰឱឲឳ';
      
      const getKhmerSortValue = (char: string): number => {
        const index = khmerOrder.indexOf(char);
        return index === -1 ? 999 : index;
      };
      
      const getSortKey = (text: string): number[] => {
        return Array.from(text).map(char => getKhmerSortValue(char));
      };
      
      // Compare last names first
      const aLastKey = getSortKey(a.lastName || '');
      const bLastKey = getSortKey(b.lastName || '');
      
      for (let i = 0; i < Math.max(aLastKey.length, bLastKey.length); i++) {
        const aVal = aLastKey[i] || 999;
        const bVal = bLastKey[i] || 999;
        if (aVal !== bVal) return aVal - bVal;
      }
      
      // If last names are equal, compare first names
      const aFirstKey = getSortKey(a.firstName || '');
      const bFirstKey = getSortKey(b.firstName || '');
      
      for (let i = 0; i < Math.max(aFirstKey.length, bFirstKey.length); i++) {
        const aVal = aFirstKey[i] || 999;
        const bVal = bFirstKey[i] || 999;
        if (aVal !== bVal) return aVal - bVal;
      }
      
      return 0;
    });
    
    setFilteredStudents(result);
  }, [students, searchTerm, selectedYear, selectedClass, courses]);

  // Sync photo preview when selected student changes
  useEffect(() => {
    console.log('🖼️ Syncing photo preview for student:', {
      studentId: selectedStudent?.studentId,
      photo: selectedStudent?.photo,
      name: selectedStudent ? `${selectedStudent.lastName} ${selectedStudent.firstName}` : 'None'
    });
    
    if (selectedStudent?.photo) {
      setPhotoPreview(selectedStudent.photo);
    } else {
      setPhotoPreview('');
    }
  }, [selectedStudent]);

  // Fetch filter data from database
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoadingFilters(true);
        
        // Fetch school years
        const yearsRes = await fetch('/api/school-years');
        if (yearsRes.ok) {
          const yearsData: SchoolYearResponse[] = await yearsRes.json();
          // Extract schoolYearCode from the response
          setAcademicYears(yearsData.map(year => year.schoolYearCode));
        }
        
        // Fetch courses (grade + section from courses)
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const coursesData: Course[] = await coursesRes.json();
          console.log('🔍 Courses loaded:', {
            count: coursesData.length,
            courses: coursesData.map(c => ({
              courseId: c.courseId,
              grade: c.grade,
              section: c.section,
              courseName: c.courseName
            }))
          });
          setCourses(coursesData);
        }
        
        // Fetch semesters
        const semestersRes = await fetch('/api/semesters');
        if (semestersRes.ok) {
          const semestersData = await semestersRes.json();
          console.log('🔍 Semesters loaded:', {
            count: semestersData.length,
            semesters: semestersData.map((s: any) => ({
              semesterId: s.semesterId,
              semester: s.semester,
              semesterCode: s.semesterCode
            }))
          });
          setSemesters(semestersData);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  // Handle clicking outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleStudentSelect = (student: Student) => {
    console.log('👤 Student selected:', {
      studentId: student.studentId,
      name: `${student.lastName} ${student.firstName}`,
      photo: student.photo,
      hasPhoto: !!student.photo
    });
    setSelectedStudent(student);
    setActiveTab('basic');
  };

  // Form validation function
  const validateDropForm = () => {
    const errors = [];
    
    // Only validate drop fields if user has chosen to drop study
    if (showDropFields) {
      if (!dropFormData.dropCourseId) {
        errors.push('សូមជ្រើសរើសថ្នាក់បោះបង់ការសិក្សា');
      }
      
      if (!dropFormData.dropSemesterId) {
        errors.push('សូមជ្រើសរើសឆមាសបោះបង់ការសិក្សា');
      }
      
      if (!dropFormData.dropDate) {
        errors.push('សូមបញ្ចូលថ្ងៃបោះបង់ការសិក្សា');
      }
      
      if (!dropFormData.dropReason.trim()) {
        errors.push('សូមបញ្ចូលមូលហេតុបោះបង់ការសិក្សា');
      }
    }
    
    return errors;
  };

  // Clear validation errors when user starts interacting with form
  const clearValidationErrors = () => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Check if student has dropped enrollment and populate dialog
  const openDropDialog = () => {
    if (!selectedStudent) return;
    
    const droppedEnrollment = selectedStudent.enrollments?.find(e => e.drop);
    if (droppedEnrollment) {
      // Student is already dropped - show current drop info
      setCurrentDropEnrollment(droppedEnrollment);
      setShowDropFields(false); // Don't show new drop fields
    } else {
      // Student is not dropped - show new drop option
      setCurrentDropEnrollment(null);
      setShowDropFields(false); // Start with radio selection
      
      // Auto-select the highest grade class
      const activeEnrollments = selectedStudent.enrollments?.filter(e => !e.drop);
      if (activeEnrollments && activeEnrollments.length > 0) {
        // Sort by grade (highest first) and auto-select the first one
        const sortedEnrollments = activeEnrollments.sort((a, b) => {
          const gradeA = parseInt(a.course?.grade || '0');
          const gradeB = parseInt(b.course?.grade || '0');
          return gradeB - gradeA; // Descending order (highest first)
        });
        
        const highestGradeEnrollment = sortedEnrollments[0];
        if (highestGradeEnrollment) {
          setDropFormData(prev => ({
            ...prev,
            dropCourseId: highestGradeEnrollment.courseId.toString()
          }));
        }
      } else {
        // No active enrollments - clear the form
        setDropFormData(prev => ({
          ...prev,
          dropCourseId: ''
        }));
      }
    }
    
    setShowDropDialog(true);
    setValidationErrors([]);
  };

  // Handle Drop Enrollment
  const handleDropEnrollment = async () => {
    if (!selectedStudent) return;
    
    // If user doesn't want to drop, just close the dialog
    if (!showDropFields) {
      setShowDropDialog(false);
      setDropFormData({ dropCourseId: '', dropSemesterId: '', dropDate: '', dropReason: '' });
      setShowDropFields(false);
      setValidationErrors([]);
      toast({
        title: "បានបិទ",
        description: "បានបិទប្រអប់បោះបង់ការសិក្សា",
      });
      return;
    }
    
    // Validate form
    const errors = validateDropForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "មានបញ្ហា",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    // Clear validation errors if form is valid
    setValidationErrors([]);
    
    // Find the enrollment for the selected course
    const enrollment = selectedStudent.enrollments?.find(e => 
      !e.drop && e.courseId === parseInt(dropFormData.dropCourseId)
    );
    if (!enrollment) {
      toast({
        title: "មានបញ្ហា",
        description: 'មិនមានការចុះឈ្មោះសកម្មសម្រាប់ថ្នាក់ដែលជ្រើសរើស',
        variant: "destructive",
      });
      return;
    }

    setIsDropping(true);
    
    try {
      const response = await fetch(`/api/enrollments/${enrollment.enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop: true,
          dropSemesterId: dropFormData.dropSemesterId ? parseInt(dropFormData.dropSemesterId) : null,
          dropDate: dropFormData.dropDate,
          dropReason: dropFormData.dropReason
        }),
      });

      if (response.ok) {
        // Refresh student data by refetching the selected student
        const studentRes = await fetch(`/api/students/${selectedStudent.studentId}`);
        if (studentRes.ok) {
          const updatedStudent = await studentRes.json();
          setSelectedStudent(updatedStudent);
        }
        
        setShowDropDialog(false);
        setDropFormData({ dropCourseId: '', dropSemesterId: '', dropDate: '', dropReason: '' });
        setShowDropFields(false);
        setValidationErrors([]);
        
        toast({
          title: "ជោគជ័យ",
          description: "បានបោះបង់ការសិក្សាដោយជោគជ័យ",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to drop enrollment');
      }
    } catch (error) {
      console.error('Error dropping enrollment:', error);
      toast({
        title: "មានបញ្ហា",
        description: 'មានបញ្ហាក្នុងការបោះបង់ការសិក្សា',
        variant: "destructive",
      });
    } finally {
      setIsDropping(false);
    }
  };

  // Handle Undo Drop Study from main dialog
  const handleUndoDropFromDialog = async () => {
    if (!selectedStudent || !currentDropEnrollment) return;
    
    setIsDropping(true);
    
    try {
      const response = await fetch(`/api/enrollments/${currentDropEnrollment.enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop: false,
          dropSemesterId: null,
          dropDate: null,
          dropReason: null
        }),
      });

      if (response.ok) {
        // Refresh student data
        const studentRes = await fetch(`/api/students/${selectedStudent.studentId}`);
        if (studentRes.ok) {
          const updatedStudent = await studentRes.json();
          setSelectedStudent(updatedStudent);
        }
        
        setShowDropDialog(false);
        setCurrentDropEnrollment(null);
        setValidationErrors([]);
        
        toast({
          title: "ជោគជ័យ",
          description: "បានដកចេញការបោះបង់ការសិក្សាដោយជោគជ័យ",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to undo drop enrollment');
      }
    } catch (error) {
      console.error('Error undoing drop enrollment:', error);
      toast({
        title: "មានបញ្ហា",
        description: 'មានបញ្ហាក្នុងការដកចេញការបោះបង់ការសិក្សា',
        variant: "destructive",
      });
    } finally {
      setIsDropping(false);
    }
  };

  // Handle Remove Drop Study (Restore Enrollment)
  const handleRemoveDropStudy = async () => {
    if (!selectedStudent || !selectedDropEnrollment) return;
    
    try {
      const response = await fetch(`/api/enrollments/${selectedDropEnrollment.enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop: false,
          dropSemesterId: null,
          dropDate: null,
          dropReason: null
        }),
      });

      if (response.ok) {
        // Refresh student data by refetching the selected student
        const studentRes = await fetch(`/api/students/${selectedStudent.studentId}`);
        if (studentRes.ok) {
          const updatedStudent = await studentRes.json();
          setSelectedStudent(updatedStudent);
        }
        setShowRemoveDropDialog(false);
        setSelectedDropEnrollment(null);
        alert('បានដកចេញការបោះបង់ការសិក្សាដោយជោគជ័យ');
      } else {
        throw new Error('Failed to remove drop study');
      }
    } catch (error) {
      console.error('Error removing drop study:', error);
      alert('មានបញ្ហាក្នុងការដកចេញការបោះបង់ការសិក្សា');
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "កំហុស",
        description: "សូមជ្រើសរើសរូបភាពតែប៉ុណ្ណោះ (JPG, PNG, GIF)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "កំហុស",
        description: "រូបភាពធំពេក។ ទំហំអតិបរមា 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { filename } = await response.json();
      const photoPath = `/uploads/${filename}`;
      
      // Update student photo in database
      if (selectedStudent) {
        const updateResponse = await fetch(`/api/students/${selectedStudent.studentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student: {
              lastName: selectedStudent.lastName,
              firstName: selectedStudent.firstName,
              gender: selectedStudent.gender,
              dob: selectedStudent.dob,
              class: selectedStudent.class,
              schoolYear: selectedStudent.schoolYear,
              photo: photoPath,
              studentHouseNumber: selectedStudent.studentHouseNumber,
              studentVillage: selectedStudent.studentVillage,
              studentDistrict: selectedStudent.studentDistrict,
              studentProvince: selectedStudent.studentProvince,
              studentBirthDistrict: selectedStudent.studentBirthDistrict,
              phone: selectedStudent.phone,
              religion: selectedStudent.religion,
              health: selectedStudent.health,
              emergencyContact: selectedStudent.emergencyContact,
              vaccinated: selectedStudent.vaccinated,
              previousSchool: selectedStudent.previousSchool,
              transferReason: selectedStudent.transferReason,
              needsClothes: selectedStudent.needsClothes,
              needsMaterials: selectedStudent.needsMaterials,
              needsTransport: selectedStudent.needsTransport,
              registerToStudy: selectedStudent.registerToStudy,
              registrationDate: selectedStudent.registrationDate,
              status: selectedStudent.status
            }
          })
        });

        if (updateResponse.ok) {
          console.log('✅ Photo uploaded successfully:', photoPath);
          
          // Update local state
          const updatedStudent = {
            ...selectedStudent,
            photo: photoPath
          };
          setSelectedStudent(updatedStudent);
          
          // Refresh students list to show photo in dropdown
          const studentsRes = await fetch('/api/students');
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            console.log('📸 Refreshed students after photo upload:', 
              studentsData.find((s: Student) => s.studentId === selectedStudent.studentId)?.photo
            );
            setStudents(Array.isArray(studentsData) ? studentsData : []);
          }
          
          toast({
            title: "ជោគជ័យ",
            description: "រូបភាពត្រូវបានផ្ទុកឡើងដោយជោគជ័យ"
          });
          
          // Reset file input to allow uploading another photo
          const fileInput = document.getElementById('student-photo-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        } else {
          const errorText = await updateResponse.text();
          console.error('❌ Photo upload failed:', {
            status: updateResponse.status,
            statusText: updateResponse.statusText,
            error: errorText
          });
          
          toast({
            title: "កំហុស",
            description: `មានបញ្ហាក្នុងការរក្សាទុករូបភាព (Status: ${updateResponse.status})`,
            variant: "destructive"
          });
          
          throw new Error(`Failed to update student photo: ${updateResponse.status} - ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការផ្ទុករូបភាព",
        variant: "destructive"
      });
      setPhotoPreview('');
      
      // Reset file input on error too
      const fileInput = document.getElementById('student-photo-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Show delete photo confirmation dialog
  const handleRemovePhoto = () => {
    setShowDeletePhotoDialog(true);
  };

  // Confirm and delete photo
  const confirmDeletePhoto = async () => {
    if (!selectedStudent) return;

    try {
      setShowDeletePhotoDialog(false);
      const updateResponse = await fetch(`/api/students/${selectedStudent.studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student: {
            lastName: selectedStudent.lastName,
            firstName: selectedStudent.firstName,
            gender: selectedStudent.gender,
            dob: selectedStudent.dob,
            class: selectedStudent.class,
            schoolYear: selectedStudent.schoolYear,
            photo: null,
            studentHouseNumber: selectedStudent.studentHouseNumber,
            studentVillage: selectedStudent.studentVillage,
            studentDistrict: selectedStudent.studentDistrict,
            studentProvince: selectedStudent.studentProvince,
            studentBirthDistrict: selectedStudent.studentBirthDistrict,
            phone: selectedStudent.phone,
            religion: selectedStudent.religion,
            health: selectedStudent.health,
            emergencyContact: selectedStudent.emergencyContact,
            vaccinated: selectedStudent.vaccinated,
            previousSchool: selectedStudent.previousSchool,
            transferReason: selectedStudent.transferReason,
            needsClothes: selectedStudent.needsClothes,
            needsMaterials: selectedStudent.needsMaterials,
            needsTransport: selectedStudent.needsTransport,
            registerToStudy: selectedStudent.registerToStudy,
            registrationDate: selectedStudent.registrationDate,
            status: selectedStudent.status
          }
        })
      });

      if (updateResponse.ok) {
        const updatedStudent = {
          ...selectedStudent,
          photo: undefined
        };
        setSelectedStudent(updatedStudent);
        setPhotoPreview('');
        
        // Refresh students list to remove photo from dropdown
        const studentsRes = await fetch('/api/students');
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        }
        
        toast({
          title: "ជោគជ័យ",
          description: "រូបភាពត្រូវបានលុបចេញ"
        });
        
        // Reset file input to allow uploading a new photo
        const fileInput = document.getElementById('student-photo-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error('Failed to remove photo');
      }
    } catch (error) {
      console.error('Photo removal error:', error);
      toast({
        title: "កំហុស",
        description: "មានបញ្ហាក្នុងការលុបរូបភាព",
        variant: "destructive"
      });
    }
  };

  // Show loading screen when first loading data (wait for both students and filters)
  if (loading || loadingFilters) {
  return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-600/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-600/20 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Search and Filter Section */}
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        {/* Decorative Background Elements */}
        <CardHeader className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-6">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              
          <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Search className="h-7 w-7 text-white" />
                  </div>
                  <div>
              <h2 className="text-xl md:text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">🔍 ស្វែងរកព័ត៌មានសិស្ស</h2>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                      📋 ព័ត៌មានពេញលេញ
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                  ✨ ការរកឃើញស្វ័យប្រវត្តិ
                  </Badge>
              </div>
              <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                </div>
              </div>
            </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Search Fields and Clear Button in One Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            {/* Student Search Field */}
            <div className="space-y-3 group lg:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-blue-600 dark:text-gray-300 transition-colors duration-200">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
                <span>សរសេរឈ្មោះសិស្ស</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  placeholder="សរសេរឈ្មោះសិស្ស..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group-hover:shadow-lg text-blue-600 dark:text-blue-400 pl-12 pr-12"
                />
                <ChevronDown 
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              
                {showDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-2xl overflow-hidden">
                    <div className="max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student: Student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center p-4 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 cursor-pointer transition-all duration-300 border-b border-gray-100/50 dark:border-gray-600/50 last:border-b-0 group"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchTerm(`${student.lastName}${student.firstName}`);
                              handleStudentSelect(student);
                              setShowDropdown(false);
                            }}
                          >
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={`${student.lastName}${student.firstName}`}
                                className="w-10 h-10 rounded-full object-cover mr-4 shadow-lg group-hover:scale-110 transition-transform duration-200 border-2 border-blue-200 dark:border-blue-700"
                              />
                            ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                              <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                {student.lastName}{student.firstName}
                              </p>
                              <p className="text-base text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                                {getGradeLabel(getStudentFullClass(student))}{getStudentSchoolYear(student) ? ` (${getStudentSchoolYear(student)})` : ''}
                              </p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 text-sm font-medium group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-200">
                              {getStatusLabel(student.status)}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-gray-500 dark:text-gray-400 text-center">
                          <User className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <p className="text-lg font-medium">រកមិនឃើញឈ្មោះសិស្ស</p>
                          <p className="text-base mt-2">សូមព្យាយាមស្វែងរកឈ្មោះផ្សេង</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Year Field */}
            <div className="space-y-3 group lg:col-span-1">
              <label className="flex items-center space-x-2 text-sm font-semibold text-purple-600 dark:text-gray-300 transition-colors duration-200">
                <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
                <span>ឆ្នាំសិក្សា</span>
              </label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 group-hover:shadow-lg text-purple-600 dark:text-purple-400">
                          <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                        </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                  {academicYears.length > 0 ? (
                            academicYears.map(year => (
                      <SelectItem 
                        key={year} 
                        value={year}
                        className="hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:bg-purple-100 dark:focus:bg-purple-900/30 focus:text-purple-900 dark:focus:text-purple-100"
                      >
                                {year}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>គ្មានឆ្នាំសិក្សា</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
            {/* Class Field */}
            <div className="space-y-3 group lg:col-span-1">
              <label className="flex items-center space-x-2 text-sm font-semibold text-green-600 dark:text-gray-300 transition-colors duration-200">
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span>ថ្នាក់</span>
              </label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-white via-white/95 to-white/90 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800/90 border-2 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group-hover:shadow-lg text-green-600 dark:text-green-400">
                          <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                        </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
                  {courses.length > 0 ? (
                    (() => {
                      const filteredCourses = courses.filter(course => !selectedYear || course.schoolYear.schoolYearCode === selectedYear);
                      console.log('🔍 Filtered courses for dropdown:', {
                        selectedYear,
                        totalCourses: courses.length,
                        filteredCourses: filteredCourses.length,
                        courses: filteredCourses.map(c => ({ courseId: c.courseId, grade: c.grade, section: c.section, schoolYear: c.schoolYear.schoolYearCode }))
                      });
                      return filteredCourses.map(course => (
                        <SelectItem 
                          key={course.courseId} 
                          value={course.courseId.toString()}
                          className="hover:bg-green-50 dark:hover:bg-green-900/20 focus:bg-green-100 dark:focus:bg-green-900/30 focus:text-green-900 dark:focus:text-green-100"
                        >
                          {getCourseLabel(course)}
                              </SelectItem>
                      ));
                    })()
                          ) : (
                            <SelectItem value="no-data" disabled>គ្មានថ្នាក់</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

            {/* Clear All Filters Button */}
            <div className="space-y-3 group lg:col-span-1">
              <label className="flex items-center space-x-2 text-sm font-semibold text-red-600 dark:text-gray-300 transition-colors duration-200">
                <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                <span>សកម្មភាព</span>
              </label>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedYear('');
                  setSelectedClass('');
                  setFilterByYearClass(true);
                }}
                variant="outline"
                className="w-full h-12 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 shadow-sm hover:shadow-md font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                លុបការច្រោះទាំងអស់
              </Button>
            </div>
          </div>         
            </CardContent>
          </Card>

      {/* Student Details Section */}
        {selectedStudent ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Modern Student Profile Card */}
            <div className="lg:col-span-1">
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 sticky top-6 overflow-hidden">
              {/* Header Gradient */}
              <div className="h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl ring-4 ring-white/20">
                          <img 
                            src={selectedStudent.photo || '/placeholder-user.jpg'} 
                        alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                      </div>
                      
              <CardContent className="pt-12">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Student Name & Info */}
                      <div className="space-y-3">
                        <h3 className="p-1 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                          {selectedStudent.lastName}{selectedStudent.firstName}
                        </h3>
                        <div className="flex items-center justify-center space-x-2">
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-300 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-400 dark:border-blue-600 shadow-sm">
                            ID: {selectedStudent.studentId}
                          </Badge>
                        </div>
                    <p className="text-gray-700 dark:text-gray-300 text-base text-center font-medium">
                      <span className={calculateAgeYears(selectedStudent.dob) !== null && calculateAgeYears(selectedStudent.dob)! < 4 ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                        អាយុ {(calculateAgeYears(selectedStudent.dob) ?? '-')} ឆ្នាំ{calculateAgeYears(selectedStudent.dob) !== null && calculateAgeYears(selectedStudent.dob)! < 4 && ' ⚠️'}
                      </span>
                      {' '}
                      <span>ភេទ{selectedStudent.gender === 'male' ? 'ប្រុស' : selectedStudent.gender === 'female' ? 'ស្រី' : '-'}</span>
                        </p>
                      </div>
                  
                  {/* Quick Stats */}
                  <div className="w-full">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-blue-200/50 dark:border-blue-800/30">
                        <div className="flex items-center justify-center mb-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">ថ្ងៃចុះឈ្មោះ</div>
                            <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatDate(selectedStudent.registrationDate)}</div>
                          </div>
                      <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-green-200/50 dark:border-green-800/30">
                        <div className="flex items-center justify-center mb-2">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Badge className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">ស្ថានភាព</div>
                            <div className="text-sm font-bold text-green-700 dark:text-green-300">{getStatusLabel(selectedStudent.status)}</div>
                          </div>
                        </div>
                            </div>

                  {/* Education Information */}
                  <div className="w-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-xl p-5 shadow-sm border border-indigo-200/50 dark:border-indigo-800/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">ព័ត៌មានសិក្សា</h4>
                    </div>
                  
                          <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center space-x-2">
                          <GraduationCap className="h-3 w-3" />
                          <span>ថ្នាក់:</span>
                        </span>
                              <span className="font-bold text-gray-900 dark:text-white text-sm">{getGradeLabel(getStudentFullClass(selectedStudent))}</span>
                            </div>
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>ឆ្នាំសិក្សា:</span>
                        </span>
                              <span className="font-bold text-gray-900 dark:text-white text-sm">{getStudentSchoolYear(selectedStudent) || '-'}</span>
                            </div>
                      {/* Register to Study */}
                            {selectedStudent.registerToStudy !== undefined && (
                        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center space-x-2">
                            <BookOpen className="h-3 w-3" />
                            <span>ចុះឈ្មោះរៀន:</span>
                          </span>
                          <Badge className={selectedStudent.registerToStudy ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 text-xs" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 text-xs"}>
                                {selectedStudent.registerToStudy ? "បានចុះឈ្មោះ" : "មិនទាន់ចុះឈ្មោះ"}
                              </Badge>
                            </div>
                            )}
                      
                      {/* Drop Study Button - Above Registration Field */}
                      {selectedStudent && (
                        <div className="flex justify-center mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={openDropDialog}
                            className="h-8 px-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <MinusCircle className="h-3 w-3 mr-2" />
                            <span className="text-xs">បោះបង់ការសិក្សា</span>
                          </Button>
                        </div>
                      )}
                      
                          </div>
                        </div>

                  {/* Modern Drop Study Dialog */}
                  <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                      <DialogHeader className="space-y-3 flex-shrink-0">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full">
                          <MinusCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
                          {currentDropEnrollment ? "ព័ត៌មានការបោះបង់ការសិក្សា" : "បោះបង់ការសិក្សា"}
                        </DialogTitle>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                          {currentDropEnrollment 
                            ? "មើលព័ត៌មានការបោះបង់ការសិក្សារបស់សិស្ស" 
                            : "បញ្ចូលព័ត៌មានសម្រាប់ការបោះបង់ការសិក្សាសិស្ស"
                          }
                        </p>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-6 pb-4">
                        {/* Student Information Card */}
                        <div className="p-5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                              <User className="h-4 w-4 text-red-700 dark:text-red-300" />
                            </div>
                            <span className="text-sm font-semibold text-red-800 dark:text-red-200">ព័ត៌មានសិស្ស</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              <span className="font-medium">ឈ្មោះ:</span> {selectedStudent?.lastName}{selectedStudent?.firstName} ID({selectedStudent?.studentId}) {getGradeLabel(getStudentFullClass(selectedStudent))}
                            </p>
                          </div>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-800 dark:text-red-200">មានបញ្ហាក្នុងទម្រង់</span>
                            </div>
                            <ul className="space-y-1">
                              {validationErrors.map((error, index) => (
                                <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                  <span>{error}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Current Drop Information or Drop Study Selection */}
                        <div className="space-y-4">
                          {currentDropEnrollment ? (
                            /* Show Current Drop Information */
                            <div className="space-y-4">
                              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center space-x-2 mb-3">
                                  <AlertCircle className="h-5 w-5 text-red-600" />
                                  <span className="text-base font-semibold text-red-800 dark:text-red-200">ព័ត៌មានការបោះបង់ការសិក្សាបច្ចុប្បន្ន</span>
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ថ្នាក់បោះបង់ការសិក្សា</span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ថ្នាក់ទី {currentDropEnrollment.course?.grade}{currentDropEnrollment.course?.section}
                                      </p>
                                    </div>
                                    
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ឆមាសបោះបង់ការសិក្សា</span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {currentDropEnrollment.dropSemester?.semester || 'មិនមានព័ត៌មាន'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ថ្ងៃបោះបង់ការសិក្សា</span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {currentDropEnrollment.dropDate 
                                          ? new Date(currentDropEnrollment.dropDate).toLocaleDateString('km-KH')
                                          : 'មិនមានព័ត៌មាន'
                                        }
                                      </p>
                                    </div>
                                    
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">មូលហេតុ</span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {currentDropEnrollment.dropReason || 'មិនមានព័ត៌មាន'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center space-x-2 mb-2">
                                  <RotateCcw className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-800 dark:text-green-200">ដកចេញការបោះបង់</span>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  ប្រសិនបើអ្នកចង់ដកចេញការបោះបង់ការសិក្សា សិស្សនឹងត្រលប់ទៅស្ថានភាពកំពុងសិក្សាវិញ។
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Show Drop Study Selection */
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <Label className="text-base font-semibold text-blue-800 dark:text-blue-200 flex items-center space-x-2 mb-3">
                                <AlertCircle className="h-5 w-5" />
                                <span>តើអ្នកចង់បោះបង់ការសិក្សាសម្រាប់សិស្សនេះទេ?</span>
                              </Label>
                              <RadioGroup
                                value={showDropFields ? "yes" : "no"}
                                onValueChange={(value) => {
                                  setShowDropFields(value === "yes");
                                  setValidationErrors([]);
                                if (value === "no") {
                                  setDropFormData({ dropCourseId: '', dropSemesterId: '', dropDate: '', dropReason: '' });
                                } else if (value === "yes") {
                                  // When switching back to "yes", auto-select highest grade again
                                  const activeEnrollments = selectedStudent?.enrollments?.filter(e => !e.drop);
                                  if (activeEnrollments && activeEnrollments.length > 0) {
                                    const sortedEnrollments = activeEnrollments.sort((a, b) => {
                                      const gradeA = parseInt(a.course?.grade || '0');
                                      const gradeB = parseInt(b.course?.grade || '0');
                                      return gradeB - gradeA;
                                    });
                                    
                                    const highestGradeEnrollment = sortedEnrollments[0];
                                    if (highestGradeEnrollment) {
                                      setDropFormData(prev => ({
                                        ...prev,
                                        dropCourseId: highestGradeEnrollment.courseId.toString()
                                      }));
                                    }
                                  } else {
                                    // No active enrollments - clear the form
                                    setDropFormData(prev => ({
                                      ...prev,
                                      dropCourseId: ''
                                    }));
                                  }
                                }
                                }}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="no" id="no-drop" className="text-green-600" />
                                  <Label htmlFor="no-drop" className="text-sm font-medium text-green-700 dark:text-green-300 cursor-pointer">
                                    ទេ មិនបោះបង់ការសិក្សា
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="yes" id="yes-drop" className="text-red-600" />
                                  <Label htmlFor="yes-drop" className="text-sm font-medium text-red-700 dark:text-red-300 cursor-pointer">
                                    បាទ បោះបង់ការសិក្សា
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}

                          {/* Drop Fields - Only show when user selects "yes" */}
                          {showDropFields && (
                            <div className="space-y-5 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-center space-x-2 mb-4">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-800 dark:text-red-200">ព័ត៌មានបោះបង់ការសិក្សា</span>
                              </div>
                              
                              {/* Course Selection */}
                              <div className="space-y-2">
                                <Label htmlFor="dropCourse" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4" />
                                  <span>ថ្នាក់បោះបង់ការសិក្សា *</span>
                                </Label>
                        <Select 
                          value={dropFormData.dropCourseId} 
                          onValueChange={(value) => {
                            setDropFormData(prev => ({ ...prev, dropCourseId: value }));
                            clearValidationErrors();
                          }}
                          disabled={isDropping || !selectedStudent?.enrollments?.filter(e => !e.drop).length}
                        >
                                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 focus:border-red-500 dark:focus:border-red-400 transition-colors duration-200">
                                    <SelectValue placeholder="ជ្រើសរើសថ្នាក់បោះបង់ការសិក្សា" />
                                  </SelectTrigger>
                          <SelectContent>
                            {selectedStudent?.enrollments?.filter(e => !e.drop).length && selectedStudent?.enrollments ? (
                              selectedStudent.enrollments
                                .filter(e => !e.drop)
                                .map((enrollment) => (
                                  <SelectItem key={enrollment.courseId} value={enrollment.courseId.toString()}>
                                    ថ្នាក់ទី {enrollment.course?.grade}{enrollment.course?.section}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                                មិនមានថ្នាក់សកម្ម
                              </div>
                            )}
                          </SelectContent>
                                </Select>
                              </div>

                              {/* Semester and Date in One Row */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Semester Selection */}
                                <div className="space-y-2">
                                  <Label htmlFor="dropSemester" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>ឆមាសបោះបង់ការសិក្សា *</span>
                                  </Label>
                                  <Select 
                                    value={dropFormData.dropSemesterId} 
                                    onValueChange={(value) => {
                                      setDropFormData(prev => ({ ...prev, dropSemesterId: value }));
                                      clearValidationErrors();
                                    }}
                                    disabled={isDropping}
                                  >
                                    <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 focus:border-red-500 dark:focus:border-red-400 transition-colors duration-200">
                                      <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {semesters.length > 0 ? (
                                        semesters.map((semester) => (
                                          <SelectItem key={semester.semesterId} value={semester.semesterId.toString()}>
                                            {semester.semester}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="" disabled>
                                          មិនមានឆមាស
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Date Selection */}
                                <div className="space-y-2">
                                  <Label htmlFor="dropDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>ថ្ងៃបោះបង់ការសិក្សា *</span>
                                  </Label>
                                  <Input
                                    id="dropDate"
                                    type="date"
                                    className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 focus:border-red-500 dark:focus:border-red-400 transition-colors duration-200"
                                    value={dropFormData.dropDate}
                                    onChange={(e) => {
                                      setDropFormData(prev => ({ ...prev, dropDate: e.target.value }));
                                      clearValidationErrors();
                                    }}
                                    disabled={isDropping}
                                  />
                                </div>
                              </div>
                              
                              {/* Reason Input */}
                              <div className="space-y-2">
                                <Label htmlFor="dropReason" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>មូលហេតុបោះបង់ការសិក្សា *</span>
                                </Label>
                                <Input
                                  id="dropReason"
                                  placeholder="បញ្ចូលមូលហេតុដែលបោះបង់ការសិក្សា..."
                                  className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 focus:border-red-500 dark:focus:border-red-400 transition-colors duration-200"
                                  value={dropFormData.dropReason}
                                  onChange={(e) => {
                                    setDropFormData(prev => ({ ...prev, dropReason: e.target.value }));
                                    clearValidationErrors();
                                  }}
                                  disabled={isDropping}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Warning Message */}
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">ព្រមាន</span>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            ការបោះបង់ការសិក្សានេះនឹងធ្វើឲ្យសិស្សឈប់សិក្សានៅថ្នាក់នេះ។ សូមពិនិត្យព័ត៌មានឲ្យបានត្រឹមត្រូវ។
                          </p>
                        </div>
                        
                        </div>
                      </div>
                      
                      {/* Action Buttons - Fixed at bottom */}
                      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="flex space-x-3">
                          <Button
                            onClick={currentDropEnrollment ? handleUndoDropFromDialog : handleDropEnrollment}
                            disabled={isDropping}
                            className={`flex-1 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                              currentDropEnrollment
                                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                                : showDropFields 
                                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                            }`}
                          >
                            {isDropping ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>{currentDropEnrollment ? "កំពុងដកចេញ..." : "កំពុងបោះបង់ការសិក្សា..."}</span>
                              </>
                            ) : (
                              <>
                                {currentDropEnrollment ? (
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                <span>
                                  {currentDropEnrollment 
                                    ? "ដកចេញការបោះបង់" 
                                    : showDropFields 
                                      ? "បោះបង់ការសិក្សា" 
                                      : "បិទប្រអប់"
                                  }
                                </span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDropDialog(false);
                              setValidationErrors([]);
                              setDropFormData({ dropCourseId: '', dropSemesterId: '', dropDate: '', dropReason: '' });
                              setShowDropFields(false);
                              setCurrentDropEnrollment(null);
                            }}
                            disabled={isDropping}
                            className="h-12 px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Remove Drop Study Dialog */}
                  <Dialog open={showRemoveDropDialog} onOpenChange={setShowRemoveDropDialog}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="flex items-center space-x-2">
                          <RotateCcw className="h-5 w-5 text-green-600" />
                          <span>ដកចេញការបោះបង់ការសិក្សា</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-4 pb-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800 dark:text-green-200">ព័ត៌មានសិស្ស</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            ឈ្មោះ: {selectedStudent?.lastName}{selectedStudent?.firstName} (ID: {selectedStudent?.studentId})
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            ថ្នាក់: {getGradeLabel(getStudentFullClass(selectedStudent))}
                          </p>
                        </div>

                        {selectedDropEnrollment && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">ព័ត៌មានការបោះបង់ការសិក្សា</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                ថ្នាក់: {selectedDropEnrollment.course ? getCourseLabel(selectedDropEnrollment.course) : `ថ្នាក់ ${selectedStudent?.class}`}
                              </p>
                              {selectedDropEnrollment.dropSemester && (
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  ឆមាសបោះបង់ការសិក្សា: {selectedDropEnrollment.dropSemester.semester}
                                </p>
                              )}
                              {selectedDropEnrollment.dropDate && (
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  ថ្ងៃបោះបង់ការសិក្សា: {formatDate(selectedDropEnrollment.dropDate)}
                                </p>
                              )}
                              {selectedDropEnrollment.dropReason && (
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  មូលហេតុ: {selectedDropEnrollment.dropReason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">ព្រមាន</span>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            ការដកចេញការបោះបង់នេះនឹងធ្វើឲ្យសិស្សត្រលប់ទៅស្ថានភាពកំពុងសិក្សាវិញ។
                          </p>
                        </div>

                        </div>
                      </div>
                      
                      {/* Action Buttons - Fixed at bottom */}
                      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleRemoveDropStudy}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            ដកចេញការបោះបង់
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowRemoveDropDialog(false)}
                            className="px-4"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Photo Confirmation Dialog */}
                  <Dialog open={showDeletePhotoDialog} onOpenChange={setShowDeletePhotoDialog}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full">
                          <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
                          លុបរូបភាព
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <p className="text-center text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                            តើអ្នកពិតជាចង់លុបរូបភាពនេះមែនទេ?
                          </p>
                          <p className="text-center text-red-600 dark:text-red-400 text-sm mt-2 font-medium">
                            រូបភាពនឹងត្រូវបានលុបចេញជាអចិន្ត្រៃយ៍
                          </p>
                        </div>

                        {photoPreview && (
                          <div className="flex justify-center">
                            <img 
                              src={photoPreview} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-lg border-2 border-red-200 dark:border-red-700 shadow-md"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDeletePhotoDialog(false)}
                          className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          បោះបង់
                        </Button>
                        <Button
                          type="button"
                          onClick={confirmDeletePhoto}
                          className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          លុបរូបភាព
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Contact Information */}
                  <div className="w-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-5 shadow-sm border border-orange-200/50 dark:border-orange-800/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">លេខទំនាក់ទំនងគោល</h4>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedStudent.phone || '-'}</span>
                      </div>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
              </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Modern Tabs Navigation */}
            <div className="relative group">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/15 dark:to-indigo-950/20 rounded-3xl -z-10" />
              
              <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700">
                <CardContent>
                  <nav className="flex gap-2 bg-gradient-to-r from-gray-50/50 via-white/50 to-gray-50/50 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/50 rounded-2xl">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-5 py-3 text-sm font-semibold flex items-center justify-center space-x-3 rounded-xl transition-all duration-500 relative group/tab overflow-hidden ${
                        activeTab === tab.id 
                            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 dark:shadow-blue-500/20 scale-105' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-md hover:scale-102'
                      }`}
                    >
                        {/* Animated Background Shine Effect */}
                      {activeTab === tab.id && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                          </>
                      )}
                      
                        {/* Icon Container */}
                        <div className={`relative p-2 rounded-lg transition-all duration-500 ${
                        activeTab === tab.id 
                            ? 'bg-white/20 shadow-lg backdrop-blur-sm scale-110' 
                            : 'bg-gray-100 dark:bg-gray-700 group-hover/tab:bg-blue-100 dark:group-hover/tab:bg-blue-900/30 group-hover/tab:scale-110'
                        }`}>
                          <div className={`transition-all duration-500 ${
                            activeTab === tab.id ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover/tab:text-blue-600 dark:group-hover/tab:text-blue-400'
                      }`}>
                        {tab.icon}
                      </div>
                        </div>
                        
                        {/* Label */}
                        <span className={`hidden sm:inline font-bold transition-all duration-500 relative z-10 ${
                          activeTab === tab.id ? 'text-white' : ''
                        }`}>
                          {tab.label}
                        </span>
                        
                        {/* Active Indicator Dot */}
                        {activeTab === tab.id && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
                        )}
                        
                        {/* Bottom Glow */}
                        {activeTab === tab.id && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 blur-md"></div>
                        )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
            </div>

            {/* Modern Tab Content */}
            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-800 dark:via-gray-800/30 dark:to-gray-800">
              <CardContent className="p-1">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានការសិក្សា</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-5 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                            <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                          </div>
                          <span className="text-base font-semibold text-blue-800 dark:text-blue-200">ឈ្មោះសិស្ស</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{selectedStudent.lastName}{selectedStudent.firstName}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-5 rounded-xl shadow-sm border border-green-200/50 dark:border-green-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                            <Calendar className="h-4 w-4 text-green-700 dark:text-green-300" />
                          </div>
                          <span className="text-base font-semibold text-green-800 dark:text-green-200">ថ្ងៃខែឆ្នាំកំណើត</span>
                        </div>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">{formatDate(selectedStudent.dob)}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-5 rounded-xl shadow-sm border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                          </div>
                          <span className="text-base font-semibold text-purple-800 dark:text-purple-200">ថ្នាក់ទី</span>
                        </div>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{getGradeLabel(getStudentFullClass(selectedStudent))}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-5 rounded-xl shadow-sm border border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                            <CalendarCheck className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                          </div>
                          <span className="text-base font-semibold text-orange-800 dark:text-orange-200">ថ្ងៃចុះឈ្មោះ</span>
                        </div>
                        <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{formatDate(selectedStudent.registrationDate)}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 p-5 rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                            <User className="h-4 w-4 text-red-700 dark:text-red-300" />
                          </div>
                          <span className="text-base font-semibold text-red-800 dark:text-red-200">ភេទ</span>
                        </div>
                        <p className="text-lg font-bold text-red-900 dark:text-red-100">{selectedStudent.gender === 'male' ? 'ប្រុស' : selectedStudent.gender === 'female' ? 'ស្រី' : '-'}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 p-5 rounded-xl shadow-sm border border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg">
                            <Calendar className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
                          </div>
                          <span className="text-base font-semibold text-indigo-800 dark:text-indigo-200">ឆ្នាំសិក្សា</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{selectedStudent.schoolYear || '-'}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 p-5 rounded-xl shadow-sm border border-teal-200/50 dark:border-teal-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-teal-200 dark:bg-teal-800 rounded-lg">
                            <Home className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                          </div>
                          <span className="text-base font-semibold text-teal-800 dark:text-teal-200">សាលាមុន</span>
                        </div>
                        <p className="text-lg font-bold text-teal-900 dark:text-teal-100">{selectedStudent.previousSchool || '-'}</p>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 p-5 rounded-xl shadow-sm border border-pink-200/50 dark:border-pink-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-pink-200 dark:bg-pink-800 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-pink-700 dark:text-pink-300" />
                          </div>
                          <span className="text-base font-semibold text-pink-800 dark:text-pink-200">មូលហេតុផ្លាស់ទី</span>
                        </div>
                        <p className="text-lg font-bold text-pink-900 dark:text-pink-100">{selectedStudent.transferReason || '-'}</p>
                      </div>
                    </div>

                    {/* Student Photo Upload Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">រូបថតសិស្ស</h4>
                      </div>
                      
                      <div className="flex items-start space-x-6">
                        {/* Photo Preview */}
                        <div className="flex-shrink-0">
                          {(photoPreview || selectedStudent.photo) ? (
                            <div className="relative group/photo">
                              <img 
                                src={photoPreview || selectedStudent.photo || ''} 
                                alt="Student Photo" 
                                className="w-40 h-40 object-cover rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg"
                              />
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover/photo:opacity-100"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-40 h-40 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-inner">
                              <User className="h-20 w-20 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-grow space-y-4">
                          <div className="relative">
                            <input
                              type="file"
                              id="student-photo-upload"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                              disabled={uploadingPhoto}
                            />
                            <label
                              htmlFor="student-photo-upload"
                              className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
                                uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <Upload className="h-5 w-5" />
                              <span className="font-medium">{uploadingPhoto ? 'កំពុងផ្ទុក...' : 'ជ្រើសរើសរូបភាព'}</span>
                            </label>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">📝 ចំណាំ:</p>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                              <li>• ទម្រង់ដែលគាំទ្រ: JPG, PNG, GIF</li>
                              <li>• ទំហំអតិបរមា: 5MB</li>
                              <li>• រូបភាពនឹងត្រូវបានរក្សាទុកទៅក្នុងប្រព័ន្ធដោយស្វ័យប្រវត្តិ</li>
                            </ul>
                          </div>
                          {(photoPreview || selectedStudent.photo) && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline font-medium"
                            >
                              🗑️ លុបរូបភាព
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'address' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានអាសយដ្ឋាន</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-xl">
                            <MapPin className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-blue-800 dark:text-blue-200">លេខផ្ទះ</p>
                            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{selectedStudent.studentHouseNumber || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-xl shadow-sm border border-green-200/50 dark:border-green-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-green-200 dark:bg-green-800 rounded-xl">
                            <MapPin className="h-5 w-5 text-green-700 dark:text-green-300" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-green-800 dark:text-green-200">ភូមិ</p>
                            <p className="text-xl font-bold text-green-900 dark:text-green-100">{selectedStudent.studentVillage || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-xl shadow-sm border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-xl">
                            <MapPin className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-purple-800 dark:text-purple-200">ស្រុក/ខណ្ឌ</p>
                            <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{selectedStudent.studentDistrict || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-6 rounded-xl shadow-sm border border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-xl">
                            <MapPin className="h-5 w-5 text-orange-700 dark:text-orange-300" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-orange-800 dark:text-orange-200">ខេត្ត/ក្រុង</p>
                            <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{selectedStudent.studentProvince || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 p-6 rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-red-200 dark:bg-red-800 rounded-xl">
                            <MapPin className="h-5 w-5 text-red-700 dark:text-red-300" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-red-800 dark:text-red-200">ស្រុកកំណើត</p>
                            <p className="text-xl font-bold text-red-900 dark:text-red-100">{selectedStudent.studentBirthDistrict || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 p-6 rounded-xl shadow-sm border border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-indigo-200 dark:bg-indigo-800 rounded-xl">
                            <Phone className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-indigo-800 dark:text-indigo-200">លេខទូរស័ព្ទ</p>
                            <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{selectedStudent.phone || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Drop Information Section */}
                    {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានការបោះបង់ការសិក្សា</h4>
                        </div>
                        
                        {/* Check if student has dropped enrollments */}
                        {selectedStudent.enrollments.filter(e => e.drop).length > 0 ? (
                          <>
                            {/* Drop Summary */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                                  <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-300" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-red-800 dark:text-red-200">
                                    សិស្សបានបោះបង់ការសិក្សាពី {selectedStudent.enrollments.filter(e => e.drop).length} ថ្នាក់
                                  </p>
                                  <p className="text-sm text-red-600 dark:text-red-400">
                                    ចាប់ពីឆ្នាំសិក្សា {selectedStudent.enrollments.filter(e => e.drop).map(e => e.course?.schoolYear?.schoolYearCode).filter(Boolean).join(', ')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Individual Drop Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {selectedStudent.enrollments.map((enrollment, index) => (
                                enrollment.drop && (
                                  <div key={enrollment.enrollmentId} className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 p-6 rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/30 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                                          <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                                        </div>
                                        <span className="text-base font-semibold text-red-800 dark:text-red-200">ថ្នាក់ដែលបោះបង់ការសិក្សា</span>
                                      </div>
                                      <div className="px-3 py-1 bg-red-200 dark:bg-red-800 rounded-full">
                                        <span className="text-xs font-bold text-red-800 dark:text-red-200">បោះបង់ការសិក្សា</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                      <p className="text-xl font-bold text-red-900 dark:text-red-100 mb-1">
                                        {enrollment.course ? `ថ្នាក់ទី ${enrollment.course.grade}${enrollment.course.section}` : `ថ្នាក់ទី ${selectedStudent.class}`}
                                      </p>
                                      {enrollment.course?.schoolYear && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                          ឆ្នាំសិក្សា: {enrollment.course.schoolYear.schoolYearCode}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {enrollment.dropSemester && (
                                        <div className="flex items-center space-x-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                                          <Calendar className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300">ឆមាសបោះបង់ការសិក្សា</p>
                                            <p className="text-sm font-bold text-red-800 dark:text-red-200">{enrollment.dropSemester.semester}</p>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {enrollment.dropDate && (
                                        <div className="flex items-center space-x-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                                          <Calendar className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300">ថ្ងៃបោះបង់ការសិក្សា</p>
                                            <p className="text-sm font-bold text-red-800 dark:text-red-200">{formatDate(enrollment.dropDate)}</p>
                                          </div>
                                        </div>
                                      )}

                                      {enrollment.dropReason && (
                                        <div className="flex items-center space-x-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-300">មូលហេតុបោះបង់ការសិក្សា</p>
                                            <p className="text-sm font-bold text-red-800 dark:text-red-200">{enrollment.dropReason}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Remove Drop Study Button */}
                                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-700">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedDropEnrollment(enrollment);
                                          setShowRemoveDropDialog(true);
                                        }}
                                        className="w-full h-8 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                      >
                                        <RotateCcw className="h-3 w-3 mr-2" />
                                        <span className="text-xs">ដកចេញការបោះបង់</span>
                                      </Button>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-8 rounded-xl shadow-sm border border-green-200/50 dark:border-green-800/30">
                            <div className="text-center">
                              <div className="flex justify-center mb-4">
                                <div className="p-4 bg-green-200 dark:bg-green-800 rounded-full">
                                  <GraduationCap className="h-8 w-8 text-green-700 dark:text-green-300" />
                                </div>
                              </div>
                              <h5 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">ស្ថានភាពសិក្សាល្អ</h5>
                              <p className="text-lg text-green-700 dark:text-green-300 mb-2">សិស្សនេះមិនបានបោះបង់ការសិក្សាពីថ្នាក់ណាមួយទេ</p>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                មាន {selectedStudent.enrollments.filter(e => !e.drop).length} ការចុះឈ្មោះសកម្ម
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'family' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Home className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានគ្រួសារ</h4>
                    </div>
                    
                    {selectedStudent.family ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-5 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                              <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                            </div>
                            <span className="text-base font-semibold text-blue-800 dark:text-blue-200">នៅជាមួយអ្នកណា</span>
                          </div>
                          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{getLivingWithLabel(selectedStudent.family.livingWith)}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-5 rounded-xl shadow-sm border border-green-200/50 dark:border-green-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                              <Home className="h-4 w-4 text-green-700 dark:text-green-300" />
                            </div>
                            <span className="text-base font-semibold text-green-800 dark:text-green-200">នៅផ្ទះផ្ទាល់ខ្លួន?</span>
                          </div>
                          <p className="text-lg font-bold text-green-900 dark:text-green-100">{selectedStudent.family.ownHouse ? 'បាទ/ចាស' : 'ទេ'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-5 rounded-xl shadow-sm border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                              <Calendar className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                            </div>
                            <span className="text-base font-semibold text-purple-800 dark:text-purple-200">រយៈពេលនៅកំពង់ចាម</span>
                          </div>
                          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{getDurationLabel(selectedStudent.family.durationInKPC)}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-5 rounded-xl shadow-sm border border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                              <HeartPulse className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                            </div>
                            <span className="text-base font-semibold text-orange-800 dark:text-orange-200">ជីវភាព</span>
                          </div>
                          <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{getLivingConditionLabel(selectedStudent.family.livingCondition)}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 p-5 rounded-xl shadow-sm border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                              <Award className="h-4 w-4 text-red-700 dark:text-red-300" />
                            </div>
                            <span className="text-base font-semibold text-red-800 dark:text-red-200">ទទួលជំនួយពីអង្គការ</span>
                          </div>
                          <p className="text-lg font-bold text-red-900 dark:text-red-100">{selectedStudent.family.organizationHelp || '-'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 p-5 rounded-xl shadow-sm border border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg">
                              <GraduationCap className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
                            </div>
                            <span className="text-base font-semibold text-indigo-800 dark:text-indigo-200">ស្គាល់សាលាតាមរយៈ</span>
                          </div>
                          <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{selectedStudent.family.knowSchool || '-'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 p-5 rounded-xl shadow-sm border border-pink-200/50 dark:border-pink-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-pink-200 dark:bg-pink-800 rounded-lg">
                              <Grape className="h-4 w-4 text-pink-700 dark:text-pink-300" />
                            </div>
                            <span className="text-base font-semibold text-pink-800 dark:text-pink-200">សាសនា</span>
                          </div>
                          <p className="text-lg font-bold text-pink-900 dark:text-pink-100">{getReligionLabel(selectedStudent.family.religion)}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 p-5 rounded-xl shadow-sm border border-yellow-200/50 dark:border-yellow-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                              <Home className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                            </div>
                            <span className="text-base font-semibold text-yellow-800 dark:text-yellow-200">ឈ្មោះព្រះវិហារ</span>
                          </div>
                          <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{selectedStudent.family.churchName || '-'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 p-5 rounded-xl shadow-sm border border-teal-200/50 dark:border-teal-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-teal-200 dark:bg-teal-800 rounded-lg">
                              <Award className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                            </div>
                            <span className="text-base font-semibold text-teal-800 dark:text-teal-200">លទ្ធភាពជួយសាលា</span>
                          </div>
                          <p className="text-lg font-bold text-teal-900 dark:text-teal-100">{selectedStudent.family.canHelpSchool ? 'បាទ/ចាស' : 'ទេ'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/10 p-5 rounded-xl shadow-sm border border-cyan-200/50 dark:border-cyan-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-cyan-200 dark:bg-cyan-800 rounded-lg">
                              <Award className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                            </div>
                            <span className="text-base font-semibold text-cyan-800 dark:text-cyan-200">ថវិកាជួយសាលា</span>
                          </div>
                          <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">{selectedStudent.family.helpAmount ? `${selectedStudent.family.helpAmount.toLocaleString()} ៛` : '-'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 p-5 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                              <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                            </div>
                            <span className="text-base font-semibold text-emerald-800 dark:text-emerald-200">ក្នុងមួយ</span>
                          </div>
                          <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{getFrequencyLabel(selectedStudent.family.helpFrequency)}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/10 p-5 rounded-xl shadow-sm border border-rose-200/50 dark:border-rose-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-rose-200 dark:bg-rose-800 rounded-lg">
                              <Award className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                            </div>
                            <span className="text-base font-semibold text-rose-800 dark:text-rose-200">ប័ណ្ឌក្រីក្រ</span>
                          </div>
                          <p className="text-lg font-bold text-rose-900 dark:text-rose-100">
                            {selectedStudent.family.povertyCard 
                              ? (selectedStudent.family.povertyCard.toLowerCase() === 'yes' ? 'មាន' : selectedStudent.family.povertyCard.toLowerCase() === 'no' ? 'គ្មាន' : selectedStudent.family.povertyCard)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl text-center shadow-sm">
                        <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-base text-gray-600 dark:text-gray-400 font-medium">សិស្សនេះមិនមានព័ត៌មានគ្រួសារទេ</p>
                        <p className="text-gray-500 dark:text-gray-500 mt-1 text-base">ព័ត៌មានគ្រួសារនឹងបង្ហាញនៅទីនេះ</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'guardian' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">ព័ត៌មានអាណាព្យាបាល</h4>
                    {selectedStudent.guardians && selectedStudent.guardians.length > 0 ? (
                      <div className="space-y-6">
                        {selectedStudent.guardians.map((guardian: Guardian, index: number) => (
                          <div key={guardian.guardianId || index} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
                            {/* Guardian Header */}
                            <div className="flex items-center mb-6">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4 shadow-md">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-base text-gray-600 dark:text-gray-400 font-medium">អាណាព្យាបាល {index + 1}</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {guardian.lastName} {guardian.firstName}
                                </p>
                                <p className="text-base text-blue-600 dark:text-blue-400 font-medium">{getRelationLabel(guardian.relation)}</p>
                              </div>
                            </div>

                            {/* Guardian Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Personal Information */}
                              <div className="space-y-3">
                                <h6 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">ព័ត៌មានផ្ទាល់ខ្លួន</h6>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">នាមត្រកូល:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.lastName || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">នាមខ្លួន:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.firstName || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ត្រូវជា:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{getRelationLabel(guardian.relation)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">លេខទូរស័ព្ទ:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.phone || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">មុខរបរ:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.occupation || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ប្រាក់ចំណូល:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.income ? `${guardian.income.toLocaleString()} ៛` : '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ចំនួនកូនក្នុងបន្ទុក:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.childrenCount || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ជឿព្រះយ៉េស៊ូ?</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.believeJesus ? 'បាទ/ចាស' : 'ទេ'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Address Information */}
                              <div className="space-y-3">
                                <h6 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">អាសយដ្ឋាន</h6>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ផ្ទះលេខ:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.houseNumber || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ភូមិ/សង្កាត់:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.village || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ស្រុក/ខណ្ឌ:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.district || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ខេត្ត/ក្រុង:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.province || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ស្រុកកំណើត:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.birthDistrict || '-'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ព្រះវិហារ:</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.church || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Information */}
                              <div className="space-y-3">
                                <h6 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">ព័ត៌មានបន្ថែម</h6>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">អាណាព្យាបាលចម្បង</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">មានទំនាក់ទំនងជាមួយសិស្ស</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">អាចជួយសាលា</span>
                                  </div>
                                </div>

                                {/* Contact Quick Actions */}
                                <div className="mt-4 space-y-2">
                                  {guardian.phone && (
                                    <div className="flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                      <Phone className="h-4 w-4 text-blue-600 mr-2" />
                                      <span className="text-base font-medium text-blue-600">ទូរស័ព្ទ: {guardian.phone}</span>
                                    </div>
                                  )}
                                  {guardian.occupation && (
                                    <div className="flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                      <User className="h-4 w-4 text-green-600 mr-2" />
                                      <span className="text-base font-medium text-green-600">{guardian.occupation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-8 rounded-lg text-center shadow-sm">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-base text-gray-600 dark:text-gray-400 font-medium">សិស្សនេះមិនមានអាណាព្យាបាលទេ</p>
                        <p className="text-gray-500 dark:text-gray-500 mt-1 text-base">អាណាព្យាបាលនឹងបង្ហាញនៅទីនេះ</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-950/20 dark:via-purple-950/15 dark:to-indigo-950/20 rounded-3xl -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]" />
          
          <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700">
            <CardContent className="p-10 text-center">
              <div className="mx-auto max-w-lg">
                {/* Animated Icon Container */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></div>
                    <User className="h-14 w-14 text-white relative z-10" />
              </div>
                </div>
                
                {/* Modern Text */}
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 group-hover:scale-105 transition-transform duration-300">
                  រកមិនឃើញព័ត៌មានសិស្ស
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  សូមជ្រើសរើសសិស្សពីខាងលើ ដើម្បីមើលព័ត៌មានលម្អិត
                </p>
                
                {/* Instruction Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8 border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-4">
                    🔍 របៀបស្វែងរក:
                  </p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</div>
                      <span className="text-base text-gray-700 dark:text-gray-300">ជ្រើសរើស <strong className="text-blue-600 dark:text-blue-400">ឆ្នាំសិក្សា</strong></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</div>
                      <span className="text-base text-gray-700 dark:text-gray-300">ជ្រើសរើស <strong className="text-purple-600 dark:text-purple-400">ថ្នាក់រៀន</strong></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</div>
                      <span className="text-base text-gray-700 dark:text-gray-300">ឬ <strong className="text-indigo-600 dark:text-indigo-400">វាយបញ្ចូលឈ្មោះ</strong> ដើម្បីស្វែងរក</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl group-hover:scale-105"
                  onClick={() => {
                    const searchInput = document.querySelector('input[placeholder*="ឈ្មោះសិស្ស"]') as HTMLInputElement;
                    if (searchInput) searchInput.focus();
                  }}
                >
                  <Search className="h-5 w-5 mr-2 animate-pulse" />
                  ចាប់ផ្តើមស្វែងរកសិស្ស
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

