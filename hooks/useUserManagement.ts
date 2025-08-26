import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'

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

interface FormData {
  username: string
  firstname: string
  lastname: string
  phonenumber1: string
  phonenumber2?: string
  role: string
  position: string
  photo: string
  status: string // "active", "inactive", "suspended"
  password: string
  verifyPassword: string
  photoFile?: File
  photoPreview?: string
}

export function useUserManagement() {
  const { toast } = useToast()
  
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusLoading, setStatusLoading] = useState<number | null>(null)
  const [viewDetailsUser, setViewDetailsUser] = useState<User | null>(null)
  const [optimisticStatus, setOptimisticStatus] = useState<{ userid: number; status: string } | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      console.log('🔍 Users API response:', data)
      console.log('🔍 Users data.users:', data.users)
      console.log('🔍 Users array length:', data.users?.length || 0)
      setUsers(data.users || [])
    } catch (e) {
      console.error('❌ Error fetching users:', e)
      toast({ 
        title: "បរាជ័យ", 
        description: "មិនអាចទាញយកទិន្នន័យបានទេ", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize data
  useEffect(() => {
    fetchUsers()
  }, [])

  // Open add/edit dialog
  const openDialog = (user?: User) => {
    setEditUser(user || null)
    setFormDialogOpen(true)
  }

  // Handle add/edit user submit
  const handleUserFormSubmit = async (data: any, isEdit: boolean): Promise<boolean> => {
    setFormLoading(true)
    setTimeout(() => {}, 0) // allow loading state to show
    try {
      // Prepare the data for API
      const userData = {
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        phonenumber1: data.phonenumber1,
        phonenumber2: data.phonenumber2 || null,
        role: data.role,
        position: data.position || null,
        photo: data.photo || null,
        status: data.status,
        password: data.password // Only for new users
      }

      const res = await fetch(
        isEdit ? `/api/users/${editUser!.userid}` : "/api/users",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      )
      const result = await res.json()
      if (!res.ok) {
        toast({ 
          title: "បរាជ័យ", 
          description: result.error || "មានបញ្ហា", 
          variant: "destructive" 
        })
        return false
      }
      // Refresh list on success; dialog will close from form after showing inline message
      fetchUsers()
      toast({ 
        title: isEdit ? "កែប្រែជោគជ័យ" : "បន្ថែមជោគជ័យ", 
        description: isEdit ? "ព័ត៌មានត្រូវបានកែប្រែ" : "អ្នកប្រើថ្មីត្រូវបានបន្ថែម" 
      })
      return true
    } catch (e) {
      toast({ 
        title: "បរាជ័យ", 
        description: "មានបញ្ហាក្នុងការផ្ញើទិន្នន័យ", 
        variant: "destructive" 
      })
      return false
    } finally {
      setFormLoading(false)
    }
  }

  // Delete user
  const handleDelete = async (userid: number) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${userid}`, { method: "DELETE" })
      await res.json()
      setDeleteId(null)
      fetchUsers()
      toast({ 
        title: "លុបជោគជ័យ", 
        description: "អ្នកប្រើត្រូវបានលុប" 
      })
    } catch (e) {
      toast({ 
        title: "បរាជ័យ", 
        description: "មិនអាចលុបបានទេ", 
        variant: "destructive" 
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Toggle user status (real-time update without refetch)
  const handleToggleStatus = async (user: User) => {
    setStatusLoading(user.userid)
    const isCurrentlyActive = (optimisticStatus && optimisticStatus.userid === user.userid ? optimisticStatus.status : user.status) === "active"
    const newStatus = isCurrentlyActive ? "inactive" : "active"
    
    // Optimistic update - update local state immediately
    setOptimisticStatus({ userid: user.userid, status: newStatus })
    
    // Update users array immediately for real-time UI
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.userid === user.userid 
          ? { ...u, status: newStatus }
          : u
      )
    )
    
    // Update viewDetailsUser if it's the same user
    if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
      setViewDetailsUser({ ...viewDetailsUser, status: newStatus })
    }
    
    try {
      const res = await fetch(`/api/users/${user.userid}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isCurrentlyActive }),
      })
      const result = await res.json()
      if (!res.ok) {
        // Revert optimistic update on error
        setOptimisticStatus(null)
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.userid === user.userid 
              ? { ...u, status: user.status } // Revert to original status
              : u
          )
        )
        if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
          setViewDetailsUser({ ...viewDetailsUser, status: user.status })
        }
        toast({ 
          title: "បរាជ័យ", 
          description: result.error || "មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ", 
          variant: "destructive" 
        })
        return
      }
      
      toast({
        title: "ផ្លាស់ប្តូរជោគជ័យ",
        description: `អ្នកប្រើត្រូវបាន${!isCurrentlyActive ? "ដំណើរការ" : "បិទដំណើរការ"}`
      })
      setOptimisticStatus(null)
    } catch (e) {
      // Revert optimistic update on error
      setOptimisticStatus(null)
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.userid === user.userid 
            ? { ...u, status: user.status } // Revert to original status
            : u
        )
      )
      if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
        setViewDetailsUser({ ...viewDetailsUser, status: user.status })
      }
      toast({ 
        title: "បរាជ័យ", 
        description: "មានបញ្ហាក្នុងការផ្លាស់ប្តូរស្ថានភាព", 
        variant: "destructive" 
      })
    } finally {
      setStatusLoading(null)
    }
  }

  // View user details
  const handleViewDetails = (user: User) => {
    setViewDetailsUser(user)
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!search) return users
    const s = search.toLowerCase()
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(s) ||
        u.firstname.toLowerCase().includes(s) ||
        u.lastname.toLowerCase().includes(s) ||
        (u.phonenumber1 || "").includes(s) ||
        (u.role || "").toLowerCase().includes(s)
    )
  }, [users, search])

  // Statistics
  const userStats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === "active").length
    const adminUsers = users.filter(u => u.role === "admin").length
    const teacherUsers = users.filter(u => u.role === "teacher").length

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      teacherUsers,
      inactiveUsers: totalUsers - activeUsers
    }
  }, [users])

  // Role distribution
  const roleDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {}
    users.forEach(user => {
      distribution[user.role] = (distribution[user.role] || 0) + 1
    })
    return distribution
  }, [users])

  // Status distribution
  const statusDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {}
    users.forEach(user => {
      distribution[user.status] = (distribution[user.status] || 0) + 1
    })
    return distribution
  }, [users])

  return {
    // State
    users: filteredUsers,
    loading,
    formDialogOpen,
    formLoading,
    editUser,
    deleteId,
    deleteLoading,
    search,
    statusLoading,
    viewDetailsUser,
    optimisticStatus,
    
    // Computed values
    userStats,
    roleDistribution,
    statusDistribution,
    
    // Actions
    setFormDialogOpen,
    setDeleteId,
    setSearch,
    setViewDetailsUser,
    
    // Functions
    fetchUsers,
    openDialog,
    handleUserFormSubmit,
    handleDelete,
    handleToggleStatus,
    handleViewDetails
  }
}
