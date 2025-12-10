-- ==========================================
-- FIX HERO RLS AND CONSTRAINTS
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Ensure Hero has a unique constraint on tenant_id
-- This is required for upsert to work correctly without an ID
-- First, remove any duplicates (keeping the most recent one)
delete from public.hero a using public.hero b
where a.tenant_id = b.tenant_id and a.created_at < b.created_at;

-- Now add the constraint
alter table public.hero drop constraint if exists hero_tenant_id_key;
alter table public.hero add constraint hero_tenant_id_key unique (tenant_id);

-- 2. Drop existing policies for Hero
drop policy if exists "Admins can insert own tenant hero" on public.hero;
drop policy if exists "Admins can update own tenant hero" on public.hero;
drop policy if exists "Admins can delete own tenant hero" on public.hero;
drop policy if exists "Admins can view own tenant hero" on public.hero;

-- 3. Recreate policies with direct checks (more robust)

-- View
create policy "Admins can view own tenant hero"
on public.hero for select
using (
  auth.uid() in (
    select user_id from public.admin_users where tenant_id = hero.tenant_id
  )
);

-- Insert
create policy "Admins can insert own tenant hero"
on public.hero for insert
with check (
  auth.uid() in (
    select user_id from public.admin_users where tenant_id = hero.tenant_id
  )
);

-- Update
create policy "Admins can update own tenant hero"
on public.hero for update
using (
  auth.uid() in (
    select user_id from public.admin_users where tenant_id = hero.tenant_id
  )
);

-- Delete
create policy "Admins can delete own tenant hero"
on public.hero for delete
using (
  auth.uid() in (
    select user_id from public.admin_users where tenant_id = hero.tenant_id
  )
);

-- 4. Verify admin_users link for current user (Optional debug)
-- select * from public.admin_users where user_id = auth.uid();
