import puppeteer from 'puppeteer'

/*
 * Puppeteer PDF Generator for Perfect Khmer Font Support
 * 
 * This approach uses Puppeteer to render HTML with proper fonts
 * and then convert to PDF, ensuring perfect Khmer text display.
 * 
 * ✅ Perfect Khmer font rendering
 * ✅ Professional PDF layout
 * ✅ Better control over styling
 * ✅ Consistent output across platforms
 */

export interface StudentData {
  lastName: string
  firstName: string
  gender: string
  dob: string
  age: string
  class: string
  studentId: string
  phone: string
  emergencyContact: string
  studentHouseNumber: string
  studentVillage: string
  studentDistrict: string
  studentProvince: string
  studentBirthDistrict: string
  previousSchool: string
  transferReason: string
  vaccinated: boolean
  schoolYear: string
  needsClothes: boolean
  needsMaterials: boolean
  needsTransport: boolean
  guardians: Array<{
    firstName: string
    lastName: string
    relation: string
    phone: string
    occupation: string
    income: string
  }>
  familyInfo: {
    livingWith: string
    ownHouse: boolean
    durationInKPC: string
    livingCondition: string
    religion: string
    churchName: string
  }
}

// Function to get grade label with Khmer text
export const getGradeLabel = (grade: string): string => {
  if (!grade) return 'មិនមាន'
  const gradeMap: { [key: string]: string } = {
    '1': 'ថ្នាក់ទី 1', '2': 'ថ្នាក់ទី 2', 
    '3': 'ថ្នាក់ទី 3', '4': 'ថ្នាក់ទី 4',
    '5': 'ថ្នាក់ទី 5', '6': 'ថ្នាក់ទី 6', 
    '7': 'ថ្នាក់ទី 7', '8': 'ថ្នាក់ទី 8',
    '9': 'ថ្នាក់ទី 9', '10': 'ថ្នាក់ទី 10', 
    '11': 'ថ្នាក់ទី 11', '12': 'ថ្នាក់ទី 12'
  }
  return gradeMap[grade] || `ថ្នាក់ទី ${grade}`
}

