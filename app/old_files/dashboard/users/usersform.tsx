import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  UserIcon, 
  UserCheck, 
  Users, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  ChevronDown, 
  ClipboardList, 
  BookOpen, 
  Check, 
  Lock, 
  AtSign,
  Phone,
  Mail,
  Camera,
  Trash2,
  Save,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface UserFormData {
  username: string;
  firstname: string;
  lastname: string;
  phonenumber1: string;
  phonenumber2?: string;
  role: string;
  position: string;
  photo: string;
  status: string;
  password: string;
  verifyPassword: string;
  photoFile?: File;
  photoPreview?: string;
}

export interface UsersFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData, isEdit: boolean) => Promise<boolean>;
  loading: boolean;
  editUser?: Partial<UserFormData> | null;
}

const emptyFormData: UserFormData = {
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

const roleOptions = [
  { value: "teacher", label: "គ្រូបង្រៀន", icon: <BookOpen className="w-4 h-4" />, color: "text-blue-600" },
  { value: "admin", label: "អ្នកគ្រប់គ្រង", icon: <Shield className="w-4 h-4" />, color: "text-purple-600" },
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
  "គ្រូបន្ទុកថ្នាក់ទី ១០",
  "គ្រូបន្ទុកថ្នាក់ទី ១១",
  "គ្រូបន្ទុកថ្នាក់ទី ១២",
  "នាយក",
];

export const UsersForm: React.FC<UsersFormProps> = ({ open, onClose, onSubmit, loading, editUser }) => {
  const [form, setForm] = useState<UserFormData>(emptyFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (editUser) {
      let photoPreview = "";
      if (editUser.photo) {
        photoPreview =
          editUser.photo.startsWith("http") || editUser.photo.startsWith("/")
            ? editUser.photo
            : `/uploads/${editUser.photo}`;
      }
      setForm({
        ...emptyFormData,
        ...editUser,
        status: editUser.status || "active",
        password: "",
        verifyPassword: "",
        photoPreview,
        photoFile: undefined,
      });
    } else {
      setForm(emptyFormData);
    }
    setFormError(null);
    setPasswordError(null);
    setShowPassword(false);
    setShowVerifyPassword(false);
  }, [editUser, open]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Auto-generate username from firstname and lastname
    if (name === "lastname" || name === "firstname") {
      const lastname = name === "lastname" ? value : form.lastname;
      const firstname = name === "firstname" ? value : form.firstname;
      if (lastname && firstname) {
        const username = `${lastname.toLowerCase()}${firstname.toLowerCase()}`.replace(/\s+/g, "");
        setForm((prev) => ({ ...prev, username }));
      }
    }
    
    if (name === "password" || name === "verifyPassword") {
      setPasswordError(null);
    }
  };

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
      
      setForm((prev) => ({
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

  const clearPhoto = () => {
    setForm((prev) => ({ 
      ...prev, 
      photoFile: undefined, 
      photoPreview: "", 
      photo: "" 
    }));
  };

  const generateAvatar = (firstname: string) => {
    return firstname ? firstname.charAt(0).toUpperCase() : "U";
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.lastname) errors.push("នាមត្រកូលគឺចាំបាច់");
    if (!form.firstname) errors.push("នាមខ្លួនគឺចាំបាច់");
    if (!editUser && !form.password) errors.push("ពាក្យសម្ងាត់គឺចាំបាច់");
    if (form.password && form.password !== form.verifyPassword) {
      errors.push("ពាក្យសម្ងាត់មិនត្រូវគ្នា");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }
    
    setFormError(null);
    setPasswordError(null);
    
    const isEdit = !!editUser;
    const username = form.username || `${form.lastname.toLowerCase()}${form.firstname.toLowerCase()}`.replace(/\s+/g, "");
    const avatar = generateAvatar(form.firstname);
    
    let submitData: any = {
      ...form,
      username,
      avatar,
    };
    
    if (isEdit && !form.password) {
      const { password, verifyPassword, ...rest } = submitData;
      submitData = rest;
    }

    setSubmitMessage(null);
    const ok = await onSubmit(submitData, isEdit);
    if (ok) {
      setSubmitMessage({ type: "success", text: isEdit ? "កែប្រែជោគជ័យ" : "បន្ថែមជោគជ័យ" });
      // Close after a short delay so the user can read the message
      setTimeout(() => {
        setSubmitMessage(null);
        onClose();
      }, 1200);
    } else {
      setSubmitMessage({ type: "error", text: isEdit ? "កែប្រែមិនជោគជ័យ" : "បន្ថែមមិនជោគជ័យ" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
        {/* Modern Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                {editUser ? (
                  <UserIcon className="h-5 w-5 text-white" />
                ) : (
                  <Plus className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-wide bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  {editUser ? "កែប្រែអ្នកប្រើ" : "បន្ថែមអ្នកប្រើ"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {editUser ? "កែប្រែព័ត៌មានអ្នកប្រើប្រាស់" : "បំពេញព័ត៌មានអ្នកប្រើថ្មី"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted/50 transition-colors"
              aria-label="បិទ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Profile Section */}
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
              <div className="flex items-center space-x-2 mb-6">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  រូបភាពប្រវត្តិ
                </h3>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative">
                  {form.photoPreview ? (
                    <div className="relative">
                      <img
                        src={form.photoPreview}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow-lg transition-colors"
                        aria-label="លុបរូបភាព"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {generateAvatar(form.firstname)}
                    </div>
                  )}
                </div>
                
                {/* Upload Controls */}
                <div className="flex-1">
                  <label htmlFor="photo-upload" className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    <span>{isUploading ? "កំពុងផ្ទុក..." : "ជ្រើសរើសរូបភាព"}</span>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    អនុញ្ញាត JPG, PNG, GIF • អតិបរមា 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
              <div className="flex items-center space-x-2 mb-6">
                <UserIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  ព័ត៌មានផ្ទាល់ខ្លួន
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-sm font-semibold flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    នាមត្រកូល <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastname"
                      name="lastname"
                      value={form.lastname}
                      onChange={handleInput}
                      required
                      className={`h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                        !form.lastname && formError ? "border-red-500" : "border-border/50"
                      }`}
                      placeholder="បញ្ចូលនាមត្រកូល"
                    />
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-sm font-semibold flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    នាមខ្លួន <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstname"
                      name="firstname"
                      value={form.firstname}
                      onChange={handleInput}
                      required
                      className={`h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                        !form.firstname && formError ? "border-red-500" : "border-border/50"
                      }`}
                      placeholder="បញ្ចូលនាមខ្លួន"
                    />
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Username (Auto-generated) */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-primary" />
                    ឈ្មោះប្រើប្រាស់
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleInput}
                      disabled
                      className="h-12 pl-10 text-base font-medium border-2 rounded-xl bg-muted/50 italic text-muted-foreground border-border/50 cursor-not-allowed"
                      placeholder="បង្កើតដោយស្វ័យប្រវត្តិ"
                    />
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
              <div className="flex items-center space-x-2 mb-6">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  ព័ត៌មានទំនាក់ទំនង
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                   <Label htmlFor="phonenumber1" className="text-sm font-semibold flex items-center gap-2">
                     <Phone className="w-4 h-4 text-primary" />
                     លេខទូរស័ព្ទ ១
                   </Label>
                   <div className="relative">
                     <Input
                       id="phonenumber1"
                       name="phonenumber1"
                       value={form.phonenumber1}
                       onChange={handleInput}
                       className="h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50"
                       placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                     />
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   </div>
                 </div>

                                 <div className="space-y-2">
                   <Label htmlFor="phonenumber2" className="text-sm font-semibold flex items-center gap-2">
                     <Phone className="w-4 h-4 text-primary" />
                     លេខទូរស័ព្ទ ២
                   </Label>
                   <div className="relative">
                     <Input
                       id="phonenumber2"
                       name="phonenumber2"
                       value={form.phonenumber2}
                       onChange={handleInput}
                       className="h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50"
                       placeholder="បញ្ចូលលេខទូរស័ព្ទ (ស្រេចចិត្ត)"
                     />
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   </div>
                 </div>
              </div>
            </div>

            {/* Role & Position */}
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  តួនាទី និងមុខតំណែង
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    តួនាទី <span className="text-red-500">*</span>
                  </Label>
                  <Select value={form.role} onValueChange={(value) => setForm({...form, role: value})}>
                    <SelectTrigger className="h-12 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50">
                      <SelectValue placeholder="ជ្រើសរើសតួនាទី" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <span className={option.color}>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    មុខតំណែង
                  </Label>
                  <Select value={form.position} onValueChange={(value) => setForm({...form, position: value})}>
                    <SelectTrigger className="h-12 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50">
                      <SelectValue placeholder="ជ្រើសរើសមុខតំណែង" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            {!editUser ? (
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
                <div className="flex items-center space-x-2 mb-6">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    សុវត្ថិភាពគណនី
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleInput}
                        required
                        className={`h-12 pl-10 pr-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                          !form.password && formError ? "border-red-500" : "border-border/50"
                        }`}
                        placeholder="បញ្ចូលពាក្យសម្ងាត់"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Verify Password */}
                  <div className="space-y-2">
                    <Label htmlFor="verifyPassword" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="verifyPassword"
                        name="verifyPassword"
                        type={showPassword ? "text" : "password"}
                        value={form.verifyPassword}
                        onChange={handleInput}
                        required
                        className={`h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                          form.password !== form.verifyPassword && form.verifyPassword ? "border-red-500" : "border-border/50"
                        }`}
                        placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
                <div className="flex items-center space-x-2 mb-6">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    បង្កើត​ពាក្យសម្ងាត់ថ្មី (ស្រេចចិត្ត)
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      បង្កើត​ពាក្យសម្ងាត់ថ្មី
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleInput}
                        className="h-12 pl-10 pr-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50"
                        placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verifyPassword" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                    </Label>
                    <div className="relative">
                      <Input
                        id="verifyPassword"
                        name="verifyPassword"
                        type={showPassword ? "text" : "password"}
                        value={form.verifyPassword}
                        onChange={handleInput}
                        className="h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border/50"
                        placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {(formError || passwordError) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700 font-medium">
                    {formError || passwordError}
                  </span>
                </div>
              </div>
            )}

            {/* Submission Status + Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border/50 gap-4">
              <div className="min-h-[1.5rem]">
                {submitMessage ? (
                  <span
                    className={
                      submitMessage.type === "success"
                        ? "text-sm font-semibold text-green-600"
                        : "text-sm font-semibold text-red-600"
                    }
                  >
                    {submitMessage.text}
                  </span>
                ) : (
                  loading && <span className="text-sm text-muted-foreground">កំពុងរក្សាទុក...</span>
                )}
              </div>
              <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-12 px-6 text-sm font-semibold hover:bg-muted/50 border-border/50"
                disabled={loading}
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="h-12 px-6 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editUser ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    រក្សាទុក
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    បន្ថែម
                  </>
                )}
              </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 