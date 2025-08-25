import { NextRequest, NextResponse } from 'next/server'
import { PDFManager } from '@/lib/pdf-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'list':
        const pdfs = await PDFManager.listPDFs()
        return NextResponse.json({ 
          success: true, 
          data: pdfs,
          count: pdfs.length 
        })
        
      case 'stats':
        const stats = await PDFManager.getStorageStats()
        return NextResponse.json({ 
          success: true, 
          data: stats 
        })
        
      case 'cleanup':
        const daysOld = parseInt(searchParams.get('days') || '30')
        const deletedCount = await PDFManager.cleanupOldPDFs(daysOld)
        return NextResponse.json({ 
          success: true, 
          deletedCount,
          message: `Cleaned up ${deletedCount} old PDF files` 
        })
        
      default:
        // Return both list and stats by default
        const [pdfFiles, storageStats] = await Promise.all([
          PDFManager.listPDFs(),
          PDFManager.getStorageStats()
        ])
        
        return NextResponse.json({ 
          success: true, 
          data: {
            pdfs: pdfFiles,
            stats: storageStats
          }
        })
    }
    
  } catch (error) {
    console.error('Error in PDF exports API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
