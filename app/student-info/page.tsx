"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, BookOpen, Home, HeartPulse, Award, CalendarCheck, Grape, Utensils, ScrollText, ChevronDown, Calendar } from "lucide-react";
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
    photo: "/student1.jpg",
    academicYear: "2023-2024",
    class: "៧ក",
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
      dropoutReason: null
    },
    scholarship: {
      type: "អាហារូបករណ៍ពូកែ",
      amount: 200000,
      sponsor: "ក្រសួងអប់រំ"
    },
    family: {
      father: "យន្ត សំអាត",
      mother: "ម៉ៅ សុធារី",
      siblings: 2
    },
    attendance: [
      { month: "មករា", present: 20, absent: 2 },
      { month: "កុម្ភៈ", present: 18, absent: 4 }
    ],
    grades: {
      khmer: 85,
      math: 90,
      science: 88
    },
    religion: "ព្រះពុទ្ធសាសនា",
    health: "ល្អ"
  },
  {
    id: 2,
    firstName: "ស្រី",
    lastName: "វណ្ណា",
    gender: "ស្រី",
    dob: "2011-03-22",
    age: 12,
    birthPlace: "កណ្តាល",
    photo: "/student2.jpg",
    academicYear: "2023-2024",
    class: "៦ខ",
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
      dropoutReason: null
    },
    scholarship: {
      type: null,
      amount: 0,
      sponsor: null
    },
    family: {
      father: "វណ្ណា សុខហួរ",
      mother: "ឡាយ ស្រីពេជ្រ",
      siblings: 1
    },
    attendance: [
      { month: "មករា", present: 22, absent: 0 },
      { month: "កុម្ភៈ", present: 20, absent: 2 }
    ],
    grades: {
      khmer: 92,
      math: 88,
      science: 85
    },
    religion: "ព្រះពុទ្ធសាសនា",
    health: "ល្អ"
  }
];

const academicYears = ["2023-2024", "2022-2023", "2021-2022"];
const classes = ["៧ក", "៧ខ", "៦ក", "៦ខ", "៥ក", "៥ខ"];

const tabs = [
  { id: 'registration', label: 'ចុះឈ្មោះ', icon: <ScrollText className="h-4 w-4" /> },
  { id: 'scholarship', label: 'អាហារូបករណ៍', icon: <Utensils className="h-4 w-4" /> },
  { id: 'family', label: 'គ្រួសារ', icon: <Home className="h-4 w-4" /> },
  { id: 'attendance', label: 'ក្រាហ្វិចអវត្តមាន', icon: <CalendarCheck className="h-4 w-4" /> },
  { id: 'grades', label: 'ក្រាហ្វិចពិន្ទុ', icon: <Award className="h-4 w-4" /> },
  { id: 'religion', label: 'សាសនា', icon: <Grape className="h-4 w-4" /> },
  { id: 'health', label: 'សុខភាព', icon: <HeartPulse className="h-4 w-4" /> }
];

