'use client'

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
  { id: 'attendance', label: 'អវត្តមាន', icon: <CalendarCheck className="h-4 w-4" /> },
  { id: 'grades', label: 'ពិន្ទុ', icon: <Award className="h-4 w-4" /> },
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
    <div>
      {/* Search Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="shadow-sm bg-white rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-800">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>ស្វែងរកសិស្ស</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 min-w-[300px]">
                <Label className="text-gray-600 mb-1">សូមបញ្ចូលឈ្មោះសិស្ស</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    placeholder="សរសេរឈ្មោះសិស្ស"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="pl-10 pr-10 rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <ChevronDown 
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="max-h-60 overflow-auto">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map(student => (
                            <div
                              key={student.id}
                              className="flex items-center p-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setSearchTerm(`${student.lastName} ${student.firstName}`);
                                handleStudentSelect(student);
                                setShowDropdown(false);
                              }}
                            >
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{student.lastName} {student.firstName}</p>
                                <p className="text-xs text-gray-500">{student.class} • {student.academicYear}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500 text-center">រកមិនឃើញឈ្មោះសិស្ស</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
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
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="filter-toggle" className="text-gray-600 cursor-pointer">
                    រកតាមឆ្នាំសិក្សា និងថ្នាក់
                  </Label>
                </div>

                {filterByYearClass && (
                  <div className="flex space-x-3">
                    <div className="w-[180px]">
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          <SelectValue placeholder="ឆ្នាំសិក្សា" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-gray-300 shadow-lg">
                          {academicYears.map(year => (
                            <SelectItem key={year} value={year} className="hover:bg-indigo-50">
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-[180px]">
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary">
                          <BookOpen className="mr-2 h-4 w-4 text-primary" />
                          <SelectValue placeholder="ថ្នាក់" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-gray-300 shadow-lg">
                          {classes.map(cls => (
                            <SelectItem key={cls} value={cls} className="hover:bg-indigo-50">
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
      </div>

      {/* Student Details Section */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm bg-white rounded-xl h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-indigo-50">
                    <img 
                      src={selectedStudent.photo} 
                      alt={`${selectedStudent.lastName} ${selectedStudent.firstName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center">
                    {selectedStudent.lastName} {selectedStudent.firstName}
                  </h3>
                  <p className="text-gray-600 text-center">{selectedStudent.age} ឆ្នាំ • {selectedStudent.gender}</p>
                  
                  <div className="mt-6 w-full space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 flex items-center">
                        <BookOpen className="h-4 w-4 text-primary mr-2" />
                        ព័ត៌មានសិក្សា
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>ថ្នាក់: {selectedStudent.class}</p>
                        <p>ឆ្នាំសិក្សា: {selectedStudent.academicYear}</p>
                        <p className={selectedStudent.education.registered ? "text-green-600" : "text-red-600"}>
                          ស្ថានភាព: {selectedStudent.education.registered ? "កំពុងសិក្សា" : "បោះបង់"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 flex items-center">
                        <Home className="h-4 w-4 text-primary mr-2" />
                        អាសយដ្ឋាន
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>{selectedStudent.address.houseNo}, {selectedStudent.address.village}</p>
                        <p>{selectedStudent.address.commune}, {selectedStudent.address.district}</p>
                        <p>{selectedStudent.address.province}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl border-none shadow-sm overflow-hidden">
              <nav className="flex overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium flex items-center space-x-2 border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <Card className="border-none shadow-sm bg-white rounded-xl">
              <CardContent className="p-6">
                {activeTab === 'registration' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ព័ត៌មានចុះឈ្មោះ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ឈ្មោះសិស្ស</p>
                        <p className="font-medium">{selectedStudent.lastName} {selectedStudent.firstName}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ថ្ងៃខែឆ្នាំកំណើត</p>
                        <p className="font-medium">{selectedStudent.dob}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ថ្នាក់ទី</p>
                        <p className="font-medium">{selectedStudent.class}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ថ្ងៃចុះឈ្មោះ</p>
                        <p className="font-medium">{selectedStudent.education.registrationDate}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'scholarship' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ព័ត៌មានអាហារូបករណ៍</h4>
                    {selectedStudent.scholarship.type ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">ប្រភេទ</p>
                          <p className="font-medium">{selectedStudent.scholarship.type}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">ចំនួនទឹកប្រាក់</p>
                          <p className="font-medium">{selectedStudent.scholarship.amount}៛</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">អង្គការឧបត្ថម្ភ</p>
                          <p className="font-medium">{selectedStudent.scholarship.sponsor}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        សិស្សនេះមិនមានអាហារូបករណ៍ទេ
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'family' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ព័ត៌មានគ្រួសារ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ឪពុក</p>
                        <p className="font-medium">{selectedStudent.family.father}</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ម្តាយ</p>
                        <p className="font-medium">{selectedStudent.family.mother}</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">បងប្អូន</p>
                        <p className="font-medium">{selectedStudent.family.siblings} នាក់</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ក្រាហ្វិចអវត្តមាន</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.attendance.map(record => (
                        <div key={record.month} className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">{record.month}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">វត្តមាន:</span>
                              <span className="font-medium text-green-600">{record.present} ថ្ងៃ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">អវត្តមាន:</span>
                              <span className="font-medium text-red-600">{record.absent} ថ្ងៃ</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'grades' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ក្រាហ្វិចពិន្ទុ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">ភាសាខ្មែរ</p>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${selectedStudent.grades.khmer}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{selectedStudent.grades.khmer}/100</span>
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">គណិតវិទ្យា</p>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${selectedStudent.grades.math}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{selectedStudent.grades.math}/100</span>
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">វិទ្យាសាស្ត្រ</p>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${selectedStudent.grades.science}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{selectedStudent.grades.science}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'religion' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ព័ត៌មានសាសនា</h4>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedStudent.religion}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">ព័ត៌មានសុខភាព</h4>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedStudent.health}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="shadow-sm bg-white rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto max-w-md">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">រកមិនឃើញព័ត៌មានសិស្ស</h3>
                <p className="text-gray-600">សូមជ្រើសរើសសិស្សដើម្បីមើលព័ត៌មានលម្អិត</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
