"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"
import { useState } from "react"

export default function StudentListReportPage() {
  const [showReportModal, setShowReportModal] = useState(true)
  const [reportData, setReportData] = useState({
    academicYear: "",
    class: "",
    format: "pdf"
  })

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Generating student list report:", reportData)
    setShowReportModal(false)
    // Add your report generation logic here
  }

  return (
    <>
      {/* Main Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-primary text-2xl font-bold mb-4">របាយការណ៍បញ្ជីឈ្មោះសិស្សតាមថ្នាក់</h1>
        <p className="text-gray-600 mb-4">ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតរបាយការណ៍</p>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          បង្កើតរបាយការណ៍
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95">
            <CardHeader>
              <CardTitle className="text-center">របាយការណ៍បញ្ជីឈ្មោះសិស្សតាមថ្នាក់</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">ឆ្នាំសិក្សា</label>
                  <input
                    type="text"
                    value={reportData.academicYear}
                    onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="ឧ. 2023-2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">ថ្នាក់</label>
                  <input
                    type="text"
                    value={reportData.class}
                    onChange={(e) => setReportData({...reportData, class: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="ឧ. ថ្នាក់ទី១ក"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">ទម្រង់ឯកសារ</label>
                  <select
                    value={reportData.format}
                    onChange={(e) => setReportData({...reportData, format: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>បង្កើតរបាយការណ៍</span>
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
