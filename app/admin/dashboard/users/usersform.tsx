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
import { Shield, UserIcon, UserCheck, Users, Eye, EyeOff, Upload, X, ChevronDown, ClipboardList, BookOpen, Check, Lock, AtSign } from "lucide-react";
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
  status: string; // "active", "inactive", "suspended"
  password: string;
  verifyPassword: string;
  photoFile?: File;
  photoPreview?: string;
}

export interface UsersFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData, isEdit: boolean) => Promise<void>;
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
  { value: "teacher", label: "គ្រូបង្រៀន", icon: <BookOpen className="w-4 h-4 text-blue-500 mr-2" /> },
  { value: "admin", label: "អ្នកគ្រប់គ្រង", icon: <Shield className="w-4 h-4 text-purple-500 mr-2" /> },
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
  const { toast } = useToast();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  const positionDropdownRef = useRef<HTMLDivElement>(null);
  const [positionInputFocus, setPositionInputFocus] = useState(false);
  const [positionDropdownIndex, setPositionDropdownIndex] = useState(-1);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [roleDropdownOpen]);

  // Handle outside click for position dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
        setPositionDropdownOpen(false);
        setPositionDropdownIndex(-1);
      }
    }
    if (positionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [positionDropdownOpen]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
    console.log("Selected file:", file);
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "បរាជ័យ", description: "សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "បរាជ័យ", description: "ទំហំឯកសារត្រូវតែតិចជាង 5MB", variant: "destructive" });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      // Upload to /api/upload
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.filename) {
          toast({ title: "បរាជ័យ", description: data.error || "Upload failed", variant: "destructive" });
          return;
        }
        console.log("Upload success, previewUrl:", previewUrl, "filename:", data.filename);
        setForm((prev) => ({
          ...prev,
          photoFile: file, // for preview only
          photoPreview: previewUrl,
          photo: data.filename, // store only filename for backend
        }));
      } catch (err) {
        toast({ title: "បរាជ័យ", description: "Upload failed", variant: "destructive" });
      }
    }
  };

  const clearPhoto = () => {
    console.log("Clearing photo");
    setForm((prev) => ({ ...prev, photoFile: undefined, photoPreview: "", photo: "" }));
  };

  const generateAvatar = (firstname: string) => {
    if (firstname) {
      return firstname.charAt(0).toUpperCase();
    }
    return "U";
  };

  const validatePassword = () => {
    if (form.password && form.verifyPassword && form.password !== form.verifyPassword) {
      setPasswordError("ពាក្យសម្ងាត់មិនត្រូវគ្នា");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPasswordError(null);
    const isEdit = !!editUser;
    if (!form.lastname || !form.firstname || (!isEdit && !form.password)) {
      setFormError("សូមបំពេញព័ត៌មានចាំបាច់");
      return;
    }
    if (form.password && form.password !== form.verifyPassword) {
      setPasswordError("ពាក្យសម្ងាត់មិនត្រូវគ្នា");
      return;
    }
    const username = form.username || `${form.lastname.toLowerCase()}${form.firstname.toLowerCase()}`.replace(/\s+/g, "");
    const avatar = generateAvatar(form.firstname);
    let submitData: any = {
      ...form,
      username,
      avatar,
    };
    if (isEdit && !form.password) {
      // Remove password fields if not set
      const { password, verifyPassword, ...rest } = submitData;
      submitData = rest;
    }
    await onSubmit(submitData, isEdit);
  };

  const filteredPositions = positionOptions.filter(opt =>
    (form.position || '').length === 0 || opt.includes(form.position || "")
  );

  console.log("photoPreview:", form.photoPreview, "photo:", form.photo);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
        <DialogTitle className="sr-only">
          {editUser ? "កែប្រែអ្នកប្រើ" : "បន្ថែមអ្នកប្រើ"}
        </DialogTitle>
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 rounded-t-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-wide bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {editUser ? "កែប្រែអ្នកប្រើ" : "បន្ថែមអ្នកប្រើ"}
              </h2>
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
          <div className="pt-1 pb-0 px-2">
            <p className="text-sm text-muted-foreground">
              {editUser ? "កែប្រែព័ត៌មានអ្នកប្រើប្រាស់" : "បំពេញព័ត៌មានអ្នកប្រើថ្មី"}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-2 md:p-2 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-2">
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
                </div>
                <div className="space-y-1 mb-4">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    រូបភាព
                  </label>
                  <div className="flex items-center gap-4">
                    {form.photoPreview ? (
                      <div className="relative">
                        <img
                          src={form.photoPreview}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border shadow"
                        />
                        <button
                          type="button"
                          onClick={clearPhoto}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                          aria-label="លុបរូបភាព"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-2xl">
                        {form.firstname?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <label htmlFor="photo-upload" className="inline-flex items-center px-3 py-2 bg-muted rounded-lg border border-border/50 cursor-pointer hover:bg-muted/70 transition">
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
                      <div className="text-xs text-muted-foreground mt-1">អនុញ្ញាត JPG, PNG, GIF, ≤ 5MB</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Lastname */}
                  <div className="space-y-1">
                    <label htmlFor="lastname" className="text-sm font-semibold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      នាមត្រកូល <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="lastname"
                        name="lastname"
                        value={form.lastname || ""}
                        onChange={handleInput}
                        required
                        className={`h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${!form.lastname && formError ? "border-red-500" : "border-border/50"}`}
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                    {!form.lastname && formError && (
                      <p className="text-xs text-red-600 font-medium">សូមបំពេញនាមត្រកូល</p>
                    )}
                  </div>
                  {/* Firstname */}
                  <div className="space-y-1">
                    <label htmlFor="firstname" className="text-sm font-semibold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      នាមខ្លួន <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="firstname"
                        name="firstname"
                        value={form.firstname || ""}
                        onChange={handleInput}
                        required
                        className={`h-12 pl-10 text-base font-medium border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${!form.firstname && formError ? "border-red-500" : "border-border/50"}`}
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                    {!form.firstname && formError && (
                      <p className="text-xs text-red-600 font-medium">សូមបំពេញនាមខ្លួន</p>
                    )}
                  </div>
                  {/* Username (auto-generated) */}
                  <div className="space-y-1">
                    <label htmlFor="username" className="text-sm font-semibold flex items-center gap-2">
                      <AtSign className="w-4 h-4 text-primary" />
                      ឈ្មោះប្រើប្រាស់
                    </label>
                    <div className="relative">
                      <Input
                        id="username"
                        name="username"
                        value={form.username || ""}
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

              {/* Account Security Section */}
              {!editUser ? (
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">សុវត្ថិភាពគណនី</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="space-y-1">
                      <label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        ពាក្យសម្ងាត់ <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password || ""}
                          onChange={handleInput}
                          required
                          className={`h-12 pl-10 pr-10 text-base font-medium border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${!form.password && formError ? "border-red-500" : "border-border/50"}`}
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                          tabIndex={-1}
                          aria-label={showPassword ? "បិទពាក្យសម្ងាត់" : "បង្ហាញពាក្យសម្ងាត់"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {!form.password && formError && (
                        <p className="text-xs text-red-600 font-medium">សូមបំពេញពាក្យសម្ងាត់</p>
                      )}
                    </div>
                    {/* Verify Password */}
                    <div className="space-y-1">
                      <label htmlFor="verifyPassword" className="text-sm font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="verifyPassword"
                          name="verifyPassword"
                          type={showPassword ? "text" : "password"}
                          value={form.verifyPassword || ""}
                          onChange={handleInput}
                          required
                          className={`h-12 pl-10 pr-10 text-base font-medium border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${form.password !== form.verifyPassword && form.verifyPassword && (formError || passwordError) ? "border-red-500" : "border-border/50"}`}
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      </div>
                      {form.password !== form.verifyPassword && form.verifyPassword && (formError || passwordError) && (
                        <p className="text-xs text-red-600 font-medium">ពាក្យសម្ងាត់មិនត្រូវគ្នា</p>
                      )}
                    </div>
                  </div>
                  {passwordError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-700 font-medium">{passwordError}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">បង្កើត​ពាក្យសម្ងាត់ថ្មី (ស្រេចចិត្ត)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div className="space-y-1">
                      <label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        បង្កើត​ពាក្យសម្ងាត់ថ្មី
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password || ""}
                          onChange={handleInput}
                          className={`h-12 pl-10 pr-10 text-base font-medium border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${form.password && formError ? "border-red-500" : "border-border/50"}`}
                          placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី (ស្រេចចិត្ត)"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                          tabIndex={-1}
                          aria-label={showPassword ? "បិទពាក្យសម្ងាត់" : "បង្ហាញពាក្យសម្ងាត់"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label htmlFor="verifyPassword" className="text-sm font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                      </label>
                      <div className="relative">
                        <Input
                          id="verifyPassword"
                          name="verifyPassword"
                          type={showPassword ? "text" : "password"}
                          value={form.verifyPassword || ""}
                          onChange={handleInput}
                          className={`h-12 pl-10 pr-10 text-base font-medium border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${form.password && form.password !== form.verifyPassword ? "border-red-500" : "border-border/50"}`}
                          placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      </div>
                      {form.password && form.password !== form.verifyPassword && (
                        <p className="text-xs text-red-600 font-medium">ពាក្យសម្ងាត់មិនត្រូវគ្នា</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information Section */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-2">
                <div className="flex items-center space-x-2 mb-4">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">ព័ត៌មានទំនាក់ទំនង</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="phonenumber1" className="text-sm font-semibold text-foreground">
                      លេខទូរស័ព្ទ ១
                    </Label>
                    <Input
                      id="phonenumber1"
                      name="phonenumber1"
                      value={form.phonenumber1 || ""}
                      onChange={handleInput}
                      className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phonenumber2" className="text-sm font-semibold text-foreground">
                      លេខទូរស័ព្ទ ២
                    </Label>
                    <Input
                      id="phonenumber2"
                      name="phonenumber2"
                      value={form.phonenumber2 || ""}
                      onChange={handleInput}
                      className="h-9 text-sm font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Position Section */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">តួនាទី និងមុខតំណែង</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Custom Role Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                      <Shield className="w-4 h-4 text-foreground" />
                      តួនាទី <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative" ref={roleDropdownRef}>
                      <button
                        type="button"
                        className={`h-12 w-full rounded-xl border-2 px-4 text-base font-medium flex items-center justify-between focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-background text-foreground ${!form.role && formError ? 'border-red-500 ring-red-200' : 'border-border/50'} ${roleDropdownOpen ? 'ring-2 ring-primary/30 border-primary' : ''}`}
                        onClick={() => setRoleDropdownOpen((open) => !open)}
                        onKeyDown={e => {
                          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') setRoleDropdownOpen(true);
                          if (e.key === 'Escape') setRoleDropdownOpen(false);
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={roleDropdownOpen}
                      >
                        <span className="flex items-center">
                          {roleOptions.find(opt => opt.value === form.role)?.icon}
                          {roleOptions.find(opt => opt.value === form.role)?.label || 'ជ្រើសរើសតួនាទី'}
                        </span>
                        <ChevronDown className={`ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {roleDropdownOpen && (
                        <div
                          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-fade-in max-h-60 overflow-auto transition-all duration-200"
                          tabIndex={-1}
                          role="listbox"
                        >
                          {roleOptions.map((option, idx) => (
                            <button
                              type="button"
                              key={option.value}
                              className={`w-full flex items-center px-4 py-3 text-left hover:bg-primary/10 focus:bg-primary/10 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${form.role === option.value ? 'bg-primary/10 font-bold' : ''}`}
                              onClick={() => {
                                handleInput({ target: { name: 'role', value: option.value } } as any);
                                setRoleDropdownOpen(false);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleInput({ target: { name: 'role', value: option.value } } as any);
                                  setRoleDropdownOpen(false);
                                }
                              }}
                              role="option"
                              aria-selected={form.role === option.value}
                              tabIndex={0}
                            >
                              {option.icon}
                              <span className="flex-1">{option.label}</span>
                              {form.role === option.value && <Check className="w-4 h-4 text-green-500 ml-2" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!form.role && formError && (
                      <p className="text-xs text-red-600 font-medium">ត្រូវជ្រើសរើសតួនាទី</p>
                    )}
                  </div>
                  {/* Position Input with Custom Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-foreground" />
                      មុខតំណែង
                    </label>
                    <div className="relative" ref={positionDropdownRef}>
                      <input
                        id="position"
                        name="position"
                        value={form.position || ''}
                        onChange={handleInput}
                        onFocus={() => {
                          setPositionDropdownOpen(true);
                          setPositionInputFocus(true);
                        }}
                        onBlur={() => setPositionInputFocus(false)}
                        onKeyDown={e => {
                          if (e.key === 'ArrowDown') {
                            setPositionDropdownOpen(true);
                            setPositionDropdownIndex(idx => Math.min(idx + 1, filteredPositions.length - 1));
                          } else if (e.key === 'ArrowUp') {
                            setPositionDropdownOpen(true);
                            setPositionDropdownIndex(idx => Math.max(idx - 1, 0));
                          } else if (e.key === 'Enter' && positionDropdownOpen && positionDropdownIndex >= 0) {
                            handleInput({ target: { name: 'position', value: filteredPositions[positionDropdownIndex] } } as any);
                            setPositionDropdownOpen(false);
                            setPositionDropdownIndex(-1);
                          } else if (e.key === 'Escape') {
                            setPositionDropdownOpen(false);
                            setPositionDropdownIndex(-1);
                          }
                        }}
                        className="h-12 w-full rounded-xl border-2 px-4 text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-background text-foreground border-border/50 pr-12"
                        placeholder="ជ្រើសរើស ឬ បញ្ចូលមុខតំណែង"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setPositionDropdownOpen(open => !open)}
                        aria-label="បង្ហាញបញ្ជីមុខតំណែង"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${positionDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {positionDropdownOpen && filteredPositions.length > 0 && (
                        <div
                          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-fade-in max-h-60 overflow-auto transition-all duration-200"
                          tabIndex={-1}
                          role="listbox"
                        >
                          {filteredPositions.map((option, idx) => (
                            <button
                              type="button"
                              key={option}
                              className={`w-full flex items-center px-4 py-3 text-left hover:bg-primary/10 focus:bg-primary/10 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${form.position === option ? 'bg-primary/10 font-bold' : ''} ${positionDropdownIndex === idx ? 'bg-primary/20' : ''}`}
                              onClick={() => {
                                handleInput({ target: { name: 'position', value: option } } as any);
                                setPositionDropdownOpen(false);
                                setPositionDropdownIndex(-1);
                              }}
                              onMouseEnter={() => setPositionDropdownIndex(idx)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleInput({ target: { name: 'position', value: option } } as any);
                                  setPositionDropdownOpen(false);
                                  setPositionDropdownIndex(-1);
                                }
                              }}
                              role="option"
                              aria-selected={form.position === option}
                              tabIndex={0}
                            >
                              <ClipboardList className="w-4 h-4 text-primary mr-2" />
                              <span className="flex-1">{option}</span>
                              {form.position === option && <Check className="w-4 h-4 text-green-500 ml-2" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">អាចជ្រើសរើសពីបញ្ជី ឬ បញ្ចូលដោយខ្លួនឯង</p>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700 font-medium">{formError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-9 px-4 text-sm font-semibold hover:bg-muted/50"
                  disabled={loading}
                >
                  បោះបង់
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="h-9 px-4 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {editUser ? "រក្សាទុក" : "បន្ថែម"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
    </Dialog>
  );
}; 