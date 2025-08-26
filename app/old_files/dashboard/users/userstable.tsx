import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, Info, Trash2, Search } from "lucide-react";

export interface User {
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

interface UsersTableProps {
  users: User[];
  loading: boolean;
  statusLoading: number | null;
  onEdit: (user: User) => void;
  onViewDetails: (user: User) => void;
  onDelete: (id: number) => void;
  search: string;
  setSearch: (s: string) => void;
}

const getPhotoUrl = (photo?: string) => {
  if (!photo) return undefined;
  if (photo.startsWith('http') || photo.startsWith('blob:') || photo.startsWith('/')) return photo;
  // If it's just a filename, assume it's in /uploads/ (change if your path is different)
  return `/uploads/${photo}`;
};

const UsersTable: React.FC<UsersTableProps> = ({ users, loading, statusLoading, onEdit, onViewDetails, onDelete, search, setSearch }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow border bg-card">
      <Table>
        <TableCaption>បញ្ជីអ្នកប្រើប្រាស់ទាំងអស់</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ឈ្មោះ</TableHead>
            <TableHead>លេខទូរស័ព្ទ</TableHead>
            <TableHead>តួនាទី</TableHead>
            <TableHead>មុខតំណែង</TableHead>
            <TableHead>ស្ថានភាព</TableHead>
            <TableHead>ចូលចុងក្រោយ</TableHead>
            <TableHead>សកម្មភាព</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary inline-block mr-2"></span>
                កំពុងផ្ទុក...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p>មិនមានអ្នកប្រើប្រាស់</p>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.userid} className="hover:bg-muted/40 transition">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.photo ? (
                      <img
                        src={getPhotoUrl(user.photo)}
                        alt={user.firstname}
                        className="w-9 h-9 rounded-full object-cover border shadow"
                        onError={e => (e.currentTarget.src = "/placeholder-user.jpg")}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm">
                        {user.firstname?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="font-medium">{user.lastname} {user.firstname}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{user.phonenumber1 || "-"}</div>
                    {user.phonenumber2 && <div className="text-muted-foreground">{user.phonenumber2}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"}>
                    {user.role === "admin" ? "អ្នកគ្រប់គ្រង" : "គ្រូបង្រៀន"}
                  </Badge>
                </TableCell>
                <TableCell>{user.position || "-"}</TableCell>
                <TableCell>
                  <Badge className={user.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                    {user.status === "active" ? "ដំណើរការ" : "បិទដំណើរការ"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="soft"
                      onClick={() => onEdit(user)}
                      className="h-8 w-8"
                      aria-label="កែប្រែ"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onViewDetails(user)}
                      className="h-8 w-8"
                      aria-label="មើលព័ត៌មានលម្អិត"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onDelete(user.userid)}
                      className="h-8 w-8"
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
  );
};

export default UsersTable; 