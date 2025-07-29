# 보안 가이드라인

## 민감한 정보 보호

이 프로젝트에서는 다음 정보들을 절대 커밋하지 마세요:

1. **환경 변수 파일**
   - `.env`
   - `.env.local`
   - `.env.*`

2. **데이터베이스 인증 정보**
   - 데이터베이스 비밀번호
   - Service Role Keys
   - Connection strings

3. **API 키**
   - Supabase API keys
   - Google OAuth credentials
   - 기타 third-party API keys

## 보안 모범 사례

- 민감한 정보는 항상 환경 변수로 관리
- `.gitignore`에 환경 변수 파일 포함 확인
- 실수로 커밋한 경우 즉시 git history에서 제거
- 프로덕션 환경에서는 강력한 비밀번호 사용

## 테스트 계정 정보

개발 환경에서 사용하는 테스트 계정은 환경 변수를 통해 관리됩니다:
- 환경 변수: `TEST_EMAIL`, `TEST_PASSWORD`로 설정
- 역할: 환경 변수 `TEST_ROLE`로 설정

**주의: 프로덕션 환경에서는 절대 테스트 계정을 사용하지 마세요!**