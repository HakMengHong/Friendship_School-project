'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX, Clock, AlertCircle, ListChecks, CalendarDays, ScrollText } from "lucide-react"
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function AbsencePage() {
  // Sample data
  const classData = [
    { name: "ថ្នាក់ទី ៧A", totalStudents: 45, present: 45, late: 2, excused: 3, unexcused: 0 },
    { name: "ថ្នាក់ទី ៨B", totalStudents: 42, present: 41, late: 5, excused: 1, unexcused: 1 },
    { name: "ថ្នាក់ទី ៩C", totalStudents: 38, present: 34, late: 3, excused: 2, unexcused: 2 }
  ]

  // Weekly absence data
  const weeklyAbsenceData = {
    labels: ['ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ'],
    datasets: [
      {
        label: 'ចំនួនអវត្តមាន',
        data: [10, 8, 5, 6, 10],
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
      }
    ]
  }

  // Monthly trend data for last 3 months
  const monthlyTrendData = {
    labels: ['មករា', 'កុម្ភៈ', 'មិនា'],
    datasets: [
      {
        label: 'អវត្តមានច្បាប់',
        data: [15, 20, 18],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        label: 'អវត្តមានឥតច្បាប់',
        data: [10, 8, 5],
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'យឺតយ៉ាវ',
        data: [30, 35, 28],
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} ដង`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return `${value} ដង`
          }
        }
      }
    }
  }

  const calculatePercentage = (present: number, total: number) => {
    return ((present / total) * 100).toFixed(1)
  }

  return (
  <div className="transition-colors duration-300">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-modern hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានថ្ងៃនេះ</CardTitle>
            <UserX className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">២៨ នាក់</div>
            <p className="text-xs text-muted-foreground">៤.៨% នៃសិស្សទាំងអស់</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">យឺតយ៉ាវ</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">១០ នាក់</div>
            <p className="text-xs text-muted-foreground">១.៧% នៃសិស្សទាំងអស់</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានច្បាប់</CardTitle>
            <ListChecks className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">៦ នាក់</div>
            <p className="text-xs text-muted-foreground">១.០% នៃសិស្សទាំងអស់</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានឥតច្បាប់</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">៣ នាក់</div>
            <p className="text-xs text-muted-foreground">០.៥% នៃសិស្សទាំងអស់</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Pattern Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានប្រចាំសប្តាហ៍</CardTitle>
            <ScrollText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="h-[full]">
            <Bar data={weeklyAbsenceData} options={chartOptions} />
          </CardContent>
        </Card>

        {/* 3-Month Trend Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អវត្តមានប្រចាំខែ</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="h-[full]">
            <Bar 
              data={monthlyTrendData} 
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: {
                    stacked: true,
                  },
                  y: {
                    ...chartOptions.scales.y,
                    stacked: true
                  }
                }
              }} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Class Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>អវត្តមានតាមថ្នាក់</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classData.map((classInfo, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  (classInfo.present / classInfo.totalStudents) > 0.9 
                    ? "bg-green-50" 
                    : (classInfo.present / classInfo.totalStudents) > 0.8 
                      ? "bg-blue-50" 
                      : "bg-rose-50"
                }`}
              >
                <div>
                  <p className="font-medium">{classInfo.name}</p>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">{classInfo.totalStudents} សិស្ស</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold">
                    {calculatePercentage(classInfo.present, classInfo.totalStudents)}%
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground dark:text-slate-500">
                    <span>យឺត: {classInfo.late}ដង</span>
                    <span>ច្បាប់: {classInfo.excused}ដង</span>
                    <span>ឥត: {classInfo.unexcused}ដង</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
