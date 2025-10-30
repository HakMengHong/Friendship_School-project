/**
 * Script to seed initial activity logs for testing
 * Run with: node scripts/seed-activity-logs.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedActivityLogs() {
  console.log('🌱 Seeding activity logs...')

  try {
    // Get the first admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.error('❌ No admin user found. Please create a user first.')
      return
    }

    console.log(`✅ Found admin user: ${adminUser.firstname} ${adminUser.lastname}`)

    // Sample activity logs
    const activityLogs = [
      {
        userId: adminUser.userId,
        action: 'ចូលប្រើប្រាស់ប្រព័ន្ធ',
        details: `${adminUser.lastname} ${adminUser.firstname}`,
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      {
        userId: adminUser.userId,
        action: 'កត់ត្រាវត្តមាន',
        details: 'កត់ត្រាវត្តមានសិស្សថ្នាក់ទី១',
        timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
      },
      {
        userId: adminUser.userId,
        action: 'បញ្ចូលពិន្ទុ',
        details: 'បញ្ចូលពិន្ទុគណិតវិទ្យា',
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      },
      {
        userId: adminUser.userId,
        action: 'បន្ថែមសិស្សថ្មី',
        details: 'បន្ថែមសិស្សថ្មីចូលថ្នាក់',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        userId: adminUser.userId,
        action: 'កែប្រែព័ត៌មានសិស្ស',
        details: 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានសិស្ស',
        timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
      }
    ]

    // Create activity logs
    for (const log of activityLogs) {
      await prisma.activityLog.create({
        data: log
      })
      console.log(`✅ Created activity log: ${log.action}`)
    }

    console.log('✅ Successfully seeded activity logs!')
  } catch (error) {
    console.error('❌ Error seeding activity logs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedActivityLogs()

