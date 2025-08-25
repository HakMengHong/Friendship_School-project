'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Trash2, RefreshCw, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface PDFFile {
  filename: string
  fullPath: string
  size: number
  created: Date
  studentName: string
  studentId: string
}

interface StorageStats {
  totalFiles: number
  totalSize: number
  averageSize: number
}

export default function PDFExportsPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([])
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/pdf-exports')
      const result = await response.json()
      
      if (result.success) {
        setPdfs(result.data.pdfs || [])
        setStats(result.data.stats || null)
      } else {
        toast.error('Failed to load PDF exports')
      }
    } catch (error) {
      toast.error('Error loading PDF exports')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const downloadPDF = async (filename: string) => {
    try {
      const response = await fetch(`/api/admin/pdf-exports/${encodeURIComponent(filename)}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('PDF downloaded successfully')
      } else {
        toast.error('Failed to download PDF')
      }
    } catch (error) {
      toast.error('Error downloading PDF')
      console.error('Error:', error)
    }
  }

  const deletePDF = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pdf-exports/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('PDF deleted successfully')
        await refreshData()
      } else {
        toast.error('Failed to delete PDF')
      }
    } catch (error) {
      toast.error('Error deleting PDF')
      console.error('Error:', error)
    }
  }

  const cleanupOldPDFs = async () => {
    if (!confirm('Are you sure you want to delete PDFs older than 30 days?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/pdf-exports?action=cleanup&days=30')
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Cleaned up ${result.deletedCount} old PDF files`)
        await refreshData()
      } else {
        toast.error('Failed to cleanup old PDFs')
      }
    } catch (error) {
      toast.error('Error cleaning up old PDFs')
      console.error('Error:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading PDF exports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PDF Exports Management</h1>
          <p className="text-muted-foreground">Manage and organize your generated PDF files</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={cleanupOldPDFs} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Old
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Size</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.averageSize)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>PDF Files ({pdfs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pdfs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No PDF files found</p>
              <p className="text-sm text-muted-foreground">Generated PDFs will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdfs.map((pdf) => (
                  <TableRow key={pdf.filename}>
                    <TableCell>
                      <div className="font-medium">{pdf.studentName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pdf.studentId}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={pdf.filename}>
                        {pdf.filename}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(pdf.size)}</TableCell>
                    <TableCell>{formatDate(pdf.created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPDF(pdf.filename)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePDF(pdf.filename)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
