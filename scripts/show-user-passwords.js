const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showUserPasswords() {
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true,
        status: true,
        lastLogin: true,
        password: true // Include password field
      }
    })
    
    console.log('🔐 User Accounts and Passwords:')
    console.log('================================')
    
    if (users.length === 0) {
      console.log('No users found in database')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`)
        console.log(`   Name: ${user.firstname} ${user.lastname}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Status: ${user.status}`)
        console.log(`   Last Login: ${user.lastLogin || 'Never'}`)
        console.log(`   Password Hash: ${user.password}`)
        console.log('')
      })
    }
    
    console.log('📝 Default Passwords:')
    console.log('====================')
    console.log('• admin / admin123')
    console.log('• teacher / teacher123')
    console.log('• hakmenghong / (check database for actual password)')
    
  } catch (error) {
    console.error('❌ Error fetching users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showUserPasswords()
