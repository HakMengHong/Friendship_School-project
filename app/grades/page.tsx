'use client'
export const dynamic = "force-dynamic"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, TrendingUp, Users, BookOpen } from "lucide-react"

export default function GradesPage() {
  const gradeData = [
    { subject: "គណិតវិទ្យា", average: 85.5, highest: 98, lowest: 65, students: 45 },
    { subject: "រូបវិទ្យា", average: 82.3, highest: 95, lowest: 58, students: 38 },
    { subject: "គីមីវិទ្យា", average: 88.1, highest: 99, lowest: 72, students: 42 },
    { subject: "ជីវវិទ្យា", average: 86.7, highest: 96, lowest: 68, students: 40 },
    { subject: "ភាសាខ្មែរ", average: 89.2, highest: 97, lowest: 75, students: 50 },
    { subject: "ភាសាអង់គ្លេស", average: 84.8, highest: 94, lowest: 62, students: 48 },
  ]

  const topStudents = [
    { name: "សុខ ចន្ទា", grade: 98.5, class: "ថ្នាក់ទី ១២A" },
    { name: "ម៉ម សុភា", grade: 97.8, class: "ថ្នាក់ទី ១២B" },
    { name: "ចាន់ ដារា", grade: 96.2, class: "ថ្នាក់ទី ១២A" },
    { name: "ហេង វិចិត្រ", grade: 95.7, class: "ថ្នាក់ទី ១២C" },
    { name: "ពេជ្រ ម៉ានី", grade: 94.9, class: "ថ្នាក់ទី ១២B" },
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">ពិន្ទុសិស្ស</h2>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option>ឆមាសទី ១</option>
            <option>ឆមាសទី ២</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option>ឆ្នាំសិក្សា ២០២៤</option>
            <option>ឆ្នាំសិក្សា ២០២៣</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ពិន្ទុមធ្យមទូទៅ</CardTitle>
            <Award className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">86.1</div>
            <p className="text-xs text-muted-foreground">+2.3% ពីឆមាសមុន</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ពិន្ទុខ្ពស់បំផុត</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5</div>
            <p className="text-xs text-muted-foreground">សុខ ចន្ទា</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សប្រលង</CardTitle>
            <Users className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">263</div>
            <p className="text-xs text-muted-foreground">សិស្សទាំងអស់</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អត្រាជាប់</CardTitle>
            <BookOpen className="h-4 w-4 text-[#0082c8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.3%</div>
            <p className="text-xs text-muted-foreground">248/263 សិស្ស</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Grades */}
        <Card>
          <CardHeader>
            <CardTitle>ពិន្ទុតាមមុខវិជ្ជា</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeData.map((subject, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{subject.subject}</h3>
                    <span className="text-lg font-bold text-blue-600">{subject.average}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="block text-xs">ខ្ពស់បំផុត</span>
                      <span className="font-medium text-green-600">{subject.highest}</span>
                    </div>
                    <div>
                      <span className="block text-xs">ទាបបំផុត</span>
                      <span className="font-medium text-red-600">{subject.lowest}</span>
                    </div>
                    <div>
                      <span className="block text-xs">សិស្ស</span>
                      <span className="font-medium">{subject.students} នាក់</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle>សិស្សល្អបំផុត</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                            ? "bg-gray-400"
                            : index === 2
                              ? "bg-orange-500"
                              : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{student.grade}</p>
                    <p className="text-xs text-gray-500">ពិន្ទុ</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
