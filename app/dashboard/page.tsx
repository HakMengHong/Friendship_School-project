'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { 
  Users, 
  BookOpen, 
  Award, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Trash2 as TrashIcon,
  Plus,
  Download,
  BarChart3,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  // State for announcements
  const [announcements, setAnnouncements] = useState([
    { id: "1", title: "ការប្រជុំគ្រូ", content: "មានការប្រជុំគ្រូនៅថ្ងៃសៅរ៍នេះ នៅម៉ោង ៨:០០ ព្រឹក", date: "2024-01-15", author: "អ្នកគ្រប់គ្រង", priority: "high" },
    { id: "2", title: "ការប្រឡងឆមាស", content: "ការប្រឡងឆមាសនឹងចាប់ផ្តើមនៅខែក្រោយ សូមគ្រូរៀបចំសិស្ស", date: "2024-01-10", author: "អ្នកគ្រប់គ្រង", priority: "medium" },
    { id: "3", title: "ការប្រកួតអក្សរសាស្ត្រ", content: "នឹងមានការប្រកួតអក្សរសាស្ត្រនៅថ្ងៃពុធ សូមគ្រូជ្រើសរើសសិស្ស", date: "2024-01-08", author: "អ្នកគ្រប់គ្រង", priority: "low" },
  ])

  // State for outstanding students
  const [outstandingStudents, setOutstandingStudents] = useState([
    { id: 1, name: "សុខ សំអាង", grade: "ថ្នាក់ទី១២ក", achievement: "ពិន្ទុខ្ពស់បំផុតក្នុងថ្នាក់", score: "A+", subject: "គណិតវិទ្យា" },
    { id: 2, name: "ម៉ៅ សុធារី", grade: "ថ្នាក់ទី១១ខ", achievement: "ឈ្នះការប្រកួតអក្សរសាស្ត្រ", score: "A+", subject: "ភាសាខ្មែរ" },
    { id: 3, name: "វ៉ាន់ សុផល", grade: "ថ្នាក់ទី១០គ", achievement: "សកម្មភាពស្ម័គ្រចិត្តល្អ", score: "A", subject: "វិទ្យាសាស្ត្រ" },
    { id: 4, name: "គឹម សុខា", grade: "ថ្នាក់ទី១២ខ", achievement: "ពិន្ទុល្អក្នុងគ្រប់មុខវិជ្ជា", score: "A", subject: "គ្រប់មុខវិជ្ជា" },
  ])

  // Learning quality data by month
  const learningQualityData = [
    { month: 'មករា', quality: 75, averageScore: 68, attendance: 92 },
    { month: 'កុម្ភៈ', quality: 82, averageScore: 72, attendance: 89 },
    { month: 'មីនា', quality: 78, averageScore: 70, attendance: 91 },
    { month: 'មេសា', quality: 85, averageScore: 75, attendance: 94 },
    { month: 'ឧសភា', quality: 90, averageScore: 80, attendance: 96 },
    { month: 'មិថុនា', quality: 88, averageScore: 78, attendance: 93 },
  ]

  // Attendance data for pie chart
  const attendanceData = [
    { name: 'មាន', value: 1150, color: '#10b981' },
    { name: 'អវត្តមាន', value: 45, color: '#ef4444' },
    { name: 'យឺតយ៉ាវ', value: 23, color: '#f59e0b' },
    { name: 'ច្បាប់', value: 12, color: '#3b82f6' },
  ]

  // Recent activities
  const recentActivities = [
    { id: 1, action: "បានបន្ថែមសិស្សថ្មី", time: "២ នាទីមុន", type: "add", user: "គ្រូ សុខា" },
    { id: 2, action: "បានកែប្រែពិន្ទុ", time: "៥ នាទីមុន", type: "edit", user: "គ្រូ ម៉ៅ" },
    { id: 3, action: "បានបង្កើតថ្នាក់ថ្មី", time: "១០ នាទីមុន", type: "create", user: "អ្នកគ្រប់គ្រង" },
    { id: 4, action: "បានបញ្ចូលអវត្តមាន", time: "១៥ នាទីមុន", type: "attendance", user: "គ្រូ វង្ស" },
    { id: 5, action: "បានបង្កើតដំណឹង", time: "២០ នាទីមុន", type: "announcement", user: "អ្នកគ្រប់គ្រង" },
  ]

  // Announcement form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    author: '',
    date: '',
    priority: 'medium'
  });
  
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    const announcementToAdd = {
      ...newAnnouncement,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setAnnouncements([announcementToAdd, ...announcements]);
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      author: '',
      date: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">សំខាន់</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">ធម្មតា</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">តិច</Badge>
      default:
        return <Badge>ធម្មតា</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'edit':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'create':
        return <Star className="h-4 w-4 text-purple-600" />
      case 'attendance':
        return <UserCheck className="h-4 w-4 text-orange-600" />
      case 'announcement':
        return <MessageSquare className="h-4 w-4 text-indigo-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-4 p-0">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សទាំងអស់</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <p className="text-xs text-muted-foreground">សិស្សកំពុងសិក្សា</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+20.1% ពីខែមុន</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">គ្រូទាំងអស់</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">24</div>
            <p className="text-xs text-muted-foreground">គ្រូបង្រៀនសកម្ម</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+2 នាក់ថ្មី</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">សិស្សពូកែ</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">15</div>
            <p className="text-xs text-muted-foreground">សិស្សពូកែក្នុងខែនេះ</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+3 នាក់ថ្មី</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ដំណឹង</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">ដំណឹងសកម្ម</p>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">ថ្មីៗ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Learning Quality Chart */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-lg">គុណភាពការសិក្សាតាមខែ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={learningQualityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'quality') return [`${value}%`, 'គុណភាព']
                        if (name === 'averageScore') return [value, 'ពិន្ទុមធ្យម']
                        if (name === 'attendance') return [`${value}%`, 'វត្តមាន']
                        return [value, name]
                      }}
                      labelFormatter={(label) => `ខែ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'quality') return 'គុណភាព (%)'
                        if (value === 'averageScore') return 'ពិន្ទុមធ្យម'
                        if (value === 'attendance') return 'វត្តមាន (%)'
                        return value
                      }}
                    />
                    <Bar dataKey="quality" fill="#3b82f6" name="គុណភាព" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="averageScore" fill="#10b981" name="ពិន្ទុមធ្យម" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="attendance" fill="#f59e0b" name="វត្តមាន" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Pie Chart */}
        <div className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="text-lg">វត្តមានថ្ងៃនេះ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                                             label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Khmer Calendar and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Khmer Calendar */}
        <div className="lg:col-span-1">
          <KhmerCalendar compact={true} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="text-lg">សកម្មភាពថ្មីៗ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Announcements */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-lg">ដំណឹងសំខាន់ៗ</span>
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
            {showAddForm ? (
              <>
                <XCircle className="h-4 w-4" />
                បោះបង់
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                បន្ថែមដំណឹង
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Add Announcement Form */}
          {showAddForm && (
            <div className="mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ចំណងជើង*</label>
                    <Input
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      placeholder="បញ្ចូលចំណងជើងដំណឹង"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">អ្នកនិពន្ធ</label>
                    <Input
                      value={newAnnouncement.author}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})}
                      placeholder="អ្នកផ្សព្វផ្សាយ"
                      className="h-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ខ្លឹមសារ*</label>
                  <Textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="បញ្ចូលខ្លឹមសារដំណឹង"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAnnouncement({
                        title: '',
                        content: '',
                        author: '',
                        date: '',
                        priority: 'medium'
                      });
                    }}
                  >
                    បោះបង់
                  </Button>
                  <Button 
                    onClick={handleAddAnnouncement}
                    disabled={!newAnnouncement.title || !newAnnouncement.content}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    រក្សាទុក
                  </Button>
                </div>
              </div>
            </div>
          )}
    
          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {announcement.date}</span>
                        {announcement.author && <span>👤 {announcement.author}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="លុបដំណឹង"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>មិនមានដំណឹងសំខាន់ៗ</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Students */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-lg">សិស្សពូកែ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {outstandingStudents.map((student) => (
              <div key={student.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.grade}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.achievement}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{student.subject}</span>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {student.score}
                    </Badge>
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