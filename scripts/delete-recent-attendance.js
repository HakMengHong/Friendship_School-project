const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteRecentAttendance() {
  try {
    console.log('\n🗑️  Deleting recent attendance records...\n')
    
    // Count before deletion
    const countBefore = await prisma.attendance.count()
    console.log(`📊 Current attendance records: ${countBefore}`)
    
    // Delete attendance records created by the auto-generation script
    const result = await prisma.attendance.deleteMany({
      where: {
        recordedBy: 'System'
      }
    })
    
    console.log(`\n✅ Deleted ${result.count} attendance record(s) created by System`)
    
    // Count after deletion
    const countAfter = await prisma.attendance.count()
    console.log(`📊 Remaining attendance records: ${countAfter}\n`)
    
  } catch (error) {
    console.error('❌ Error deleting attendance:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteRecentAttendance()

