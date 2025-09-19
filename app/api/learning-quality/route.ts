import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Calculate learning quality metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    // Get all grades for the specified year
    const grades = await prisma.grade.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`)
        }
      },
      include: {
        student: true,
        course: true,
        subject: true
      }
    })

    // Calculate monthly metrics
    const monthlyData = []
    const months = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ]

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      
      const monthGrades = grades.filter(grade => {
        const gradeDate = new Date(grade.createdAt)
        return gradeDate >= monthStart && gradeDate <= monthEnd
      })

      if (monthGrades.length === 0) {
        monthlyData.push({
          month: months[month],
          quality: 0,
          averageScore: 0,
          attendance: 0,
          totalGrades: 0
        })
        continue
      }

      // Calculate average score
      const totalScore = monthGrades.reduce((sum, grade) => sum + grade.grade, 0)
      const averageScore = Math.round(totalScore / monthGrades.length)

      // Calculate quality percentage (based on score distribution)
      const excellentGrades = monthGrades.filter(g => g.grade >= 80).length
      const goodGrades = monthGrades.filter(g => g.grade >= 60 && g.grade < 80).length
      const quality = Math.round(((excellentGrades + goodGrades * 0.7) / monthGrades.length) * 100)

      // Get attendance data for the month
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          attendanceDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      const totalAttendance = attendanceRecords.length
      const presentAttendance = attendanceRecords.filter(a => a.status === 'present').length
      const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0

      monthlyData.push({
        month: months[month],
        quality: Math.min(quality, 100),
        averageScore: Math.min(averageScore, 100),
        attendance: attendanceRate,
        totalGrades: monthGrades.length
      })
    }

    // Calculate overall statistics
    const totalGrades = grades.length
    const totalScore = grades.reduce((sum, grade) => sum + grade.grade, 0)
    const overallAverage = totalGrades > 0 ? Math.round(totalScore / totalGrades) : 0

    const excellentCount = grades.filter(g => g.grade >= 80).length
    const goodCount = grades.filter(g => g.grade >= 60 && g.grade < 80).length
    const overallQuality = totalGrades > 0 ? Math.round(((excellentCount + goodCount * 0.7) / totalGrades) * 100) : 0

    // Get overall attendance data
    const allAttendanceRecords = await prisma.attendance.findMany({
      where: {
        attendanceDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`)
        }
      }
    })

    const totalAttendanceRecords = allAttendanceRecords.length
    const totalPresentRecords = allAttendanceRecords.filter(a => a.status === 'present').length
    const overallAttendance = totalAttendanceRecords > 0 ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100) : 0

    return NextResponse.json({
      monthlyData,
      overallStats: {
        totalGrades,
        averageScore: overallAverage,
        quality: overallQuality,
        attendance: overallAttendance,
        year: parseInt(year)
      }
    })
  } catch (error) {
    console.error('Error calculating learning quality:', error)
    return NextResponse.json(
      { error: 'Failed to calculate learning quality' },
      { status: 500 }
    )
  }
}
