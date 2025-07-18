'use client'

import { useState, useEffect, useRef } from "react";
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
  Utensils, 
  ScrollText, 
  ChevronDown, 
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Star,
  TrendingUp,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock student data
const students = [
  {
    id: 1,
    firstName: "សុខ",
    lastName: "យន្ត",
    gender: "ប្រុស",
    dob: "2010-05-15",
    age: 13,
    birthPlace: "ភ្នំពេញ",
    photo: "/placeholder-user.jpg",
    academicYear: "2023-2024",
    class: "៧ក",
    phone: "012345678",
    email: "sok.yant@email.com",
    address: {
      houseNo: "12A",
      village: "ភូមិទី 3",
      commune: "ឃុំចំការមន",
      district: "ខណ្ឌដង្កោ",
      province: "ភ្នំពេញ"
    },
    education: {
      registered: true,
      grade: "៧",
      registrationDate: "2023-09-01",
      dropoutDate: null,
      dropoutReason: null,
      gpa: 3.8
    },
    scholarship: {
      type: "អាហារូបករណ៍ពូកែ",
      amount: 200000,
      sponsor: "ក្រសួងអប់រំ"
    },
    family: {
      father: "យន្ត សំអាត",
      mother: "ម៉ៅ សុធារី",
      siblings: 2,
      fatherPhone: "012345679",
      motherPhone: "012345680"
    },
    attendance: [
      { month: "មករា", present: 20, absent: 2, percentage: 90.9 },
      { month: "កុម្ភៈ", present: 18, absent: 4, percentage: 81.8 },
      { month: "មីនា", present: 22, absent: 0, percentage: 100 },
      { month: "មេសា", present: 19, absent: 3, percentage: 86.4 }
    ],
    grades: {
      khmer: 85,
      math: 90,
      science: 88,
      english: 82,
      history: 87,
      geography: 89
    },
    religion: "ព្រះពុទ្ធសាសនា",
    health: "ល្អ",
    emergencyContact: "យន្ត សំអាត (012345679)"
  },
  {
    id: 2,
    firstName: "ស្រី",
    lastName: "វណ្ណា",
    gender: "ស្រី",
    dob: "2011-03-22",
    age: 12,
    birthPlace: "កណ្តាល",
    photo: "/placeholder-user.jpg",
    academicYear: "2023-2024",
    class: "៦ខ",
    phone: "012345681",
    email: "srey.vanna@email.com",
    address: {
      houseNo: "45B",
      village: "ភូមិទី 2",
      commune: "ឃុំព្រែកថ្មី",
      district: "ស្រុកកណ្តាលស្ទឹង",
      province: "កណ្តាល"
    },
    education: {
      registered: true,
      grade: "៦",
      registrationDate: "2023-09-01",
      dropoutDate: null,
      dropoutReason: null,
      gpa: 3.9
    },
    scholarship: {
      type: null,
      amount: 0,
      sponsor: null
    },
    family: {
      father: "វណ្ណា សុខហួរ",
      mother: "ឡាយ ស្រីពេជ្រ",
      siblings: 1,
      fatherPhone: "012345682",
      motherPhone: "012345683"
    },
    attendance: [
      { month: "មករា", present: 22, absent: 0, percentage: 100 },
      { month: "កុម្ភៈ", present: 20, absent: 2, percentage: 90.9 },
      { month: "មីនា", present: 21, absent: 1, percentage: 95.5 },
      { month: "មេសា", present: 20, absent: 2, percentage: 90.9 }
    ],
    grades: {
      khmer: 92,
      math: 88,
      science: 85,
      english: 90,
      history: 87,
      geography: 89
    },
    religion: "ព្រះពុទ្ធសាសនា",
    health: "ល្អ",
    emergencyContact: "វណ្ណា សុខហួរ (012345682)"
  }
];

const academicYears = ["2023-2024", "2022-2023", "2021-2022"];
const classes = ["៧ក", "៧ខ", "៦ក", "៦ខ", "៥ក", "៥ខ"];

