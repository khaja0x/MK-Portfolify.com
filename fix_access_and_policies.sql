-- ==========================================
-- FIX ACCESS AND POLICIES
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Fix the specific permission issue for the current user
-- We link the user (358d32b4...) to the tenant (8f406de2...)
insert into public.admin_users (user_id, tenant_id, role)
values (
  '358d32b4-728f-468e-9e3e-c939d94601e3', -- User ID from your logs
  '8f406de2-ba76-4290-b773-2c36b71b804c', -- Tenant ID from your logs
  'owner'
)
on conflict (user_id, tenant_id) do nothing;

-- 2. Ensure RLS Policies are correct (Option C implementation)

-- Helper function to get user's tenant IDs
create or replace function public.get_user_tenant_ids()
returns setof uuid as $$
begin
  return query
  select tenant_id 
  from public.admin_users 
  where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Procedure to reset policies
create or replace procedure public.reset_tenant_policies(table_name text)
language plpgsql
as $$
begin
  -- Drop existing policies
  execute format('drop policy if exists "Public can view %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admins can view own tenant %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admins can insert own tenant %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admins can update own tenant %s" on public.%I', table_name, table_name);
  execute format('drop policy if exists "Admins can delete own tenant %s" on public.%I', table_name, table_name);

  -- 1. Public View Policy
  execute format('create policy "Public can view %s" on public.%I for select using (true)', table_name, table_name);

  -- 2. Admin View Policy
  execute format('create policy "Admins can view own tenant %s" on public.%I for select using (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);

  -- 3. Admin Insert Policy
  execute format('create policy "Admins can insert own tenant %s" on public.%I for insert with check (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);

  -- 4. Admin Update Policy
  execute format('create policy "Admins can update own tenant %s" on public.%I for update using (tenant_id in (select public.get_user_tenant_ids())) with check (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);

  -- 5. Admin Delete Policy
  execute format('create policy "Admins can delete own tenant %s" on public.%I for delete using (tenant_id in (select public.get_user_tenant_ids()))', table_name, table_name);
end;
$$;

-- Apply to all content tables
call public.reset_tenant_policies('hero');
call public.reset_tenant_policies('about');
call public.reset_tenant_policies('skills');
call public.reset_tenant_policies('projects');
call public.reset_tenant_policies('experience');
call public.reset_tenant_policies('contact_info');

-- 3. Ensure unique constraints for single-row tables (Critical for upsert)
-- Hero
delete from public.hero a using public.hero b where a.tenant_id = b.tenant_id and a.created_at < b.created_at;
alter table public.hero drop constraint if exists hero_tenant_id_key;
alter table public.hero add constraint hero_tenant_id_key unique (tenant_id);

-- About
delete from public.about a using public.about b where a.tenant_id = b.tenant_id and a.created_at < b.created_at;
alter table public.about drop constraint if exists about_tenant_id_key;
alter table public.about add constraint about_tenant_id_key unique (tenant_id);

-- Contact Info
delete from public.contact_info a using public.contact_info b where a.tenant_id = b.tenant_id and a.created_at < b.created_at;
alter table public.contact_info drop constraint if exists contact_info_tenant_id_key;
alter table public.contact_info add constraint contact_info_tenant_id_key unique (tenant_id);