export default function StudentInfoPage() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('registration');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByYearClass, setFilterByYearClass] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveTab('registration');
  };

  return (
  <>
      {/* Search and Filter Section */}
    <div className="grid grid-cols-1 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-[#0082c8]" />
            <span>ស្វែងរកសិស្ស</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <Label htmlFor="student-search">សូមបញ្ចូលឈ្មោះសិស្ស</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0082c8]" />
                <Input
                  id="student-search"
                  placeholder="ជ្រើសរើស ឬ សរសេរឈ្មោះសិស្ស"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="pl-10 pr-10"
                />
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0082c8] cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-60 overflow-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                          <div
                            key={student.id}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => {
                              setSearchTerm(`${student.lastName} ${student.firstName}`);
                              handleStudentSelect(student);
                              setShowDropdown(false);
                            }}
                          >
                            <User className="mr-2 h-4 w-4 text-[#0082c8]" />
                            <div>
                              <p>{student.lastName} {student.firstName}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 text-center">រកមិនឃើញឈ្មោះសិស្ស</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {/* Checkbox and Label - Centered */}
              <div className="flex justify-center items-center space-x-4 w-[400px] -translate-y-1/2">
                <Checkbox
                  id="filter-toggle"
                  checked={filterByYearClass}
                  onCheckedChange={(checked) => {
                    setFilterByYearClass(checked);
                    if (!checked) {
                      setSelectedYear("");
                      setSelectedClass("");
                    }
                  }}
                />
                <Label htmlFor="filter-toggle" className="cursor-pointer whitespace-nowrap">
                  រកតាមឆ្នាំសិក្សា និងថ្នាក់
                </Label>
              </div>

              {/* Year and Class Filters - Centered when shown */}
              {filterByYearClass && (
                <div className="flex justify-center space-x-4">
                  <div className="w-[180px]">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="ឆ្នាំសិក្សា" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="ថ្នាក់" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#0082c8]" />
                <span>ព័ត៌មានលម្អិត</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Student Photo and Basic Info */}
                <div className="space-y-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto overflow-hidden">
                    <img 
                      src={selectedStudent.photo} 
                      alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{selectedStudent.lastName} {selectedStudent.firstName}</h3>
                    <p className="text-gray-600">អាយុ: {selectedStudent.age} ឆ្នាំ</p>
                    <p className="text-gray-600">ថ្នាក់ទី: {selectedStudent.class}</p>
                    <p className="text-gray-600">ឆ្នាំសិក្សា: {selectedStudent.academicYear}</p>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold">ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                  <p><span className="font-medium">ភេទ:</span> {selectedStudent.gender}</p>
                  <p><span className="font-medium">ថ្ងៃខែឆ្នាំកំណើត:</span> {selectedStudent.dob}</p>
                  <p><span className="font-medium">កំណើត:</span> {selectedStudent.birthPlace}</p>
                </div>

                {/* Address Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold">អាសយដ្ឋាន</h4>
                  <p><span className="font-medium">ផ្ទះលេខ:</span> {selectedStudent.address.houseNo}</p>
                  <p><span className="font-medium">ភូមិ/ឃុំ:</span> {selectedStudent.address.village}</p>
                  <p><span className="font-medium">សង្កាត់:</span> {selectedStudent.address.commune}</p>
                  <p><span className="font-medium">ស្រុក/ខណ្ឌ:</span> {selectedStudent.address.district}</p>
                  <p><span className="font-medium">ខេត្ត/ក្រុង:</span> {selectedStudent.address.province}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-[#0082c8]" />
                <span>ព័ត៌មានការសិក្សា</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">ចុះឈ្មោះចូលរៀន:</span> {selectedStudent.education.registered ? 'បាទ/ចាស' : 'ទេ'}</p>
                  <p><span className="font-medium">ថ្នាក់ទី:</span> {selectedStudent.education.grade}</p>
                  <p><span className="font-medium">ថ្ងៃចុះឈ្មោះ:</span> {selectedStudent.education.registrationDate}</p>
                </div>
                <div>
                  {selectedStudent.education.dropoutDate ? (
                    <>
                      <p><span className="font-medium">ថ្ងៃបោះបង់ការសិក្សា:</span> {selectedStudent.education.dropoutDate}</p>
                      <p><span className="font-medium">មូលហេតុ:</span> {selectedStudent.education.dropoutReason}</p>
                    </>
                  ) : (
                    <p className="text-green-600">កំពុងសិក្សា</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Navigation */}
         <div className="col-span-full border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <Card className="lg:col-span-full">
            <CardContent className="p-6">
              {activeTab === 'registration' && (
                <div>
                  <h4 className="font-bold mb-4">ព័ត៌មានចុះឈ្មោះ</h4>
                  <p>ឈ្មោះសិស្ស: {selectedStudent.lastName} {selectedStudent.firstName}</p>
                  <p>ថ្នាក់ទី: {selectedStudent.class}</p>
                  <p>ឆ្នាំសិក្សា: {selectedStudent.academicYear}</p>
                  <p>ថ្ងៃចុះឈ្មោះ: {selectedStudent.education.registrationDate}</p>
                </div>
              )}

              {activeTab === 'scholarship' && (
                <div>
                  <h4 className="font-bold mb-4">ព័ត៌មានអាហារូបករណ៍</h4>
                  {selectedStudent.scholarship.type ? (
                    <>
                      <p>ប្រភេទ: {selectedStudent.scholarship.type}</p>
                      <p>ចំនួនទឹកប្រាក់: {selectedStudent.scholarship.amount}៛</p>
                      <p>អង្គការឧបត្ថម្ភ: {selectedStudent.scholarship.sponsor}</p>
                    </>
                  ) : (
                    <p>សិស្សនេះមិនមានអាហារូបករណ៍ទេ</p>
                  )}
                </div>
              )}

              {activeTab === 'family' && (
                <div>
                  <h4 className="font-bold mb-4">ព័ត៌មានគ្រួសារ</h4>
                  <p>ឪពុក: {selectedStudent.family.father}</p>
                  <p>ម្តាយ: {selectedStudent.family.mother}</p>
                  <p>បងប្អូន: {selectedStudent.family.siblings} នាក់</p>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div>
                  <h4 className="font-bold mb-4">ក្រាហ្វិចអវត្តមាន</h4>
                  <div className="space-y-2">
                    {selectedStudent.attendance.map(record => (
                      <div key={record.month} className="flex justify-between">
                        <span>{record.month}:</span>
                        <span>
                          មានវត្តមាន {record.present} ថ្ងៃ, អវត្តមាន {record.absent} ថ្ងៃ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'grades' && (
                <div>
                  <h4 className="font-bold mb-4">ក្រាហ្វិចពិន្ទុ</h4>
                  <div className="space-y-2">
                    <p>ភាសាខ្មែរ: {selectedStudent.grades.khmer}/100</p>
                    <p>គណិតវិទ្យា: {selectedStudent.grades.math}/100</p>
                    <p>វិទ្យាសាស្ត្រ: {selectedStudent.grades.science}/100</p>
                  </div>
                </div>
              )}

              {activeTab === 'religion' && (
                <div>
                  <h4 className="font-bold mb-4">ព័ត៌មានសាសនា</h4>
                  <p>សាសនា: {selectedStudent.religion}</p>
                </div>
              )}

              {activeTab === 'health' && (
                <div>
                  <h4 className="font-bold mb-4">ព័ត៌មានសុខភាព</h4>
                  <p>ស្ថានភាពសុខភាព: {selectedStudent.health}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            សូមជ្រើសរើសសិស្សដើម្បីមើលព័ត៌មាន
          </CardContent>
        </Card>
      )}
     </div>
  </>
  );
}
