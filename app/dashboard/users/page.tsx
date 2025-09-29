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
import { Plus, Edit, Trash2, User as UserIcon, Users, Shield, UserCheck, Search, Eye, EyeOff, Upload, X, ToggleLeft, Info, Sparkles, BarChart3, Activity, BookOpen, Camera, Phone, AtSign, Mail, Lock, Save, Check, CheckCircle, ChevronDown, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
// Removed separate component imports - now consolidated
interface User {
  userId: number;
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
  const [optimisticStatus, setOptimisticStatus] = useState<{ userId: number; status: string } | null>(null);
  
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
        isEdit ? `/api/users/${editUser!.userId}` : "/api/users",
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
  const handleDelete = async (userId: number) => {
    setDeleteLoading(true);
    try {
              const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
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
    setStatusLoading(user.userId);
    const isCurrentlyActive = (optimisticStatus && optimisticStatus.userId === user.userId ? optimisticStatus.status : user.status) === "active";
    const newStatus = isCurrentlyActive ? "inactive" : "active";
    
    // Optimistic update - update local state immediately
    setOptimisticStatus({ userId: user.userId, status: newStatus });
    
    // Update users array immediately for real-time UI
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.userId === user.userId 
          ? { ...u, status: newStatus }
          : u
      )
    );
    
    // Update viewDetailsUser if it's the same user
    if (viewDetailsUser && viewDetailsUser.userId === user.userId) {
      setViewDetailsUser({ ...viewDetailsUser, status: newStatus });
    }
    
    try {
              const res = await fetch(`/api/users/${user.userId}/status`, {
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
            u.userId === user.userId 
              ? { ...u, status: user.status } // Revert to original status
              : u
          )
        );
        if (viewDetailsUser && viewDetailsUser.userId === user.userId) {
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
          u.userId === user.userId 
            ? { ...u, status: user.status } // Revert to original status
            : u
        )
      );
      if (viewDetailsUser && viewDetailsUser.userId === user.userId) {
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
    setSkipLockoutLoading(user.userId);
    
    try {
      const res = await fetch(`/api/users/${user.userId}/skip-lockout`, {
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
          u.userId === user.userId 
            ? { ...u, accountLockedUntil: undefined }
            : u
        )
      );
      
      // Update viewDetailsUser if it's the same user
      if (viewDetailsUser && viewDetailsUser.userId === user.userId) {
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
    setSkipLockoutLoading(user.userId);
    
    try {
      const res = await fetch(`/api/users/${user.userId}/reset-login-attempts`, {
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
          u.userId === user.userId 
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
      if (viewDetailsUser && viewDetailsUser.userId === user.userId) {
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
  
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Enhanced Statistics Overview */}
      <div className="relative mb-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />

        <div className="text-center space-y-6 p-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Total Users Card */}
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-300">{totalUsers}</p>
                    <p className="text-lg text-blue-500 dark:text-blue-300 font-medium">អ្នកប្រើទាំងអស់</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Active Users Card */}
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform duration-300">{activeUsers}</p>
                    <p className="text-lg text-green-500 dark:text-green-300 font-medium">អ្នកប្រើសកម្ម</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Admin Users Card */}
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-300">{adminUsers}</p>
                    <p className="text-lg text-purple-500 dark:text-purple-300 font-medium">អ្នកគ្រប់គ្រង</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Teacher Users Card */}
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform duration-300">{teacherUsers}</p>
                    <p className="text-lg text-orange-500 dark:text-orange-300 font-medium">គ្រូបង្រៀន</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Users Table Section */}
      <div className="relative group">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-purple-50/30 dark:from-purple-950/20 dark:via-pink-950/15 dark:to-purple-950/20 rounded-3xl -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.05),transparent_50%)]" />

        <Card className="relative overflow-hidden border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 group-hover:scale-[1.02]">
          {/* Modern Header */}
          <CardHeader className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white p-8">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">បញ្ជីអ្នកប្រើប្រាស់</h2>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                      {totalUsers} អ្នកប្រើ
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-medium">
                      {activeUsers} សកម្ម
                    </Badge>
                  </div>
                  <div className="h-1.5 w-12 bg-white/40 rounded-full mt-3 group-hover:w-16 transition-all duration-500" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search Bar Section - Separate from header */}
                <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/30 dark:border-purple-700/30 rounded-xl p-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <Input
                      placeholder="ស្វែងរកអ្នកប្រើ..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-10 h-10 w-full bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300 rounded-lg text-sm shadow-lg"
                    />
                    {search && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        onClick={() => setSearch("")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => openDialog()}
                  className="group px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  variant="ghost"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>បន្ថែមអ្នកប្រើ</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                </div>
                <p className="text-sm md:text-base text-muted-foreground">
                  កំពុងទាញយក...
                </p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="relative">
                {/* Modern Fixed Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-50/98 to-pink-50/98 dark:from-purple-900/98 dark:to-pink-900/98 backdrop-blur-xl border-b-2 border-purple-200/60 dark:border-purple-700/60 shadow-lg">
                  <div className="grid grid-cols-12 gap-4 py-4 px-4">
                    <div className="col-span-12 md:col-span-3">
                      <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full" />
                        ឈ្មោះ
                      </h3>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-center">
                      <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full" />
                        ទូរស័ព្ទ
                      </h3>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-center">
                      <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full" />
                        តួនាទី
                      </h3>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-center">
                      <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full" />
                        ស្ថានភាព
                      </h3>
                    </div>
                    <div className="col-span-6 md:col-span-3 text-center">
                      <h3 className="text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full" />
                        សកម្មភាព
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Modern Scrollable User List */}
                <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-500">
                  <div className="divide-y divide-gray-200/50 dark:divide-gray-700/30">
                    {filteredUsers.map((user, index) => (
                      <div 
                        key={user.userId} 
                        className={`group grid grid-cols-12 gap-4 py-4 px-4 hover:bg-gradient-to-r hover:from-purple-50/60 hover:to-pink-50/60 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 hover:scale-[1.005] hover:shadow-md ${
                          index % 2 === 0 
                            ? 'bg-white/40 dark:bg-gray-800/40' 
                            : 'bg-purple-50/30 dark:bg-purple-900/20'
                        }`}
                      >
                        {/* Modern User Info */}
                        <div className="col-span-12 md:col-span-3 flex items-center gap-3 md:gap-4">
                          <div className="relative group/avatar flex-shrink-0">
                            {user.photo ? (
                              <img
                                src={user.photo.startsWith('http') || user.photo.startsWith('blob:') || user.photo.startsWith('/') ? user.photo : `/uploads/${user.photo}`}
                                alt={user.firstname}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover ring-2 ring-purple-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-110 group-hover/avatar:shadow-xl transition-all duration-300"
                                onError={e => (e.currentTarget.src = "/placeholder-user.jpg")}
                              />
                            ) : (
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm md:text-lg font-bold shadow-lg ring-2 ring-purple-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-110 group-hover/avatar:shadow-xl transition-all duration-300">
                                {user.firstname?.charAt(0) || "U"}
                              </div>
                            )}
                            {/* User Number Badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md group-hover/avatar:scale-110 transition-transform duration-300">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white text-sm md:text-base group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300 leading-tight">
                              {user.lastname} {user.firstname}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mt-1">
                              @{user.username}
                            </div>
                          </div>
                        </div>

                        {/* Modern Phone Info */}
                        <div className="col-span-6 md:col-span-2 flex justify-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {user.phonenumber1 || "-"}
                            </div>
                            {user.phonenumber2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300">
                                {user.phonenumber2}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Modern Role Badge */}
                        <div className="col-span-6 md:col-span-2 flex justify-center">
                          <div className="group-hover:scale-110 transition-transform duration-300">
                            <Badge className={`text-xs font-medium px-2 py-1 ${
                              user.role === "admin" 
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" 
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            }`}>
                              {user.role === "admin" ? "អ្នកគ្រប់គ្រង" : "គ្រូបង្រៀន"}
                            </Badge>
                          </div>
                        </div>

                        {/* Modern Status Badge */}
                        <div className="col-span-6 md:col-span-2 flex justify-center">
                          <div className="group-hover:scale-110 transition-transform duration-300">
                            <Badge className={`text-xs font-medium px-2 py-1 ${
                              user.status === "active" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }`}>
                              {user.status === "active" ? "ដំណើរការ" : "បិទដំណើរការ"}
                            </Badge>
                          </div>
                        </div>

                        {/* Modern Action Buttons */}
                        <div className="col-span-6 md:col-span-3 flex justify-center">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openDialog(user)}
                              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl transition-all duration-300 hover:scale-110"
                              aria-label="កែប្រែ"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewDetails(user)}
                              className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-all duration-300 hover:scale-110"
                              aria-label="មើលព័ត៌មានលម្អិត"
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(user.userId)}
                              className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-300 hover:scale-110"
                              aria-label="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                  {search ? "រកមិនឃើញអ្នកប្រើ" : "មិនមានអ្នកប្រើប្រាស់"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Modern Add/Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 overflow-visible">
          {/* Enhanced Modern Header with Gradient Background */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white p-8 -m-8 mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">
                    {editUser ? "កែប្រែអ្នកប្រើ" : "បន្ថែមអ្នកប្រើថ្មី"}
                  </DialogTitle>
                  <DialogDescription className="text-white/90 text-base font-medium">
                    {editUser ? "កែប្រែព័ត៌មានអ្នកប្រើ" : "បំពេញព័ត៌មានដើម្បីបន្ថែមអ្នកប្រើថ្មី"}
                  </DialogDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-sm">
                  {new Date().toLocaleDateString('en-GB')}
                </div>
                <div className="text-white/60 text-xs">
                  {new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 overflow-x-visible">
            <form id="user-form" onSubmit={handleFormSubmit} className="space-y-6 px-2">
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

            </form>
          </div>
          
          {/* Enhanced Fixed Action Buttons - Always visible */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 px-4 -mx-8 -mb-8 p-8 animate-in slide-in-from-bottom-2 duration-500 delay-400">
            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>ព័ត៌មានអ្នកប្រើត្រូវបានរក្សាទុកដោយសុវត្ថិភាព</span>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormDialogOpen(false)}
                className="px-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 font-medium shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  បោះបង់
                </div>
              </Button>
              <Button
                type="submit"
                form="user-form"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
                disabled={formLoading}
              >
                <div className="flex items-center gap-2">
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      កំពុងរក្សាទុក...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editUser ? "កែប្រែ" : "បន្ថែម"}
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Modern Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              លុបអ្នកប្រើ
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              តើអ្នកប្រាកដជាចង់លុបអ្នកប្រើនេះមែនទេ?
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                សកម្មភាពនេះមិនអាចត្រលប់បានទេ។
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="px-6 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:scale-105 font-medium shadow-sm hover:shadow-md"
                disabled={deleteLoading}
              >
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  បោះបង់
                </div>
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
              disabled={deleteLoading}
            >
              <div className="flex items-center gap-2">
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    កំពុងលុប...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    លុបអ្នកប្រើ
                  </>
                )}
              </div>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Modern View Details Dialog */}
      <Dialog open={!!viewDetailsUser} onOpenChange={open => { if (!open) setViewDetailsUser(null); }}>
        <DialogContent className="max-w-2xl max-h-[95vh] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 backdrop-blur-xl border-0 shadow-2xl rounded-3xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 overflow-visible">
          {/* Enhanced Modern Header with Gradient Background */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white p-8 -m-8 mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            
            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold animate-in slide-in-from-top-2 duration-500">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Info className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-2xl font-bold mb-1">
                    ព័ត៌មានលម្អិតអ្នកប្រើ
                  </div>
                  <div className="text-white/90 text-base font-medium">
                    ព័ត៌មានពេញលេញពីមូលដ្ឋានទិន្នន័យ
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm">
                    {new Date().toLocaleDateString('en-GB')}
                  </div>
                  <div className="text-white/60 text-xs">
                    {new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          {viewDetailsUser && (
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 overflow-x-visible">
              <div className="space-y-6 px-2">
                {/* Enhanced User Avatar and Basic Info */}
                <div className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/10 rounded-2xl p-6 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left-2 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      {viewDetailsUser.photo ? (
                        <img
                          src={viewDetailsUser.photo}
                          alt={viewDetailsUser.firstname}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-200/50 dark:ring-purple-700/50 group-hover:scale-110 transition-transform duration-300"
                          onError={e => (e.currentTarget.src = "/placeholder-user.jpg")}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                          {viewDetailsUser.firstname?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-xl mb-1">
                        {viewDetailsUser.lastname} {viewDetailsUser.firstname}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        @{viewDetailsUser.username}
                      </div>
                      <Badge className={`text-xs font-medium px-2 py-1 ${
                        viewDetailsUser.status === "active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}>
                        {viewDetailsUser.status === "active" ? "ដំណើរការ" : "បិទដំណើរការ"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-300">
                        ID: {viewDetailsUser.userId}
                      </div>
                    </div>
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
                      aria-pressed={((optimisticStatus && optimisticStatus.userId === viewDetailsUser.userId ? optimisticStatus.status : viewDetailsUser.status) === 'active')}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 border-2 border-transparent ${((optimisticStatus && optimisticStatus.userId === viewDetailsUser.userId ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'bg-green-500' : 'bg-gray-300'}`}
                      onClick={() => handleToggleStatus(viewDetailsUser)}
                      disabled={statusLoading === viewDetailsUser.userId}
                      tabIndex={0}
                      onKeyDown={e => {
                        if ((e.key === ' ' || e.key === 'Enter') && !statusLoading) {
                          e.preventDefault();
                          handleToggleStatus(viewDetailsUser);
                        }
                      }}
                    >
                      <span
                        className={`absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${((optimisticStatus && optimisticStatus.userId === viewDetailsUser.userId ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'translate-x-8' : 'translate-x-0'}`}
                      >
                        {((optimisticStatus && optimisticStatus.userId === viewDetailsUser.userId ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? (
                          <span className="text-green-500 text-lg font-bold">✔</span>
                        ) : (
                          <span className="text-gray-400 text-lg font-bold">✖</span>
                        )}
                      </span>
                      {statusLoading === viewDetailsUser.userId && (
                        <span className="absolute left-1/2 -translate-x-1/2 animate-spin h-5 w-5 border-b-2 border-primary"></span>
                      )}
                    </button>
                    <span className={`text-base font-bold select-none ${((optimisticStatus && optimisticStatus.userId === viewDetailsUser.userId ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'text-green-600' : 'text-red-600'}`}>
                      {((optimisticStatus && optimisticStatus.userId === viewDetailsUser.userId ? optimisticStatus.status : viewDetailsUser.status) === 'active') ? 'ដំណើរការ' : 'បិទដំណើរការ'}
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

              </div>
            </div>
          )}
          
          {/* Enhanced Fixed Action Buttons - Always visible */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 px-4 -mx-8 -mb-8 p-8 animate-in slide-in-from-bottom-2 duration-500 delay-400">
            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>ព័ត៌មានអ្នកប្រើត្រូវបានរក្សាទុកដោយសុវត្ថិភាព</span>
            </div>
            <div className="flex gap-3">
              <DialogClose asChild>
                <Button 
                  variant="outline" 
                  className="px-6 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:scale-105 font-medium shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    បោះបង់
                  </div>
                </Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setViewDetailsUser(null);
                  openDialog(viewDetailsUser || undefined);
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  កែប្រែ
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
