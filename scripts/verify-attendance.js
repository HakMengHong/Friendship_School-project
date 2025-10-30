const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyAttendance() {
  try {
    console.log('\n📊 Verifying Generated Attendance Data...\n')
    
    // Status distribution
    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { recordedBy: 'System' }
    })
    
    const total = stats.reduce((sum, s) => sum + s._count.status, 0)
    
    console.log('📈 Status Distribution:')
    console.log('-'.repeat(50))
    stats.forEach(s => {
      const pct = (s._count.status / total * 100).toFixed(1)
      console.log(`   ${s.status.padEnd(15)} ${s._count.status.toString().padStart(5)} records (${pct}%)`)
    })
    console.log(`   ${'TOTAL'.padEnd(15)} ${total.toString().padStart(5)} records`)
    
    // By month
    console.log('\n📅 By Month:')
    console.log('-'.repeat(50))
    const byMonth = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "attendanceDate") as year,
        EXTRACT(MONTH FROM "attendanceDate") as month,
        COUNT(*) as count
      FROM "Attendance"
      WHERE "recordedBy" = 'System'
      GROUP BY year, month
      ORDER BY year, month
    `
    
    byMonth.forEach(m => {
      const monthName = new Date(m.year, m.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      console.log(`   ${monthName.padEnd(20)} ${m.count.toString().padStart(5)} records`)
    })
    
    // Sample records with reasons
    console.log('\n📝 Sample Records (with reasons):')
    console.log('-'.repeat(50))
    const samples = await prisma.attendance.findMany({
      where: {
        recordedBy: 'System',
        reason: { not: null }
      },
      include: {
        student: true
      },
      take: 10
    })
    
    samples.forEach(s => {
      const date = s.attendanceDate.toISOString().split('T')[0]
      console.log(`   ${date} | ${s.student.lastName} ${s.student.firstName} | ${s.status} | ${s.reason}`)
    })
    
    console.log('\n✅ Verification complete!\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAttendance()

