-- FormTime 데이터베이스 스키마 생성

-- 사용자 테이블 (Supabase Auth와 연동)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  image text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 폼 테이블
create table if not exists public.forms (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  slug text unique not null,
  is_published boolean default false not null,
  
  -- 폼 설정 (JSON 형태로 저장)
  questions jsonb default '[]'::jsonb not null,
  styling jsonb default '{}'::jsonb not null,
  settings jsonb default '{}'::jsonb not null,
  
  -- 스케줄링 설정
  scheduling_config jsonb,
  
  -- 메타데이터
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- 외래키
  user_id uuid references public.users(id) on delete cascade not null
);

-- 폼 응답 테이블
create table if not exists public.form_responses (
  id uuid default gen_random_uuid() primary key,
  responses jsonb not null default '{}'::jsonb,
  submitted_at timestamptz default now() not null,
  
  -- 응답자 정보
  respondent_email text,
  respondent_name text,
  respondent_phone text,
  
  -- 외래키
  form_id uuid references public.forms(id) on delete cascade not null
);

-- 예약 테이블
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  
  -- 일정 정보
  start_time timestamptz not null,
  end_time timestamptz not null,
  time_zone text default 'Asia/Seoul' not null,
  
  -- 미팅 정보
  meeting_type text not null check (meeting_type in ('online', 'offline', 'both')),
  location text,
  meeting_url text,
  
  -- 상태
  status text default 'confirmed' not null check (status in ('pending', 'confirmed', 'cancelled')),
  
  -- 메타데이터
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- 외래키
  user_id uuid references public.users(id) on delete set null,
  form_id uuid references public.forms(id) on delete set null,
  response_id uuid references public.form_responses(id) on delete set null unique
);

-- 캘린더 연동 테이블
create table if not exists public.calendar_integrations (
  id uuid default gen_random_uuid() primary key,
  provider text not null check (provider in ('google', 'outlook', 'apple')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  
  -- 사용자 정보
  user_id uuid references public.users(id) on delete cascade not null,
  email text not null,
  
  -- 메타데이터
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  unique(user_id, provider)
);

-- 인덱스 생성
create index if not exists idx_forms_user_id on public.forms(user_id);
create index if not exists idx_forms_slug on public.forms(slug);
create index if not exists idx_forms_published on public.forms(is_published);
create index if not exists idx_form_responses_form_id on public.form_responses(form_id);
create index if not exists idx_appointments_user_id on public.appointments(user_id);
create index if not exists idx_appointments_form_id on public.appointments(form_id);
create index if not exists idx_appointments_start_time on public.appointments(start_time);
create index if not exists idx_calendar_integrations_user_id on public.calendar_integrations(user_id);

-- Updated_at 자동 업데이트를 위한 트리거 함수
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Updated_at 트리거 생성 (존재하지 않는 경우만)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'handle_users_updated_at') then
    create trigger handle_users_updated_at before update on public.users
      for each row execute procedure public.handle_updated_at();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'handle_forms_updated_at') then
    create trigger handle_forms_updated_at before update on public.forms
      for each row execute procedure public.handle_updated_at();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'handle_appointments_updated_at') then
    create trigger handle_appointments_updated_at before update on public.appointments
      for each row execute procedure public.handle_updated_at();
  end if;
end $$;

-- RLS (Row Level Security) 활성화
alter table public.users enable row level security;
alter table public.forms enable row level security;
alter table public.form_responses enable row level security;
alter table public.appointments enable row level security;
alter table public.calendar_integrations enable row level security;

-- RLS 정책 생성

-- Users 정책
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Forms 정책
create policy "Users can view own forms" on public.forms
  for select using (auth.uid() = user_id);

create policy "Users can create forms" on public.forms
  for insert with check (auth.uid() = user_id);

create policy "Users can update own forms" on public.forms
  for update using (auth.uid() = user_id);

create policy "Users can delete own forms" on public.forms
  for delete using (auth.uid() = user_id);

create policy "Published forms are viewable by anyone" on public.forms
  for select using (is_published = true);

-- Form Responses 정책
create policy "Form owners can view responses" on public.form_responses
  for select using (
    exists (
      select 1 from public.forms 
      where forms.id = form_responses.form_id 
      and forms.user_id = auth.uid()
    )
  );

create policy "Anyone can submit form responses" on public.form_responses
  for insert with check (
    exists (
      select 1 from public.forms 
      where forms.id = form_responses.form_id 
      and forms.is_published = true
    )
  );

-- Appointments 정책
create policy "Users can view own appointments" on public.appointments
  for select using (auth.uid() = user_id);

create policy "Users can create appointments" on public.appointments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own appointments" on public.appointments
  for update using (auth.uid() = user_id);

create policy "Users can delete own appointments" on public.appointments
  for delete using (auth.uid() = user_id);

-- Calendar Integrations 정책
create policy "Users can manage own calendar integrations" on public.calendar_integrations
  for all using (auth.uid() = user_id);

-- 함수: 사용자 생성 시 자동으로 users 테이블에 추가
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, image)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 사용자 생성 트리거 (존재하지 않는 경우만)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;