const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingDashboardData() {
  try {
    console.log('🔧 Adding Missing Dashboard Data...\n');
    
    // Add sample announcements
    console.log('📢 Adding sample announcements...');
    
    const announcements = [
      {
        title: "សូមស្វាគមន៍មកកាន់កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស",
        content: "សូមស្វាគមន៍មកកាន់កម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្សថ្មី។ កម្មវិធីនេះនឹងជួយអ្នកគ្រូ និងបុគ្គលិកក្នុងការគ្រប់គ្រង់ពិន្ទុ វត្តមាន និងរបាយការណ៍សិស្ស។",
        author: "អ្នកគ្រប់គ្រង",
        published: true
      },
      {
        title: "ការប្រកាសពិន្ទុប្រចាំខែ",
        content: "សូមជូនដំណឹងថា ពិន្ទុប្រចាំខែនឹងត្រូវបានប្រកាសនៅថ្ងៃទី 25 ខែនេះ។ សូមអ្នកគ្រូចូលបញ្ចូលពិន្ទុឱ្យបានទាន់ពេលវេលា។",
        author: "អ្នកគ្រប់គ្រង",
        published: true
      },
      {
        title: "ការប្រកាសវត្តមាន",
        content: "សូមជូនដំណឹងថា ការចុះវត្តមានសិស្សនឹងត្រូវបានធ្វើឡើងជាប្រចាំរៀងរាល់ថ្ងៃ។ សូមអ្នកគ្រូចូលចុះវត្តមានឱ្យបានទាន់ពេលវេលា។",
        author: "អ្នកគ្រប់គ្រង",
        published: true
      },
      {
        title: "ការប្រកាសរបាយការណ៍",
        content: "សូមជូនដំណឹងថា របាយការណ៍ប្រចាំខែនឹងត្រូវបានបង្កើតនៅថ្ងៃទី 30 ខែនេះ។ សូមអ្នកគ្រូចូលពិនិត្យឱ្យបានទាន់ពេលវេលា។",
        author: "អ្នកគ្រប់គ្រង",
        published: false
      },
      {
        title: "ការប្រកាសការប្រជុំ",
        content: "សូមជូនដំណឹងថា ការប្រជុំប្រចាំខែនឹងត្រូវបានធ្វើឡើងនៅថ្ងៃទី 15 ខែក្រោយ។ សូមអ្នកគ្រូ និងបុគ្គលិកចូលរួមឱ្យបានទាន់ពេលវេលា។",
        author: "អ្នកគ្រប់គ្រង",
        published: true
      }
    ];
    
    for (const announcement of announcements) {
      await prisma.announcement.create({
        data: announcement
      });
    }
    
    console.log(`✅ Added ${announcements.length} announcements`);
    
    // Add sample activity logs
    console.log('\n📈 Adding sample activity logs...');
    
    // Get some users to create activity logs
    const users = await prisma.user.findMany({
      select: { userId: true, firstname: true, lastname: true }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found to create activity logs');
      return;
    }
    
    const activities = [
      { action: "បានចូលកម្មវិធី", details: "ចូលកម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស" },
      { action: "បានបញ្ចូលពិន្ទុ", details: "បញ្ចូលពិន្ទុសិស្សថ្នាក់ទី 5A" },
      { action: "បានចុះវត្តមាន", details: "ចុះវត្តមានសិស្សថ្នាក់ទី 5A" },
      { action: "បានបង្កើតរបាយការណ៍", details: "បង្កើតរបាយការណ៍ប្រចាំខែ" },
      { action: "បានបន្ថែមសិស្ស", details: "បន្ថែមសិស្សថ្មីទៅក្នុងថ្នាក់" },
      { action: "បានកែប្រែព័ត៌មាន", details: "កែប្រែព័ត៌មានសិស្ស" },
      { action: "បានចុះវត្តមាន", details: "ចុះវត្តមានសិស្សថ្នាក់ទី 5B" },
      { action: "បានបញ្ចូលពិន្ទុ", details: "បញ្ចូលពិន្ទុសិស្សថ្នាក់ទី 5B" },
      { action: "បានបង្កើតរបាយការណ៍", details: "បង្កើតរបាយការណ៍ប្រចាំខែ" },
      { action: "បានចូលកម្មវិធី", details: "ចូលកម្មវិធីគ្រប់គ្រង់ពិន្ទុសិស្ស" }
    ];
    
    // Create activity logs for the last 10 days
    const now = new Date();
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const user = users[i % users.length];
      const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Each day back
      
      await prisma.activityLog.create({
        data: {
          userId: user.userId,
          action: activity.action,
          details: activity.details,
          timestamp: timestamp
        }
      });
    }
    
    console.log(`✅ Added ${activities.length} activity logs`);
    
    // Verify the data was added
    console.log('\n🔍 Verifying added data...');
    
    const announcementCount = await prisma.announcement.count();
    const activityLogCount = await prisma.activityLog.count();
    
    console.log(`📢 Announcements: ${announcementCount}`);
    console.log(`📈 Activity Logs: ${activityLogCount}`);
    
    console.log('\n✅ Dashboard data setup complete!');
    console.log('💡 The dashboard should now show real data instead of mock data.');
    
  } catch (error) {
    console.error('❌ Error adding dashboard data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingDashboardData();
