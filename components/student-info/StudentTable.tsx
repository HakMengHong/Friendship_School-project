'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  GraduationCap
} from "lucide-react";
import { format } from "date-fns";

interface Student {
  studentId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | Date;
  class: string;
  photo?: string;
  phone?: string;
  registrationDate?: string | Date;
  status?: string;
  religion?: string;
  health?: string;
  emergencyContact?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  classId?: number;
  needsClothes?: boolean;
  needsMaterials?: boolean;
  needsTransport?: boolean;
  previousSchool?: string;
  registerToStudy?: boolean;
  studentBirthDistrict?: string;
  studentDistrict?: string;
  studentHouseNumber?: string;
  studentProvince?: string;
  studentVillage?: string;
  transferReason?: string;
  vaccinated?: boolean;
  schoolYear?: string;
}

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentTable = ({ 
  students, 
  loading, 
  onViewStudent, 
  onEditStudent 
}: StudentTableProps) => {
  const [sortField, setSortField] = useState<keyof Student>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    return 0;
  });

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">សកម្ម</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">អសកម្ម</Badge>;
      case 'graduated':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">បញ្ចប់ការសិក្សា</Badge>;
      case 'transferred':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">បានផ្លាស់ទី</Badge>;
      default:
        return <Badge variant="outline">មិនដឹង</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">កំពុងផ្ទុក... (Loading...)</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">គ្មានសិស្ស (No Students)</h3>
            <p className="text-muted-foreground">គ្មានសិស្សត្រូវបានរកឃើញ (No students found)</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>បញ្ជីសិស្ស (Student List)</span>
          <span className="text-sm text-muted-foreground">
            សរុប: {students.length} នាក់ (Total: {students.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>សិស្ស (Student)</TableHead>
                <TableHead>ថ្នាក់ (Class)</TableHead>
                <TableHead>ឆ្នាំសិក្សា (School Year)</TableHead>
                <TableHead>ស្ថានភាព (Status)</TableHead>
                <TableHead>កាលបរិច្ឆេទចុះឈ្មោះ (Registration Date)</TableHead>
                <TableHead className="text-right">សកម្មភាព (Actions)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.photo} alt={`${student.firstName} ${student.lastName}`} />
                        <AvatarFallback>
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {student.phone || 'គ្មានលេខទូរស័ព្ទ (No phone)'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.class}</Badge>
                  </TableCell>
                  <TableCell>
                    {student.schoolYear || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(student.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(student.registrationDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewStudent(student)}>
                          <Eye className="mr-2 h-4 w-4" />
                          មើល (View)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditStudent(student)}>
                          <Edit className="mr-2 h-4 w-4" />
                          កែប្រែ (Edit)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
