/*
 * Script: Update Attendance.semesterId based on attendanceDate
 * Mapping:
 *   - Months 9-12 (Sep-Dec)  -> semesterId = 1
 *   - Months 1-6  (Jan-Jun)  -> semesterId = 2
 *   - Months 7-8  (Jul-Aug)  -> left as NULL (skipped)
 *
 * Usage:
 *   node scripts/update-attendance-semesterId.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating Attendance.semesterId based on attendanceDate...')

  // Resolve known semester IDs (assumes semesterId 1 = S1, 2 = S2)
  // If the DB uses different IDs, adjust here or resolve dynamically by semesterCode
  let s1Id = 1
  let s2Id = 2

  try {
    const s1 = await prisma.semester.findFirst({ where: { OR: [{ semesterCode: 'S1' }, { semester: { contains: '1' } }] } })
    const s2 = await prisma.semester.findFirst({ where: { OR: [{ semesterCode: 'S2' }, { semester: { contains: '2' } }] } })
    if (s1 && s2) {
      s1Id = s1.semesterId
      s2Id = s2.semesterId
    }
  } catch (e) {
    // Fallback to defaults
  }

  const pageSize = 500
  let totalUpdated = 0
  let totalSkipped = 0
  let cursor = undefined

  while (true) {
    const batch = await prisma.attendance.findMany({
      where: { semesterId: null },
      orderBy: { attendanceId: 'asc' },
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { attendanceId: cursor } } : {})
    })

    if (batch.length === 0) break

    for (const record of batch) {
      const date = new Date(record.attendanceDate)
      if (Number.isNaN(date.getTime())) {
        totalSkipped++
        continue
      }
      const month = date.getMonth() + 1
      let targetSemesterId = null
      if (month >= 9 && month <= 12) targetSemesterId = s1Id
      else if (month >= 1 && month <= 6) targetSemesterId = s2Id
      else targetSemesterId = null // Jul-Aug: skip

      if (targetSemesterId) {
        await prisma.attendance.update({
          where: { attendanceId: record.attendanceId },
          data: { semesterId: targetSemesterId }
        })
        totalUpdated++
      } else {
        totalSkipped++
      }
      cursor = record.attendanceId
    }
  }

  console.log(`✅ Done. Updated: ${totalUpdated}, Skipped: ${totalSkipped}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


