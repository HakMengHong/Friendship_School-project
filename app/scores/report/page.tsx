"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"
import { useState } from "react"

export default function ScoreReportPage() {
  const [showReportModal, setShowReportModal] = useState(true)
  const [reportType, setReportType] = useState("monthly")
  const [reportData, setReportData] = useState({
    academicYear: "",
    month: "",
    year: "",
    semester: "",
    class: "",
    sortByRank: false,
    format: "pdf",
    includeDetails: true,
    includeAllClasses: false
  })

  const generateReport = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Generating score report:", { reportType, reportData })
    // Implement report generation logic here based on reportType
  }

  return (
    <>
      {/* Main content can show report history or instructions */}
      <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow">
        <h1 className="text-primary text-2xl font-bold mb-4">របាយការណ៍ពិន្ទុ</h1>
        <p className="text-muted-foreground dark:text-slate-400 mb-4">ជ្រើសរើសជម្រើសរបាយការណ៍ខាងក្រោម</p>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          បង្កើតរបាយការណ៍
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-primary">បង្កើតរបាយការណ៍ពិន្ទុ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={generateReport}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ជ្រើសរើសរបាយការណ៍</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
                      required
                    >
                      <option value="monthly">របាយការណ៍ពិន្ទុប្រចាំខែ</option>
                      <option value="semester">របាយការណ៍ពិន្ទុប្រចាំឆមាស</option>
                      <option value="yearly">របាយការណ៍ពិន្ទុប្រចាំឆ្នាំ</option>
                    </select>
                  </div>

                  {/* Common field for all report types */}
                  <div>
                    <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ឆ្នាំសិក្សា</label>
                    <input
                      type="text"
                      value={reportData.academicYear}
                      onChange={(e) => setReportData({...reportData, academicYear: e.target.value})}
                      className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
                      placeholder="ឧ. 2023-2024"
                      required
                    />
                  </div>

                  {/* Monthly Report Fields */}
                  {reportType === "monthly" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ខែ</label>
                        <select
                          value={reportData.month}
                          onChange={(e) => setReportData({...reportData, month: e.target.value})}
                          className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
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
                        <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ឆ្នាំ</label>
                        <input
                          type="number"
                          value={reportData.year}
                          onChange={(e) => setReportData({...reportData, year: e.target.value})}
                          className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
                          placeholder="ឧ. 2024"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Semester Report Fields */}
                  {reportType === "semester" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ឆមាស</label>
                      <select
                        value={reportData.semester}
                        onChange={(e) => setReportData({...reportData, semester: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
                        required
                      >
                        <option value="">ជ្រើសរើសឆមាស</option>
                        <option value="1">ឆមាសទី១</option>
                        <option value="2">ឆមាសទី២</option>
                      </select>
                    </div>
                  )}

                  {/* Class field (common for all except when includeAllClasses is checked) */}
                  {!reportData.includeAllClasses && (
                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ថ្នាក់</label>
                      <input
                        type="text"
                        value={reportData.class}
                        onChange={(e) => setReportData({...reportData, class: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
                        placeholder="ឧ. ថ្នាក់ទី១ក"
                        required={!reportData.includeAllClasses}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-1">ទម្រង់ឯកសារ</label>
                      <select
                        value={reportData.format}
                        onChange={(e) => setReportData({...reportData, format: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary dark:bg-slate-800 dark:text-slate-10"
                        required
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground dark:text-slate-200 mb-2">ជម្រើស</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={reportData.sortByRank}
                          onChange={(e) => setReportData({...reportData, sortByRank: e.target.checked})}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>រៀបចំតាមចំណាត់ថ្នាក់</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={reportData.includeDetails}
                          onChange={(e) => setReportData({...reportData, includeDetails: e.target.checked})}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>រួមបញ្ចូលព័ត៌មានលម្អិត</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={reportData.includeAllClasses}
                          onChange={(e) => setReportData({...reportData, includeAllClasses: e.target.checked})}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>រួមបញ្ចូលគ្រប់ថ្នាក់</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 border rounded-md text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-700"
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
