-- 중복된 정책 문제 해결
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;