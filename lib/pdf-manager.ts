import fs from 'fs'
import path from 'path'

export interface PDFFile {
  filename: string
  fullPath: string
  size: number
  created: Date
  studentName: string
  studentId: string
}

export class PDFManager {
  private static exportsDir = path.join(process.cwd(), 'public', 'pdf-exports')

  /**
   * Get all PDF files in the exports directory
   */
  static async listPDFs(): Promise<PDFFile[]> {
    try {
      if (!fs.existsSync(this.exportsDir)) {
        return []
      }

      const files = fs.readdirSync(this.exportsDir)
      const pdfFiles: PDFFile[] = []

      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const fullPath = path.join(this.exportsDir, file)
          const stats = fs.statSync(fullPath)
          
          // Parse filename to extract student info
          const studentInfo = this.parseFilename(file)
          
          pdfFiles.push({
            filename: file,
            fullPath,
            size: stats.size,
            created: stats.birthtime,
            studentName: studentInfo.studentName,
            studentId: studentInfo.studentId
          })
        }
      }

      // Sort by creation date (newest first)
      return pdfFiles.sort((a, b) => b.created.getTime() - a.created.getTime())
    } catch (error) {
      console.error('Error listing PDFs:', error)
      return []
    }
  }

  /**
   * Parse filename to extract student information
   */
  private static parseFilename(filename: string): { studentName: string; studentId: string } {
    try {
      // Format: student-registration-{studentId}-{studentName}-{timestamp}.pdf
      const parts = filename.replace('.pdf', '').split('-')
      
      if (parts.length >= 4) {
        const studentId = parts[2] || 'Unknown'
        const studentName = parts.slice(3, -1).join('-') || 'Unknown'
        return { studentName, studentId }
      }
      
      return { studentName: 'Unknown', studentId: 'Unknown' }
    } catch (error) {
      return { studentName: 'Unknown', studentId: 'Unknown' }
    }
  }

  /**
   * Get a specific PDF file
   */
  static async getPDF(filename: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.exportsDir, filename)
      
      if (!fs.existsSync(filePath)) {
        return null
      }

      return fs.readFileSync(filePath)
    } catch (error) {
      console.error('Error reading PDF:', error)
      return null
    }
  }

  /**
   * Delete a specific PDF file
   */
  static async deletePDF(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.exportsDir, filename)
      
      if (!fs.existsSync(filePath)) {
        return false
      }

      fs.unlinkSync(filePath)
      return true
    } catch (error) {
      console.error('Error deleting PDF:', error)
      return false
    }
  }

  /**
   * Clean up old PDF files (older than specified days)
   */
  static async cleanupOldPDFs(daysOld: number = 30): Promise<number> {
    try {
      const files = await this.listPDFs()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      
      let deletedCount = 0
      
      for (const file of files) {
        if (file.created < cutoffDate) {
          if (await this.deletePDF(file.filename)) {
            deletedCount++
          }
        }
      }
      
      return deletedCount
    } catch (error) {
      console.error('Error cleaning up PDFs:', error)
      return 0
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    averageSize: number
  }> {
    try {
      const files = await this.listPDFs()
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      
      return {
        totalFiles: files.length,
        totalSize,
        averageSize: files.length > 0 ? Math.round(totalSize / files.length) : 0
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return { totalFiles: 0, totalSize: 0, averageSize: 0 }
    }
  }
}
