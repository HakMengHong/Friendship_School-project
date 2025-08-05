'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  UserPlus, 
  FileText, 
  User, 
  Home, 
  BookOpen, 
  Calendar, 
  Search, 
  MapPin,
  Plus,
  X,
  Edit,
  Eye,
  Download,
  Filter,
  TrendingUp,
  Users,
  GraduationCap,
  Phone,
  Mail,
  Building,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Save,
  Upload,
  Shield,
  Target,
  Award
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function RegisterStudentPage() {
  const [studentName, setStudentName] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>({
    id: 'new',
    lastName: '',
    firstName: '',
    class: '',
    dob: '',
    gender: '',
    studentId: ''
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [guardianForms, setGuardianForms] = useState([0]); // Start with one form
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(true) // Show form by default
  const [isNewStudent, setIsNewStudent] = useState(true) // Set to true by default
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Form state for new student
  const [formData, setFormData] = useState({
    // ===== BASIC INFORMATION =====
    // Personal Details
    lastName: '',
    firstName: '',
    gender: '',
    dob: '',
    age: '',
    studentId: '',
    
    // Academic Information
    class: '',
    registerToStudy: false,
    previousSchool: '',
    transferReason: '',
    
    // ===== ADDRESS & CONTACT =====
    // Student Address
    studentHouseNumber: '',
    studentVillage: '',
    studentDistrict: '',
    studentProvince: '',
    studentBirthDistrict: '',
    
    // Contact Information
    phone: '',
    emergencyContact: '',
    
    // ===== HEALTH & RELIGION =====
    // Health Information
    health: '',
    vaccinated: false,
    
    // Religious Information
    religion: '',
    
    // ===== SCHOOL NEEDS =====
    // Material Needs
    needsClothes: false,
    needsMaterials: false,
    needsTransport: false,
    
    // Guardians
    guardians: [{
      firstName: '',
      lastName: '',
      relation: '',
      phone: '',
      occupation: '',
      income: '',
      childrenCount: '',
      houseNumber: '',
      village: '',
      district: '',
      province: '',
      birthDistrict: '',
      believeJesus: false,
      church: ''
    }],
    
    // Family info
    familyInfo: {
      livingWith: '',
      ownHouse: false,
      durationInKPC: '',
      livingCondition: '',
      organizationHelp: '',
      knowSchool: '',
      religion: '',
      churchName: '',
      canHelpSchool: false,
      helpAmount: '',
      helpFrequency: ''
    }
  })

  // Function to generate next student ID
  const generateNextStudentId = async () => {
    try {
      const response = await fetch('/api/students/next-id')
      const data = await response.json()
      return data.nextStudentId
    } catch (error) {
      console.error('Error generating student ID:', error)
      // Fallback: generate simple number based on current students count
      const nextId = students.length + 1
      return nextId.toString()
    }
  }

  // Function to generate simple numeric student ID
  const generateSimpleStudentId = () => {
    // Generate simple number based on current students count + 1
    const nextId = students.length + 1;
    return nextId.toString();
  }

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students')
        const data = await response.json()
        setStudents(data.students || [])
      } catch (error) {
        console.error('Error fetching students:', error)
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [toast])



  const addGuardianForm = () => {
    setGuardianForms([...guardianForms, guardianForms.length]);
    setFormData(prev => ({
      ...prev,
      guardians: [...prev.guardians, {
        firstName: '',
        lastName: '',
        relation: '',
        phone: '',
        occupation: '',
        income: '',
        childrenCount: '',
        houseNumber: '',
        village: '',
        district: '',
        province: '',
        birthDistrict: '',
        believeJesus: false,
        church: ''
      }]
    }));
  };

  const removeGuardianForm = (indexToRemove: number) => {
    setGuardianForms(guardianForms.filter(index => index !== indexToRemove));
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = {
      lastName: formData.lastName,
      firstName: formData.firstName,
      gender: formData.gender,
      dob: formData.dob,
      class: formData.class
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true)
    try {
      // Determine if this is a new student or updating existing
      const isNewStudent = !selectedStudent?.studentId || selectedStudent?.studentId === 'new';
      const url = isNewStudent ? '/api/students' : `/api/students/${selectedStudent.studentId}`;
      const method = isNewStudent ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student: {
            lastName: formData.lastName,
            firstName: formData.firstName,
            gender: formData.gender,
            dob: formData.dob,
            class: formData.class,
            registerToStudy: formData.registerToStudy,
            studentHouseNumber: formData.studentHouseNumber,
            studentVillage: formData.studentVillage,
            studentDistrict: formData.studentDistrict,
            studentProvince: formData.studentProvince,
            studentBirthDistrict: formData.studentBirthDistrict,
            phone: formData.phone,

            religion: formData.religion,
            health: formData.health,
            emergencyContact: formData.emergencyContact,
            vaccinated: formData.vaccinated,
            previousSchool: formData.previousSchool,
            transferReason: formData.transferReason,
            needsClothes: formData.needsClothes,
            needsMaterials: formData.needsMaterials,
            needsTransport: formData.needsTransport,
            registrationDate: new Date().toISOString(),
            status: 'active'
          },
          guardians: formData.guardians.filter(guardian => 
            guardian.firstName || guardian.lastName || guardian.relation || guardian.phone
          ),
          familyInfo: formData.familyInfo
        })
      })

      if (response.ok) {
        const result = await response.json()
        const isNewStudent = !selectedStudent?.studentId || selectedStudent?.studentId === 'new';
        toast({
          title: "Success",
          description: isNewStudent ? "Student registered successfully" : "Student updated successfully",
        })
        // Reset form
        setFormData({
          // ===== BASIC INFORMATION =====
          // Personal Details
          lastName: '',
          firstName: '',
          gender: '',
          dob: '',
          age: '',
          studentId: '',
          
          // Academic Information
          class: '',
          registerToStudy: false,
          previousSchool: '',
          transferReason: '',
          
          // ===== ADDRESS & CONTACT =====
          // Student Address
          studentHouseNumber: '',
          studentVillage: '',
          studentDistrict: '',
          studentProvince: '',
          studentBirthDistrict: '',
          
          // Contact Information
          phone: '',
          emergencyContact: '',
          
          // ===== HEALTH & RELIGION =====
          // Health Information
          health: '',
          vaccinated: false,
          
          // Religious Information
          religion: '',
          
          // ===== SCHOOL NEEDS =====
          // Material Needs
          needsClothes: false,
          needsMaterials: false,
          needsTransport: false,
          guardians: [{
            firstName: '',
            lastName: '',
            relation: '',
            phone: '',
            occupation: '',
            income: '',
            childrenCount: '',
            houseNumber: '',
            village: '',
            district: '',
            province: '',
            birthDistrict: '',
            believeJesus: false,
            church: ''
          }],
          familyInfo: {
            livingWith: '',
            ownHouse: false,
            durationInKPC: '',
            livingCondition: '',
            organizationHelp: '',
            knowSchool: '',
            religion: '',
            churchName: '',
            canHelpSchool: false,
            helpAmount: '',
            helpFrequency: ''
          }
        })
        setShowForm(false)
        setSelectedStudent(null)
        setIsNewStudent(false)
        // Refresh students list
        const studentsResponse = await fetch('/api/students')
        const studentsData = await studentsResponse.json()
        setStudents(studentsData.students || [])
      } else {
        throw new Error('Failed to register student')
      }
    } catch (error) {
      console.error('Error registering student:', error)
      toast({
        title: "Error",
        description: "Failed to register student",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewStudent = () => {
    setSelectedStudent({
      id: 'new',
      lastName: '',
      firstName: '',
      class: '',
      dob: '',
      gender: '',
      studentId: ''
    })
    
    // Reset form data for new student
    setFormData({
      // ===== BASIC INFORMATION =====
      // Personal Details
      lastName: '',
      firstName: '',
      gender: '',
      dob: '',
      age: '',
      studentId: '',
      
      // Academic Information
      class: '',
      registerToStudy: false,
      previousSchool: '',
      transferReason: '',
      
      // ===== ADDRESS & CONTACT =====
      // Student Address
      studentHouseNumber: '',
      studentVillage: '',
      studentDistrict: '',
      studentProvince: '',
      studentBirthDistrict: '',
      
      // Contact Information
      phone: '',
      emergencyContact: '',
      
      // ===== HEALTH & RELIGION =====
      // Health Information
      health: '',
      vaccinated: false,
      
      // Religious Information
      religion: '',
      
      // ===== SCHOOL NEEDS =====
      // Material Needs
      needsClothes: false,
      needsMaterials: false,
      needsTransport: false,
      guardians: [{
        firstName: '',
        lastName: '',
        relation: '',
        phone: '',
        occupation: '',
        income: '',
        childrenCount: '',
        houseNumber: '',
        village: '',
        district: '',
        province: '',
        birthDistrict: '',
        believeJesus: false,
        church: ''
      }],
      familyInfo: {
        livingWith: '',
        ownHouse: false,
        durationInKPC: '',
        livingCondition: '',
        organizationHelp: '',
        knowSchool: '',
        religion: '',
        churchName: '',
        canHelpSchool: false,
        helpAmount: '',
        helpFrequency: ''
      }
    })
    
    setIsNewStudent(true)
    setShowForm(true)
    setActiveTab("basic")
  }

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student)
    setIsNewStudent(false)
    setShowForm(true)
    setActiveTab("basic")
    
    // Calculate age from DOB
    let ageString = '';
    if (student.dob) {
      const birthDate = new Date(student.dob);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();
      
      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
        days = Math.floor((today.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      ageString = `${years} ឆ្នាំ ${months} ខែ ${days} ថ្ងៃ`;
    }
    
    // Populate form with student data
    setFormData({
      // ===== BASIC INFORMATION =====
      // Personal Details
      lastName: student.lastName || '',
      firstName: student.firstName || '',
      gender: student.gender || '',
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      age: ageString,
      studentId: student.studentId?.toString() || '',
      
      // Academic Information
      class: student.class || '',
      registerToStudy: student.registerToStudy || false,
      previousSchool: student.previousSchool || '',
      transferReason: student.transferReason || '',
      
      // ===== ADDRESS & CONTACT =====
      // Student Address
      studentHouseNumber: student.studentHouseNumber || '',
      studentVillage: student.studentVillage || '',
      studentDistrict: student.studentDistrict || '',
      studentProvince: student.studentProvince || '',
      studentBirthDistrict: student.studentBirthDistrict || '',
      
      // Contact Information
      phone: student.phone || '',
      emergencyContact: student.emergencyContact || '',
      
      // ===== HEALTH & RELIGION =====
      // Health Information
      health: student.health || '',
      vaccinated: student.vaccinated || false,
      
      // Religious Information
      religion: student.religion || '',
      
      // ===== SCHOOL NEEDS =====
      // Material Needs
      needsClothes: student.needsClothes || false,
      needsMaterials: student.needsMaterials || false,
      needsTransport: student.needsTransport || false,
      
      // Guardians (load from student.guardians if available)
      guardians: student.guardians && student.guardians.length > 0 ? student.guardians.map((guardian: any) => ({
        firstName: guardian.firstName || '',
        lastName: guardian.lastName || '',
        relation: guardian.relation || '',
        phone: guardian.phone || '',
        occupation: guardian.occupation || '',
        income: guardian.income?.toString() || '',
        childrenCount: guardian.childrenCount?.toString() || '',
        houseNumber: guardian.houseNumber || '',
        village: guardian.village || '',
        district: guardian.district || '',
        province: guardian.province || '',
        birthDistrict: guardian.birthDistrict || '',
        believeJesus: guardian.believeJesus || false,
        church: guardian.church || ''
      })) : [{
        firstName: '',
        lastName: '',
        relation: '',
        phone: '',
        occupation: '',
        income: '',
        childrenCount: '',
        houseNumber: '',
        village: '',
        district: '',
        province: '',
        birthDistrict: '',
        believeJesus: false,
        church: ''
      }],
      
      // Family info (load from student.family if available)
      familyInfo: student.family ? {
        livingWith: student.family.livingWith || '',
        ownHouse: student.family.ownHouse || false,
        durationInKPC: student.family.durationInKPC || '',
        livingCondition: student.family.livingCondition || '',
        organizationHelp: student.family.organizationHelp || '',
        knowSchool: student.family.knowSchool || '',
        religion: student.family.religion || '',
        churchName: student.family.churchName || '',
        canHelpSchool: student.family.canHelpSchool || false,
        helpAmount: student.family.helpAmount?.toString() || '',
        helpFrequency: student.family.helpFrequency || ''
      } : {
        livingWith: '',
        ownHouse: false,
        durationInKPC: '',
        livingCondition: '',
        organizationHelp: '',
        knowSchool: '',
        religion: '',
        churchName: '',
        canHelpSchool: false,
        helpAmount: '',
        helpFrequency: ''
      }
    })
    
    // Update guardian forms count based on loaded guardians
    if (student.guardians && student.guardians.length > 0) {
      setGuardianForms(Array.from({ length: student.guardians.length }, (_, i) => i));
    } else {
      setGuardianForms([0]);
    }
  }

  const filteredStudents = students.filter(student => {
    if (!studentName) return true
    const searchTerm = studentName.toLowerCase()
    const fullName = `${student.lastName || ''} ${student.firstName || ''}`.toLowerCase()
    return fullName.includes(searchTerm)
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-relaxed py-2">
          ចុះឈ្មោះសិស្ស
        </h1>
        <p className="text-lg font-medium text-muted-foreground mt-3 leading-relaxed">
          បញ្ចូលព័ត៌មានសិស្សថ្មី និងគ្រប់គ្រងព័ត៌មាន
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Student List Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="h-full border-0 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-600">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">បញ្ជីសិស្ស</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">ជ្រើសរើសសិស្សដើម្បីចុះឈ្មោះ</CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={handleNewStudent}
                  size="sm"
                  variant="gradient"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  ថ្មី
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="relative">
                  <Input
                    placeholder="ស្វែងរកសិស្ស..."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="pl-10 h-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</p>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredStudents.map(student => (
                      <div
                        key={student.studentId}
                        onClick={() => handleSelectStudent(student)}
                        className={`p-4 cursor-pointer transition-colors duration-150 ${
                          selectedStudent?.studentId === student.studentId 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-r-blue-600' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {student.firstName?.charAt(0) || ''}{student.lastName?.charAt(0) || ''}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {student.lastName} {student.firstName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ថ្នាក់ {student.class} • ID: {student.studentId}
                            </p>
                          </div>
                          {selectedStudent?.studentId === student.studentId && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {studentName ? 'រកមិនឃើញសិស្ស' : 'គ្មានសិស្ស'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form Content */}
        <div className="flex-1 space-y-6">
          {showForm && selectedStudent ? (
            <>
              {/* Form Navigation Tabs */}
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        ព័ត៌មានសិស្ស
                      </TabsTrigger>
                      <TabsTrigger value="guardian" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        អាណាព្យាបាល
                      </TabsTrigger>
                      <TabsTrigger value="family" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        គ្រួសារ
                      </TabsTrigger>
                      <TabsTrigger value="additional" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        បន្ថែម
                      </TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-2">
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>ព័ត៌មានមូលដ្ឋាន</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            {/* Last Name */}
                            <div className="space-y-1">
                              <Label htmlFor="last-name">នាមត្រកូល</Label>
                              <Input 
                                id="last-name" 
                                value={formData.lastName} 
                                onChange={(e) => {
                                  const lastName = e.target.value;
                                  setFormData({...formData, lastName: lastName});
                                }}
                                placeholder="នាមត្រកូល" 
                                className="h-11 text-center"
                              />
                            </div>

                            {/* First Name */}
                            <div className="space-y-1">
                              <Label htmlFor="first-name">នាមខ្លួន</Label>
                              <Input 
                                id="first-name" 
                                value={formData.firstName} 
                                onChange={(e) => {
                                  const firstName = e.target.value;
                                  setFormData({...formData, firstName: firstName});
                                }}
                                placeholder="នាមខ្លួន" 
                                className="h-11 text-center"
                              />
                            </div>

                            {/* Gender */}
                            <div className="space-y-1">
                              <Label htmlFor="gender">ភេទ</Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({...formData, gender: value})}
                              >
                                <SelectTrigger id="gender" className="h-11 text-center">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">ប្រុស</SelectItem>
                                  <SelectItem value="female">ស្រី</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-1">
                              <Label htmlFor="dob">ថ្ងៃខែឆ្នាំកំណើត</Label>
                              <Input 
                                type="date" 
                                id="dob" 
                                value={formData.dob} 
                                onChange={(e) => {
                                  const dob = e.target.value;
                                  setFormData({...formData, dob: dob});
                                  // Auto-calculate detailed age if DOB is provided
                                  if (dob) {
                                    const birthDate = new Date(dob);
                                    const today = new Date();
                                    
                                    // Calculate years, months, and days
                                    let years = today.getFullYear() - birthDate.getFullYear();
                                    let months = today.getMonth() - birthDate.getMonth();
                                    let days = today.getDate() - birthDate.getDate();
                                    
                                    // Adjust for negative months/days
                                    if (days < 0) {
                                      months--;
                                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
                                      days = Math.floor((today.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
                                    }
                                    
                                    if (months < 0) {
                                      years--;
                                      months += 12;
                                    }
                                    
                                    // Format as "Xឆ្នាំ Yខែ Zថ្ងៃ"
                                    const ageString = `${years} ឆ្នាំ ${months} ខែ ${days} ថ្ងៃ`;
                                    setFormData(prev => ({...prev, age: ageString}));
                                  }
                                }}
                                className="h-11 text-center"
                              />
                            </div>

                            {/* Age */}
                            <div className="space-y-1">
                              <Label htmlFor="age">អាយុ</Label>
                              <Input 
                                id="age" 
                                value={formData.age || ""}
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                placeholder="អាយុ" 
                                className="h-11 text-center"
                              />
                            </div>

                            {/* Class */}
                            <div className="space-y-1">
                              <Label htmlFor="class">ចូលរៀនថ្នាក់ទី</Label>
                              <Select
                                value={formData.class}
                                onValueChange={(value) => {
                                  setFormData({...formData, class: value});
                                }}
                              >
                                <SelectTrigger id="class" className="h-11 text-center">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["៧ក", "៧ខ", "៦ក", "៦ខ", "៥ក", "៥ខ"].map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Register to Study Checkbox */}
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <Checkbox 
                                id="register-to-study" 
                                checked={formData.registerToStudy}
                                onCheckedChange={(checked) => setFormData({...formData, registerToStudy: checked as boolean})}
                              />
                              <Label htmlFor="register-to-study">ចុះឈ្មោះចូលរៀន?</Label>
                            </div>
                            
                            {/* Student ID */}
                            <div className="space-y-1">
                              <Label>លេខសំគាល់សិស្ស (ID)</Label>
                              <div className="text-4xl h-11 flex items-center justify-center font-bold bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                              {isNewStudent ? formData.studentId || "NEW" : selectedStudent?.studentId || "N/A"}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Student Address Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>អាសយដ្ឋានសិស្ស</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            {/* House Number */}
                            <div className="space-y-1">
                              <Label htmlFor="student-house-number">ផ្ទះលេខ</Label>
                              <Input 
                                id="student-house-number" 
                                placeholder="ផ្ទះលេខ" 
                                value={formData.studentHouseNumber}
                                onChange={(e) => setFormData({...formData, studentHouseNumber: e.target.value})}
                                className="h-11 text-center" 
                              />
                            </div>

                            {/* Village */}
                            <div className="space-y-1">
                              <Label htmlFor="student-village">ភូមិ/សង្កាត់</Label>
                              <Input 
                                id="student-village" 
                                placeholder="ភូមិ/សង្កាត់" 
                                value={formData.studentVillage}
                                onChange={(e) => setFormData({...formData, studentVillage: e.target.value})}
                                className="h-11 text-center" 
                              />
                            </div>

                            {/* District */}
                            <div className="space-y-1">
                              <Label htmlFor="student-district">ស្រុក/ខណ្ឌ</Label>
                              <Input 
                                id="student-district" 
                                placeholder="ស្រុក/ខណ្ឌ" 
                                value={formData.studentDistrict}
                                onChange={(e) => setFormData({...formData, studentDistrict: e.target.value})}
                                className="h-11 text-center" 
                              />
                            </div>

                            {/* Province */}
                            <div className="space-y-1">
                              <Label htmlFor="student-province">ខេត្ត/ក្រុង</Label>
                              <Input 
                                id="student-province" 
                                placeholder="ខេត្ត/ក្រុង" 
                                value={formData.studentProvince}
                                onChange={(e) => setFormData({...formData, studentProvince: e.target.value})}
                                className="h-11 text-center" 
                              />
                            </div>

                            {/* Birth District */}
                            <div className="space-y-1 col-span-4">
                              <Label htmlFor="student-birth-district">ស្រុកកំណើត</Label>
                              <Input 
                                id="student-birth-district" 
                                placeholder="ស្រុកកំណើត" 
                                value={formData.studentBirthDistrict}
                                onChange={(e) => setFormData({...formData, studentBirthDistrict: e.target.value})}
                                className="h-11 text-center" 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contact Information Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>ព័ត៌មានបន្ថែម</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            {/* Phone */}
                            <div className="space-y-1">
                              <Label htmlFor="phone">លេខទូរស័ព្ទទំនាក់ទំនងគោល</Label>
                              <Input 
                                id="phone" 
                                type="tel"
                                placeholder="012 XXX XXX" 
                                value={formData.phone}
                                onChange={(e) => {
                                  // Only allow numbers and spaces
                                  const value = e.target.value.replace(/[^0-9\s]/g, '');
                                  // Limit to 12 characters (including spaces)
                                  if (value.length <= 12) {
                                    setFormData({...formData, phone: value});
                                  }
                                }}
                                className="h-11 text-center" 
                              />
                            </div>

                            {/* Vaccination Status */}
                            <div className="flex flex-col items-center justify-center space-y-1 col-span-3">
                              <Checkbox 
                                id="vaccinated" 
                                checked={formData.vaccinated || false}
                                onCheckedChange={(checked) => setFormData({...formData, vaccinated: checked as boolean})}
                              />
                              <Label htmlFor="vaccinated" className="cursor-pointer text-center">
                                តើសិស្សបានទទួលវ៉ាក់សាំងគ្រប់គ្រាន់ហើយឬនៅ?
                              </Label>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Guardian Information Tab */}
                    <TabsContent value="guardian" className="space-y-2">
                      {guardianForms.map((formIndex) => (
                        <Card key={formIndex} className="hover:shadow-lg transition-all duration-200">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="flex items-center space-x-2">
                                <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span>
                                  ព័ត៌មានអាណាព្យាបាល {guardianForms.length > 1 ? formIndex + 1 : ''}
                                </span>
                              </CardTitle>
                              {formIndex > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeGuardianForm(formIndex)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  លុប
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                              {/* Family's Name */}
                              <div className="space-y-1">
                                <Label htmlFor={`family-first-name-${formIndex}`}>នាមត្រកូល</Label>
                                <Input 
                                  id={`family-first-name-${formIndex}`} 
                                  placeholder="នាមត្រកូល" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.firstName || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], firstName: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`family-last-name-${formIndex}`}>នាមខ្លួន</Label>
                                <Input 
                                  id={`family-last-name-${formIndex}`} 
                                  placeholder="នាមខ្លួន" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.lastName || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], lastName: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>

                              {/* Guardian Info */}
                              <div className="space-y-1">
                                <Label htmlFor={`guardian-relation-${formIndex}`}>ត្រូវជា</Label>
                                <Select
                                  value={formData.guardians[formIndex]?.relation || ''}
                                  onValueChange={(value) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], relation: value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                >
                                  <SelectTrigger id={`guardian-relation-${formIndex}`} className="h-11 text-center">
                                    <SelectValue placeholder="ជ្រើសរើស" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="father">ឪពុក</SelectItem>
                                    <SelectItem value="mother">ម្តាយ</SelectItem>
                                    <SelectItem value="guardian">អាណាព្យាបាល</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-1">
                                <Label htmlFor={`phone-${formIndex}`}>លេខទូរស័ព្ទ</Label>
                                <Input 
                                  id={`phone-${formIndex}`} 
                                  type="tel"
                                  placeholder="012 XXX XXX" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.phone || ''}
                                  onChange={(e) => {
                                    // Only allow numbers and spaces
                                    const value = e.target.value.replace(/[^0-9\s]/g, '');
                                    // Limit to 12 characters (including spaces)
                                    if (value.length <= 12) {
                                      const newGuardians = [...formData.guardians];
                                      newGuardians[formIndex] = { ...newGuardians[formIndex], phone: value };
                                      setFormData({ ...formData, guardians: newGuardians });
                                    }
                                  }}
                                />
                              </div>

                              {/* Occupation */}
                              <div className="space-y-1">
                                <Label htmlFor={`occupation-${formIndex}`}>មុខរបរ</Label>
                                <Input 
                                  id={`occupation-${formIndex}`} 
                                  placeholder="មុខរបរ" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.occupation || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], occupation: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`income-${formIndex}`}>ប្រាក់ចំណូល</Label>
                                <Input 
                                  id={`income-${formIndex}`} 
                                  type="number"
                                  placeholder="0" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.income || ''}
                                  onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], income: value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>

                              {/* Children Info */}
                              <div className="space-y-1">
                                <Label htmlFor={`children-count-${formIndex}`}>ចំនួនកូនក្នុងបន្ទុក</Label>
                                <Input 
                                  id={`children-count-${formIndex}`} 
                                  type="number" 
                                  placeholder="0" 
                                  min="0"
                                  max="20"
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.childrenCount || ''}
                                  onChange={(e) => {
                                    // Only allow numbers and limit to reasonable range
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    const numValue = parseInt(value) || 0;
                                    if (numValue >= 0 && numValue <= 20) {
                                      const newGuardians = [...formData.guardians];
                                      newGuardians[formIndex] = { ...newGuardians[formIndex], childrenCount: value };
                                      setFormData({ ...formData, guardians: newGuardians });
                                    }
                                  }}
                                />
                              </div>

                              {/* Address */}
                              <div className="space-y-1">
                                <Label htmlFor={`house-number-${formIndex}`}>ផ្ទះលេខ</Label>
                                <Input 
                                  id={`house-number-${formIndex}`} 
                                  placeholder="ផ្ទះលេខ" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.houseNumber || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], houseNumber: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`village-${formIndex}`}>ភូមិ/សង្កាត់</Label>
                                <Input 
                                  id={`village-${formIndex}`} 
                                  placeholder="ភូមិ/សង្កាត់" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.village || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], village: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`district-${formIndex}`}>ស្រុក/ខណ្ឌ</Label>
                                <Input 
                                  id={`district-${formIndex}`} 
                                  placeholder="ស្រុក/ខណ្ឌ" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.district || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], district: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`province-${formIndex}`}>ខេត្ត/ក្រុង</Label>
                                <Input 
                                  id={`province-${formIndex}`} 
                                  placeholder="ខេត្ត/ក្រុង" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.province || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], province: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`birth-district-${formIndex}`}>ស្រុកកំណើត</Label>
                                <Input 
                                  id={`birth-district-${formIndex}`} 
                                  placeholder="ស្រុកកំណើត" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.birthDistrict || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], birthDistrict: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>

                              {/* Religion */}
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <Checkbox 
                                  id={`believe-jesus-${formIndex}`}
                                  checked={formData.guardians[formIndex]?.believeJesus || false}
                                  onCheckedChange={(checked) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], believeJesus: checked as boolean };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                                <Label htmlFor={`believe-jesus-${formIndex}`}>ជឿព្រះយ៉េស៊ូ?</Label>
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label htmlFor={`church-${formIndex}`}>ព្រះវិហារ</Label>
                                <Input 
                                  id={`church-${formIndex}`} 
                                  placeholder="ព្រះវិហារ" 
                                  className="h-11 text-center"
                                  value={formData.guardians[formIndex]?.church || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], church: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button 
                        type="button" 
                        onClick={addGuardianForm}
                        className="mt-4 flex items-center gap-2"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                        បន្ថែម
                      </Button>
                    </TabsContent>

                    {/* Family Information Tab */}
                    <TabsContent value="family" className="space-y-6">
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            {/* Living Situation */}
                            <div className="space-y-1">
                              <Label htmlFor="living-with">នៅជាមួយអ្នកណា</Label>
                              <Input 
                                id="living-with" 
                                placeholder="នៅជាមួយអ្នកណា" 
                                className="h-11 text-center"
                                value={formData.familyInfo.livingWith || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, livingWith: e.target.value }
                                })}
                              />
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <Checkbox 
                                id="own-house"
                                checked={formData.familyInfo.ownHouse || false}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, ownHouse: checked as boolean }
                                })}
                              />
                              <Label htmlFor="own-house">នៅផ្ទះផ្ទាល់ខ្លួន?</Label>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="duration-in-kpc">រយៈពេលនៅកំពង់ចាម</Label>
                              <Input 
                                id="duration-in-kpc" 
                                placeholder="រយៈពេល" 
                                className="h-11 text-center"
                                value={formData.familyInfo.durationInKPC || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, durationInKPC: e.target.value }
                                })}
                              />
                            </div>

                            {/* Living Condition */}
                            <div className="space-y-1">
                              <Label htmlFor="living-condition">ជីវភាព</Label>
                              <Select
                                value={formData.familyInfo.livingCondition || ''}
                                onValueChange={(value) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, livingCondition: value }
                                })}
                              >
                                <SelectTrigger id="living-condition" className="h-11 text-center">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="good">ល្អ</SelectItem>
                                  <SelectItem value="medium">មធ្យម</SelectItem>
                                  <SelectItem value="poor">ខ្វះខាត</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Organization Help */}
                            <div className="space-y-1">
                              <Label htmlFor="organization-help">ទទួលជំនួយពីអង្គការ</Label>
                              <Input 
                                id="organization-help" 
                                placeholder="អង្គការ" 
                                className="h-11 text-center"
                                value={formData.familyInfo.organizationHelp || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, organizationHelp: e.target.value }
                                })}
                              />
                            </div>

                            {/* School Info */}
                            <div className="space-y-1">
                              <Label htmlFor="know-school">ស្គាល់សាលាតាមរយៈ</Label>
                              <Input 
                                id="know-school" 
                                placeholder="ស្គាល់សាលាតាម" 
                                className="h-11 text-center"
                                value={formData.familyInfo.knowSchool || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, knowSchool: e.target.value }
                                })}
                              />
                            </div>

                            {/* Religion */}
                            <div className="space-y-1">
                              <Label htmlFor="religion">សាសនា</Label>
                              <Input 
                                id="religion" 
                                placeholder="សាសនា" 
                                className="h-11 text-center"
                                value={formData.familyInfo.religion || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, religion: e.target.value }
                                })}
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="church-name">ឈ្មោះព្រះវិហារ</Label>
                              <Input 
                                id="church-name" 
                                placeholder="ព្រះវិហារ" 
                                className="h-11 text-center"
                                value={formData.familyInfo.churchName || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, churchName: e.target.value }
                                })}
                              />
                            </div>

                            {/* School Support */}
                            <div className="space-y-1">
                              <Label htmlFor="can-help-school">លទ្ធភាពជួយសាលា</Label>
                              <Select
                                value={formData.familyInfo.canHelpSchool ? 'yes' : 'no'}
                                onValueChange={(value) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, canHelpSchool: value === 'yes' }
                                })}
                              >
                                <SelectTrigger id="can-help-school" className="h-11 text-center">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">បាទ/ចាស</SelectItem>
                                  <SelectItem value="no">ទេ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="help-amount">ថវិកាជួយសាលា</Label>
                              <Input 
                                id="help-amount" 
                                type="number"
                                placeholder="0" 
                                className="h-11 text-center"
                                value={formData.familyInfo.helpAmount || ''}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setFormData({
                                    ...formData, 
                                    familyInfo: { ...formData.familyInfo, helpAmount: value }
                                  });
                                }}
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="help-frequency">ក្នុងមួយ</Label>
                              <Select
                                value={formData.familyInfo.helpFrequency || ''}
                                onValueChange={(value) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, helpFrequency: value }
                                })}
                              >
                                <SelectTrigger id="help-frequency" className="h-11 text-center">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="month">ខែ</SelectItem>
                                  <SelectItem value="year">ឆ្នាំ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Study Information Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>ព័ត៌មានសិក្សាសម្រាប់សិស្សថ្មី</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2">
                            <div className="space-y-1 col-span-3">
                              <Label htmlFor="school">សាលារៀនមុន</Label>
                              <Input 
                                id="school" 
                                className="h-11 text-center"
                                value={formData.previousSchool || ''}
                                onChange={(e) => setFormData({...formData, previousSchool: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-1 col-span-4">
                              <Label htmlFor="reason">មូលហេតុផ្លាស់ប្តូរ</Label>
                              <Input 
                                id="reason" 
                                className="h-11 text-center"
                                value={formData.transferReason || ''}
                                onChange={(e) => setFormData({...formData, transferReason: e.target.value})}
                              />
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-1 col-span-5">
                              <Checkbox 
                                id="vaccinated"
                                checked={formData.vaccinated || false}
                                onCheckedChange={(checked) => setFormData({...formData, vaccinated: checked as boolean})}
                              />
                              <Label htmlFor="vaccinated" className="cursor-pointer">
                                សិស្សទទួលបានវ៉ាក់សាំងគ្រប់គ្រាន់ហើយនៅ?
                              </Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Additional Information Tab */}
                    <TabsContent value="additional" className="space-y-6">
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>តម្រូវការពីសាលា</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="clothes"
                                checked={formData.needsClothes || false}
                                onCheckedChange={(checked) => setFormData({...formData, needsClothes: checked as boolean})}
                              />
                              <Label htmlFor="clothes">កង្វះខាតសម្លៀកបំពាក់</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="materials"
                                checked={formData.needsMaterials || false}
                                onCheckedChange={(checked) => setFormData({...formData, needsMaterials: checked as boolean})}
                              />
                              <Label htmlFor="materials">កង្វះខាតសម្ភារៈសិក្សា</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="transport"
                                checked={formData.needsTransport || false}
                                onCheckedChange={(checked) => setFormData({...formData, needsTransport: checked as boolean})}
                              />
                              <Label htmlFor="transport">ត្រូវការឡានដើម្បីជូនមកសាលា</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span>កាលបរិច្ឆេទចុះឈ្មោះ</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <Label htmlFor="registration-date">ថ្ងៃខែឆ្នាំចុះឈ្មោះចូលរៀន</Label>
                              <Input
                                id="registration-date"
                                type="date"
                                className="h-11 w-full md:w-auto"
                              />
                            </div>
                            <div className="flex gap-4">
                              <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    កំពុងរក្សាទុក...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isNewStudent ? 'បញ្ចប់ការចុះឈ្មោះសិស្ស' : 'រក្សាទុកការកែប្រែ'}
                                  </>
                                )}
                              </Button>
                              <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                បោះពុម្ព
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-12 text-center">
                <div className="mx-auto max-w-md">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isNewStudent ? 'បង្កើតសិស្សថ្មី' : 'ជ្រើសរើសសិស្ស'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isNewStudent 
                      ? 'សូមបំពេញព័ត៌មានសិស្សថ្មីខាងក្រោម' 
                      : 'សូមជ្រើសរើសសិស្សពីបញ្ជីខាងឆ្វេងដើម្បីចាប់ផ្តើមការចុះឈ្មោះ'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}