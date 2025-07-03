'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Users, BookOpen, Award, MessageSquare, Star, TrendingUp, Calendar, Activity, Trash2 as TrashIcon } from "lucide-react"
import { KhmerCalendar } from "@/components/calendar/khmer_calendar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  // State for announcements
  const [announcements, setAnnouncements] = useState([
    { id: "1", title: "ការប្រជុំគ្រូ", content: "មានការប្រជុំគ្រូនៅថ្ងៃសៅរ៍នេះ", date: "2023-05-15", author: "អ្នកគ្រប់គ្រង" },
    { id: "2", title: "ការប្រឡងឆមាស", content: "ការប្រឡងឆមាសនឹងចាប់ផ្តើមនៅខែក្រោយ", date: "2023-05-10", author: "អ្នកគ្រប់គ្រង" },
  ])

  // State for outstanding students
  const [outstandingStudents, setOutstandingStudents] = useState([
    { id: 1, name: "សុខ សំអាង", grade: "ថ្នាក់ទី១២ក", achievement: "ពិន្ទុខ្ពស់បំផុតក្នុងថ្នាក់", score: "A" },
    { id: 2, name: "ម៉ៅ សុធារី", grade: "ថ្នាក់ទី១១ខ", achievement: "ឈ្នះការប្រកួតអក្សរសាស្ត្រ", score: "A+" },
    { id: 3, name: "វ៉ាន់ សុផល", grade: "ថ្នាក់ទី១០គ", achievement: "សកម្មភាពស្ម័គ្រចិត្តល្អ", score: "A" },
  ])

  // Learning quality data by month
  const learningQualityData = [
    { month: 'មករា', quality: 75, averageScore: 68 },
    { month: 'កុម្ភៈ', quality: 82, averageScore: 72 },
    { month: 'មីនា', quality: 78, averageScore: 70 },
    { month: 'មេសា', quality: 85, averageScore: 75 },
    { month: 'ឧសភា', quality: 90, averageScore: 80 },
    { month: 'មិថុនា', quality: 88, averageScore: 78 },
  ]

  // Announcement form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    author: '',
    date: ''
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
      date: ''
    });
    setShowAddForm(false);
  };
  
  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  return (
    <>
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">សូមស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង</h2>
        <p className="text-muted-foreground">ទិន្នន័យសង្ខេបនិងសកម្មភាពសំខាន់ៗ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="សិស្សទាំងអស់"
          value={<span className="text-primary">1,234</span>}
          description="សិស្សកំពុងសិក្សា"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: "20.1%", isPositive: true }}
        />
        
        <StatCard
          title="គ្រូទាំងអស់"
          value={<span className="text-primary">24</span>}
          description="គ្រូបង្រៀនសកម្ម"
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <StatCard
          title="សិស្សពូកែ"
          value={<span className="text-primary">15</span>}
          description="សិស្សពូកែក្នុងខែនេះ"
          icon={<Award className="h-6 w-6" />}
        />
        
        <StatCard
          title="ដំណឹង"
          value={<span className="text-primary">{announcements.length}</span>}
          description="ដំណឹងសកម្ម"
          icon={<MessageSquare className="h-6 w-6" />}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Learning Quality Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-primary">គុណភាពការសិក្សាតាមខែ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={learningQualityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'quality') return [`${value}%`, 'គុណភាព']
                        if (name === 'averageScore') return [value, 'ពិន្ទុមធ្យម']
                        return [value, name]
                      }}
                      labelFormatter={(label) => `ខែ${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'quality') return 'គុណភាព (%)'
                        if (value === 'averageScore') return 'ពិន្ទុមធ្យម'
                        return value
                      }}
                    />
                    <Bar dataKey="quality" fill="#0082c8" name="គុណភាព" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="averageScore" fill="#00c2cb" name="ពិន្ទុមធ្យម" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                ក្រាហ្វបង្ហាញពីគុណភាពការសិក្សានិងពិន្ទុមធ្យមរបស់សិស្សតាមខែ
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Khmer Calendar */}
        <div className="lg:col-span-1">
          <KhmerCalendar compact={true} />
        </div>
      </div>
      
      {/* Announcements */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary">ដំណឹងសំខាន់ៗ</CardTitle>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'បោះបង់' : 'បន្ថែមដំណឹង'}
              </Button>
            </CardHeader>
            <CardContent>
              {/* Add Announcement Form */}
              {showAddForm && (
                <div className="mb-6 border border-border rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">ចំណងជើង*</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-border rounded-md"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                        placeholder="បញ្ចូលចំណងជើងដំណឹង"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">ខ្លឹមសារ*</label>
                      <textarea
                        className="w-full p-2 border border-border rounded-md"
                        rows={3}
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                        placeholder="បញ្ចូលខ្លឹមសារដំណឹង"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">អ្នកនិពន្ធ</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-border rounded-md"
                        value={newAnnouncement.author}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})}
                        placeholder="អ្នកផ្សព្វផ្សាយ"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddForm(false);
                          setNewAnnouncement({
                            title: '',
                            content: '',
                            author: '',
                            date: ''
                          });
                        }}
                      >
                        បោះបង់
                      </Button>
                      <Button 
                        onClick={handleAddAnnouncement}
                        disabled={!newAnnouncement.title || !newAnnouncement.content}
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
                    <div key={announcement.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors relative">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-foreground flex-1 min-w-0 break-words">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {announcement.date}
                          </span>
                          <button 
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="លុបដំណឹង"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground break-words">
                        {announcement.content}
                      </p>
                      {announcement.author && (
                        <p className="text-xs text-muted-foreground mt-2 break-words">
                          - {announcement.author}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">មិនមានដំណឹងសំខាន់ៗ</p>
                )}
              </div>
            </CardContent>
          </Card>


      {/* Outstanding Students and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outstanding Students */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-primary">សិស្សពូកែ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outstandingStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.grade}</p>
                        <p className="text-xs text-muted-foreground">{student.achievement}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {student.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-primary">សកម្មភាពថ្មីៗ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">បានបន្ថែមសិស្សថ្មី</p>
                    <p className="text-xs text-muted-foreground">២ នាទីមុន</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">បានកែប្រែពិន្ទុ</p>
                    <p className="text-xs text-muted-foreground">៥ នាទីមុន</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">បានបង្កើតថ្នាក់ថ្មី</p>
                    <p className="text-xs text-muted-foreground">១០ នាទីមុន</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      </>
  )
}