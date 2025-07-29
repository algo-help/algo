-- Option 1: users 테이블에 auth_id 컬럼 추가하여 Supabase Auth ID와 연결
ALTER TABLE users 
ADD COLUMN auth_id UUID UNIQUE;

-- 기존 OAuth 사용자들의 auth_id 매핑 (수동으로 해야 함)
-- UPDATE users SET auth_id = 'supabase-auth-uuid' WHERE email = 'user@example.com';

-- Option 2: users 테이블의 ID를 Supabase Auth ID와 동일하게 사용
-- 이 경우 OAuth 콜백에서 users 테이블 생성 시 Auth ID를 그대로 사용
-- INSERT INTO users (id, email, ...) VALUES (auth.uid(), 'email', ...)