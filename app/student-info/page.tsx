"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users } from "lucide-react"

export default function StudentInfoPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ព័ត៌មានសិស្ស</h2>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#0082c8]" />
              <span>បញ្ជីសិស្ស</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">បញ្ជីសិស្សទាំងអស់នឹងត្រូវបានបង្ហាញនៅទីនេះ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-[#0082c8]" />
              <span>ព័ត៌មានលម្អិត</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">ព័ត៌មានលម្អិតរបស់សិស្សនឹងត្រូវបានបង្ហាញនៅទីនេះ</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
