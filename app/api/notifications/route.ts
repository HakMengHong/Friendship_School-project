import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const notifications = await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    // Format notifications for dashboard
    const formattedNotifications = notifications.map(announcement => ({
      id: announcement.id,
      type: announcement.published ? 'info' : 'warning',
      message: announcement.title,
      details: announcement.content,
      time: formatTimeAgo(announcement.createdAt),
      author: announcement.author
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " ឆ្នាំមុន";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " ខែមុន";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ថ្ងៃមុន";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " ម៉ោងមុន";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " នាទីមុន";
  return "ឥឡូវនេះ";
}
