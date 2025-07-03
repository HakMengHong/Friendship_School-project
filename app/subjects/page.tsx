'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Clock, Award } from "lucide-react"

export default function SubjectsPage() {
  const subjects = [
    { name: "គណិតវិទ្យា", students: 45, duration: "60 នាទី", teacher: "លោកគ្រូ ស៊ុន សុខា" },
    { name: "រូបវិទ្យា", students: 38, duration: "60 នាទី", teacher: "លោកគ្រូ ចាន់ ដារា" },
    { name: "គីមីវិទ្យា", students: 42, duration: "60 នាទី", teacher: "លោកស្រី ម៉ម សុភា" },
    { name: "ជីវវិទ្យា", students: 40, duration: "60 នាទី", teacher: "លោកគ្រូ ហេង វិចិត្រ" },
    { name: "ភាសាខ្មែរ", students: 50, duration: "45 នាទី", teacher: "លោកស្រី ពេជ្រ ចន្ទា" },
    { name: "ភាសាអង់គ្លេស", students: 48, duration: "45 នាទី", teacher: "លោកគ្រូ ជន ម៉ានី" },
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">មុខវិជ្ជាទាំងអស់</h2>
        <div className="flex space-x-2">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {subjects.length} មុខវិជ្ជា
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">មុខវិជ្ជាទាំងអស់</CardTitle>
            <BookOpen className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">មុខវិជ្ជាសកម្ម</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សសរុប</CardTitle>
            <Users className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.reduce((total, subject) => total + subject.students, 0)}</div>
            <p className="text-xs text-muted-foreground">សិស្សចុះឈ្មោះ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">មធ្យមភាគ</CardTitle>
            <Clock className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">55</div>
            <p className="text-xs text-muted-foreground">នាទី/មេរៀន</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">គ្រូបង្រៀន</CardTitle>
            <Award className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">គ្រូសកម្ម</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-[#0082c8]" />
                <span>{subject.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">គ្រូបង្រៀន:</span>
                <span className="text-sm font-medium">{subject.teacher}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">សិស្ស:</span>
                <span className="text-sm font-medium">{subject.students} នាក់</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">រយៈពេល:</span>
                <span className="text-sm font-medium">{subject.duration}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">ស្ថានភាព</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">សកម្ម</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
