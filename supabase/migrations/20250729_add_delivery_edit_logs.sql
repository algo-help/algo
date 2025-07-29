-- 배송 편집 로그 테이블 생성
create table if not exists public.delivery_edit_logs (
  id uuid default gen_random_uuid() primary key,
  delivery_id integer not null references public.supplement_delivery(id) on delete cascade,
  editor_id uuid not null references public.users(id) on delete cascade,
  changes jsonb not null default '{}'::jsonb,
  edited_at timestamptz not null default now(),
  created_at timestamptz default now() not null
);

-- 인덱스 생성
create index if not exists idx_delivery_edit_logs_delivery_id on public.delivery_edit_logs(delivery_id);
create index if not exists idx_delivery_edit_logs_editor_id on public.delivery_edit_logs(editor_id);
create index if not exists idx_delivery_edit_logs_edited_at on public.delivery_edit_logs(edited_at);

-- RLS 활성화
alter table public.delivery_edit_logs enable row level security;

-- RLS 정책 생성
create policy "Enable read access for all users" on public.delivery_edit_logs
  for select using (true);

create policy "Enable insert for all users" on public.delivery_edit_logs
  for insert with check (true);

-- 테이블 권한 부여
grant all on table public.delivery_edit_logs to anon;
grant all on table public.delivery_edit_logs to authenticated;
grant all on table public.delivery_edit_logs to service_role;