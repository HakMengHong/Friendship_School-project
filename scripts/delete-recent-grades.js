const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteRecentGrades() {
  console.log('🗑️  Deleting recently created grades...')
  
  try {
    // Delete grades created today for grades 5, 7, 9 (the ones we just created incorrectly)
    const result = await prisma.grade.deleteMany({
      where: {
        gradeDate: {
          in: ['11/25', '12/25', '01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26']
        },
        course: {
          grade: {
            in: ['5', '7', '9']
          }
        }
      }
    })
    
    console.log(`✅ Deleted ${result.count} grades`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteRecentGrades()

