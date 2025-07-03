'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, TrendingUp, Award, Target, Medal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ScoresPage() {
  return (
    <>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-[#0082c8]" />
              <span>ពិន្ទុមធ្យម</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">85.2</div>
            <p className="text-sm text-gray-600">ពិន្ទុមធ្យមទូទៅ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[#0082c8]" />
              <span>ការកែលម្អ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+5.3%</div>
            <p className="text-sm text-gray-600">ពីខែមុន</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-[#0082c8]" />
              <span>សិស្សល្អបំផុត</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">សុខ ចន្ទា</div>
            <p className="text-sm text-gray-600">ពិន្ទុ: 98.5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="h-5 w-5 text-[#0082c8]" />
              <span>ចំណាត់ថ្នាក់</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#3</div>
            <p className="text-sm text-gray-600">ក្នុងចំណោមសិស្ស 45 នាក់</p>
            <div className="mt-2 text-sm">
              <span className="font-medium">ការវាយតម្លៃ:</span> ល្អណាស់
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>ពិន្ទុតាមមុខវិជ្ជា</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Bar Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ការបែងចែកពិន្ទុ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Pie Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-[#0082c8]" />
            <span>ការតាមដានគោលដៅ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>គោលដៅពិន្ទុមធ្យម</span>
                <span>85.2/90</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(85.2/90)*100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>គោលដៅភាសាអង់គ្លេស</span>
                <span>88/95</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${(88/95)*100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>គោលដៅគណិតវិទ្យា</span>
                <span>92/95</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${(92/95)*100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scores and Semester Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ពិន្ទុថ្មីៗ</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>មុខវិជ្ជា</TableHead>
                  <TableHead>ពិន្ទុ</TableHead>
                  <TableHead>កាលបរិច្ឆេទ</TableHead>
                  <TableHead>ស្ថានភាព</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { subject: "គណិតវិទ្យា", score: 92, date: "2023-11-15", status: "ល្អណាស់" },
                  { subject: "ភាសាអង់គ្លេស", score: 88, date: "2023-11-10", status: "ល្អ" },
                  { subject: "រូបវិទ្យា", score: 85, date: "2023-11-08", status: "មធ្យម" },
                  { subject: "ភាសាខ្មែរ", score: 90, date: "2023-11-05", status: "ល្អណាស់" },
                  { subject: "គីមីវិទ្យា", score: 87, date: "2023-11-03", status: "ល្អ" },
                ].map((item) => (
                  <TableRow key={item.subject}>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.score}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "ល្អណាស់" 
                          ? "bg-green-100 text-green-800" 
                          : item.status === "ល្អ" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ការប្រៀបធៀបពាក់កណ្តាលឆ្នាំ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-full flex flex-col justify-center">
              <div className="flex justify-around text-center mb-6">
                <div>
                  <div className="text-sm text-gray-500">ពាក់កណ្តាលឆ្នាំទី១</div>
                  <div className="text-2xl font-bold">82.4</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ពាក់កណ្តាលឆ្នាំទី២</div>
                  <div className="text-2xl font-bold text-blue-600">85.2</div>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Comparison Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
