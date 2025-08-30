'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface StudentFilterPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSchoolYear: string;
  setSelectedSchoolYear: (year: string) => void;
  selectedClass: string;
  setSelectedClass: (class_: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  schoolYears: Array<{ schoolYearId: number; schoolYearCode: string }>;
  classes: string[];
  clearFilters: () => void;
}

export const StudentFilterPanel = ({
  searchTerm,
  setSearchTerm,
  selectedSchoolYear,
  setSelectedSchoolYear,
  selectedClass,
  setSelectedClass,
  selectedStatus,
  setSelectedStatus,
  schoolYears,
  classes,
  clearFilters,
}: StudentFilterPanelProps) => {
  const hasActiveFilters = selectedSchoolYear || selectedClass || selectedStatus || searchTerm;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          ត្រងសិស្ស (Student Filters)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ... (Search by name or phone...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* School Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ឆ្នាំសិក្សា (School Year)</label>
            <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា (Select school year)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់ (All)</SelectItem>
                {schoolYears.map((year) => (
                  <SelectItem key={year.schoolYearId} value={year.schoolYearCode}>
                    {year.schoolYearCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ថ្នាក់ (Class)</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើសថ្នាក់ (Select class)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់ (All)</SelectItem>
                {classes.map((class_) => (
                  <SelectItem key={class_} value={class_}>
                    {class_}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ស្ថានភាព (Status)</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="ជ្រើសរើសស្ថានភាព (Select status)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់ (All)</SelectItem>
                <SelectItem value="active">សកម្ម (Active)</SelectItem>
                <SelectItem value="inactive">អសកម្ម (Inactive)</SelectItem>
                <SelectItem value="graduated">បញ្ចប់ការសិក្សា (Graduated)</SelectItem>
                <SelectItem value="transferred">បានផ្លាស់ទី (Transferred)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              លុបតម្រង (Clear Filters)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
