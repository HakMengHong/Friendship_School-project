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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, User as UserIcon, Users, Shield, UserCheck, Search, Eye, EyeOff, Upload, X, ToggleLeft, Info, Sparkles, BarChart3, Activity, BookOpen, Camera, Phone, AtSign, Mail, Lock, Save, Check, ChevronDown, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
// Removed separate component imports - now consolidated
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

// Form data interface
export interface UserFormData {
  firstname: string;
  lastname: string;
  phonenumber1: string;
  phonenumber2: string; // Changed from optional to required with empty string default
  role: string;
  position: string;
  photo: string;
  password: string;
  verifyPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  photoFile?: File;
  photoPreview?: string;
}

// Constants for form options
const emptyFormData: UserFormData = {
  firstname: "",
  lastname: "",
  phonenumber1: "",
  phonenumber2: "",
  role: "teacher",
  position: "",
  photo: "",
  password: "",
  verifyPassword: "",
  newPassword: "",
  confirmNewPassword: "",
  photoFile: undefined,
  photoPreview: "",
};

const roleOptions = [
  { value: "teacher", label: "គ្រូបង្រៀន", icon: "📚", color: "text-blue-600" },
  { value: "admin", label: "អ្នកគ្រប់គ្រង", icon: "🛡️", color: "text-purple-600" },
];

