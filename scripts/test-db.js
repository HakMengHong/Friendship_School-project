const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`📊 Total users in database: ${userCount}`)
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true,
        status: true
      }
    })
    
    console.log('\n👥 Users in database:')
    users.forEach(user => {
      console.log(`  - ${user.firstname} ${user.lastname} (${user.username}) - ${user.role} - ${user.status}`)
    })
    
    // Test password hashing
    const bcrypt = require('bcryptjs')
    const testPassword = 'password'
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    console.log('\n🔐 Password hashing test:')
    console.log(`  Original: ${testPassword}`)
    console.log(`  Hashed: ${hashedPassword}`)
    console.log(`  Verification: ${await bcrypt.compare(testPassword, hashedPassword)}`)
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase() 