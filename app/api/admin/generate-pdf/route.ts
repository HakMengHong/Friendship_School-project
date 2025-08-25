import { NextRequest, NextResponse } from 'next/server'
import { generateStudentRegistrationPDF } from '@/lib/puppeteer-pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('📄 Generating PDF for student:', data.firstName, data.lastName)
    
    const result = await generateStudentRegistrationPDF(data)
    
    console.log('✅ PDF generated successfully:', result.filename)
    
    // Return the PDF buffer with proper headers
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
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