const tabs = [
  { id: 'register-student', label: 'ចុះឈ្មោះ', icon: <ScrollText className="h-4 w-4" /> },
  { id: 'scholarship', label: 'អាហារូបករណ៍', icon: <Utensils className="h-4 w-4" /> },
  { id: 'family', label: 'គ្រួសារ', icon: <Home className="h-4 w-4" /> },
  { id: 'attendance', label: 'អវត្តមាន', icon: <CalendarCheck className="h-4 w-4" /> },
  { id: 'grades', label: 'ពិន្ទុ', icon: <Award className="h-4 w-4" /> },
  { id: 'religion', label: 'សាសនា', icon: <Grape className="h-4 w-4" /> },
  { id: 'health', label: 'សុខភាព', icon: <HeartPulse className="h-4 w-4" /> }
];

export default function StudentInfoPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('register-student');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByYearClass, setFilterByYearClass] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let result = students;
    
    if (filterByYearClass) {
      if (selectedYear) {
        result = result.filter(student => student.academicYear === selectedYear);
      }
      if (selectedClass) {
        result = result.filter(student => student.class === selectedClass);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.firstName.toLowerCase().includes(term) || 
        student.lastName.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(result);
  }, [searchTerm, filterByYearClass, selectedYear, selectedClass]);

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

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setActiveTab('register-student');
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 95) return { color: "text-green-600", bg: "bg-green-100", text: "ល្អ" };
    if (percentage >= 85) return { color: "text-yellow-600", bg: "bg-yellow-100", text: "មធ្យម" };
    return { color: "text-red-600", bg: "bg-red-100", text: "ខ្សោយ" };
  };

  const getGradeStatus = (grade: number) => {
    if (grade >= 90) return { color: "text-green-600", bg: "bg-green-100", text: "A" };
    if (grade >= 80) return { color: "text-blue-600", bg: "bg-blue-100", text: "B" };
    if (grade >= 70) return { color: "text-yellow-600", bg: "bg-yellow-100", text: "C" };
    return { color: "text-red-600", bg: "bg-red-100", text: "D" };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-2">
          ព័ត៌មានសិស្ស
        </h1>
        <p className="text-lg font-medium text-muted-foreground mt-3 leading-relaxed">
          គ្រប់គ្រងព័ត៌មានលម្អិតរបស់សិស្ស
        </p>
      </div>

      {/* Search and Filter Section */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span className="text-lg">ស្វែងរកសិស្ស</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <Label className="text-gray-700 dark:text-gray-300 mb-2">សូមបញ្ចូលឈ្មោះសិស្ស</Label>
              <div className="relative mt-1" ref={dropdownRef}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <Input
                  placeholder="សរសេរឈ្មោះសិស្ស"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10 pr-10 h-12"
                />
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                          <div
                            key={student.id}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSearchTerm(`${student.lastName} ${student.firstName}`);
                              handleStudentSelect(student);
                              setShowDropdown(false);
                            }}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">{student.lastName} {student.firstName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{student.class} • {student.academicYear}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {student.age} ឆ្នាំ
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                          <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>រកមិនឃើញឈ្មោះសិស្ស</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-4 w-[400px] -translate-y-1/2">
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
                  className="h-5 w-5"
                />
                <Label htmlFor="filter-toggle" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                  រកតាមឆ្នាំសិក្សា និងថ្នាក់
                </Label>
              </div>

              {filterByYearClass && (
                <div className="flex space-x-3">
                  <div className="w-[180px]">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-12">
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="ឆ្នាំសិក្សា" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="h-12">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="ថ្នាក់" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Section */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Student Profile Card */}
          <div className="lg:col-span-1">
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full overflow-hidden mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                    <img 
                      src={selectedStudent.photo} 
                      alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                    {selectedStudent.lastName} {selectedStudent.firstName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{selectedStudent.age} ឆ្នាំ • {selectedStudent.gender}</p>
                  
                  <div className="w-full space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedStudent.education.gpa}</div>
                        <div className="text-xs text-blue-600">GPA</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedStudent.attendance[selectedStudent.attendance.length - 1]?.percentage || 0}%</div>
                        <div className="text-xs text-green-600">វត្តមាន</div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        ព័ត៌មានទំនាក់ទំនង
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{selectedStudent.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{selectedStudent.email}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-2 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{selectedStudent.address.province}</span>
                        </div>
                      </div>
                    </div>

                    {/* Education Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        ព័ត៌មានសិក្សា
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ថ្នាក់:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedStudent.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ឆ្នាំសិក្សា:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedStudent.academicYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ស្ថានភាព:</span>
                          <Badge className={selectedStudent.education.registered ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                            {selectedStudent.education.registered ? "កំពុងសិក្សា" : "បោះបង់"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        ទំនាក់ទំនងអាសន្ន
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedStudent.emergencyContact}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-2">
            {/* Tabs Navigation */}
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <nav className="flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                        activeTab === tab.id 
                          ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10' 
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Tab Content */}
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                {activeTab === 'register-student' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានចុះឈ្មោះ</h4>
                      <Button size="sm" className="flex items-center gap-2" variant="gradient">
                        <Edit className="h-4 w-4" />
                        កែប្រែ
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ឈ្មោះសិស្ស</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.lastName} {selectedStudent.firstName}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ថ្ងៃខែឆ្នាំកំណើត</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.dob}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ថ្នាក់ទី</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.class}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ថ្ងៃចុះឈ្មោះ</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.education.registrationDate}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'scholarship' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានអាហារូបករណ៍</h4>
                    {selectedStudent.scholarship.type ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ប្រភេទ</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.scholarship.type}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ចំនួនទឹកប្រាក់</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.scholarship.amount.toLocaleString()}៛</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">អង្គការឧបត្ថម្ភ</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.scholarship.sponsor}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                        <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 dark:text-gray-400">សិស្សនេះមិនមានអាហារូបករណ៍ទេ</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'family' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានគ្រួសារ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ឪពុក</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.family.father}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedStudent.family.fatherPhone}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ម្តាយ</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.family.mother}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedStudent.family.motherPhone}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">បងប្អូន</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.family.siblings} នាក់</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ក្រាហ្វិចអវត្តមាន</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.attendance.map((record: any, index: number) => {
                        const status = getAttendanceStatus(record.percentage);
                        return (
                          <div key={record.month} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-900 dark:text-white">{record.month}</h5>
                              <Badge className={`${status.bg} ${status.color}`}>
                                {status.text}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">វត្តមាន:</span>
                                <span className="font-semibold text-green-600">{record.present} ថ្ងៃ</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">អវត្តមាន:</span>
                                <span className="font-semibold text-red-600">{record.absent} ថ្ងៃ</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">ភាគរយ:</span>
                                <span className="font-semibold text-blue-600">{record.percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'grades' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ក្រាហ្វិចពិន្ទុ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(selectedStudent.grades).map(([subject, grade]: [string, any]) => {
                        const status = getGradeStatus(grade);
                        return (
                          <div key={subject} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {subject === 'khmer' ? 'ភាសាខ្មែរ' :
                                 subject === 'math' ? 'គណិតវិទ្យា' :
                                 subject === 'science' ? 'វិទ្យាសាស្ត្រ' :
                                 subject === 'english' ? 'ភាសាអង់គ្លេស' :
                                 subject === 'history' ? 'ប្រវត្តិវិទ្យា' :
                                 'ភូមិវិទ្យា'}
                              </h5>
                              <Badge className={`${status.bg} ${status.color}`}>
                                {status.text}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-3">
                                <div 
                                  className={`h-2.5 rounded-full ${status.color.replace('text-', 'bg-')}`}
                                  style={{ width: `${grade}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">{grade}/100</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'religion' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានសាសនា</h4>
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Grape className="h-6 w-6 text-purple-600" />
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">{selectedStudent.religion}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ព័ត៌មានសុខភាព</h4>
                    <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-lg">
                      <div className="flex items-center gap-3">
                        <HeartPulse className="h-6 w-6 text-green-600" />
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">{selectedStudent.health}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">រកមិនឃើញព័ត៌មានសិស្ស</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">សូមជ្រើសរើសសិស្សដើម្បីមើលព័ត៌មានលម្អិត</p>
              <Button className="flex items-center gap-2 mx-auto" variant="gradient">
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
