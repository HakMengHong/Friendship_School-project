const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        firstname: true,
        lastname: true,
        role: true,
        status: true,
        lastLogin: true
      }
    })
    
    console.log('📋 Available Users:')
    console.log('==================')
    
    if (users.length === 0) {
      console.log('No users found in database')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`)
        console.log(`   Name: ${user.firstname} ${user.lastname}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Status: ${user.status}`)
        console.log(`   Last Login: ${user.lastLogin || 'Never'}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()


