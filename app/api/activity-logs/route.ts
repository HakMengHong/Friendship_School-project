import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch recent activity logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const userId = searchParams.get('userId')

    const whereClause = userId ? { userId: parseInt(userId) } : {}

    const activityLogs = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: parseInt(limit)
    })

    // Format the response to match dashboard expectations
    const formattedLogs = activityLogs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      time: formatTimeAgo(log.timestamp),
      type: getActivityType(log.action),
      user: `${log.user.lastname} ${log.user.firstname}`,
      timestamp: log.timestamp
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

// POST - Create new activity log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, details } = body

    // Validate required fields
    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action' },
        { status: 400 }
      )
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        userId: parseInt(userId),
        action,
        details
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(activityLog, { status: 201 })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(timestamp: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} វិនាទីមុន`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} នាទីមុន`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ម៉ោងមុន`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ថ្ងៃមុន`
  }
}

// Helper function to determine activity type
function getActivityType(action: string): string {
  if (action.includes('បន្ថែម') || action.includes('បង្កើត')) return 'add'
  if (action.includes('កែប្រែ') || action.includes('ធ្វើបច្ចុប្បន្នភាព')) return 'edit'
  if (action.includes('អវត្តមាន') || action.includes('វត្តមាន')) return 'attendance'
  if (action.includes('ដំណឹង') || action.includes('ប្រកាស')) return 'announcement'
  if (action.includes('ថ្នាក់') || action.includes('វគ្គ')) return 'create'
  return 'other'
}
