'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RoleGuard } from "@/components/ui/role-guard"
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
  Award,
  Printer
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useToast } from "@/hooks/use-toast"

// PDF generation types
import type { StudentRegistrationData } from '@/lib/pdf-generators/reports/student-registration'
import { ReportType } from '@/lib/pdf-generators/core/types'

export default function RegisterStudentPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <RegisterStudentContent />
    </RoleGuard>
  )
}

function RegisterStudentContent() {
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
    const [isCompleted, setIsCompleted] = useState(false)
    const [showForm, setShowForm] = useState(true) // Show form by default
    const [isNewStudent, setIsNewStudent] = useState(true) // Set to true by default
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false) // PDF generation loading state
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
    schoolYear: '', // Add school year field
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

  // Add school years state
  const [schoolYears, setSchoolYears] = useState<any[]>([])

  // Function to convert grade number to Khmer label
  const getGradeLabel = (gradeNumber: string | number) => {
    const gradeMap: { [key: string]: string } = {
      "1": "ថ្នាក់ទី ១",
      "2": "ថ្នាក់ទី ២", 
      "3": "ថ្នាក់ទី ៣",
      "4": "ថ្នាក់ទី ៤",
      "5": "ថ្នាក់ទី ៥",
      "6": "ថ្នាក់ទី ៦",
      "7": "ថ្នាក់ទី ៧",
      "8": "ថ្នាក់ទី ៨",
      "9": "ថ្នាក់ទី ៩"
    };
    return gradeMap[gradeNumber?.toString()] || gradeNumber?.toString() || "N/A";
  };

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

  // Function to format Khmer text for better display
  const formatKhmerText = (text: string, defaultValue: string = 'មិនមាន') => {
    if (!text || text.trim() === '') {
      return defaultValue;
    }
    return text.trim();
  }

  // Note: PDF generation is now handled by the dedicated utility file
  // This provides better code organization and reusability

  // Function to export student registration as PDF
  const exportToPDF = async () => {
    console.log('PDF export function called');
    console.log('Selected student:', selectedStudent);
    console.log('Form data:', formData);
    
    if (!selectedStudent || selectedStudent.id === 'new') {
      console.log('No student selected, showing error');
      toast({
        title: "កំហុស",
        description: "សូមជ្រើសរើសសិស្សដើម្បីបោះពុម្ភ",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields before generating PDF
    const requiredFields = ['lastName', 'firstName', 'studentId', 'class'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "កំហុស",
        description: `សូមបំពេញព័ត៌មានដែលត្រូវការ: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Set loading state
    setIsGeneratingPDF(true);

    try {
      console.log('Generating PDF using utility function...');
      
      // Show loading toast
      toast({
        title: "កំពុងបោះពុម្ភ PDF",
        description: "សូមរង់ចាំ...",
      });
      
      // Convert formData to StudentRegistrationData format
      const studentData: StudentRegistrationData = {
        lastName: formData.lastName,
        firstName: formData.firstName,
        gender: formData.gender,
        dob: formData.dob,
        age: formData.age,
        class: formData.class,
        studentId: formData.studentId,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        studentHouseNumber: formData.studentHouseNumber,
        studentVillage: formData.studentVillage,
        studentDistrict: formData.studentDistrict,
        studentProvince: formData.studentProvince,
        studentBirthDistrict: formData.studentBirthDistrict,
        previousSchool: formData.previousSchool,
        transferReason: formData.transferReason,
        vaccinated: formData.vaccinated,
        schoolYear: formData.schoolYear,
        needsClothes: formData.needsClothes,
        needsMaterials: formData.needsMaterials,
        needsTransport: formData.needsTransport,
        guardians: formData.guardians,
        familyInfo: formData.familyInfo
      };
      
      // Generate PDF using the new PDF generator system
      const response = await fetch('/api/pdf-generate/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: ReportType.STUDENT_REGISTRATION,
          data: studentData,
          options: {
            format: 'A4',
            orientation: 'portrait',
            includeHeader: true,
            includeFooter: true,
            margin: {
              top: '20mm',
              right: '15mm',
              bottom: '20mm',
              left: '15mm'
            }
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`PDF generation failed: ${response.statusText} - ${errorData.error || ''}`);
      }
      
      // Get the PDF blob and trigger download
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create a safe filename for download with better formatting
      const studentName = `${formData.lastName || ''} ${formData.firstName || ''}`.trim() || 'Student';
      const safeStudentName = studentName.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '-') || 'Student';
      const classInfo = formData.class ? `-${formData.class.replace(/\s+/g, '')}` : '';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `student-registration-${formData.studentId}${classInfo}-${safeStudentName}-${timestamp}.pdf`;
      
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message with file info
      const fileSize = (pdfBlob.size / 1024).toFixed(1); // Convert to KB
      toast({
        title: "ជោគជ័យ",
        description: `ទម្រង់ចុះឈ្មោះសិស្សត្រូវបានបោះពុម្ភជា PDF ដោយជោគជ័យ (${fileSize} KB)`,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      toast({
        title: "កំហុស",
        description: `មានបញ្ហាក្នុងការបោះពុម្ភ PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      // Reset loading state
      setIsGeneratingPDF(false);
    }
  }

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students')
        const data = await response.json()
        setStudents(data || []) // API returns array directly, not wrapped in students object
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

  // Fetch school years from API
  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const response = await fetch('/api/school-years')
        const data = await response.json()
        setSchoolYears(data || []) // API returns array directly
      } catch (error) {
        console.error('Error fetching school years:', error)
        toast({
          title: "Error",
          description: "Failed to fetch school years",
          variant: "destructive"
        })
      }
    }

    fetchSchoolYears()
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
    console.log('handleSubmit called');
    console.log('Current formData:', formData);
    console.log('isSubmitting:', isSubmitting, 'isCompleted:', isCompleted);
    
    // Prevent multiple submissions
    if (isSubmitting || isCompleted) {
      console.log('Submission blocked - already submitting or completed');
      return;
    }

    // Validate required fields
    const requiredFields = {
      lastName: formData.lastName,
      firstName: formData.firstName,
      gender: formData.gender,
      dob: formData.dob,
      class: formData.class,
      schoolYear: formData.schoolYear
    };

    console.log('Required fields check:', requiredFields);

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      console.log('Current formData:', formData);
      toast({
        title: "កំហុសក្នុងការបំពេញព័ត៌មាន",
        description: `សូមបំពេញព័ត៌មានដែលត្រូវការ: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    console.log('Validation passed, starting submission');
    setIsSubmitting(true)
    try {
      // Determine if this is a new student or updating existing
      const isNewStudent = !selectedStudent?.studentId || selectedStudent?.studentId === 'new';
      const url = isNewStudent ? '/api/students' : `/api/students/${selectedStudent.studentId}`;
      const method = isNewStudent ? 'POST' : 'PUT';
      
      console.log('Submitting form data:', {
        student: {
          lastName: formData.lastName,
          firstName: formData.firstName,
          gender: formData.gender,
          dob: formData.dob,
          class: formData.class,
          schoolYear: formData.schoolYear,
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
      });
      
      console.log('Making API call to:', url, 'with method:', method);
      const requestBody = {
        student: {
          lastName: formData.lastName,
          firstName: formData.firstName,
          gender: formData.gender,
          dob: formData.dob,
          class: formData.class,
          schoolYear: formData.schoolYear,
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
      };
      
      console.log('Request body:', requestBody);
      
            const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Response received:', result);
        const isNewStudent = !selectedStudent?.studentId || selectedStudent?.studentId === 'new';
        toast({
          title: "Success",
          description: isNewStudent ? "Student registered successfully" : "Student updated successfully",
        })
        setIsCompleted(true)
        console.log('Success state set to true')
        
        // Show completion state for 3 seconds before allowing new submission
        setTimeout(() => {
          setIsCompleted(false)
          console.log('Success state reset to false')
        }, 3000)
        
                // Don't reset form or close it - keep the data visible
        // Refresh students list
        const studentsResponse = await fetch('/api/students')
        const studentsData = await studentsResponse.json()
        setStudents(studentsData || []) // API returns array directly, not wrapped in students object

        // Notify other pages (e.g., student-info) to refresh
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('students:updated'))
            // Also use storage to notify other tabs
            localStorage.setItem('studentsUpdatedAt', String(Date.now()))
          }
        } catch (e) {
          // ignore notification errors
        }
      } else {
        const errorData = await response.text();
        console.error('Response not ok:', response.status, errorData);
        throw new Error(`Failed to register student: ${response.status} ${errorData}`)
      }
    } catch (error) {
      console.error('Error registering student:', error)
      setIsCompleted(false) // Reset completion state on error
      toast({
        title: "Error",
        description: `Failed to register student: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    
    setIsCompleted(false)
    setShowForm(true)
    setActiveTab("basic")
    
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
      schoolYear: '',
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
    setIsCompleted(false)
    
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
      schoolYear: student.schoolYear || '',
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar: Follows height of main content */}
        <div className="w-full lg:w-80 flex-shrink-0 rounded-xl shadow overflow-y-auto">
          <Card className="h-full border-0 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-600">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-primary dark:text-white">បញ្ជីសិស្ស</CardTitle>
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
            <CardContent className="flex flex-col flex-1 p-0">
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

              <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                {loading ? (
                  <div className=" py-12">
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
                              {getGradeLabel(student.class)} • ID: {student.studentId}
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
                  <div className=" py-12">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {studentName ? 'រកមិនឃើញសិស្ស' : 'គ្មានសិស្ស'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Varies by tab content */}
        <div className="flex-1 rounded-xl shadow">
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
                    <TabsContent value="basic" className="space-y-6">
                      {/* Personal Information Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-primary dark:text-blue-400" />
                            <span className="text-primary dark:text-white"  >ព័ត៌មានផ្ទាល់ខ្លួន</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <span className="text-red-500">*</span> បង្ហាញព័ត៌មានដែលត្រូវការ (Required fields)
                            </p>
                          </div>
                          
                          {/* Personal Details - Row 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Last Name */}
                            <div className="space-y-2">
                              <Label htmlFor="last-name" className="text-sm font-medium">
                                នាមត្រកូល <span className="text-red-500">*</span>
                              </Label>
                              <Input 
                                id="last-name" 
                                value={formData.lastName} 
                                onChange={(e) => {
                                  const lastName = e.target.value;
                                  setFormData({...formData, lastName: lastName});
                                }}
                                placeholder="នាមត្រកូល" 
                                className="h-12 "
                              />
                            </div>

                            {/* First Name */}
                            <div className="space-y-2">
                              <Label htmlFor="first-name" className="text-sm font-medium">
                                នាមខ្លួន <span className="text-red-500">*</span>
                              </Label>
                              <Input 
                                id="first-name" 
                                value={formData.firstName} 
                                onChange={(e) => {
                                  const firstName = e.target.value;
                                  setFormData({...formData, firstName: firstName});
                                }}
                                placeholder="នាមខ្លួន" 
                                className="h-12 "
                              />
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                              <Label htmlFor="gender" className="text-sm font-medium">
                                ភេទ <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({...formData, gender: value})}
                              >
                                <SelectTrigger id="gender" className="h-12 ">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">ប្រុស</SelectItem>
                                  <SelectItem value="female">ស្រី</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-2">
                              <Label htmlFor="dob" className="text-sm font-medium">
                                ថ្ងៃខែឆ្នាំកំណើត <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Input 
                                  type="date" 
                                  id="dob" 
                                  value={formData.dob} 
                                  onChange={(e) => {
                                    const dob = e.target.value;
                                    console.log('Date input changed:', dob);
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
                                      console.log('Age calculated:', ageString);
                                      setFormData(prev => ({...prev, age: ageString}));
                                    }
                                  }}
                                  className="h-12 pr-10 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-background text-foreground border-input [&::-webkit-calendar-picker-indicator]:opacity-0"
                                  max={new Date().toISOString().split('T')[0]}
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Academic Information - Row 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Age */}
                            <div className="space-y-2">
                              <Label htmlFor="age" className="text-sm font-medium">អាយុ</Label>
                              <Input 
                                id="age" 
                                value={formData.age || ""}
                                readOnly
                                placeholder="អាយុ" 
                                className="h-12  bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                              />
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                              <Label htmlFor="class" className="text-sm font-medium">
                                ចូលរៀនថ្នាក់ទី <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.class}
                                onValueChange={(value) => {
                                  setFormData({...formData, class: value});
                                }}
                              >
                                <SelectTrigger id="class" className="h-12 text-center">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    { value: "1", label: "ថ្នាក់ទី ១" },
                                    { value: "2", label: "ថ្នាក់ទី ២" },
                                    { value: "3", label: "ថ្នាក់ទី ៣" },
                                    { value: "4", label: "ថ្នាក់ទី ៤" },
                                    { value: "5", label: "ថ្នាក់ទី ៥" },
                                    { value: "6", label: "ថ្នាក់ទី ៦" },
                                    { value: "7", label: "ថ្នាក់ទី ៧" },
                                    { value: "8", label: "ថ្នាក់ទី ៨" },
                                    { value: "9", label: "ថ្នាក់ទី ៩" }
                                  ].map(grade => (
                                    <SelectItem key={grade.value} value={grade.value}>
                                      {grade.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Register to Study Checkbox */}
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Checkbox 
                                id="register-to-study" 
                                checked={formData.registerToStudy}
                                onCheckedChange={(checked) => setFormData({...formData, registerToStudy: checked as boolean})}
                              />
                              <Label htmlFor="register-to-study" className="text-sm font-medium ">
                                ចុះឈ្មោះចូលរៀន?
                              </Label>
                            </div>
                            
                            {/* Student ID */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">លេខសំគាល់សិស្ស (ID)</Label>
                              <div className="h-12 flex items-center justify-center font-bold bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                            <MapPin className="h-5 w-5 text-primary dark:text-blue-400" />
                            <span className="text-primary dark:text-white" >អាសយដ្ឋាន និង ទំនាក់ទំនង</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* Address Information - Row 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* House Number */}
                            <div className="space-y-2">
                              <Label htmlFor="student-house-number" className="text-sm font-medium">ផ្ទះលេខ</Label>
                              <Input 
                                id="student-house-number" 
                                placeholder="ផ្ទះលេខ" 
                                value={formData.studentHouseNumber}
                                onChange={(e) => setFormData({...formData, studentHouseNumber: e.target.value})}
                                className="h-12 " 
                              />
                            </div>

                            {/* Village */}
                            <div className="space-y-2">
                              <Label htmlFor="student-village" className="text-sm font-medium">ភូមិ/សង្កាត់</Label>
                              <Input 
                                id="student-village" 
                                placeholder="ភូមិ/សង្កាត់" 
                                value={formData.studentVillage}
                                onChange={(e) => setFormData({...formData, studentVillage: e.target.value})}
                                className="h-12 " 
                              />
                            </div>

                            {/* District */}
                            <div className="space-y-2">
                              <Label htmlFor="student-district" className="text-sm font-medium">ស្រុក/ខណ្ឌ</Label>
                              <Input 
                                id="student-district" 
                                placeholder="ស្រុក/ខណ្ឌ" 
                                value={formData.studentDistrict}
                                onChange={(e) => setFormData({...formData, studentDistrict: e.target.value})}
                                className="h-12 " 
                              />
                            </div>

                            {/* Province */}
                            <div className="space-y-2">
                              <Label htmlFor="student-province" className="text-sm font-medium">ខេត្ត/ក្រុង</Label>
                              <Input 
                                id="student-province" 
                                placeholder="ខេត្ត/ក្រុង" 
                                value={formData.studentProvince}
                                onChange={(e) => setFormData({...formData, studentProvince: e.target.value})}
                                className="h-12 " 
                              />
                            </div>
                          </div>

                          {/* Contact Information - Row 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Birth District */}
                            <div className="space-y-2 lg:col-span-2">
                              <Label htmlFor="student-birth-district" className="text-sm font-medium">ស្រុកកំណើត</Label>
                              <Input 
                                id="student-birth-district" 
                                placeholder="ស្រុកកំណើត" 
                                value={formData.studentBirthDistrict}
                                onChange={(e) => setFormData({...formData, studentBirthDistrict: e.target.value})}
                                className="h-12 " 
                              />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-sm font-medium">លេខទូរស័ព្ទទំនាក់ទំនងគោល</Label>
                              <Input 
                                id="phone" 
                                type="tel"
                                placeholder="012 456 789" 
                                value={formData.phone}
                                onChange={(e) => {
                                  // Only allow numbers and spaces
                                  const value = e.target.value.replace(/[^0-9\s]/g, '');
                                  // Limit to 12 characters (including spaces)
                                  if (value.length <= 12) {
                                    setFormData({...formData, phone: value});
                                  }
                                }}
                                className="h-12 " 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Guardian Information Tab */}
                    <TabsContent value="guardian" className="space-y-6">
                      {guardianForms.map((formIndex) => (
                        <Card key={formIndex} className="hover:shadow-lg transition-all duration-200">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-primary dark:text-blue-400" />
                                <span>
                                  <span className="text-primary dark:text-white" >ព័ត៌មានអាណាព្យាបាល {guardianForms.length > 1 ? formIndex + 1 : ''}</span>
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
                            {/* Guardian Personal Information - Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              {/* Family's Name */}
                              <div className="space-y-2">
                                <Label htmlFor={`family-first-name-${formIndex}`} className="text-sm font-medium">នាមត្រកូល</Label>
                                <Input 
                                  id={`family-first-name-${formIndex}`} 
                                  placeholder="នាមត្រកូល" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.firstName || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], firstName: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`family-last-name-${formIndex}`} className="text-sm font-medium">នាមខ្លួន</Label>
                                <Input 
                                  id={`family-last-name-${formIndex}`} 
                                  placeholder="នាមខ្លួន" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.lastName || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], lastName: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>

                              {/* Guardian Relation */}
                              <div className="space-y-2">
                                <Label htmlFor={`guardian-relation-${formIndex}`} className="text-sm font-medium">ត្រូវជា</Label>
                                <Select
                                  value={formData.guardians[formIndex]?.relation || ''}
                                  onValueChange={(value) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], relation: value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                >
                                  <SelectTrigger id={`guardian-relation-${formIndex}`} className="h-12 ">
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
                              <div className="space-y-2">
                                <Label htmlFor={`phone-${formIndex}`} className="text-sm font-medium">លេខទូរស័ព្ទ</Label>
                                <Input 
                                  id={`phone-${formIndex}`} 
                                  type="tel"
                                  placeholder="012 456 789" 
                                  className="h-12 "
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
                            </div>

                            {/* Guardian Work & Income - Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              {/* Occupation */}
                              <div className="space-y-2">
                                <Label htmlFor={`occupation-${formIndex}`} className="text-sm font-medium">មុខរបរ</Label>
                                <Input 
                                  id={`occupation-${formIndex}`} 
                                  placeholder="មុខរបរ" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.occupation || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], occupation: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`income-${formIndex}`} className="text-sm font-medium">ប្រាក់ចំណូល</Label>
                                <div className="relative">
                                  <Input 
                                    id={`income-${formIndex}`} 
                                    type="text"
                                    placeholder="0" 
                                    className="h-12  pr-16"
                                    value={formData.guardians[formIndex]?.income ? parseInt(formData.guardians[formIndex]?.income).toLocaleString() : ''}
                                    onChange={(e) => {
                                      // Remove all non-numeric characters and commas
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      const newGuardians = [...formData.guardians];
                                      newGuardians[formIndex] = { ...newGuardians[formIndex], income: value };
                                      setFormData({ ...formData, guardians: newGuardians });
                                    }}
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500 text-sm">រៀល</span>
                                  </div>
                                </div>
                              </div>

                              {/* Children Info */}
                              <div className="space-y-2">
                                <Label htmlFor={`children-count-${formIndex}`} className="text-sm font-medium">ចំនួនកូនក្នុងបន្ទុក</Label>
                                <div className="relative">
                                  <Input 
                                    id={`children-count-${formIndex}`} 
                                    type="text" 
                                    placeholder="0" 
                                    className="h-12  pr-16"
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
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500 text-sm">នាក់</span>
                                  </div>
                                </div>
                              </div>

                              {/* Religion Checkbox */}
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <Checkbox 
                                  id={`believe-jesus-${formIndex}`}
                                  checked={formData.guardians[formIndex]?.believeJesus || false}
                                  onCheckedChange={(checked) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], believeJesus: checked as boolean };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                                <Label htmlFor={`believe-jesus-${formIndex}`} className="text-sm font-medium ">ជឿព្រះយ៉េស៊ូ?</Label>
                              </div>
                            </div>

                            {/* Guardian Address - Row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              {/* House Number */}
                              <div className="space-y-2">
                                <Label htmlFor={`house-number-${formIndex}`} className="text-sm font-medium">ផ្ទះលេខ</Label>
                                <Input 
                                  id={`house-number-${formIndex}`} 
                                  placeholder="ផ្ទះលេខ" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.houseNumber || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], houseNumber: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`village-${formIndex}`} className="text-sm font-medium">ភូមិ/សង្កាត់</Label>
                                <Input 
                                  id={`village-${formIndex}`} 
                                  placeholder="ភូមិ/សង្កាត់" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.village || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], village: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`district-${formIndex}`} className="text-sm font-medium">ស្រុក/ខណ្ឌ</Label>
                                <Input 
                                  id={`district-${formIndex}`} 
                                  placeholder="ស្រុក/ខណ្ឌ" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.district || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], district: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`province-${formIndex}`} className="text-sm font-medium">ខេត្ត/ក្រុង</Label>
                                <Input 
                                  id={`province-${formIndex}`} 
                                  placeholder="ខេត្ត/ក្រុង" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.province || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], province: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                            </div>

                            {/* Birth District & Church - Row 4 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`birth-district-${formIndex}`} className="text-sm font-medium">ស្រុកកំណើត</Label>
                                <Input 
                                  id={`birth-district-${formIndex}`} 
                                  placeholder="ស្រុកកំណើត" 
                                  className="h-12 "
                                  value={formData.guardians[formIndex]?.birthDistrict || ''}
                                  onChange={(e) => {
                                    const newGuardians = [...formData.guardians];
                                    newGuardians[formIndex] = { ...newGuardians[formIndex], birthDistrict: e.target.value };
                                    setFormData({ ...formData, guardians: newGuardians });
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2 lg:col-span-3">
                                <Label htmlFor={`church-${formIndex}`} className="text-sm font-medium">ព្រះវិហារ</Label>
                                <Input 
                                  id={`church-${formIndex}`} 
                                  placeholder="ព្រះវិហារ" 
                                  className="h-12 "
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
                        បន្ថែមអាណាព្យាបាល
                      </Button>
                    </TabsContent>

                    {/* Family Information Tab */}
                    <TabsContent value="family" className="space-y-6">
                      {/* Family Background Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Home className="h-5 w-5 text-primary dark:text-blue-400" />
                            <span className="text-primary dark:text-white" >ព័ត៌មានពីស្ថានភាពគ្រួសារសិស្ស</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* Living Situation - Row 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Living With */}
                            <div className="space-y-2">
                              <Label htmlFor="living-with" className="text-sm font-medium">នៅជាមួយអ្នកណា</Label>
                              <Input 
                                id="living-with" 
                                placeholder="នៅជាមួយអ្នកណា" 
                                className="h-12 "
                                value={formData.familyInfo.livingWith || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, livingWith: e.target.value }
                                })}
                              />
                            </div>
                            
                            {/* Own House Checkbox */}
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Checkbox 
                                id="own-house"
                                checked={formData.familyInfo.ownHouse || false}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, ownHouse: checked as boolean }
                                })}
                              />
                              <Label htmlFor="own-house" className="text-sm font-medium ">នៅផ្ទះផ្ទាល់ខ្លួន?</Label>
                            </div>

                            {/* Duration in KPC */}
                            <div className="space-y-2">
                              <Label htmlFor="duration-in-kpc" className="text-sm font-medium">រយៈពេលនៅកំពង់ចាម</Label>
                              <div className="relative">
                                <Input 
                                  id="duration-in-kpc" 
                                  type="text"
                                  placeholder="0" 
                                  className="h-12  pr-16"
                                  value={formData.familyInfo.durationInKPC || ''}
                                  onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({
                                      ...formData, 
                                      familyInfo: { ...formData.familyInfo, durationInKPC: value }
                                    });
                                  }}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-gray-500 text-sm">ឆ្នាំ</span>
                                </div>
                              </div>
                            </div>

                            {/* Living Condition */}
                            <div className="space-y-2">
                              <Label htmlFor="living-condition" className="text-sm font-medium">ជីវភាព</Label>
                              <Select
                                value={formData.familyInfo.livingCondition || ''}
                                onValueChange={(value) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, livingCondition: value }
                                })}
                              >
                                <SelectTrigger id="living-condition" className="h-12 ">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="good">ល្អ</SelectItem>
                                  <SelectItem value="medium">មធ្យម</SelectItem>
                                  <SelectItem value="poor">ខ្វះខាត</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Organization & School Info - Row 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Organization Help */}
                            <div className="space-y-2">
                              <Label htmlFor="organization-help" className="text-sm font-medium">ទទួលជំនួយពីអង្គការ</Label>
                              <Input 
                                id="organization-help" 
                                placeholder="អង្គការ" 
                                className="h-12 "
                                value={formData.familyInfo.organizationHelp || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, organizationHelp: e.target.value }
                                })}
                              />
                            </div>

                            {/* School Info */}
                            <div className="space-y-2">
                              <Label htmlFor="know-school" className="text-sm font-medium">ស្គាល់សាលាតាមរយៈ</Label>
                              <Input 
                                id="know-school" 
                                placeholder="ស្គាល់សាលាតាម" 
                                className="h-12 "
                                value={formData.familyInfo.knowSchool || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, knowSchool: e.target.value }
                                })}
                              />
                            </div>

                            {/* Religion */}
                            <div className="space-y-2">
                              <Label htmlFor="religion" className="text-sm font-medium">សាសនា</Label>
                              <Input 
                                id="religion" 
                                placeholder="សាសនា" 
                                className="h-12 "
                                value={formData.familyInfo.religion || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, religion: e.target.value }
                                })}
                              />
                            </div>

                            {/* Church Name */}
                            <div className="space-y-2">
                              <Label htmlFor="church-name" className="text-sm font-medium">ឈ្មោះព្រះវិហារ</Label>
                              <Input 
                                id="church-name" 
                                placeholder="ព្រះវិហារ" 
                                className="h-12 "
                                value={formData.familyInfo.churchName || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, churchName: e.target.value }
                                })}
                              />
                            </div>
                          </div>

                          {/* School Support - Row 3 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Can Help School */}
                            <div className="space-y-2">
                              <Label htmlFor="can-help-school" className="text-sm font-medium">លទ្ធភាពជួយសាលា</Label>
                              <Select
                                value={formData.familyInfo.canHelpSchool ? 'yes' : 'no'}
                                onValueChange={(value) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, canHelpSchool: value === 'yes' }
                                })}
                              >
                                <SelectTrigger id="can-help-school" className="h-12 ">
                                  <SelectValue placeholder="ជ្រើសរើស" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">បាទ/ចាស</SelectItem>
                                  <SelectItem value="no">ទេ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Help Amount */}
                            <div className="space-y-2">
                              <Label htmlFor="help-amount" className="text-sm font-medium">ថវិកាជួយសាលា</Label>
                              <div className="relative">
                                <Input 
                                  id="help-amount" 
                                  type="text"
                                  placeholder="0" 
                                  className="h-12  pr-16"
                                  value={formData.familyInfo.helpAmount ? parseInt(formData.familyInfo.helpAmount).toLocaleString() : ''}
                                  onChange={(e) => {
                                    // Remove all non-numeric characters and commas
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({
                                      ...formData, 
                                      familyInfo: { ...formData.familyInfo, helpAmount: value }
                                    });
                                  }}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-gray-500 text-sm">រៀល</span>
                                </div>
                              </div>
                            </div>

                            {/* Help Frequency */}
                            <div className="space-y-2">
                              <Label htmlFor="help-frequency" className="text-sm font-medium">ក្នុងមួយ</Label>
                              <Select
                                value={formData.familyInfo.helpFrequency || ''}
                                onValueChange={(value) => setFormData({
                                  ...formData, 
                                  familyInfo: { ...formData.familyInfo, helpFrequency: value }
                                })}
                              >
                                <SelectTrigger id="help-frequency" className="h-12 ">
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
                            <BookOpen className="h-5 w-5 text-primary dark:text-blue-400" />
                            <span className="text-primary dark:text-white" >ព័ត៌មានសិក្សាសម្រាប់សិស្សថ្មី</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Previous School */}
                            <div className="space-y-2">
                              <Label htmlFor="school" className="text-sm font-medium">សាលារៀនមុន</Label>
                              <Input 
                                id="school" 
                                className="h-12 "
                                value={formData.previousSchool || ''}
                                onChange={(e) => setFormData({...formData, previousSchool: e.target.value})}
                                placeholder="សាលារៀនមុន"
                              />
                            </div>
                            
                            {/* Transfer Reason */}
                            <div className="space-y-2">
                              <Label htmlFor="reason" className="text-sm font-medium">មូលហេតុផ្លាស់ប្តូរ</Label>
                              <Input 
                                id="reason" 
                                className="h-12 "
                                value={formData.transferReason || ''}
                                onChange={(e) => setFormData({...formData, transferReason: e.target.value})}
                                placeholder="មូលហេតុផ្លាស់ប្តូរ"
                              />
                            </div>
                            
                            {/* Vaccinated Checkbox */}
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Checkbox 
                                id="vaccinated"
                                checked={formData.vaccinated || false}
                                onCheckedChange={(checked) => setFormData({...formData, vaccinated: checked as boolean})}
                              />
                              <Label htmlFor="vaccinated" className="text-center text-sm font-medium  cursor-pointer">
                                សិស្សទទួលបានវ៉ាក់សាំងគ្រប់គ្រាន់ហើយនៅ?
                              </Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Additional Information Tab */}
                    <TabsContent value="additional" className="space-y-6">
                      {/* School Needs Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-primary dark:text-blue-400" />
                            <span className="text-primary dark:text-white" >តម្រូវការពីសាលា</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Clothes Need */}
                            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <Checkbox 
                                id="clothes"
                                checked={formData.needsClothes || false}
                                onCheckedChange={(checked) => setFormData({...formData, needsClothes: checked as boolean})}
                              />
                              <Label htmlFor="clothes" className="text-sm font-medium cursor-pointer flex-1">
                                កង្វះខាតសម្លៀកបំពាក់
                              </Label>
                            </div>
                            
                            {/* Materials Need */}
                            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <Checkbox 
                                id="materials"
                                checked={formData.needsMaterials || false}
                                onCheckedChange={(checked) => setFormData({...formData, needsMaterials: checked as boolean})}
                              />
                              <Label htmlFor="materials" className="text-sm font-medium cursor-pointer flex-1">
                                កង្វះខាតសម្ភារៈសិក្សា
                              </Label>
                            </div>
                            
                            {/* Transport Need */}
                            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <Checkbox 
                                id="transport"
                                checked={formData.needsTransport || false}
                                onCheckedChange={(checked) => setFormData({...formData, needsTransport: checked as boolean})}
                              />
                              <Label htmlFor="transport" className="text-sm font-medium cursor-pointer flex-1">
                                ត្រូវការឡានដើម្បីជូនមកសាលា
                              </Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Registration & Submission Card */}
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-primary dark:text-blue-400" />
                            <span className="text-primary dark:text-white" >កាលបរិច្ឆេទចុះឈ្មោះ</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">                             
                              {/* School Year */}
                              <div className="space-y-2">
                                <Label htmlFor="school-year" className="text-sm font-medium">
                                  ឆ្នាំសិក្សា
                                </Label>
                                <Select 
                                  value={formData.schoolYear} 
                                  onValueChange={(value) => setFormData(prev => ({ ...prev, schoolYear: value }))}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {schoolYears && schoolYears.length > 0 ? (
                                      schoolYears.map((year) => (
                                        <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                                          {year.schoolYearCode}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="loading" disabled>
                                        កំពុងទាញយកឆ្នាំសិក្សា...
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Registration Date */}
                              <div className="space-y-2">
                                <Label htmlFor="registration-date" className="text-sm font-medium">
                                  ថ្ងៃខែឆ្នាំចុះឈ្មោះចូលរៀន
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="registration-date"
                                    type="date"
                                    className="h-12 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    disabled
                                    value={new Date().toISOString().split('T')[0]}
                                  />
                                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            {/* PDF Generation Info */}
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start space-x-3">
                                <FileText className="h-5 w-5 text-primary dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    ព័ត៌មានដែលនឹងត្រូវបានបោះពុម្ភ
                                  </h4>
                                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>ព័ត៌មានផ្ទាល់ខ្លួនសិស្ស</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>អាស័យដ្ឋាន និងទំនាក់ទំនង</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>ព័ត៌មានអាណាព្យាបាល</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>ព័ត៌មានគ្រួសារ និងជីវភាព</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                              <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || isCompleted}
                                className={`${
                                  isCompleted 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                                    : isSubmitting
                                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                } transition-all duration-200 flex-1 sm:flex-none`}
                                title={`isSubmitting: ${isSubmitting}, isCompleted: ${isCompleted}`}
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    កំពុងរក្សាទុក...
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                                    បញ្ចាប់រួចរាល់
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isNewStudent ? 'បញ្ចប់ការចុះឈ្មោះសិស្ស' : 'រក្សាទុកការកែប្រែ'}
                                  </>
                                )}
                              </Button>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      className={`flex-1 sm:flex-none ${
                                        isGeneratingPDF 
                                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-700' 
                                          : ''
                                      }`}
                                      onClick={exportToPDF}
                                      disabled={!selectedStudent || selectedStudent.id === 'new' || isGeneratingPDF}
                                    >
                                      {isGeneratingPDF ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                          កំពុងបោះពុម្ភ...
                                        </>
                                      ) : (
                                        <>
                                          <Printer className="h-4 w-4 mr-2" />
                                          បោះពុម្ភ PDF
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>បោះពុម្ភទម្រង់ចុះឈ្មោះសិស្សជា PDF</p>
                                    <p className="text-xs text-gray-500 mt-1">រួមមានព័ត៌មានសិស្ស អាណាព្យាបាល និងគ្រួសារ</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {/* Success Message */}
                            {isCompleted && (
                              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 animate-pulse bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {isNewStudent ? 'ការចុះឈ្មោះសិស្សបានជោគជ័យ' : 'ការកែប្រែព័ត៌មានសិស្សបានជោគជ័យ'}
                                </span>
                              </div>
                            )}
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
              <CardContent className="p-12 ">
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