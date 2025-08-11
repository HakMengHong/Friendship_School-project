const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanCoursesAdvanced(options = {}) {
  const {
    deleteRelatedGrades = false,
    deleteRelatedEnrollments = false,
    dryRun = false,
    confirm = false
  } = options

  try {
    console.log('🔄 Starting advanced course data cleanup...')
    console.log('📋 Options:', {
      deleteRelatedGrades,
      deleteRelatedEnrollments,
      dryRun,
      confirm
    })
    
    // Check existing data
    const courseCount = await prisma.course.count()
    const gradeCount = await prisma.grade.count()
    const enrollmentCount = await prisma.enrollment.count()
    
    console.log('\n📊 Current database state:')
    console.log(`   Courses: ${courseCount}`)
    console.log(`   Grades: ${gradeCount}`)
    console.log(`   Enrollments: ${enrollmentCount}`)
    
    if (courseCount === 0) {
      console.log('\n✅ No courses to delete. Database is already clean.')
      return
    }
    
    // Check for related data
    if (gradeCount > 0 || enrollmentCount > 0) {
      console.log('\n⚠️  Found related data:')
      if (gradeCount > 0) console.log(`   - ${gradeCount} grades reference courses`)
      if (enrollmentCount > 0) console.log(`   - ${enrollmentCount} enrollments reference courses`)
      
      if (!deleteRelatedGrades && !deleteRelatedEnrollments) {
        console.log('\n❌ Cannot delete courses due to existing related data.')
        console.log('   Use --delete-related-grades and/or --delete-related-enrollments flags')
        return
      }
    }
    
    if (dryRun) {
      console.log('\n🔍 DRY RUN MODE - No data will be deleted')
      console.log('   Would delete:')
      if (deleteRelatedGrades && gradeCount > 0) console.log(`   - ${gradeCount} grades`)
      if (deleteRelatedEnrollments && enrollmentCount > 0) console.log(`   - ${enrollmentCount} enrollments`)
      console.log(`   - ${courseCount} courses`)
      return
    }
    
    if (!confirm) {
      console.log('\n⚠️  Use --confirm flag to actually delete data')
      return
    }
    
    console.log('\n🗑️  Starting deletion process...')
    
    // Delete related data first (if requested)
    if (deleteRelatedGrades && gradeCount > 0) {
      console.log(`   Deleting ${gradeCount} grades...`)
      const gradeResult = await prisma.grade.deleteMany({})
      console.log(`   ✅ Deleted ${gradeResult.count} grades`)
    }
    
    if (deleteRelatedEnrollments && enrollmentCount > 0) {
      console.log(`   Deleting ${enrollmentCount} enrollments...`)
      const enrollmentResult = await prisma.enrollment.deleteMany({})
      console.log(`   ✅ Deleted ${enrollmentResult.count} enrollments`)
    }
    
    // Delete courses
    console.log(`   Deleting ${courseCount} courses...`)
    const courseResult = await prisma.course.deleteMany({})
    console.log(`   ✅ Deleted ${courseResult.count} courses`)
    
    // Verify cleanup
    const remainingCourses = await prisma.course.count()
    const remainingGrades = await prisma.grade.count()
    const remainingEnrollments = await prisma.enrollment.count()
    
    console.log('\n📊 Cleanup verification:')
    console.log(`   Remaining courses: ${remainingCourses}`)
    console.log(`   Remaining grades: ${remainingGrades}`)
    console.log(`   Remaining enrollments: ${remainingEnrollments}`)
    
    if (remainingCourses === 0) {
      console.log('\n🎉 Course cleanup completed successfully!')
    } else {
      console.log('\n⚠️  Some data may still exist. Check database manually.')
    }
    
  } catch (error) {
    console.error('\n❌ Error during course cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    deleteRelatedGrades: args.includes('--delete-related-grades'),
    deleteRelatedEnrollments: args.includes('--delete-related-enrollments'),
    dryRun: args.includes('--dry-run'),
    confirm: args.includes('--confirm')
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📖 Course Cleanup Script Usage:

Basic cleanup (deletes only courses):
  node scripts/clean-courses-advanced.js --confirm

Cleanup with related data:
  node scripts/clean-courses-advanced.js --delete-related-grades --delete-related-enrollments --confirm

Dry run (see what would be deleted):
  node scripts/clean-courses-advanced.js --delete-related-grades --delete-related-enrollments --dry-run

Flags:
  --delete-related-grades     Delete grades that reference courses
  --delete-related-enrollments Delete enrollments that reference courses
  --dry-run                   Show what would be deleted without actually deleting
  --confirm                   Actually perform the deletion
  --help, -h                 Show this help message

⚠️  WARNING: This will permanently delete data from your database!
    Make sure you have backups before running this script.
`)
    process.exit(0)
  }
  
  return options
}

// Run the cleanup with parsed arguments
const options = parseArgs()
cleanCoursesAdvanced(options)
  .then(() => {
    console.log('\n🏁 Script execution completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
