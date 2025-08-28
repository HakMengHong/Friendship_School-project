"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/ui/role-guard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, User as UserIcon, Users, Shield, UserCheck, Search, Eye, EyeOff, Upload, X, ToggleLeft, Info, Sparkles, BarChart3, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { UsersForm, UserFormData } from "./usersform";
import UsersTable, { User as UsersTableUser } from "./userstable";
interface User {
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  phonenumber1: string;
  phonenumber2?: string;
  role: string;
  avatar?: string;
  position?: string;
  photo?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  status: string; // "active", "inactive", "suspended"
  failedLoginAttempts?: number;
  lastFailedLogin?: string;
  accountLockedUntil?: string;
}

interface FormData {
  username: string;
  firstname: string;
  lastname: string;
  phonenumber1: string;
  phonenumber2?: string;
  role: string;
  position: string;
  photo: string;
  status: string; // "active", "inactive", "suspended"
  password: string;
  verifyPassword: string;
  photoFile?: File;
  photoPreview?: string;
}

const emptyFormData: FormData = {
  username: "",
  firstname: "",
  lastname: "",
  phonenumber1: "",
  phonenumber2: "",
  role: "teacher",
  position: "",
  photo: "",
  status: "active",
  password: "",
  verifyPassword: "",
  photoFile: undefined,
  photoPreview: "",
};

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminUsersContent />
    </RoleGuard>
  )
}

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [viewDetailsUser, setViewDetailsUser] = useState<User | null>(null);
  const [skipLockoutLoading, setSkipLockoutLoading] = useState<number | null>(null);
  const { toast } = useToast();
  const [optimisticStatus, setOptimisticStatus] = useState<{ userid: number; status: string } | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      console.log('🔍 Users API response:', data);
      console.log('🔍 Users data.users:', data.users);
      console.log('🔍 Users array length:', data.users?.length || 0);
      setUsers(data.users || []);
    } catch (e) {
      console.error('❌ Error fetching users:', e);
      toast({ title: "បរាជ័យ", description: "មិនអាចទាញយកទិន្នន័យបានទេ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Open add/edit dialog
  const openDialog = (user?: User) => {
    setEditUser(user || null);
    setFormDialogOpen(true);
  };

  // Handle add/edit user submit
  const handleUserFormSubmit = async (data: UserFormData, isEdit: boolean): Promise<boolean> => {
    setFormLoading(true);
    setTimeout(() => {}, 0); // allow loading state to show
    try {
      const res = await fetch(
        isEdit ? `/api/users/${editUser!.userid}` : "/api/users",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        toast({ title: "បរាជ័យ", description: result.error || "មានបញ្ហា", variant: "destructive" });
        return false;
      }
      // Refresh list on success; dialog will close from form after showing inline message
      fetchUsers();
      toast({ title: isEdit ? "កែប្រែជោគជ័យ" : "បន្ថែមជោគជ័យ", description: isEdit ? "ព័ត៌មានត្រូវបានកែប្រែ" : "អ្នកប្រើថ្មីត្រូវបានបន្ថែម" });
      return true;
    } catch (e) {
      toast({ title: "បរាជ័យ", description: "មានបញ្ហាក្នុងការផ្ញើទិន្នន័យ", variant: "destructive" });
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userid: number) => {
    setDeleteLoading(true);
    try {
              const res = await fetch(`/api/users/${userid}`, { method: "DELETE" });
      await res.json();
      setDeleteId(null);
      fetchUsers();
      toast({ title: "លុបជោគជ័យ", description: "អ្នកប្រើត្រូវបានលុប" });
    } catch (e) {
      toast({ title: "បរាជ័យ", description: "មិនអាចលុបបានទេ", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle user status (real-time update without refetch)
  const handleToggleStatus = async (user: User) => {
    setStatusLoading(user.userid);
    const isCurrentlyActive = (optimisticStatus && optimisticStatus.userid === user.userid ? optimisticStatus.status : user.status) === "active";
    const newStatus = isCurrentlyActive ? "inactive" : "active";
    
    // Optimistic update - update local state immediately
    setOptimisticStatus({ userid: user.userid, status: newStatus });
    
    // Update users array immediately for real-time UI
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.userid === user.userid 
          ? { ...u, status: newStatus }
          : u
      )
    );
    
    // Update viewDetailsUser if it's the same user
    if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
      setViewDetailsUser({ ...viewDetailsUser, status: newStatus });
    }
    
    try {
              const res = await fetch(`/api/users/${user.userid}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isCurrentlyActive }),
      });
      const result = await res.json();
      if (!res.ok) {
        // Revert optimistic update on error
        setOptimisticStatus(null);
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.userid === user.userid 
              ? { ...u, status: user.status } // Revert to original status
              : u
          )
        );
        if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
          setViewDetailsUser({ ...viewDetailsUser, status: user.status });
        }
        toast({ title: "បរាជ័យ", description: result.error || "មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ", variant: "destructive" });
        return;
      }
      
      toast({
        title: "ផ្លាស់ប្តូរជោគជ័យ",
        description: `អ្នកប្រើត្រូវបាន${!isCurrentlyActive ? "ដំណើរការ" : "បិទដំណើរការ"}`
      });
      setOptimisticStatus(null);
    } catch (e) {
      // Revert optimistic update on error
      setOptimisticStatus(null);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.userid === user.userid 
            ? { ...u, status: user.status } // Revert to original status
            : u
        )
      );
      if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
        setViewDetailsUser({ ...viewDetailsUser, status: user.status });
      }
      toast({ title: "បរាជ័យ", description: "មានបញ្ហាក្នុងការផ្លាស់ប្តូរស្ថានភាព", variant: "destructive" });
    } finally {
      setStatusLoading(null);
    }
  };

  // View user details
  const handleViewDetails = (user: User) => {
    setViewDetailsUser(user);
  };

  // Skip lockout for user
  const handleSkipLockout = async (user: User) => {
    setSkipLockoutLoading(user.userid);
    
    try {
      const res = await fetch(`/api/users/${user.userid}/skip-lockout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        toast({ 
          title: "បរាជ័យ", 
          description: result.error || "មិនអាចរំសាយការចាក់សោបានទេ", 
          variant: "destructive" 
        });
        return;
      }
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.userid === user.userid 
            ? { ...u, accountLockedUntil: undefined }
            : u
        )
      );
      
      // Update viewDetailsUser if it's the same user
      if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
        setViewDetailsUser({ ...viewDetailsUser, accountLockedUntil: undefined });
      }
      
      toast({
        title: "ជោគជ័យ",
        description: "បានរំសាយការចាក់សោគណនីដោយជោគជ័យ"
      });
      
    } catch (error) {
      toast({ 
        title: "បរាជ័យ", 
        description: "មានបញ្ហាក្នុងការរំសាយការចាក់សោ", 
        variant: "destructive" 
      });
    } finally {
      setSkipLockoutLoading(null);
    }
  };

  // Reset failed login attempts for user
  const handleResetAttempts = async (user: User) => {
    setSkipLockoutLoading(user.userid);
    
    try {
      const res = await fetch(`/api/users/${user.userid}/reset-login-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        toast({ 
          title: "បរាជ័យ", 
          description: result.error || "មិនអាចកំណត់ឡើងវិញបានទេ", 
          variant: "destructive" 
        });
        return;
      }
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.userid === user.userid 
            ? { 
                ...u, 
                failedLoginAttempts: 0,
                lastFailedLogin: undefined,
                accountLockedUntil: undefined,
                status: 'active'
              }
            : u
        )
      );
      
      // Update viewDetailsUser if it's the same user
      if (viewDetailsUser && viewDetailsUser.userid === user.userid) {
        setViewDetailsUser({ 
          ...viewDetailsUser, 
          failedLoginAttempts: 0,
          lastFailedLogin: undefined,
          accountLockedUntil: undefined,
          status: 'active'
        });
      }
      
      toast({
        title: "ជោគជ័យ",
        description: "បានកំណត់ឡើងវិញនូវការព្យាយាមចូលខុស"
      });
      
    } catch (error) {
      toast({ 
        title: "បរាជ័យ", 
        description: "មានបញ្ហាក្នុងការកំណត់ឡើងវិញ", 
        variant: "destructive" 
      });
    } finally {
      setSkipLockoutLoading(null);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(s) ||
        u.firstname.toLowerCase().includes(s) ||
        u.lastname.toLowerCase().includes(s) ||
        (u.phonenumber1 || "").includes(s) ||
        (u.role || "").toLowerCase().includes(s)
    );
  }, [users, search]);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const teacherUsers = users.filter(u => u.role === "teacher").length;
  
  // Debug logging
  console.log('🔍 Users state:', users);
  console.log('🔍 Total users:', totalUsers);
  console.log('🔍 Active users:', activeUsers);
  console.log('🔍 Admin users:', adminUsers);
  console.log('🔍 Teacher users:', teacherUsers);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 rounded-3xl -z-10" />
        <div className="text-center space-y-6 p-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Total Users Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</p>
                    <p className="text-lg text-blue-500 dark:text-blue-300 font-medium">អ្នកប្រើទាំងអស់</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Active Users Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeUsers}</p>
                    <p className="text-lg text-green-500 dark:text-green-300 font-medium">អ្នកប្រើសកម្ម</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Admin Users Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{adminUsers}</p>
                    <p className="text-lg text-purple-500 dark:text-purple-300 font-medium">អ្នកគ្រប់គ្រង</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Teacher Users Card */}
            <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{teacherUsers}</p>
                    <p className="text-lg text-orange-500 dark:text-orange-300 font-medium">គ្រូបង្រៀន</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/20 via-blue-50/20 to-gray-50/20 dark:from-gray-950/10 dark:via-blue-950/10 dark:to-gray-950/10 rounded-3xl -z-10" />
        
        <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Enhanced Header */}
          <CardHeader className="relative overflow-hidden bg-gradient-to-r from-gray-500 via-gray-600 to-blue-600 text-white p-8">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">បញ្ជីអ្នកប្រើប្រាស់</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {totalUsers} អ្នកប្រើ
                    </Badge>
                    <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="ស្វែងរក..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                    className="w-full pr-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 transition-all duration-300"
              />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
              {search && (
                <button
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
                  onClick={() => setSearch("")}
                >
                      <X className="h-4 w-4" />
                </button>
              )}
            </div>
                
                <Button 
                  onClick={() => openDialog()}
                  className="group px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  variant="ghost"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>បន្ថែមអ្នកប្រើ</span>
                  </div>
            </Button>
              </div>
          </div>
        </CardHeader>

          <CardContent className="p-8">
          <UsersTable
            users={filteredUsers}
            loading={loading}
            statusLoading={statusLoading}
            skipLockoutLoading={skipLockoutLoading}
            onEdit={openDialog}
            onViewDetails={handleViewDetails}
            onDelete={(id) => setDeleteId(id)}
            onSkipLockout={handleSkipLockout}
            onResetAttempts={handleResetAttempts}
            search={search}
            setSearch={setSearch}
          />
        </CardContent>
      </Card>
      </div>

      {/* Enhanced Add/Edit Dialog */}
      <UsersForm
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleUserFormSubmit}
        loading={formLoading}
        editUser={editUser}
      />

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-md w-full bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
          <Card className="w-full bg-transparent border-0 shadow-none">
            <CardHeader className="pb-4 border-b border-border/50 bg-background/80 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <Trash2 className="h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-wide text-red-600 dark:text-red-400">
                      លុបអ្នកប្រើ
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium">តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើនេះមែនទេ?</p>
                    <p className="text-xs mt-1 opacity-80">ព័ត៌មានទាំងអស់នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <DialogClose asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 px-6 text-sm font-semibold"
                      disabled={deleteLoading}
                    >
                      បោះបង់
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    loading={deleteLoading}
                    onClick={() => deleteId && handleDelete(deleteId)}
                    className="h-10 px-6 text-sm font-bold bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {deleteLoading ? "កំពុងលុប..." : "លុបអ្នកប្រើ"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Details Dialog */}
      <Dialog open={!!viewDetailsUser} onOpenChange={open => { if (!open) setViewDetailsUser(null); }}>
        <DialogContent className="max-w-2xl w-full bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
          <Card className="w-full bg-transparent border-0 shadow-none">
            <CardHeader className="pb-4 border-b border-border/50 bg-background/80 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Info className="h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-wide">
                      ព័ត៌មានលម្អិតអ្នកប្រើ
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      ព័ត៌មានពេញលេញពីមូលដ្ឋានទិន្នន័យ
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {viewDetailsUser && (
                <div className="space-y-6">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                    {viewDetailsUser.photo ? (
                      <img
                        src={viewDetailsUser.photo}
                        alt={viewDetailsUser.firstname}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                        onError={e => (e.currentTarget.src = "/placeholder-user.jpg")}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-xl">
                        {viewDetailsUser.firstname?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold">{viewDetailsUser.lastname} {viewDetailsUser.firstname}</h3>
                      <p className="text-sm text-muted-foreground">@{viewDetailsUser.username}</p>
                      <Badge className={`mt-1 ${viewDetailsUser.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {viewDetailsUser.status === "active" ? "ដំណើរការ" : "បិទដំណើរការ"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Status Toggle */}
                  <div className="flex items-center gap-3 mt-2 mb-4">
                    <label htmlFor="status-toggle-details" className="text-sm font-semibold flex items-center gap-2">
                      ស្ថានភាព:
                    </label>
                    <button
                      type="button"
                      id="status-toggle-details"
                      aria-pressed={((optimisticStatus && optimisticStatus.userid === viewDetailsUser.userid ? optimisticStatus.status : viewDetailsUser.status) === 'active')}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 border-2 border-transparent ${((optimisticStatus && optimisticStatus.userid === viewDetailsUser.userid ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'bg-green-500' : 'bg-gray-300'}`}
                      onClick={() => handleToggleStatus(viewDetailsUser)}
                      disabled={statusLoading === viewDetailsUser.userid}
                      tabIndex={0}
                      onKeyDown={e => {
                        if ((e.key === ' ' || e.key === 'Enter') && !statusLoading) {
                          e.preventDefault();
                          handleToggleStatus(viewDetailsUser);
                        }
                      }}
                    >
                      <span
                        className={`absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${((optimisticStatus && optimisticStatus.userid === viewDetailsUser.userid ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'translate-x-8' : 'translate-x-0'}`}
                      >
                        {((optimisticStatus && optimisticStatus.userid === viewDetailsUser.userid ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? (
                          <span className="text-green-500 text-lg font-bold">✔</span>
                        ) : (
                          <span className="text-gray-400 text-lg font-bold">✖</span>
                        )}
                      </span>
                      {statusLoading === viewDetailsUser.userid && (
                        <span className="absolute left-1/2 -translate-x-1/2 animate-spin h-5 w-5 border-b-2 border-primary"></span>
                      )}
                    </button>
                    <span className={`text-base font-bold select-none ${((optimisticStatus && optimisticStatus.userid === viewDetailsUser.userid ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'text-green-600' : 'text-red-600'}`}>
                      {((optimisticStatus && optimisticStatus.userid === viewDetailsUser.userid ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'ដំណើរការ' : 'បិទដំណើរការ'}
                    </span>
                  </div>

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">តួនាទី</label>
                        <p className="text-sm font-medium">{viewDetailsUser.role === "admin" ? "អ្នកគ្រប់គ្រង" : "គ្រូបង្រៀន"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">មុខតំណែង</label>
                        <p className="text-sm font-medium">{viewDetailsUser.position || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">លេខទូរស័ព្ទ ១</label>
                        <p className="text-sm font-medium">{viewDetailsUser.phonenumber1 || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">លេខទូរស័ព្ទ ២</label>
                        <p className="text-sm font-medium">{viewDetailsUser.phonenumber2 || "-"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">ចូលចុងក្រោយ</label>
                        <p className="text-sm font-medium">
                          {viewDetailsUser.lastLogin ? new Date(viewDetailsUser.lastLogin).toLocaleString() : "មិនទាន់ចូល"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">បង្កើតនៅថ្ងៃ</label>
                        <p className="text-sm font-medium">{new Date(viewDetailsUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">កែប្រែចុងក្រោយ</label>
                        <p className="text-sm font-medium">{new Date(viewDetailsUser.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
                    <DialogClose asChild>
                      <Button variant="outline" className="h-10 px-6 text-sm font-semibold">
                        បិទ
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={() => {
                        setViewDetailsUser(null);
                        openDialog(viewDetailsUser);
                      }}
                      className="h-10 px-6 text-sm font-bold"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      កែប្រែ
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
} 