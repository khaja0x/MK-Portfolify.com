-- =====================================================
-- Multi-Tenant RLS (Row Level Security) Policies
-- =====================================================
-- This script sets up tenant-based data isolation
-- Run this AFTER 001_add_multi_tenant.sql

-- =====================================================
-- STEP 1: Drop Existing Policies
-- =====================================================

-- Drop old policies that don't account for tenants
drop policy if exists "Public can view hero" on public.hero;
drop policy if exists "Public can view about" on public.about;
drop policy if exists "Public can view skills" on public.skills;
drop policy if exists "Public can view projects" on public.projects;
drop policy if exists "Public can view experience" on public.experience;
drop policy if exists "Public can view contact_info" on public.contact_info;
drop policy if exists "Public can insert messages" on public.messages;

drop policy if exists "Admin can do everything on hero" on public.hero;
drop policy if exists "Admin can do everything on about" on public.about;
drop policy if exists "Admin can do everything on skills" on public.skills;
drop policy if exists "Admin can do everything on projects" on public.projects;
drop policy if exists "Admin can do everything on experience" on public.experience;
drop policy if exists "Admin can do everything on contact_info" on public.contact_info;
drop policy if exists "Admin can view/update/delete messages" on public.messages;

-- =====================================================
-- STEP 2: Helper Function - Get User's Tenant IDs
-- =====================================================

-- Function to get all tenant IDs that the current user has access to
create or replace function public.get_user_tenant_ids()
returns setof uuid as $$
begin
  return query
  select tenant_id 
  from public.admin_users 
  where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- =====================================================
-- STEP 3: Tenants Table Policies
-- =====================================================

-- Public can view active tenants (for portfolio discovery)
create policy "Public can view active tenants"
  on public.tenants for select
  using (is_active = true);

-- Admins can view their own tenant
create policy "Admins can view own tenant"
  on public.tenants for select
  using (id in (select public.get_user_tenant_ids()));

-- Admins can update their own tenant
create policy "Admins can update own tenant"
  on public.tenants for update
  using (id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 4: Admin Users Table Policies
-- =====================================================

-- Admins can view users in their tenant
create policy "Admins can view own tenant users"
  on public.admin_users for select
  using (tenant_id in (select public.get_user_tenant_ids()));

-- Owners can manage users in their tenant
create policy "Owners can manage tenant users"
  on public.admin_users for all
  using (
    tenant_id in (
      select tenant_id from public.admin_users 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- =====================================================
-- STEP 5: Hero Section Policies
-- =====================================================

-- Public can view all hero sections (for public portfolios)
create policy "Public can view hero"
  on public.hero for select
  using (true);

-- Admins can view their tenant's hero
create policy "Admins can view own tenant hero"
  on public.hero for select
  using (tenant_id in (select public.get_user_tenant_ids()));

-- Admins can insert for their tenant
create policy "Admins can insert own tenant hero"
  on public.hero for insert
  with check (tenant_id in (select public.get_user_tenant_ids()));

-- Admins can update their tenant's hero
create policy "Admins can update own tenant hero"
  on public.hero for update
  using (tenant_id in (select public.get_user_tenant_ids()));

-- Admins can delete their tenant's hero
create policy "Admins can delete own tenant hero"
  on public.hero for delete
  using (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 6: About Section Policies
-- =====================================================

create policy "Public can view about"
  on public.about for select
  using (true);

create policy "Admins can manage own tenant about"
  on public.about for all
  using (tenant_id in (select public.get_user_tenant_ids()))
  with check (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 7: Skills Section Policies
-- =====================================================

create policy "Public can view skills"
  on public.skills for select
  using (true);

create policy "Admins can manage own tenant skills"
  on public.skills for all
  using (tenant_id in (select public.get_user_tenant_ids()))
  with check (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 8: Projects Section Policies
-- =====================================================

create policy "Public can view projects"
  on public.projects for select
  using (true);

create policy "Admins can manage own tenant projects"
  on public.projects for all
  using (tenant_id in (select public.get_user_tenant_ids()))
  with check (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 9: Experience Section Policies
-- =====================================================

create policy "Public can view experience"
  on public.experience for select
  using (true);

create policy "Admins can manage own tenant experience"
  on public.experience for all
  using (tenant_id in (select public.get_user_tenant_ids()))
  with check (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 10: Contact Info Policies
-- =====================================================

create policy "Public can view contact_info"
  on public.contact_info for select
  using (true);

create policy "Admins can manage own tenant contact_info"
  on public.contact_info for all
  using (tenant_id in (select public.get_user_tenant_ids()))
  with check (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 11: Messages Policies
-- =====================================================

-- Public can insert messages (contact form submissions)
-- But they need to specify a valid tenant_id
create policy "Public can insert messages"
  on public.messages for insert
  with check (
    tenant_id in (select id from public.tenants where is_active = true)
  );

-- Admins can view messages for their tenant
create policy "Admins can view own tenant messages"
  on public.messages for select
  using (tenant_id in (select public.get_user_tenant_ids()));

-- Admins can update messages for their tenant (mark as read)
create policy "Admins can update own tenant messages"
  on public.messages for update
  using (tenant_id in (select public.get_user_tenant_ids()));

-- Admins can delete messages for their tenant
create policy "Admins can delete own tenant messages"
  on public.messages for delete
  using (tenant_id in (select public.get_user_tenant_ids()));

-- =====================================================
-- STEP 12: Grant Permissions
-- =====================================================

-- Grant usage on helper function
grant execute on function public.get_user_tenant_ids() to authenticated;
grant execute on function public.get_user_tenant_ids() to anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- List all policies
-- select schemaname, tablename, policyname, permissive, roles, cmd, qual
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, policyname;

-- Test tenant isolation (run as authenticated user)
-- select * from public.get_user_tenant_ids();
-- select * from public.hero; -- Should only see own tenant's data