// Function to generate HTML content for PDF
export const generateStudentRegistrationHTML = (data: StudentData): string => {
  const html = `
<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Registration Form</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans Khmer', 'Khmer OS', 'Khmer OS System', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .school-name {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .form-title {
            font-size: 24px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
        }
        
        .form-subtitle {
            font-size: 16px;
            color: #6b7280;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            background: #f3f4f6;
            padding: 10px 15px;
            border-left: 4px solid #2563eb;
            margin-bottom: 15px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
            display: block;
            font-size: 14px;
        }
        
        .value {
            padding: 8px 12px;
            background: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            min-height: 20px;
            font-size: 14px;
            color: #111827;
        }
        
        .guardian-section {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .guardian-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="school-name">សាលាមិត្តភាព</div>
        <div class="form-title">ទម្រង់ចុះឈ្មោះសិស្ស</div>
        <div class="form-subtitle">Student Registration Form</div>
    </div>

    <div class="section">
        <div class="section-title">ព័ត៌មានផ្ទាល់ខ្លួន / Personal Information</div>
        <div class="form-grid">
            <div class="form-group">
                <div class="label">នាមត្រកូល / Last Name</div>
                <div class="value">${data.lastName || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">នាមខ្លួន / First Name</div>
                <div class="value">${data.firstName || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ភេទ / Gender</div>
                <div class="value">${data.gender || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ថ្ងៃខែឆ្នាំកំណើត / Date of Birth</div>
                <div class="value">${data.dob || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">អាយុ / Age</div>
                <div class="value">${data.age || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ថ្នាក់ / Class</div>
                <div class="value">${getGradeLabel(data.class)}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">ព័ត៌មានការចុះឈ្មោះ / Registration Information</div>
        <div class="form-grid">
            <div class="form-group">
                <div class="label">លេខសិស្ស / Student ID</div>
                <div class="value">${data.studentId || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">លេខទូរស័ព្ទ / Phone Number</div>
                <div class="value">${data.phone || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">លេខទូរស័ព្ទអាសន្ន / Emergency Contact</div>
                <div class="value">${data.emergencyContact || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ឆ្នាំសិក្សា / School Year</div>
                <div class="value">${data.schoolYear || 'មិនមាន'}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">អាសយដ្ឋាន / Address</div>
        <div class="form-grid">
            <div class="form-group">
                <div class="label">លេខផ្ទះ / House Number</div>
                <div class="value">${data.studentHouseNumber || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ភូមិ / Village</div>
                <div class="value">${data.studentVillage || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ស្រុក / District</div>
                <div class="value">${data.studentDistrict || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ខេត្ត / Province</div>
                <div class="value">${data.studentProvince || 'មិនមាន'}</div>
            </div>
        </div>
    </div>

    ${data.guardians && data.guardians.length > 0 ? `
    <div class="section">
        <div class="section-title">អាណាព្យាបាទ / Guardians</div>
        ${data.guardians.map((guardian, index) => `
        <div class="guardian-section">
            <div class="guardian-title">អាណាព្យាបាទ ${index + 1} / Guardian ${index + 1}</div>
            <div class="form-grid">
                <div class="form-group">
                    <div class="label">នាមត្រកូល / Last Name</div>
                    <div class="value">${guardian.lastName || 'មិនមាន'}</div>
                </div>
                <div class="form-group">
                    <div class="label">នាមខ្លួន / First Name</div>
                    <div class="value">${guardian.firstName || 'មិនមាន'}</div>
                </div>
                <div class="form-group">
                    <div class="label">ទំនាក់ទំនង / Relation</div>
                    <div class="value">${guardian.relation || 'មិនមាន'}</div>
                </div>
                <div class="form-group">
                    <div class="label">លេខទូរស័ព្ទ / Phone</div>
                    <div class="value">${guardian.phone || 'មិនមាន'}</div>
                </div>
                <div class="form-group">
                    <div class="label">មុខរបរ / Occupation</div>
                    <div class="value">${guardian.occupation || 'មិនមាន'}</div>
                </div>
                <div class="form-group">
                    <div class="label">ចំណូល / Income</div>
                    <div class="value">${guardian.income || 'មិនមាន'}</div>
                </div>
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">ព័ត៌មានបន្ថែម / Additional Information</div>
        <div class="form-grid">
            <div class="form-group">
                <div class="label">អតីតសាលា / Previous School</div>
                <div class="value">${data.previousSchool || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">មូលហេតុផ្លាស់ប្តូរ / Transfer Reason</div>
                <div class="value">${data.transferReason || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ថ្ងៃខែឆ្នាំកំណើត / Birth District</div>
                <div class="value">${data.studentBirthDistrict || 'មិនមាន'}</div>
            </div>
            <div class="form-group">
                <div class="label">ចាក់វ៉ាក់សាំង / Vaccinated</div>
                <div class="value">${data.vaccinated ? 'បាន / Yes' : 'មិនទាន់ / No'}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">តម្រូវការ / Needs Assessment</div>
        <div class="form-grid">
            <div class="form-group">
                <div class="label">ត្រូវការសម្លៀកបំពាក់ / Needs Clothes</div>
                <div class="value">${data.needsClothes ? 'បាទ / Yes' : 'ទេ / No'}</div>
            </div>
            <div class="form-group">
                <div class="label">ត្រូវការសម្ភារៈ / Needs Materials</div>
                <div class="value">${data.needsMaterials ? 'បាទ / Yes' : 'ទេ / No'}</div>
            </div>
            <div class="form-group">
                <div class="label">ត្រូវការការដឹកជញ្ជូន / Needs Transport</div>
                <div class="value">${data.needsTransport ? 'បាទ / Yes' : 'ទេ / No'}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>ទម្រង់នេះត្រូវបានបង្កើតឡើងនៅក្នុងប្រព័ន្ធគ្រប់គ្រងសាលា</p>
        <p>This form was generated by the School Management System</p>
        <p>Generated on: ${new Date().toLocaleDateString('km-KH')} - ${new Date().toLocaleTimeString('km-KH')}</p>
    </div>
</body>
</html>
  `
  return html
}

// Function to generate PDF using Puppeteer
export const generateStudentRegistrationPDF = async (data: StudentData): Promise<Uint8Array> => {
  try {
    console.log('🚀 Starting Puppeteer PDF generation...')
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    console.log('🌐 Browser launched successfully')
    
    // Create new page
    const page = await browser.newPage()
    
    // Generate HTML content
    const htmlContent = generateStudentRegistrationHTML(data)
    
    // Set content and wait for fonts to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    console.log('📄 HTML content loaded, waiting for fonts...')
    
    // Wait a bit more for fonts to fully load
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    console.log('✅ PDF generated successfully with Puppeteer!')
    console.log(`📏 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
    
    // Close browser
    await browser.close()
    
    return pdfBuffer
    
  } catch (error) {
    console.error('❌ Error generating PDF with Puppeteer:', error)
    throw new Error(`PDF generation failed: ${error}`)
  }
}

// Function to save PDF to file (for testing)
export const saveStudentRegistrationPDF = async (data: StudentData, filename: string = 'student-registration.pdf'): Promise<Uint8Array> => {
  try {
    const pdfBuffer = await generateStudentRegistrationPDF(data)
    
    // In a browser environment, we'll trigger download
    // In Node.js, we could save to file system
    console.log('💾 PDF ready for download:', filename)
    
    return pdfBuffer
  } catch (error) {
    console.error('❌ Error saving PDF:', error)
    throw error
  }
}