const positionOptions = [
  "គ្រូបន្ទុកថ្នាក់ទី ១",
  "គ្រូបន្ទុកថ្នាក់ទី ២",
  "គ្រូបន្ទុកថ្នាក់ទី ៣",
  "គ្រូបន្ទុកថ្នាក់ទី ៤",
  "គ្រូបន្ទុកថ្នាក់ទី ៥",
  "គ្រូបន្ទុកថ្នាក់ទី ៦",
  "គ្រូបន្ទុកថ្នាក់ទី ៧",
  "គ្រូបន្ទុកថ្នាក់ទី ៨",
  "គ្រូបន្ទុកថ្នាក់ទី ៩",
  "នាយិកា",
  "នាយក",
];

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
  
  // Form state variables
  const [formData, setFormData] = useState<UserFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // Form input handler
  const handleFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    
    if (name === "password" || name === "verifyPassword") {
      setPasswordError(null);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ 
        title: "បរាជ័យ", 
        description: "សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ", 
        variant: "destructive" 
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "បរាជ័យ", 
        description: "ទំហំឯកសារត្រូវតែតិចជាង 5MB", 
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    const previewUrl = URL.createObjectURL(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.filename) {
        throw new Error(data.error || "Upload failed");
      }
      
      setFormData((prev) => ({
        ...prev,
        photoFile: file,
        photoPreview: previewUrl,
        photo: data.filename,
      }));
      
      toast({ 
        title: "ជោគជ័យ", 
        description: "រូបភាពត្រូវបានផ្ទុកឡើង", 
      });
    } catch (err) {
      toast({ 
        title: "បរាជ័យ", 
        description: "មិនអាចផ្ទុករូបភាពបានទេ", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!formData.lastname) errors.push("នាមត្រកូលគឺចាំបាច់");
    if (!formData.firstname) errors.push("នាមខ្លួនគឺចាំបាច់");
    if (!editUser && !formData.password) errors.push("ពាក្យសម្ងាត់គឺចាំបាច់");
    if (formData.password && formData.password !== formData.verifyPassword) {
      errors.push("ពាក្យសម្ងាត់មិនត្រូវគ្នា");
    }
    
    // Password change validation for edit mode
    if (editUser && showChangePassword) {
      if (!formData.newPassword) errors.push("ពាក្យសម្ងាត់ថ្មីគឺចាំបាច់");
      if (formData.newPassword && formData.newPassword.length < 6) {
        errors.push("ពាក្យសម្ងាត់ថ្មីត្រូវតែមានយ៉ាងហោចណាស់ 6 តួអក្សរ");
      }
      if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
        errors.push("ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា");
      }
    }
    
    return errors;
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }
    
    setFormError(null);
    setPasswordError(null);
    
    const isEdit = !!editUser;
    const username = `${formData.lastname.toLowerCase()}${formData.firstname.toLowerCase()}`.replace(/\s+/g, "");
    const avatar = formData.firstname ? formData.firstname.charAt(0).toUpperCase() : "U";
    
    let submitData: any = {
      ...formData,
      username,
      avatar,
      status: "active", // Always set to active by default
    };
    
    if (isEdit && !formData.password) {
      const { password, verifyPassword, ...rest } = submitData;
      submitData = rest;
    }
    
    // Handle password change for edit mode
    if (isEdit && showChangePassword) {
      submitData.newPassword = formData.newPassword;
      // Remove the old password fields
      const { password, verifyPassword, newPassword, confirmNewPassword, ...rest } = submitData;
      submitData = { ...rest, newPassword };
    }

    setSubmitMessage(null);
    const ok = await handleUserFormSubmit(submitData, isEdit);
    if (ok) {
      setSubmitMessage({ type: "success", text: isEdit ? "កែប្រែជោគជ័យ" : "បន្ថែមជោគជ័យ" });
      // Close after a short delay so the user can read the message
      setTimeout(() => {
        setSubmitMessage(null);
        setFormDialogOpen(false);
      }, 1200);
    } else {
      setSubmitMessage({ type: "error", text: isEdit ? "កែប្រែមិនជោគជ័យ" : "បន្ថែមមិនជោគជ័យ" });
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (editUser) {
      let photoPreview = "";
      if (editUser.photo) {
        photoPreview =
          editUser.photo.startsWith("http") || editUser.photo.startsWith("/")
            ? editUser.photo
            : `/uploads/${editUser.photo}`;
      }
      const { username, status, ...userDataWithoutUsernameAndStatus } = editUser;
      setFormData({
        ...emptyFormData,
        ...userDataWithoutUsernameAndStatus,
        // Ensure all string fields are not null to prevent React warnings
        phonenumber1: userDataWithoutUsernameAndStatus.phonenumber1 || "",
        phonenumber2: userDataWithoutUsernameAndStatus.phonenumber2 || "",
        position: userDataWithoutUsernameAndStatus.position || "",
        photo: userDataWithoutUsernameAndStatus.photo || "",
        password: "",
        verifyPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        photoPreview,
        photoFile: undefined,
      });
    } else {
      setFormData(emptyFormData);
    }
    setFormError(null);
    setPasswordError(null);
    setShowPassword(false);
    setShowVerifyPassword(false);
    setShowChangePassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  }, [editUser, formDialogOpen]);

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
    <div>
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

          <CardContent className="pt-6">
            {/* Users Table Component - Inline */}
            <div className="overflow-x-auto rounded-xl border border-border/50 bg-card shadow-sm">
              <Table>
                <TableCaption className="text-base text-muted-foreground mb-4">
                  បញ្ជីអ្នកប្រើប្រាស់ទាំងអស់ ({filteredUsers.length} នាក់)
                </TableCaption>
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/30">
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">ឈ្មោះ</TableHead>
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">លេខទូរស័ព្ទ</TableHead>
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">តួនាទី</TableHead>
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">មុខតំណែង</TableHead>
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">ស្ថានភាព</TableHead>
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">ចូលចុងក្រោយ</TableHead>
                    <TableHead className="text-base font-semibold text-primary py-4 px-6 text-center">សកម្មភាព</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                          <p className="text-base text-muted-foreground">កំពុងផ្ទុក...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-base font-medium text-foreground">មិនមានអ្នកប្រើប្រាស់</p>
                            <p className="text-sm text-muted-foreground mt-1">ចាប់ផ្តើមបន្ថែមអ្នកប្រើថ្មី</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.userid} className="hover:bg-muted/30 transition-colors duration-200 border-b border-border/30">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.photo ? (
                              <img
                                src={user.photo.startsWith('http') || user.photo.startsWith('blob:') || user.photo.startsWith('/') ? user.photo : `/uploads/${user.photo}`}
                                alt={user.firstname}
                                className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
                                onError={e => (e.currentTarget.src = "/placeholder-user.jpg")}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-base shadow-sm">
                                {user.firstname?.charAt(0) || "U"}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-primary">{user.lastname} {user.firstname}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-base">
                            <div className="font-medium text-foreground">{user.phonenumber1 || "-"}</div>
                            {user.phonenumber2 && <div className="text-sm text-muted-foreground mt-1">{user.phonenumber2}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <Badge className={`text-sm font-medium px-2 py-1 ${user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"}`}>
                            {user.role === "admin" ? "អ្នកគ្រប់គ្រង" : "គ្រូបង្រៀន"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-base text-muted-foreground text-center">{user.position || "-"}</div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge className={`text-sm font-medium px-2 py-1 ${user.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
                            {user.status === "active" ? "ដំណើរការ" : "បិទដំណើរការ"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-sm text-muted-foreground">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="icon"
                              variant="soft"
                              onClick={() => openDialog(user)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                              aria-label="កែប្រែ"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleViewDetails(user)}
                              className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                              aria-label="មើលព័ត៌មានលម្អិត"
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => setDeleteId(user.userid)}
                              className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                              aria-label="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Add/Edit Dialog - Inline */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-4xl w-full bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
          <Card className="w-full bg-transparent border-0 shadow-none">
            <CardHeader className="pb-3 border-b border-border/50 bg-background/80 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-primary text-xl font-bold tracking-wide">
                      {editUser ? "កែប្រែអ្នកប្រើ" : "បន្ថែមអ្នកប្រើថ្មី"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-base mt-1">
                      {editUser ? "កែប្រែព័ត៌មានអ្នកប្រើ" : "បំពេញព័ត៌មានដើម្បីបន្ថែមអ្នកប្រើថ្មី"}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 max-h-[70vh] overflow-y-auto scrollbar">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Profile Picture & Personal Information - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Profile Section */}
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center space-x-2 mb-4">
                      <Camera className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-primary">
                        រូបភាពប្រវត្តិ
                      </h3>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3">
                      {/* Avatar Preview */}
                      <div className="relative">
                        {formData.photoPreview ? (
                          <div className="relative">
                            <img
                              src={formData.photoPreview}
                              alt="Profile"
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, photoFile: undefined, photoPreview: "", photo: "" }))}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow-lg transition-colors"
                              aria-label="លុបរូបភាព"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {formData.firstname ? formData.firstname.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Controls */}
                      <div className="w-full text-center">
                        <label htmlFor="photo-upload" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer transition-colors text-base font-medium">
                          <Upload className="w-4 h-4 mr-2" />
                          <span>ជ្រើសរើសរូបភាព</span>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          អនុញ្ញាត JPG, PNG, GIF • អតិបរមា 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center space-x-2 mb-4">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-primary">
                        ព័ត៌មានផ្ទាល់ខ្លួន
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="lastname" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-primary" />
                          នាមត្រកូល <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastname"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleFormInput}
                          placeholder="បញ្ចូលនាមត្រកូល"
                          className="h-9 text-base"
                          required
                        />
                      </div>

                      {/* First Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="firstname" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-primary" />
                          នាមខ្លួន <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstname"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleFormInput}
                          placeholder="បញ្ចូលនាមខ្លួន"
                          className="h-9 text-base"
                          required
                        />
                      </div>

                    </div>
                  </div>
                </div>

                {/* Contact Information & Role & Position - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center space-x-2 mb-4">
                      <Phone className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-primary">
                        ព័ត៌មានទំនាក់ទំនង
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Phone 1 */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phonenumber1" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phonenumber1"
                          name="phonenumber1"
                          value={formData.phonenumber1}
                          onChange={handleFormInput}
                          placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                          className="h-10 text-base"
                          required
                        />
                      </div>

                      {/* Phone 2 */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phonenumber2" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          លេខទូរស័ព្ទទី២
                        </Label>
                        <Input
                          id="phonenumber2"
                          name="phonenumber2"
                          value={formData.phonenumber2}
                          onChange={handleFormInput}
                          placeholder="បញ្ចូលលេខទូរស័ព្ទទី២"
                          className="h-10 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role & Position */}
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center space-x-2 mb-4">
                      <Shield className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-primary">
                        តួនាទី និង មុខតំណែង
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Role */}
                      <div className="space-y-1.5">
                        <Label htmlFor="role" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          តួនាទី <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="ជ្រើសរើសតួនាទី" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <span className={role.color}>{role.icon}</span>
                                  {role.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Position */}
                      <div className="space-y-1.5">
                        <Label htmlFor="position" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-primary" />
                          មុខតំណែង
                        </Label>
                        <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="ជ្រើសរើសមុខតំណែង" />
                          </SelectTrigger>
                          <SelectContent>
                            {positionOptions.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                {!editUser ? (
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center space-x-2 mb-4">
                      <Lock className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-primary">
                        ពាក្យសម្ងាត់
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-primary" />
                          ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleFormInput}
                            placeholder="បញ្ចូលពាក្យសម្ងាត់"
                            className="h-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Verify Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="verifyPassword" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-primary" />
                          បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="verifyPassword"
                            name="verifyPassword"
                            type={showVerifyPassword ? "text" : "password"}
                            value={formData.verifyPassword}
                            onChange={handleFormInput}
                            placeholder="បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត"
                            className="h-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Change Password Section for Edit Mode */
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <h3 className="text-base font-semibold text-primary">
                          ផ្លាស់ប្តូរពាក្យសម្ងាត់
                        </h3>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="text-sm"
                      >
                        {showChangePassword ? "លាក់" : "បង្ហាញ"}
                      </Button>
                    </div>
                    
                    {showChangePassword && (
                      <div className="space-y-4">
                        {/* Info Note */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-base text-blue-700 dark:text-blue-300">
                              <p className="font-medium">ព័ត៌មាន:</p>
                              <p>អ្នកអាចផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយបញ្ចូលតែពាក្យសម្ងាត់ថ្មី។</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* New Password */}
                        <div className="space-y-1.5">
                          <Label htmlFor="newPassword" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-primary" />
                            ពាក្យសម្ងាត់ថ្មី <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={handleFormInput}
                              placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                              className="h-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1.5">
                          <Label htmlFor="confirmNewPassword" className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-primary" />
                            បញ្ជាក់ពាក្យសម្ងាត់ថ្មី <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmNewPassword"
                              name="confirmNewPassword"
                              type={showConfirmNewPassword ? "text" : "password"}
                              value={formData.confirmNewPassword}
                              onChange={handleFormInput}
                              placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                              className="h-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Error Message */}
                {formError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-base text-red-700 dark:text-red-300">{formError}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {submitMessage && (
                  <div className={`${submitMessage.type === "success" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"} border rounded-lg p-4`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${submitMessage.type === "success" ? "bg-green-500" : "bg-red-500"} rounded-full`}></div>
                      <p className={`text-base ${submitMessage.type === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                        {submitMessage.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormDialogOpen(false)}
                    className="h-9 px-5 text-base font-medium"
                    disabled={formLoading}
                  >
                    បោះបង់
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-5 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>កំពុងរក្សាទុក...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>{editUser ? "កែប្រែ" : "បន្ថែម"}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-md w-full bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
          <Card className="w-full bg-transparent border-0 shadow-none">
            <CardHeader className="pb-3 border-b border-border/50 bg-background/80 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <Trash2 className="h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-wide text-red-600 dark:text-red-400">
                      លុបអ្នកប្រើ
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mt-1">
                      សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="text-base text-red-700 dark:text-red-300">
                    <p className="font-medium">តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើនេះមែនទេ?</p>
                    <p className="text-sm mt-1 opacity-80">ព័ត៌មានទាំងអស់នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <DialogClose asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 px-6 text-base font-semibold"
                      disabled={deleteLoading}
                    >
                      បោះបង់
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
        loading={deleteLoading}
                    onClick={() => deleteId && handleDelete(deleteId)}
                    className="h-10 px-6 text-base font-bold bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
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
            <CardHeader className="pb-3 border-b border-border/50 bg-background/80 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Info className="h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-primary text-xl font-bold tracking-wide">
                      ព័ត៌មានលម្អិតអ្នកប្រើ
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mt-1">
                      ព័ត៌មានពេញលេញពីមូលដ្ឋានទិន្នន័យ
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30">
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
                      <h3 className="text-lg font-bold text-primary">{viewDetailsUser.lastname} {viewDetailsUser.firstname}</h3>
                      <p className="text-base text-muted-foreground">@{viewDetailsUser.username}</p>
                      <Badge className={`mt-1 ${viewDetailsUser.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
                        {viewDetailsUser.status === "active" ? "ដំណើរការ" : "បិទដំណើរការ"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Status Toggle */}
                  <div className="flex items-center gap-3 mt-2 mb-4">
                    <label htmlFor="status-toggle-details" className="text-base font-medium text-foreground flex items-center gap-1.5">
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
                        <label className="text-base font-semibold text-primary">តួនាទី</label>
                        <p className="text-base font-medium">{viewDetailsUser.role === "admin" ? "អ្នកគ្រប់គ្រង" : "គ្រូបង្រៀន"}</p>
                      </div>
                      <div>
                        <label className="text-base font-semibold text-primary">មុខតំណែង</label>
                        <p className="text-base font-medium">{viewDetailsUser.position || "-"}</p>
                      </div>
                      <div>
                        <label className="text-base font-semibold text-primary">លេខទូរស័ព្ទ ១</label>
                        <p className="text-base font-medium">{viewDetailsUser.phonenumber1 || "-"}</p>
                      </div>
                      <div>
                        <label className="text-base font-semibold text-primary">លេខទូរស័ព្ទ ២</label>
                        <p className="text-base font-medium">{viewDetailsUser.phonenumber2 || "-"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-base font-semibold text-primary">ចូលចុងក្រោយ</label>
                        <p className="text-base font-medium">
                          {viewDetailsUser.lastLogin ? new Date(viewDetailsUser.lastLogin).toLocaleString() : "មិនទាន់ចូល"}
                        </p>
                      </div>
                      <div>
                        <label className="text-base font-semibold text-primary">បង្កើតនៅថ្ងៃ</label>
                        <p className="text-base font-medium">{new Date(viewDetailsUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-base font-semibold text-primary">កែប្រែចុងក្រោយ</label>
                        <p className="text-base font-medium">{new Date(viewDetailsUser.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
                    <DialogClose asChild>
                      <Button variant="outline" className="h-10 px-6 text-base font-semibold">
                        បោះបង់
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={() => {
                        setViewDetailsUser(null);
                        openDialog(viewDetailsUser);
                      }}
                      className="h-10 px-6 text-base font-bold"
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
