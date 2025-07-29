# OAuth 배포 환경 설정 가이드

## 🔧 Supabase Dashboard 설정

### 1. URL Configuration 설정
Supabase Dashboard → Authentication → URL Configuration에서 다음을 설정하세요:

#### Site URL
```
https://supabase-supplement-delivery.vercel.app
```

#### Redirect URLs
다음 URL들을 모두 추가하세요:
```
https://supabase-supplement-delivery.vercel.app/api/auth/callback
http://localhost:3000/api/auth/callback
```

### 2. Google OAuth 설정
Google Cloud Console → APIs & Services → Credentials에서:

#### OAuth 2.0 Client ID 설정
- **Authorized JavaScript origins**:
  - `https://supabase-supplement-delivery.vercel.app`
  - `http://localhost:3000` (개발용)

- **Authorized redirect URIs**:
  - `https://ewkfmzqvflbmdiwojnse.supabase.co/auth/v1/callback`

### 3. Vercel Environment Variables 확인
Vercel Dashboard에서 다음 환경변수가 설정되어 있는지 확인:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NODE_ENV=production`

## 🛠️ 코드 수정 사항

### 수정된 파일들:
1. **`/app/api/auth/google/route.ts`**
   - 환경별 도메인 구분 로직 추가
   - 프로덕션 환경에서 올바른 도메인 사용

2. **`/app/api/auth/callback/route.ts`**
   - 모든 리디렉션 URL을 환경별 도메인으로 수정
   - 콘솔 로그 추가로 디버깅 개선

### 변경 사항:
- `${origin}` → `${redirectOrigin}` 으로 모든 리디렉션 URL 수정
- 프로덕션 환경에서 `https://supabase-supplement-delivery.vercel.app` 강제 사용
- 로컬 환경에서는 기존 로직 유지

## 🔍 테스트 방법

1. **로컬 테스트**:
   ```bash
   npm run dev
   ```
   - http://localhost:3000 에서 Google 로그인 테스트

2. **프로덕션 테스트**:
   - https://supabase-supplement-delivery.vercel.app 에서 Google 로그인 테스트

3. **디버깅**:
   - Vercel Functions 로그에서 OAuth 관련 로그 확인
   - Console 로그에서 Origin과 Redirect Origin 확인

## 🚨 주의사항

1. **Supabase URL 설정**을 반드시 먼저 완료하세요
2. **Google OAuth 설정**에서 Authorized redirect URIs 확인
3. **Vercel에서 재배포** 후 테스트하세요
4. **브라우저 캐시 및 쿠키 클리어** 후 테스트하세요

## 📋 체크리스트

- [ ] Supabase Site URL 설정 완료
- [ ] Supabase Redirect URLs 설정 완료  
- [ ] Google OAuth Authorized redirect URIs 설정 완료
- [ ] Vercel 재배포 완료
- [ ] 프로덕션 환경에서 Google 로그인 테스트 완료
- [ ] 로컬 환경에서 Google 로그인 테스트 완료