import { NextRequest, NextResponse } from 'next/server'
import { generateStudentRegistrationPDF } from '../../../../lib/puppeteer-pdf-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 PDF generation API endpoint called')
    
    // Parse the request body
    const data = await request.json()
    
    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }
    
    console.log('📄 Received data for PDF generation:', Object.keys(data))
    
    // Generate PDF using Puppeteer
    const pdfBuffer = await generateStudentRegistrationPDF(data)
    
    console.log('✅ PDF generated successfully!')
    console.log(`📏 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
    
    // Return the PDF as a response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="student-registration.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('❌ Error in PDF generation API:', error)
    
    return NextResponse.json(
      { 
        error: 'PDF generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
