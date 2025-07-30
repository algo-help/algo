import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// OAuth 콜백은 동적 처리가 필요함
export const dynamic = 'force-dynamic';

// Google OAuth ID를 일관된 UUID로 변환하는 함수
function googleIdToUuid(googleId: string): string {
  // Google ID를 SHA-256으로 해시하고 UUID v4 형식으로 변환
  const hash = createHash('sha256').update(googleId).digest('hex');
  
  // UUID v4 형식으로 변환: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // 첫 번째 32자를 8-4-4-4-12 형식으로 나누고 버전과 variant 비트 설정
  const uuid = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16), // 버전 4 설정
    ((parseInt(hash.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20), // variant 설정
    hash.slice(20, 32)
  ].join('-');
  
  return uuid;
}

export async function GET(request: Request) {
  const debugInfo: any[] = [];
  debugInfo.push('🔹 OAuth callback started');
  console.log('🔹 OAuth callback started');
  console.log('🔹 Full request URL:', request.url);
  console.log('🔹 Request method:', request.method);
  console.log('🔹 Request headers:', Object.fromEntries(request.headers.entries()));
  
  // Dynamic server usage를 피하기 위해 headers 사용
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;
  
  // URL 파라미터는 여전히 필요하므로 request.url 사용 (동적 처리 필요)
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  console.log('🔹 Request details:', { code: !!code, origin });
  
  // 환경별 도메인 확인
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  // 프로덕션 환경에서 올바른 도메인 사용 확인
  let redirectOrigin = origin;
  if (isProduction && isVercel) {
    // Vercel 배포 환경에서는 현재 요청의 origin을 그대로 사용
    redirectOrigin = origin;
  }
  
  console.log('🔹 Redirect Origin Decision:', {
    origin,
    redirectOrigin,
    isProduction,
    isVercel,
    host: request.headers.get('host')
  });
  
  // console.log('🔹 OAuth callback - Origin:', origin, 'Redirect Origin:', redirectOrigin, 'Is Production:', isProduction);

  if (code) {
    // console.log('🔹 Code found, creating Supabase client');
    const supabase = await createClient();
    
    // URL에서 모든 파라미터 로깅
    const allParams = Array.from(requestUrl.searchParams.entries());
    // console.log('🔹 All URL parameters:', allParams);
    
    // 쿠키 상태 확인
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.includes('pkce')
    );
    // console.log('🔹 Supabase related cookies:', supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('🔹 Session exchange result:', { 
      hasData: !!data, 
      hasError: !!error, 
      hasSession: !!data?.session,
      errorMessage: error?.message 
    });

    if (!error && data.session) {
      // Supabase 세션이 성공적으로 생성되었습니다
      const { user } = data.session;
      
      // Google OAuth ID를 일관된 UUID로 변환
      const originalGoogleId = user.id;
      const convertedUuid = googleIdToUuid(originalGoogleId);
      
      console.log('🔹 User session created:', { 
        email: user.email, 
        originalId: originalGoogleId,
        originalIdLength: originalGoogleId?.length,
        originalIdType: typeof originalGoogleId,
        convertedUuid: convertedUuid,
        isConvertedValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(convertedUuid)
      });
      
      // 이후 모든 로직에서 변환된 UUID 사용
      const userId = convertedUuid;
      
      // 허용된 도메인 확인
      const allowedDomains = ['@algocarelab.com', '@algocare.me'];
      const userDomain = user.email ? '@' + user.email.split('@')[1] : '';
      
      // console.log('🔹 Domain check:', { userDomain, allowed: allowedDomains.includes(userDomain) });
      
      if (!allowedDomains.includes(userDomain)) {
        // 허용되지 않은 도메인 - 로그아웃 처리
        // console.log('🔹 Domain not allowed, signing out');
        await supabase.auth.signOut();
        return NextResponse.redirect(`${redirectOrigin}/login?error=Only @algocarelab.com and @algocare.me domains are allowed`);
      }

      // users 테이블에서 사용자 정보 확인 또는 생성
      // RLS 문제를 피하기 위해 바로 admin 클라이언트 사용
      console.log('🔹 Environment check in OAuth callback:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40),
        serviceKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 40),
        fullUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL
      });
      
      let userData: any = null;
      let userError: any = null;
      
      try {
        const adminSupabase = createAdminClient();
        
        // 먼저 auth_id로 검색 시도 (변환된 UUID 사용)
        let authIdResult = await adminSupabase
          .from('users')
          .select('id, email, role, is_active, password_hash, created_at, avatar_url, auth_id')
          .eq('auth_id', userId)
          .single();
        
        console.log('🔹 Auth ID lookup result:', { hasData: !!authIdResult.data, hasError: !!authIdResult.error, errorCode: authIdResult.error?.code });
        
        if (authIdResult.data && !authIdResult.error) {
          // auth_id로 찾은 경우
          userData = authIdResult.data;
          userError = null;
          console.log('🔹 User found by auth_id:', { userId: userData.id, email: userData.email });
        } else {
          // auth_id로 찾지 못한 경우 이메일로 검색
          const emailResult = await adminSupabase
            .from('users')
            .select('id, email, role, is_active, password_hash, created_at, avatar_url, auth_id')
            .eq('email', user.email)
            .single();
          
          console.log('🔹 Email lookup result:', { hasData: !!emailResult.data, hasError: !!emailResult.error, errorCode: emailResult.error?.code });
          
          if (emailResult.data && !emailResult.error) {
            // 이메일로 찾았지만 auth_id가 다른 경우 -> 기존 사용자의 auth_id 업데이트
            console.log('🔹 Existing user found by email, updating auth_id:', {
              currentAuthId: emailResult.data.auth_id,
              newAuthId: userId,
              email: user.email
            });
            
            const { error: updateError } = await adminSupabase
              .from('users')
              .update({ auth_id: userId })
              .eq('id', emailResult.data.id);
            
            if (updateError) {
              console.error('🔹 Failed to update auth_id:', updateError);
              // 업데이트 실패해도 기존 데이터 사용 (중요: 로그인 계속 진행)
              userData = emailResult.data;
              userError = null;
            } else {
              console.log('🔹 Successfully updated auth_id for existing user');
              userData = { ...emailResult.data, auth_id: userId };
              userError = null;
            }
          } else {
            // 이메일로도 찾지 못한 경우만 새 사용자 생성으로 진입
            console.log('🔹 User not found by email, will create new user');
            userData = null;
            userError = emailResult.error;
          }
        }
      } catch (adminError) {
        console.error('🔹 Admin client creation failed:', adminError);
        userError = { message: `Admin client error: ${adminError}`, code: 'ADMIN_CLIENT_ERROR' };
      }
      
      console.log('🔹 User lookup result (admin client):', { userData, userError, email: user.email, errorCode: userError?.code });

      let role = 'v'; // 기본 역할 (보기전용)
      let isActive = true;
      
      if (userData && !userError) {
        // 기존 사용자
        console.log('🔹 Existing user found:', { 
          role: userData.role, 
          isActive: userData.is_active, 
          dbId: userData.id,
          authId: user.id,
          idsMatch: userData.id === user.id 
        });
        
        // ID 불일치 감지 (기존 OAuth 사용자)
        if (userData.id !== userId) {
          console.log('🔹 ID mismatch detected! This is a legacy OAuth user.');
          console.log('🔹 Updating user ID to match Auth ID...');
          
          // Admin 클라이언트로 ID 업데이트 시도
          try {
            const adminSupabase = createAdminClient();
            
            // 1. 새 ID로 사용자 생성
            const { error: createError } = await adminSupabase
              .from('users')
              .insert({
                id: userId, // 변환된 UUID 사용
                email: userData.email,
                password_hash: userData.password_hash,
                role: userData.role,
                is_active: userData.is_active,
                created_at: userData.created_at,
                avatar_url: userData.avatar_url
              });
            
            if (!createError) {
              // 2. 기존 레코드 삭제
              const { error: deleteError } = await adminSupabase
                .from('users')
                .delete()
                .eq('id', userData.id);
              
              if (!deleteError) {
                // console.log('🔹 Successfully migrated user to new ID');
                userData.id = userId; // 이후 로직에서 새 ID (변환된 UUID) 사용
              } else {
                // console.error('🔹 Failed to delete old record:', deleteError);
              }
            } else {
              // console.error('🔹 Failed to create new record:', createError);
            }
          } catch (migrationError) {
            // console.error('🔹 Migration failed:', migrationError);
          }
        }
        
        if (!userData.is_active) {
          // 비활성화된 계정은 승인 대기 페이지로 리다이렉트
          // console.log('🔹 User is inactive, redirecting to pending approval');
          const cookieStore = await cookies();
          cookieStore.set('auth-session', JSON.stringify({
            id: userData.id, // users 테이블 ID 사용
            email: user.email,
            role: userData.role,
            authenticated: true,
            auth_type: 'oauth',
            is_active: false
          }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7일
          });
          return NextResponse.redirect(`${redirectOrigin}/pending-approval`);
        }
        role = userData.role;
        isActive = userData.is_active;
      } else {
        // 새 사용자 - 자동으로 생성 (승인 대기 상태)
        console.log('🔹 New user detected, attempting to create user record');
        console.log('🔹 User data from Google OAuth:', { 
          originalId: originalGoogleId, 
          convertedId: userId,
          email: user.email, 
          provider: 'google',
          originalIdLength: originalGoogleId?.length,
          originalIdType: typeof originalGoogleId,
          rawOriginalId: JSON.stringify(originalGoogleId),
          convertedIdIsUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId),
          userMetadata: user.user_metadata,
          appMetadata: user.app_metadata 
        });
        
        // 랜덤 아바타 URL 생성
        const avatarSeed = Math.random().toString(36).substring(2, 15);
        const avatarGender = Math.random() > 0.5 ? 'male' : 'female';
        const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${avatarSeed}&gender=${avatarGender}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        
        // UUID 형식 검증 (변환된 UUID 사용)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          console.error('🔹 Invalid UUID format for converted userId:', userId);
          return NextResponse.redirect(`${redirectOrigin}/login?error=Invalid converted user ID format`);
        }
        
        console.log('🔹 Attempting to insert user with data:', {
          id: userId,
          email: user.email,
          password_hash: 'oauth_user',
          role: 'v',
          is_active: false,
          avatar_url: avatarUrl
        });
        
        // 먼저 기본 클라이언트로 시도 - 변환된 UUID 사용
        let { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId, // 변환된 UUID 사용
            email: user.email,
            password_hash: 'oauth_user', // OAuth 사용자는 비밀번호 불필요
            role: 'v',
            is_active: false, // 새 사용자는 승인 대기 상태로 생성
            avatar_url: avatarUrl // 랜덤 아바타 추가
          });
          
        console.log('🔹 Insert attempt (regular client):', { hasError: !!insertError, errorCode: insertError?.code, errorMessage: insertError?.message });
          
        // 권한 문제로 실패한 경우 admin 클라이언트 시도
        if (insertError && (insertError.code === 'PGRST301' || insertError.message?.includes('permission'))) {
          console.log('🔹 Trying user creation with admin client...');
          try {
            const adminSupabase = createAdminClient();
            const adminInsertResult = await adminSupabase
              .from('users')
              .insert({
                id: userId, // 변환된 UUID 사용
                email: user.email,
                password_hash: 'oauth_user',
                role: 'v',
                is_active: false,
                avatar_url: avatarUrl // 랜덤 아바타 추가
              });
            insertError = adminInsertResult.error;
            console.log('🔹 Insert attempt (admin client):', { hasError: !!insertError, errorCode: insertError?.code, errorMessage: insertError?.message });
          } catch (adminError) {
            console.error('🔹 Admin client creation failed during insert:', adminError);
            insertError = { message: `Admin client error: ${adminError}`, code: 'ADMIN_CLIENT_ERROR' } as any;
          }
        }
          
        if (insertError) {
          console.error('🔹 Final user creation error:', insertError);
          console.error('🔹 Error details:', { code: insertError.code, message: insertError.message, details: insertError.details });
          // 사용자 생성이 실패했지만 리다이렉트 에러로 표시되지 않도록 에러 메시지 반환
          return NextResponse.redirect(`${redirectOrigin}/login?error=Database error saving new user: ${insertError.message}`);
        } else {
          console.log('🔹 New user created successfully:', user.email);
        }
        
        // 새 사용자는 승인 대기 페이지로 리다이렉트
        // console.log('🔹 Setting cookie for new user and redirecting to pending approval');
        const cookieStore = await cookies();
        cookieStore.set('auth-session', JSON.stringify({
          id: userId, // 변환된 UUID 사용
          email: user.email,
          role: 'v',
          authenticated: true,
          auth_type: 'oauth',
          is_active: false
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7일
        });
        return NextResponse.redirect(`${redirectOrigin}/pending-approval`);
      }

      // 기존 세션 시스템과 호환을 위한 쿠키 설정 (활성화된 사용자만)
      const cookieStore = await cookies();
      cookieStore.set('auth-session', JSON.stringify({
        id: userData.id, // users 테이블 ID 사용
        email: user.email,
        role: role,
        authenticated: true,
        auth_type: 'oauth',
        is_active: isActive
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7일
      });

      return NextResponse.redirect(`${redirectOrigin}/`);
    } else {
      // console.log('🔹 Session exchange failed or no session');
    }
  } else {
    // console.log('🔹 No code parameter found');
  }

  // OAuth 인증 실패
  // console.log('🔹 OAuth authentication failed, redirecting to login');
  return NextResponse.redirect(`${redirectOrigin}/login?error=Could not authenticate user`);
}