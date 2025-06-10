"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, FileText } from "lucide-react"

export default function RegistrationPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ចុះឈ្មោះសិស្ស</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-[#0082c8]" />
              <span>ចុះឈ្មោះសិស្សថ្មី</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">ទម្រង់ចុះឈ្មោះសិស្សថ្មីនឹងត្រូវបានបង្ហាញនៅទីនេះ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#0082c8]" />
              <span>ឯកសារចាំបាច់</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">បញ្ជីឯកសារចាំបាច់សម្រាប់ការចុះឈ្មោះ</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
