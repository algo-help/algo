import { NextResponse } from 'next/server';

export async function POST() {
  // 로그아웃 기능 비활성화 - 성공 응답만 반환
  return NextResponse.json({ success: true });
}