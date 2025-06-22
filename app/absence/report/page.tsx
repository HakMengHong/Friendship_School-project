"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"
import { useState } from "react"

export default function AbsenceReportPage() {
  const [showReportModal, setShowReportModal] = useState(true)
  const [reportType, setReportType] = useState("daily")
  const [reportData, setReportData] = useState({
    title: "របាយការណ៍អវត្តមានសិស្ស",
    date: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    academicYear: "",
    month: "",
    year: "",
    class: "",
    format: "pdf",
    includeDetails: true,
    includeAllClasses: false
  })

  const generateReport = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Generating absence report:", { reportType, reportData })
    // Implement report generation logic here based on reportType
  }

  return (
    <>
      {/* Main content can show report history or instructions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">របាយការណ៍អវត្តមាន</h1>
        <p className="text-gray-600 mb-4">ជ្រើសរើសជម្រើសរបាយការណ៍ខាងក្រោម</p>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          បង្កើតរបាយការណ៍
        </button>
      </div>

      {/* Report Modal - matches your absence form style */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>បង្កើតរបាយការណ៍អវត្តមាន</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={generateReport}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ជ្រើសរើសរបាយការណ៍</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="daily">របាយការណ៍អវត្តមានសិស្សប្រចាំថ្ងៃ</option>
                      <option value="monthly">របាយការណ៍អវត្តមានសិស្សប្រចាំខែ</option>
                      <option value="yearly">របាយការណ៍អវត្តមានសិស្សប្រចាំឆ្នាំ</option>
                    </select>
                  </div>

                  {/* Daily Report Fields */}
                  {reportType === "daily" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃចាប់ផ្តើម</label>
                        <input
                          type="date"
                          value={reportData.startDate}
                          onChange={(e) => setReportData({...reportData, startDate: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃបញ្ចប់</label>
                        <input
                          type="date"
                          value={reportData.endDate}
                          onChange={(e) => setReportData({...reportData, endDate: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Monthly Report Fields */}
                  {reportType === "monthly" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ឆ្នាំសិក្សា</label>
                        <input
                          type="text"
                          value={reportData.academicYear}
                          onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="ឧ. 2023-2024"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ខែ</label>
                        <select
                          value={reportData.month}
                          onChange={(e) => setReportData({...reportData, month: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">ជ្រើសរើសខែ</option>
                          <option value="1">មករា</option>
                          <option value="2">កុម្ភៈ</option>
                          <option value="3">មីនា</option>
                          <option value="4">មេសា</option>
                          <option value="5">ឧសភា</option>
                          <option value="6">មិថុនា</option>
                          <option value="7">កក្កដា</option>
                          <option value="8">សីហា</option>
                          <option value="9">កញ្ញា</option>
                          <option value="10">តុលា</option>
                          <option value="11">វិច្ឆិកា</option>
                          <option value="12">ធ្នូ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ឆ្នាំ</label>
                        <input
                          type="number"
                          value={reportData.year}
                          onChange={(e) => setReportData({...reportData, year: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="ឧ. 2024"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ថ្នាក់</label>
                        <input
                          type="text"
                          value={reportData.class}
                          onChange={(e) => setReportData({...reportData, class: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="ឧ. ថ្នាក់ទី១ក"
                        />
                      </div>
                    </div>
                  )}

                  {/* Yearly Report Fields */}
                  {reportType === "yearly" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ឆ្នាំសិក្សា</label>
                        <input
                          type="text"
                          value={reportData.academicYear}
                          onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="ឧ. 2023-2024"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ថ្នាក់</label>
                        <input
                          type="text"
                          value={reportData.class}
                          onChange={(e) => setReportData({...reportData, class: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="ឧ. ថ្នាក់ទី១ក"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ទម្រង់ឯកសារ</label>
                      <select
                        value={reportData.format}
                        onChange={(e) => setReportData({...reportData, format: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      បង្កើតរបាយការណ៍
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
