-- ==========================================
-- COMPLETE MULTI-TENANT SCHEMA & RLS SETUP
-- Run this in Supabase SQL Editor to fix all permission issues
-- ==========================================

-- 1. Ensure Tables Exist (Idempotent)
create table if not exists public.tenants (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id text unique not null,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admin_users (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  role text default 'admin' not null,
  created_at timestamptz default now(),
  unique(user_id, tenant_id)
);

-- Content Tables
create table if not exists public.hero (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text,
  title text,
  subtitle text,
  cta_text text,
  cta_link text,
  social_links jsonb,
  resume_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.about (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  title text,
  description text,
  profile_image_url text,
  extra_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.skills (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  category text,
  skill_name text,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  title text,
  description text,
  tech_stack text[],
  image_url text,
  github_link text,
  demo_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.experience (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  company text,
  role text,
  period text,
  details text[],
  skills_used text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contact_info (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  email text,
  phone text,
  location text,
  whatsapp text,
  linkedin text,
  github text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 2. Enable RLS on all tables
alter table public.tenants enable row level security;
alter table public.admin_users enable row level security;
alter table public.hero enable row level security;
alter table public.about enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.experience enable row level security;
alter table public.contact_info enable row level security;
alter table public.messages enable row level security;

-- 3. Ensure Unique Constraints for Single-Row Tables (Critical for Upsert)
-- This allows upserting by tenant_id without knowing the row ID
alter table public.hero drop constraint if exists hero_tenant_id_key;
alter table public.hero add constraint hero_tenant_id_key unique (tenant_id);

alter table public.about drop constraint if exists about_tenant_id_key;
alter table public.about add constraint about_tenant_id_key unique (tenant_id);

alter table public.contact_info drop constraint if exists contact_info_tenant_id_key;
alter table public.contact_info add constraint contact_info_tenant_id_key unique (tenant_id);

-- 4. Helper Function for RLS
create or replace function public.get_user_tenant_ids()
returns setof uuid as $$
begin
  return query
  select tenant_id 
  from public.admin_users 
  where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- 5. RLS Policies

-- Procedure to reset policies for a content table
create or replace procedure public.reset_content_policies(table_name text)
language plpgsql
as $$
begin
  -- Drop existing
  execute format('drop policy if exists "Public view %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admin view %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admin insert %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admin update %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admin delete %s" on public.%I', table_name, table_name);

  -- Public View
  execute format('create policy "Public view %s" on public.%I for select using (true)', table_name, table_name);

  -- Admin View
  execute format('create policy "Admin view %s" on public.%I for select using (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);

  -- Admin Insert
  execute format('create policy "Admin insert %s" on public.%I for insert with check (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);

  -- Admin Update
  execute format('create policy "Admin update %s" on public.%I for update using (tenant_id in (select public.get_user_tenant_ids())) with check (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);

  -- Admin Delete
  execute format('create policy "Admin delete %s" on public.%I for delete using (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);
end;
$$;

-- Apply to content tables
call public.reset_content_policies('hero');
call public.reset_content_policies('about');
call public.reset_content_policies('skills');
call public.reset_content_policies('projects');
call public.reset_content_policies('experience');
call public.reset_content_policies('contact_info');

-- Tenants Table Policies
drop policy if exists "Public view tenants" on public.tenants;
create policy "Public view tenants" on public.tenants for select using (is_active = true);

drop policy if exists "Admin view own tenant" on public.tenants;
create policy "Admin view own tenant" on public.tenants for select using (id in (select public.get_user_tenant_ids()));

drop policy if exists "Admin update own tenant" on public.tenants;
create policy "Admin update own tenant" on public.tenants for update using (id in (select public.get_user_tenant_ids()));

-- Admin Users Table Policies
drop policy if exists "Admin view users" on public.admin_users;
create policy "Admin view users" on public.admin_users for select using (tenant_id in (select public.get_user_tenant_ids()));

-- Messages Table Policies (Special case: Public Insert)
drop policy if exists "Public insert messages" on public.messages;
create policy "Public insert messages" on public.messages for insert with check (true);

drop policy if exists "Admin view messages" on public.messages;
create policy "Admin view messages" on public.messages for select using (tenant_id in (select public.get_user_tenant_ids()));

drop policy if exists "Admin update messages" on public.messages;
create policy "Admin update messages" on public.messages for update using (tenant_id in (select public.get_user_tenant_ids()));

drop policy if exists "Admin delete messages" on public.messages;
create policy "Admin delete messages" on public.messages for delete using (tenant_id in (select public.get_user_tenant_ids()));

-- 6. Grant Permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant insert on public.messages to anon;
