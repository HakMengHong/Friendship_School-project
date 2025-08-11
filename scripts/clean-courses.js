const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanCourses() {
  try {
    console.log('🔄 Starting course data cleanup...')
    
    // First, check how many courses exist
    const courseCount = await prisma.course.count()
    console.log(`📊 Found ${courseCount} existing courses`)
    
    if (courseCount === 0) {
      console.log('✅ No courses to delete. Database is already clean.')
      return
    }
    
    // Delete all courses
    console.log('🗑️  Deleting all courses...')
    const deleteResult = await prisma.course.deleteMany({})
    
    console.log(`✅ Successfully deleted ${deleteResult.count} courses`)
    
    // Verify deletion
    const remainingCourses = await prisma.course.count()
    console.log(`📊 Remaining courses: ${remainingCourses}`)
    
    if (remainingCourses === 0) {
      console.log('🎉 Course cleanup completed successfully!')
    } else {
      console.log('⚠️  Some courses may still exist. Check database manually.')
    }
    
  } catch (error) {
    console.error('❌ Error during course cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanCourses()
  .then(() => {
    console.log('🏁 Script execution completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
