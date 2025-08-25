import { NextRequest, NextResponse } from 'next/server'
import { PDFManager } from '@/lib/pdf-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    const pdfBuffer = await PDFManager.getPDF(filename)
    
    if (!pdfBuffer) {
      return NextResponse.json(
        { error: 'PDF file not found' },
        { status: 404 }
      )
    }
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('Error downloading PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to download PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    const deleted = await PDFManager.deletePDF(filename)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'PDF file not found or could not be deleted' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `PDF file "${filename}" deleted successfully`
    })
    
  } catch (error) {
    console.error('Error deleting PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
