import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // User-Agent 확인하여 검색 엔진 봇 차단
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const searchEngineBotsPattern = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|applebot|yeti|naverbot|kakaotalk|daum|seznambot|sogou|exabot|msnbot|alexa|ia_archiver|adsbot|mediapartners|teoma|crawl|spider|bot|scraper|archiver/i;
  
  if (searchEngineBotsPattern.test(userAgent)) {
    // 검색 엔진 봇에게 403 Forbidden 응답
    return new NextResponse('Access Forbidden', { status: 403 });
  }

  const sessionCookie = request.cookies.get('auth-session');
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const isPendingApprovalPage = pathname === '/pending-approval';
  
  // 세션이 없는 경우
  if (!sessionCookie) {
    // 로그인 페이지가 아니면 로그인 페이지로 리다이렉트
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 세션이 있는 경우
  try {
    const session = JSON.parse(sessionCookie.value);
    
    // 로그인 페이지에 접근하려는 경우
    if (isLoginPage) {
      // is_active가 false면 승인 대기 페이지로
      if (session.is_active === false) {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      // is_active가 true면 홈으로
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // is_active가 false인 사용자
    if (session.is_active === false) {
      // 승인 대기 페이지가 아닌 다른 페이지에 접근하려면 승인 대기 페이지로 리다이렉트
      if (!isPendingApprovalPage && !pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
    } else {
      // is_active가 true인 사용자가 승인 대기 페이지에 접근하려면 홈으로 리다이렉트
      if (isPendingApprovalPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (error) {
    // 세션 파싱 오류 시 로그인 페이지로
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};