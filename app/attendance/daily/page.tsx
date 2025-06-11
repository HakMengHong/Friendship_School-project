"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, UserX, Clock } from "lucide-react"

export default function DailyAttendancePage() {
  const students = [
    { id: 1, name: "សុខ ចន្ទា", status: "present", time: "៧:៣០" },
    { id: 2, name: "ម៉ម សុភា", status: "present", time: "៧:៤៥" },
    { id: 3, name: "ចាន់ ដារា", status: "absent", time: "-" },
    { id: 4, name: "ហេង វិចិត្រ", status: "late", time: "៨:១៥" },
    { id: 5, name: "ពេជ្រ ម៉ានី", status: "present", time: "៧:២០" },
  ]

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">វត្តមានប្រចាំថ្ងៃ</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <span>វត្តមាន</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">៤២</div>
            <p className="text-sm text-gray-600">សិស្ស</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-red-600" />
              <span>អវត្តមាន</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">៣</div>
            <p className="text-sm text-gray-600">សិស្ស</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span>យឺត</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">១</div>
            <p className="text-sm text-gray-600">សិស្ស</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>បញ្ជីវត្តមានថ្ងៃនេះ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      student.status === "present"
                        ? "bg-green-500"
                        : student.status === "absent"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }`}
                  />
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{student.time}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === "present"
                        ? "bg-green-100 text-green-800"
                        : student.status === "absent"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {student.status === "present" ? "វត្តមាន" : student.status === "absent" ? "អវត្តមាន" : "យឺត"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
