import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf-generators/pdf-manager'
import { ReportType } from '@/lib/pdf-generators/types'

export async function POST(request: NextRequest) {
  try {
    const { reportType, data, options } = await request.json()
    
    console.log('📄 Generating PDF for report type:', reportType)
    
    // Validate report type
    if (!reportType || !Object.values(ReportType).includes(reportType)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Generate PDF using the new system
    const result = await generatePDF(reportType as ReportType, data, options)
    
    console.log('✅ PDF generated successfully:', result.filename)
    
    // Create a safe filename for the response (ASCII only)
    const safeFilename = result.filename.replace(/[^\x00-\x7F]/g, '') || 'report.pdf'
    
    // Return the PDF buffer with proper headers
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': result.buffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error)
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
