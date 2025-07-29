# Supabase 영양제 배송 추적기

Supabase의 `supplement_delivery` 테이블 데이터를 표시하는 Next.js 애플리케이션입니다. 이 프로젝트는 Vercel에 쉽게 배포할 수 있도록 설계되었습니다.

## 주요 기능

- 영양제 배송 정보 표시
- 배송 추가/편집 기능 (삭제 기능 대신 편집 기능으로 변경)
- 배송 상태 토글 (배송 대기 ↔ 배송 완료)
- 편집 기록 로그 (변경 사항 추적 및 롤백 지원)
- 필터링 및 검색 기능
- Supabase의 실시간 데이터
- 사용자 권한 관리 (읽기 전용 vs 관리자)
- Tailwind CSS를 사용한 반응형 디자인
- Vercel 간편 배포

## 사전 준비사항

Supabase 프로젝트가 이미 설정되어 있고, `supplement_delivery` 테이블이 다음 구조로 존재해야 합니다:

```sql
CREATE TABLE supplement_delivery (
  id SERIAL PRIMARY KEY,
  delivery_date DATE,
  supplement_type TEXT,
  recipient_name TEXT,
  quantity INTEGER,
  invoice_number TEXT,
  is_send BOOLEAN
);
```

## 환경변수 설정

### 필수 환경변수

프로젝트를 실행하기 위해서는 다음 환경변수들이 필요합니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Supabase 키 확인 방법

1. [Supabase 대시보드](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "Settings" > "API" 클릭
4. "Project URL"과 "anon public" 키를 복사

### 로컬 개발용 환경변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 실제 값으로 변경:

```bash
cp .env.example .env.local
```

`.env.local` 파일 내용:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Vercel 배포 방법

### 방법 1: 원클릭 배포

Vercel에 이 프로젝트를 배포하는 가장 쉬운 방법은 아래 버튼을 클릭하는 것입니다:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falgo-jeff%2Fsupabase-supplement-delivery)

### 방법 2: 수동 가져오기

1. [vercel.com](https://vercel.com)으로 이동합니다
2. "Add New" > "Project"를 클릭합니다
3. "Import Git Repository"를 선택합니다
4. 이 GitHub 저장소를 선택하거나, 변경을 원하면 먼저 포크합니다
5. 설정 단계에서 다음 환경 변수를 추가합니다:
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 프로젝트 익명 키
6. "Deploy"를 클릭합니다

## 로컬 개발 환경

로컬에서 이 프로젝트를 실행하려면:

1. 저장소 클론
   ```bash
   git clone https://github.com/algo-jeff/supabase-supplement-delivery.git
   cd supabase-supplement-delivery
   ```

2. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn
   # 또는
   pnpm install
   ```

3. 환경변수 설정 (위의 "환경변수 설정" 섹션 참고)

4. 개발 서버 실행
   ```bash
   npm run dev
   # 또는
   yarn dev
   # 또는
   pnpm dev
   ```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인합니다.

## Supabase 권한 설정

Supabase 테이블에 접근 권한을 부여하려면:

1. [Supabase 대시보드](https://app.supabase.com)에 로그인합니다
2. 프로젝트를 선택합니다
3. 왼쪽 메뉴에서 "SQL Editor"를 클릭합니다
4. 새 쿼리 생성 버튼을 클릭합니다
5. 아래 SQL 코드를 복사해서 붙여넣기:

```sql
-- RLS 정책 설정
ALTER TABLE supplement_delivery ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기 권한 부여
CREATE POLICY "Enable read access for all users" ON supplement_delivery 
FOR SELECT USING (true);

-- 모든 사용자에게 추가 권한 부여
CREATE POLICY "Enable insert for all users" ON supplement_delivery 
FOR INSERT WITH CHECK (true);

-- 모든 사용자에게 업데이트 권한 부여
CREATE POLICY "Enable update for all users" ON supplement_delivery 
FOR UPDATE USING (true);

-- 모든 사용자에게 삭제 권한 부여
CREATE POLICY "Enable delete for all users" ON supplement_delivery 
FOR DELETE USING (true);
```

6. "Run" 버튼을 클릭하여 실행합니다

### 편집 로그 테이블 설정 (선택사항)

편집 기록 추적 기능을 사용하려면 추가로 편집 로그 테이블을 생성해야 합니다:

1. Supabase SQL Editor에서 `supabase/create_delivery_edit_logs.sql` 파일의 내용을 실행합니다
2. 또는 다음 SQL을 직접 실행합니다:

```sql
-- 배송 정보 편집 로그 테이블 생성
CREATE TABLE IF NOT EXISTS delivery_edit_logs (
    id SERIAL PRIMARY KEY,
    delivery_id INTEGER NOT NULL REFERENCES supplement_delivery(id) ON DELETE CASCADE,
    editor_email TEXT NOT NULL,
    editor_id TEXT,
    changes JSONB NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_delivery_edit_logs_delivery_id ON delivery_edit_logs(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_edit_logs_editor_email ON delivery_edit_logs(editor_email);

-- RLS 정책 설정
ALTER TABLE delivery_edit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to view edit logs" ON delivery_edit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert edit logs" ON delivery_edit_logs FOR INSERT TO authenticated WITH CHECK (true);
```

**참고**: 편집 로그 테이블이 없어도 편집 기능은 정상적으로 작동하며, 로그 저장 실패 시에도 메인 기능에는 영향을 주지 않습니다.

## 보안 주의사항

⚠️ **중요**: 
- `.env.local` 파일은 Git에 커밋하지 마세요
- `.gitignore`에 환경변수 파일들이 포함되어 있는지 확인하세요
- 프로덕션 환경에서는 적절한 RLS 정책을 설정하세요

## 커스터마이징

- 테이블 스키마가 다른 경우 `utils/supabase.ts`를 수정합니다
- 데이터 표시 방식을 변경하려면 `app/page.tsx`에서 UI를 편집합니다
- 필요에 따라 더 많은 페이지나 기능을 추가합니다

## 더 알아보기

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)