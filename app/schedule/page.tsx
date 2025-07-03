'use client'
export const dynamic = "force-dynamic"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

export default function SchedulePage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">កាលវិភាគសិស្ស</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-[#0082c8]" />
              <span>កាលវិភាគថ្ងៃនេះ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">គណិតវិទ្យា</p>
                  <p className="text-sm text-gray-600">ថ្នាក់ទី ៧</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">៨:០០ - ៩:០០</p>
                  <p className="text-xs text-gray-500">បន្ទប់ A101</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">រូបវិទ្យា</p>
                  <p className="text-sm text-gray-600">ថ្នាក់ទី ៨</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">៩:១៥ - ១០:១៥</p>
                  <p className="text-xs text-gray-500">បន្ទប់ B202</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#0082c8]" />
              <span>កាលវិភាគសប្តាហ៍</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">កាលវិភាគសប្តាហ៍នឹងត្រូវបានបង្ហាញនៅទីនេះ</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
