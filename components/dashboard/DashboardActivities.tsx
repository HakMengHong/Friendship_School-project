'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare,
  Star,
  Activity,
  Plus,
  Trash2,
  UserPlus,
  Edit,
  Calendar,
  Clock,
  User,
  Award,
  BookOpen,
  CheckCircle
} from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  priority: 'high' | 'medium' | 'low'
}

interface OutstandingStudent {
  id: number
  name: string
  grade: string
  achievement: string
  score: string
  subject: string
}

interface RecentActivity {
  id: number
  action: string
  time: string
  type: 'add' | 'edit' | 'create' | 'attendance' | 'announcement'
  user: string
}

interface DashboardActivitiesProps {
  announcements: Announcement[]
  outstandingStudents: OutstandingStudent[]
  recentActivities: RecentActivity[]
  showAddForm: boolean
  newAnnouncement: {
    title: string
    content: string
    author: string
    date: string
    priority: 'high' | 'medium' | 'low'
  }
  onShowAddForm: (show: boolean) => void
  onNewAnnouncementChange: (field: string, value: string) => void
  onAddAnnouncement: () => void
  onDeleteAnnouncement: (id: string) => void
}

export function DashboardActivities({
  announcements,
  outstandingStudents,
  recentActivities,
  showAddForm,
  newAnnouncement,
  onShowAddForm,
  onNewAnnouncementChange,
  onAddAnnouncement,
  onDeleteAnnouncement
}: DashboardActivitiesProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'ខ្ពស់'
      case 'medium':
        return 'មធ្យម'
      case 'low':
        return 'ទាប'
      default:
        return priority
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'create':
        return <BookOpen className="h-4 w-4 text-purple-600" />
      case 'attendance':
        return <CheckCircle className="h-4 w-4 text-orange-600" />
      case 'announcement':
        return <MessageSquare className="h-4 w-4 text-indigo-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Announcements Section */}
      <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">ដំណឹង</CardTitle>
                <p className="text-indigo-100 text-sm">Announcements</p>
              </div>
            </div>
            <Button
              onClick={() => onShowAddForm(!showAddForm)}
              variant="secondary"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              បន្ថែមដំណឹង
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Add Announcement Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                បន្ថែមដំណឹងថ្មី
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ចំណងជើង
                  </label>
                  <Input
                    value={newAnnouncement.title}
                    onChange={(e) => onNewAnnouncementChange('title', e.target.value)}
                    placeholder="បញ្ចូលចំណងជើងដំណឹង"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    មាតិកា
                  </label>
                  <Textarea
                    value={newAnnouncement.content}
                    onChange={(e) => onNewAnnouncementChange('content', e.target.value)}
                    placeholder="បញ្ចូលមាតិកាដំណឹង"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      អ្នកនិពន្ធ
                    </label>
                    <Input
                      value={newAnnouncement.author}
                      onChange={(e) => onNewAnnouncementChange('author', e.target.value)}
                      placeholder="ឈ្មោះអ្នកនិពន្ធ"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      អាទិភាព
                    </label>
                    <Select
                      value={newAnnouncement.priority}
                      onValueChange={(value) => onNewAnnouncementChange('priority', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="ជ្រើសរើសអាទិភាព" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">ខ្ពស់</SelectItem>
                        <SelectItem value="medium">មធ្យម</SelectItem>
                        <SelectItem value="low">ទាប</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={onAddAnnouncement} className="bg-indigo-600 hover:bg-indigo-700">
                    បន្ថែមដំណឹង
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onShowAddForm(false)}
                  >
                    បោះបង់
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {announcement.title}
                      </h4>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {getPriorityLabel(announcement.priority)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{announcement.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{announcement.date}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Students and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Students */}
        <Card className="border-2 border-yellow-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">សិស្សល្អ</CardTitle>
                <p className="text-yellow-100 text-sm">Outstanding Students</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {outstandingStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {student.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.grade}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {student.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {student.achievement}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    មុខវិជ្ជា: {student.subject}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">សកម្មភាពថ្មីៗ</CardTitle>
                <p className="text-green-100 text-sm">Recent Activities</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        <span>{activity.user}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
