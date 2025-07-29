import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const provider = searchParams.get('provider')

    if (!userId || !provider) {
      return NextResponse.json({ error: '사용자 ID와 프로바이더가 필요합니다' }, { status: 400 })
    }

    // 임시 빈 이벤트 배열 반환
    const events: any[] = []

    return NextResponse.json({ events })
  } catch (error) {
    console.error('캘린더 이벤트 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, provider, eventData } = body

    if (!userId || !provider || !eventData) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    // 임시 응답 반환
    const createdEvent = {
      id: `temp-${Date.now()}`,
      summary: eventData.summary || '새 이벤트',
      start: eventData.start,
      end: eventData.end
    }

    return NextResponse.json({ event: createdEvent })
  } catch (error) {
    console.error('캘린더 이벤트 생성 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}