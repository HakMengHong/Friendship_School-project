const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function addTestUsers() {
  try {
    console.log('🔧 Adding test users...')

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create test users
    const users = [
      {
        username: 'admin',
        password: hashedPassword,
        firstname: 'Admin',
        lastname: 'User',
        role: 'admin',
        status: 'active',
        position: 'System Administrator'
      },
      {
        username: 'teacher1',
        password: hashedPassword,
        firstname: 'Teacher',
        lastname: 'One',
        role: 'teacher',
        status: 'active',
        position: 'Mathematics Teacher'
      },
      {
        username: 'teacher2',
        password: hashedPassword,
        firstname: 'Teacher',
        lastname: 'Two',
        role: 'teacher',
        status: 'active',
        position: 'Science Teacher'
      }
    ]

    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      })

      if (existingUser) {
        console.log(`✅ User ${userData.username} already exists`)
      } else {
        const user = await prisma.user.create({
          data: userData
        })
        console.log(`✅ Created user: ${user.username} (${user.role})`)
      }
    }

    console.log('🎉 Test users added successfully!')
    console.log('\n📋 Test Credentials:')
    console.log('Username: admin, Password: password123')
    console.log('Username: teacher1, Password: password123')
    console.log('Username: teacher2, Password: password123')
    console.log('\n⚠️  Test the failed login functionality by entering wrong passwords 5 times')

  } catch (error) {
    console.error('❌ Error adding test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestUsers()
