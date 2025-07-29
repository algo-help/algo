# Supabase CLI 사용 가이드

이 프로젝트는 Supabase CLI를 사용하여 데이터베이스를 관리합니다.

## 주요 명령어

### 데이터베이스 마이그레이션
```bash
# 새 마이그레이션 생성
supabase migration new <migration_name>

# 마이그레이션 상태 확인
supabase migration list

# 로컬에서 마이그레이션 실행
supabase db reset

# 원격 데이터베이스에 적용
supabase db push
```

### TypeScript 타입 생성
```bash
# 연결된 프로젝트에서 타입 생성
supabase gen types typescript --linked > types/supabase.ts

# 로컬에서 타입 생성
supabase gen types typescript --local > types/supabase.ts
```

### 로컬 개발
```bash
# 로컬 Supabase 시작
supabase start

# 로컬 Supabase 중지
supabase stop

# 로컬 상태 확인
supabase status
```

### 프로젝트 연결
```bash
# 클라우드 프로젝트와 연결
supabase link --project-ref <project-id>

# 연결 해제
supabase unlink
```

## 백업된 SQL 파일

기존 SQL 파일들은 `supabase_backup/` 폴더에 백업되어 있습니다.
현재 모든 스키마는 마이그레이션 시스템으로 관리됩니다.

## 환경 변수

`.env.local` 파일에 필요한 환경 변수가 설정되어 있습니다:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_DIRECT_URL`
- `SUPABASE_POOLER_URL`