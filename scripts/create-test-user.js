const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        firstname: 'Admin',
        lastname: 'User',
        role: 'admin',
        position: 'System Administrator',
        status: 'active',
        phonenumber1: '012345678',
        avatar: 'AU'
      }
    })
    
    console.log('✅ Admin user created successfully:')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('User ID:', adminUser.userId)
    
    // Create teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    const teacherUser = await prisma.user.create({
      data: {
        username: 'teacher',
        password: teacherPassword,
        firstname: 'John',
        lastname: 'Teacher',
        role: 'teacher',
        position: 'Class Teacher',
        status: 'active',
        phonenumber1: '098765432',
        avatar: 'JT'
      }
    })
    
    console.log('\n✅ Teacher user created successfully:')
    console.log('Username: teacher')
    console.log('Password: teacher123')
    console.log('User ID:', teacherUser.userId)
    
  } catch (error) {
    console.error('❌ Error creating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
