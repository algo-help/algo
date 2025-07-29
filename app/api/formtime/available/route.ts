import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const duration = parseInt(searchParams.get('duration') || '30')
    const bufferTime = parseInt(searchParams.get('bufferTime') || '15')

    if (!userId || !date) {
      return NextResponse.json({ error: '사용자 ID와 날짜가 필요합니다' }, { status: 400 })
    }

    // 기본 가용 시간 슬롯 제공 (임시)
    const availableSlots = [
      { start: '09:00', end: '09:30' },
      { start: '10:00', end: '10:30' },
      { start: '11:00', end: '11:30' },
      { start: '14:00', end: '14:30' },
      { start: '15:00', end: '15:30' },
      { start: '16:00', end: '16:30' }
    ]

    return NextResponse.json({
      date: date,
      workingHours: { start: '09:00', end: '18:00' },
      availableSlots,
      duration,
      bufferTime
    })
  } catch (error) {
    console.error('가용 시간 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}