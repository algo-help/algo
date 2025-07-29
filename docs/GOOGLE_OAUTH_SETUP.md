# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### OAuth 2.0 클라이언트 ID 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **API 및 서비스** → **사용자 인증 정보**
4. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**

### OAuth 동의 화면 구성 (처음인 경우)
- **User Type**: External
- **앱 정보**: 앱 이름, 사용자 지원 이메일 등 입력
- **범위**: email, profile 선택

### OAuth 2.0 클라이언트 설정
- **애플리케이션 유형**: 웹 애플리케이션
- **이름**: Supabase Supplement Delivery (원하는 이름)
- **승인된 JavaScript 원본**:
  - `http://localhost:3000` (개발)
  - `https://your-domain.com` (프로덕션)
- **승인된 리디렉션 URI**:
  - `https://your-project-ref.supabase.co/auth/v1/callback`
  - Supabase 프로젝트 Reference ID는 Supabase 대시보드에서 확인

## 2. Supabase 설정

### Supabase 대시보드에서
1. **Authentication** → **Providers**
2. **Google** 활성화
3. Google Cloud Console에서 생성한:
   - **Client ID** 입력
   - **Client Secret** 입력
4. **Save** 클릭

### Redirect URL 확인
- Supabase가 제공하는 Redirect URL을 복사
- Google Cloud Console의 승인된 리디렉션 URI에 추가

## 3. 프로젝트 환경변수 설정

`.env.local` 파일에 Supabase 정보 추가:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 테스트

1. 개발 서버 실행: `npm run dev`
2. `/login` 페이지 접속
3. "Google로 로그인" 버튼 클릭
4. Google 계정 선택
5. 로그인 성공 시 대시보드로 리다이렉트

## 5. 사용자 권한 관리

### 기본 동작
- Google OAuth로 처음 로그인한 사용자는 자동으로 `readonly` 권한으로 생성
- 관리자가 직접 DB에서 권한 변경 필요

### 권한 변경 SQL
```sql
-- 특정 사용자를 관리자로 변경
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## 문제 해결

### "redirect_uri_mismatch" 오류
- Google Cloud Console의 승인된 리디렉션 URI 확인
- Supabase 대시보드의 Redirect URL과 정확히 일치해야 함

### 로그인 후 권한 오류
- users 테이블에서 해당 사용자의 `is_active` 상태 확인
- `role` 필드가 올바른지 확인