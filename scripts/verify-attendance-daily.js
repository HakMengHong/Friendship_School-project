const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyAttendance() {
  console.log('\n📊 Verifying Generated Attendance Data...\n')
  
  // Get all System-generated attendance
  const records = await prisma.attendance.findMany({
    where: { recordedBy: 'System' },
    include: { student: true },
    orderBy: { attendanceDate: 'asc' }
  })
  
  // Status distribution
  const statusCounts = {
    'absent': 0,
    'late': 0,
    'excused': 0,
    'present': 0
  }
  
  // Session distribution
  const sessionCounts = {
    'AM': 0,
    'PM': 0,
    'FULL': 0
  }
  
  // Count by month
  const monthCounts = {}
  
  records.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
    sessionCounts[r.session] = (sessionCounts[r.session] || 0) + 1
    
    const monthKey = r.attendanceDate.toISOString().substring(0, 7)
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
  })
  
  const total = records.length
  
  // Print status distribution
  console.log('📈 Status Distribution:')
  console.log('--------------------------------------------------')
  for (const [status, count] of Object.entries(statusCounts)) {
    if (count > 0) {
      const percent = ((count / total) * 100).toFixed(1)
      console.log(`   ${status.padEnd(15)} ${count.toString().padStart(6)} records (${percent}%)`)
    }
  }
  console.log(`   ${'TOTAL'.padEnd(15)} ${total.toString().padStart(6)} records`)
  
  // Print session distribution
  console.log('\n📅 Session Distribution:')
  console.log('--------------------------------------------------')
  for (const [session, count] of Object.entries(sessionCounts)) {
    if (count > 0) {
      const percent = ((count / total) * 100).toFixed(1)
      console.log(`   ${session.padEnd(15)} ${count.toString().padStart(6)} records (${percent}%)`)
    }
  }
  
  // Print by month
  console.log('\n📅 By Month:')
  console.log('--------------------------------------------------')
  const sortedMonths = Object.keys(monthCounts).sort()
  for (const month of sortedMonths) {
    const date = new Date(month + '-01')
    const monthName = date.toLocaleString('en-US', { year: 'numeric', month: 'long' })
    console.log(`   ${monthName.padEnd(25)} ${monthCounts[month].toString().padStart(6)} records`)
  }
  
  // Sample records
  console.log('\n📝 Sample Records (with reasons):')
  console.log('--------------------------------------------------')
  const samples = records.slice(0, 10)
  for (const r of samples) {
    const dateStr = r.attendanceDate.toISOString().split('T')[0]
    const studentName = `${r.student.lastName} ${r.student.firstName}`
    console.log(`   ${dateStr} | ${r.session.padEnd(4)} | ${studentName.padEnd(20)} | ${r.status.padEnd(7)} | ${r.reason || '-'}`)
  }
  
  console.log('\n✅ Verification complete!')
  
  await prisma.$disconnect()
}

verifyAttendance()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })

