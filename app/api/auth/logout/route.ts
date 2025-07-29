import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  // Supabase 로그아웃
  await supabase.auth.signOut();
  
  // 세션 쿠키 삭제
  cookieStore.delete('auth-session');
  
  return NextResponse.json({ success: true });
}