# 영양제 배송 관리 시스템 - 작업 가이드

## 프로젝트 개요
Next.js 14와 Supabase를 사용한 영양제 배송 관리 대시보드 시스템입니다.

### 주요 기술 스택
- **Frontend**: Next.js 14.0.3 (App Router)
- **UI 라이브러리**: shadcn/ui (New York 스타일)
- **스타일링**: Tailwind CSS
- **백엔드**: Supabase (Auth, Database, RLS)
- **인증**: Supabase Auth (이메일/비밀번호, Google OAuth)
- **개발 도구**: Claude Code CLI

## 현재 작업 상태

### 완료된 주요 작업
1. **UI 전환**: 커스텀 Tailwind/Framer Motion → shadcn/ui 컴포넌트
2. **인증 시스템**: 
   - Google OAuth 구현 (도메인 제한: @algocarelab.com, @algocare.me)
   - 사용자 승인 시스템 (신규 가입자는 관리자 승인 필요)
3. **시연용 계정**: testviewtest@algocarelab.com (데이터 마스킹 적용)
4. **모바일 반응형**: 전체 UI 모바일 최적화
5. **배포**: Vercel 배포 완료

### 주요 파일 구조
```
/app
  ├── page.tsx                 # 메인 대시보드
  ├── login/page.tsx          # 로그인 페이지
  ├── pending-approval/page.tsx # 승인 대기 페이지
  ├── actions.ts              # 서버 액션
  └── api/auth/callback/      # OAuth 콜백

/components
  ├── AddDeliveryModal.tsx    # 배송 추가 모달
  ├── DeleteConfirmModal.tsx  # 삭제 확인 모달
  └── SupplementInfoDialog.tsx # 영양제 정보 다이얼로그

/middleware.ts                # 라우트 보호 미들웨어
```

## 개발 환경 설정

### 필수 환경 변수 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 개발 서버 실행
```bash
npm install
npm run dev
```

## 주요 기능별 작업 방법

### 1. UI 컴포넌트 수정
- shadcn/ui 컴포넌트 사용 (Dialog, Card, Table, Button 등)
- 반응형 디자인: 모바일 우선 접근 (text-xs sm:text-sm 패턴)
- 일관된 spacing: gap-2, gap-3, gap-4 사용

### 2. 모바일 반응형 처리
```tsx
// 텍스트 크기
className="text-xs sm:text-sm"

// 패딩
className="px-1 sm:px-3 py-1.5 sm:py-2"

// 컴포넌트 높이
className="h-9 sm:h-10"

// 그리드 레이아웃
className="grid grid-cols-1 sm:grid-cols-3"
```

### 3. 데이터 마스킹 (시연용 계정)
```tsx
const isDemoAccount = userEmail === 'testviewtest@algocarelab.com';

const maskEvenChars = (text: string) => {
  if (!isDemoAccount) return text;
  return text.split('').map((char, index) => 
    (index + 1) % 2 === 0 ? '*' : char
  ).join('');
};
```

### 4. 스크롤 제어
```tsx
// 페이지 전체 가로 스크롤 방지
useEffect(() => {
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
}, []);

// 다이얼로그 열릴 때 배경 스크롤 방지
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }
}, [isOpen]);
```

## 주의사항

### 1. 상태 관리
- 로딩 상태는 스켈레톤 UI로 표시
- 에러 처리는 Alert 컴포넌트 사용
- 사용자 권한(readonly)에 따른 UI 제어

### 2. 성능 최적화
- 테이블은 가로 스크롤 가능 (min-w 설정)
- 통계 카드는 크로스페이드 애니메이션 적용
- 필터는 실시간 적용 (debounce 없음)

### 3. 보안
- Service Role Key는 서버 사이드에서만 사용
- RLS 정책 적용됨 (users, supplement_deliveries 테이블)
- OAuth 도메인 제한 적용

## 테스트 계정

### 관리자 계정
- 이메일: test@algocarelab.com
- 비밀번호: pass

### 시연용 읽기 전용 계정
- 이메일: testviewtest@algocarelab.com
- 비밀번호: testview
- 특징: 데이터 수정 불가, 민감 정보 마스킹

## 일반적인 문제 해결

### 1. RLS 정책 문제
- Service Role Key 사용 확인
- 테이블별 정책 확인 (SELECT, INSERT, UPDATE, DELETE)

### 2. 모바일 UI 깨짐
- overflow-x-hidden 적용 확인
- min-w 클래스 제거 또는 조정
- 반응형 클래스 확인

### 3. 스크롤 이슈
- 다이얼로그: overscroll-contain 적용
- 테이블: overflow-x-auto로 가로 스크롤만 허용
- body overflow 제어 확인

## Git 작업 흐름
```bash
# 브랜치 생성
git checkout -b feature/branch-name

# 커밋 (Claude Code 자동 생성)
# 코드 변경 후 커밋 요청하면 자동으로 처리됨

# PR 생성
gh pr create --title "제목" --body "설명"

# 머지
gh pr merge --merge
```

## 다음 작업 제안
1. 테스트 코드 작성
2. 에러 바운더리 추가
3. 로딩 상태 개선 (Suspense 활용)
4. 접근성 개선 (ARIA 레이블 등)
5. 국제화(i18n) 지원