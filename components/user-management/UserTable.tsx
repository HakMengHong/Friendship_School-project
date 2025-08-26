'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  User,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  Users,
  Loader2,
  Phone,
  Calendar,
  ToggleLeft,
  Info
} from "lucide-react"

interface User {
  userid: number
  username: string
  firstname: string
  lastname: string
  phonenumber1: string
  phonenumber2?: string
  role: string
  avatar?: string
  position?: string
  photo?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
  status: string // "active", "inactive", "suspended"
}

interface UserTableProps {
  users: User[]
  loading?: boolean
  statusLoading?: number | null
  onEdit: (user: User) => void
  onViewDetails: (user: User) => void
  onDelete: (userid: number) => void
  onToggleStatus: (user: User) => void
}

export function UserTable({
  users,
  loading = false,
  statusLoading = null,
  onEdit,
  onViewDetails,
  onDelete,
  onToggleStatus
}: UserTableProps) {
  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('km-KH')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'សកម្ម'
      case 'inactive':
        return 'អសកម្ម'
      case 'suspended':
        return 'ផ្អាក'
      default:
        return 'មិនដឹង'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'teacher':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'អ្នកគ្រប់គ្រង'
      case 'teacher':
        return 'គ្រូបង្រៀន'
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'teacher':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងអ្នកប្រើ
              </CardTitle>
              <p className="text-white/80 text-sm">
                User Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
              <p className="text-gray-600 dark:text-gray-400">
                កំពុងផ្ទុកព័ត៌មានអ្នកប្រើ...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងអ្នកប្រើ
              </CardTitle>
              <p className="text-white/80 text-sm">
                User Table
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              គ្មានអ្នកប្រើ
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              មិនមានអ្នកប្រើដែលត្រូវគ្នានឹងការច្រោះរបស់អ្នក
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                តារាងអ្នកប្រើ
              </CardTitle>
              <p className="text-white/80 text-sm">
                User Table - {users.length} អ្នកប្រើ
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            {users.length} អ្នកប្រើ
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="font-semibold">អ្នកប្រើ</TableHead>
                <TableHead className="font-semibold">ព័ត៌មានទំនាក់ទំនង</TableHead>
                <TableHead className="font-semibold">តួនាទី</TableHead>
                <TableHead className="font-semibold">ស្ថានភាព</TableHead>
                <TableHead className="font-semibold">កាលបរិច្ឆេទ</TableHead>
                <TableHead className="font-semibold">សកម្មភាព</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={`${user.firstname} ${user.lastname}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                        {user.position && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {user.position}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {user.phonenumber1 && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{user.phonenumber1}</span>
                        </div>
                      )}
                      {user.phonenumber2 && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-500">{user.phonenumber2}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(user.role)}>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(user.role)}
                          <span>{getRoleLabel(user.role)}</span>
                        </div>
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusLabel(user.status)}
                      </Badge>
                      <Button
                        onClick={() => onToggleStatus(user)}
                        disabled={statusLoading === user.userid}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-purple-200 hover:border-purple-500"
                      >
                        {statusLoading === user.userid ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ToggleLeft className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center space-x-1">
                          <UserCheck className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(user.lastLogin)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => onViewDetails(user)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onEdit(user)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDelete(user.userid)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ការពន្យល់ស្ថានភាព (Status Legend)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                សកម្ម
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                អសកម្ម
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                អ្នកគ្រប់គ្រង
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Admin</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                គ្រូបង្រៀន
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">Teacher</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
