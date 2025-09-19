'use client'

import { useState, useEffect, useRef } from "react";
import { RoleGuard } from "@/components/ui/role-guard";

// Type definitions
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
}

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
  family?: FamilyInfo;
  guardians?: Guardian[];
}

// API response interfaces
interface SchoolYearResponse {
  schoolYearId: number;
  schoolYearCode: string;
  createdAt: string;
}

interface ClassesResponse {
  classes: string[];
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helpers for displaying grade labels
const getGradeLabel = (value?: string | null) => {
  if (!value) return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return `ថ្នាក់ទី${n}`;
};


// Helpers for dates/age
const formatDate = (value?: string | Date | null) => {
  if (!value) return '-';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('km-KH');
};

const calculateAgeYears = (dob?: string | Date | null): number | null => {
  if (!dob) return null;
  const birth = typeof dob === 'string' ? new Date(dob) : dob;
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return years < 0 ? null : years;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByYearClass, setFilterByYearClass] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    
    // Apply year and class filters FIRST (this affects both dropdown and student list)
    if (filterByYearClass) {
      if (selectedYear && selectedYear !== 'all') {
        result = result.filter(student => (student.schoolYear || '') === selectedYear);
      }
      if (selectedClass && selectedClass !== 'all') {
        result = result.filter(student => (student.class || '') === selectedClass);
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
    
    // Sort results by name for better UX
    result.sort((a, b) => {
      const nameA = `${a.lastName || ''} ${a.firstName || ''}`.toLowerCase();
      const nameB = `${b.lastName || ''} ${b.firstName || ''}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    setFilteredStudents(result);
  }, [students, searchTerm, filterByYearClass, selectedYear, selectedClass]);

  // Database-driven filter values
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);



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
        
        // Fetch classes (grades from courses)
        const classesRes = await fetch('/api/classes');
        if (classesRes.ok) {
          const classesData: ClassesResponse = await classesRes.json();
          setClasses(classesData.classes);
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
    setSelectedStudent(student);
    setActiveTab('basic');
  };



  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Modern Header Section */}
      <div className="text-center space-y-6 p-8 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 rounded-3xl">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
          ព័ត៌មានសិស្ស
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          ប្រព័ន្ធគ្រប់គ្រង និងមើលព័ត៌មានលម្អិតរបស់សិស្ស
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-base text-blue-500">សិស្សសរុប</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="text-2xl font-bold text-purple-600">{classes.length}</div>
            <div className="text-base text-purple-500">ថ្នាក់រៀន</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="text-2xl font-bold text-green-600">{academicYears.length}</div>
            <div className="text-base text-green-500">ឆ្នាំសិក្សា</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="text-2xl font-bold text-orange-600">{selectedStudent ? '1' : '0'}</div>
            <div className="text-base text-orange-500">សិស្សជ្រើសរើស</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-md">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <span>ស្វែងរកសិស្ស</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-700 dark:text-gray-300 text-base font-medium">
                  សូមបញ្ចូលឈ្មោះសិស្ស
                </Label>
              </div>
              <div className="relative" ref={dropdownRef}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <Input
                  placeholder="សរសេរឈ្មោះសិស្ស..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10 pr-10 h-10 text-base border-2 focus:border-blue-500 transition-colors"
                />
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              
                {showDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student: Student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchTerm(`${student.lastName} ${student.firstName}`);
                              handleStudentSelect(student);
                              setShowDropdown(false);
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3 shadow-md">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-base">
                                {student.lastName} {student.firstName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getGradeLabel(student.class)}{student.schoolYear ? ` • ${student.schoolYear}` : ''}
                              </p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 text-sm">
                            {getStatusLabel(student.status)}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-gray-500 dark:text-gray-400 text-center">
                          <User className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                          <p className="text-base">រកមិនឃើញឈ្មោះសិស្ស</p>
                          <p className="text-sm mt-1">សូមព្យាយាមស្វែងរកឈ្មោះផ្សេង</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Checkbox
                  id="filter-toggle"
                  checked={filterByYearClass}
                  onCheckedChange={(checked) => {
                    setFilterByYearClass(checked === true);
                    if (checked !== true) {
                      setSelectedYear("");
                      setSelectedClass("");
                    }
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor="filter-toggle" className="text-gray-700 dark:text-gray-300 cursor-pointer text-base font-medium">
                  រកតាមឆ្នាំសិក្សា និងថ្នាក់
                </Label>
              </div>

              {filterByYearClass && (
                <div className="space-y-3">
                  {loadingFilters && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center space-x-2 text-base text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>កំពុងផ្ទុកជម្រើស...</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:w-[160px]">
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="h-10 text-base">
                          <Calendar className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="ឆ្នាំសិក្សា" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingFilters ? (
                            <SelectItem value="loading" disabled>កំពុងផ្ទុក...</SelectItem>
                          ) : academicYears.length > 0 ? (
                            academicYears.map(year => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>គ្មានឆ្នាំសិក្សា</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-full sm:w-[160px]">
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="h-10 text-base">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="ថ្នាក់" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingFilters ? (
                            <SelectItem value="loading" disabled>កំពុងផ្ទុក...</SelectItem>
                          ) : classes.length > 0 ? (
                            classes.map(classValue => (
                              <SelectItem key={classValue} value={classValue}>
                                {getGradeLabel(classValue)}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>គ្មានថ្នាក់</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>         
        </CardContent>
      </Card>

      {/* Student Details Section */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Student Profile Card */}
          <div className="lg:col-span-1">
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md sticky top-4">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full overflow-hidden border-3 border-white dark:border-gray-800 shadow-lg">
                      <img 
                        src={selectedStudent.photo || '/placeholder-user.jpg'} 
                        alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 shadow-md"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedStudent.lastName} {selectedStudent.firstName} ({selectedStudent.studentId})
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-base">
                      {(calculateAgeYears(selectedStudent.dob) ?? '-') + ' ឆ្នាំ'} • {selectedStudent.gender === 'male' ? 'ប្រុស' : selectedStudent.gender === 'female' ? 'ស្រី' : '-'}
                    </p>
                  </div>
                  
                  <div className="w-full space-y-4">
                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-3 text-center shadow-sm">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">ថ្ងៃចុះឈ្មោះ</div>
                        <div className="text-base font-bold text-blue-700 dark:text-blue-300">{formatDate(selectedStudent.registrationDate)}</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-3 text-center shadow-sm">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">ស្ថានភាព</div>
                        <div className="text-base font-bold text-green-700 dark:text-green-300">{getStatusLabel(selectedStudent.status)}</div>
                      </div>
                    </div>
                    {/* Education Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-4 shadow-sm">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center text-base">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-md mr-2">
                          <GraduationCap className="h-3 w-3 text-blue-600" />
                        </div>
                        ព័ត៌មានសិក្សា
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">ថ្នាក់:</span>
                          <span className="font-bold text-gray-900 dark:text-white text-base">{getGradeLabel(selectedStudent.class)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">ឆ្នាំសិក្សា:</span>
                          <span className="font-bold text-gray-900 dark:text-white text-base">{selectedStudent.schoolYear || '-'}</span>
                        </div>
                        {selectedStudent.registerToStudy !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">ចុះឈ្មោះរៀន:</span>
                          <Badge className={selectedStudent.registerToStudy ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 text-sm" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 text-sm"}>
                            {selectedStudent.registerToStudy ? "បានចុះឈ្មោះ" : "មិនទាន់ចុះឈ្មោះ"}
                          </Badge>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg p-4 shadow-sm">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center text-base">
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-md mr-2">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                        </div>
                        លេខទំនាក់ទំនងគោល
                      </h4>
                      <span className="text-gray-700 dark:text-gray-300 text-base">{selectedStudent.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs Navigation */}
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardContent className="p-0">
                <nav className="flex bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'border-blue-500 text-blue-600 bg-white dark:bg-gray-900 shadow-sm' 
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-900'
                      }`}
                    >
                      <div className={`p-1 rounded ${activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {tab.icon}
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Tab Content */}
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardContent className="p-6">
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
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{selectedStudent.lastName} {selectedStudent.firstName}</p>
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
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{getGradeLabel(selectedStudent.class)}</p>
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
                          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{selectedStudent.family.livingWith || '-'}</p>
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
                          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{selectedStudent.family.durationInKPC || '-'}</p>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-5 rounded-xl shadow-sm border border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                              <HeartPulse className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                            </div>
                            <span className="text-base font-semibold text-orange-800 dark:text-orange-200">ជីវភាព</span>
                          </div>
                          <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{selectedStudent.family.livingCondition || '-'}</p>
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
                          <p className="text-lg font-bold text-pink-900 dark:text-pink-100">{selectedStudent.family.religion || '-'}</p>
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
                          <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{selectedStudent.family.helpFrequency || '-'}</p>
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
                                  {guardian.firstName} {guardian.lastName}
                                </p>
                                <p className="text-base text-blue-600 dark:text-blue-400 font-medium">{guardian.relation}</p>
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
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{guardian.relation || '-'}</span>
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
        <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">រកមិនឃើញព័ត៌មានសិស្ស</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6">សូមជ្រើសរើសសិស្សដើម្បីមើលព័ត៌មានលម្អិត</p>
              <Button size="sm" className="flex items-center gap-2 mx-auto px-6 py-2" variant="gradient">
                <Search className="h-4 w-4" />
                ស្វែងរកសិស្ស
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

