import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// OAuth 콜백은 동적 처리가 필요함
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('🔹 SIMPLE OAuth callback started');
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = 'https://algo-topaz.vercel.app'; // 하드코딩으로 고정
  
  console.log('🔹 Code found:', !!code);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('🔹 Session exchange:', { hasData: !!data, hasError: !!error, hasSession: !!data?.session });

    if (!error && data.session) {
      const { user } = data.session;
      console.log('🔹 Google user:', { email: user.email, id: user.id });
      
      // 허용된 도메인 확인
      const userDomain = user.email ? '@' + user.email.split('@')[1] : '';
      if (userDomain !== '@algocarelab.com' && userDomain !== '@algocare.me') {
        console.log('🔹 Domain not allowed:', userDomain);
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=Domain not allowed`);
      }

      // 무조건 새 UUID 생성해서 사용자 생성
      const newUserId = randomUUID();
      console.log('🔹 Generated new UUID:', newUserId);
      
      try {
        const adminSupabase = createAdminClient();
        
        // 기존 사용자 삭제 (있다면)
        await adminSupabase.from('users').delete().eq('email', user.email);
        console.log('🔹 Deleted existing user (if any)');
        
        // 새 사용자 생성
        const { error: insertError } = await adminSupabase
          .from('users')
          .insert({
            id: newUserId,
            email: user.email,
            password_hash: 'oauth_user',
            role: user.email === 'jeff@algocarelab.com' ? 'admin' : 'v',
            is_active: true, // 일단 바로 활성화
            avatar_url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${Math.random()}&gender=male&backgroundColor=b6e3f4`,
            auth_id: user.id // Google OAuth ID를 auth_id에 저장
          });
        
        if (insertError) {
          console.error('🔹 Insert error:', insertError);
          return NextResponse.redirect(`${origin}/login?error=Database error: ${insertError.message}`);
        }
        
        console.log('✅ User created successfully:', user.email);
        
        // 세션 쿠키 설정
        const cookieStore = await cookies();
        cookieStore.set('auth-session', JSON.stringify({
          id: newUserId,
          email: user.email,
          role: user.email === 'jeff@algocarelab.com' ? 'admin' : 'v',
          authenticated: true,
          auth_type: 'oauth',
          is_active: true
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7일
        });

        return NextResponse.redirect(`${origin}/`);
        
      } catch (adminError) {
        console.error('🔹 Admin error:', adminError);
        return NextResponse.redirect(`${origin}/login?error=System error: ${adminError}`);
      }
    } else {
      console.log('🔹 Session exchange failed:', error?.message);
    }
  } else {
    console.log('🔹 No code parameter');
  }

  // OAuth 인증 실패
  console.log('🔹 OAuth failed, redirecting to login');
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}