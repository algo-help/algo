import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: '세션이 없습니다' }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const supabase = await createClient();
    
    // 이메일로 실제 users 테이블 ID 조회
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('email', session.email)
      .single();
      
    if (error || !userData) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }
    
    // 세션 업데이트
    cookieStore.set('auth-session', JSON.stringify({
      ...session,
      id: userData.id // users 테이블의 실제 ID로 업데이트
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7일
    });
    
    return NextResponse.json({ 
      message: '세션이 수정되었습니다',
      oldId: session.id,
      newId: userData.id
    });
  } catch (error) {
    // console.error('세션 수정 오류:', error);
    return NextResponse.json({ error: '세션 수정 실패' }, { status: 500 });
  }
}