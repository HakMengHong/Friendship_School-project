"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, User as UserIcon, Users, Shield, UserCheck, Search, Eye, EyeOff, Upload, X, ToggleLeft, Info } from "lucide-react";
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
  const { toast } = useToast();
  const [optimisticStatus, setOptimisticStatus] = useState<{ userid: number; status: string } | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
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
  const handleUserFormSubmit = async (data: UserFormData, isEdit: boolean) => {
    setFormLoading(true);
    setTimeout(() => {}, 0); // allow loading state to show
    try {
      const res = await fetch(
        isEdit ? `/api/admin/users/${editUser!.userid}` : "/api/admin/users",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        toast({ title: "បរាជ័យ", description: result.error || "មានបញ្ហា", variant: "destructive" });
        return;
      }
      setFormDialogOpen(false);
      fetchUsers();
      toast({ title: isEdit ? "កែប្រែជោគជ័យ" : "បន្ថែមជោគជ័យ", description: isEdit ? "ព័ត៌មានត្រូវបានកែប្រែ" : "អ្នកប្រើថ្មីត្រូវបានបន្ថែម" });
    } catch (e) {
      toast({ title: "បរាជ័យ", description: "មានបញ្ហាក្នុងការផ្ញើទិន្នន័យ", variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userid: number) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userid}`, { method: "DELETE" });
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
      const res = await fetch(`/api/admin/users/${user.userid}/status`, {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អ្នកប្រើទាំងអស់</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">អ្នកប្រើប្រាស់សរុប</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អ្នកប្រើសកម្ម</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">អ្នកប្រើប្រាស់សកម្ម</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">អ្នកគ្រប់គ្រង</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">អ្នកគ្រប់គ្រងប្រព័ន្ធ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">គ្រូបង្រៀន</CardTitle>
            <UserIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{teacherUsers}</div>
            <p className="text-xs text-muted-foreground">គ្រូបង្រៀនសកម្ម</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Card */}
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-lg">បញ្ជីអ្នកប្រើប្រាស់</span>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="ស្វែងរក..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="w-full pr-10"
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </div>
            <Button onClick={() => openDialog()} variant="gradient" size="sm" className="whitespace-nowrap">
              <Plus className="mr-2" /> បន្ថែមអ្នកប្រើ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={filteredUsers}
            loading={loading}
            statusLoading={statusLoading}
            onEdit={openDialog}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            search={search}
            setSearch={setSearch}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <UsersForm
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleUserFormSubmit}
        loading={formLoading}
        editUser={editUser}
      />

      {/* Delete Confirmation Dialog */}
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
                      className="h-10 px-6 text-sm font-semibold hover:bg-muted/50 border-border/50"
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

      {/* View Details Dialog */}
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