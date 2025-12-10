-- Fix RLS and Permissions

-- 1. Make get_user_tenant_ids robust and prevent recursion
create or replace function public.get_user_tenant_ids()
returns setof uuid as $$
begin
  return query
  select tenant_id 
  from public.admin_users 
  where user_id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public;

-- 2. Update admin_users policy to be non-recursive for own row
drop policy if exists "Admin view users" on public.admin_users;
create policy "Admin view users" on public.admin_users for select using (
  user_id = auth.uid() OR 
  tenant_id in (select public.get_user_tenant_ids())
);

-- 3. Ensure contact_info RLS is correct
alter table public.contact_info enable row level security;

drop policy if exists "Admin insert contact_info" on public.contact_info;
create policy "Admin insert contact_info" on public.contact_info for insert with check (
  tenant_id in (select public.get_user_tenant_ids())
);

drop policy if exists "Admin update contact_info" on public.contact_info;
create policy "Admin update contact_info" on public.contact_info for update using (
  tenant_id in (select public.get_user_tenant_ids())
) with check (
  tenant_id in (select public.get_user_tenant_ids())
);

-- 4. Fix specific user association (if missing)
-- This block attempts to link the user 'mohdzubair3278@gmail.com' to tenant 'zubair-ayan'
do $$
declare
  v_user_id uuid;
  v_tenant_id uuid;
begin
  -- Find user ID by email (check both auth.users and public.users if you have a public mirror, but here we use auth.users)
  -- Note: Accessing auth.users requires superuser or appropriate permissions. 
  -- If running in Supabase SQL Editor, this usually works.
  select id into v_user_id from auth.users where email = 'mohdzubair3278@gmail.com';
  
  -- Find tenant ID
  select id into v_tenant_id from public.tenants where tenant_id = 'zubair-ayan';
  
  if v_user_id is not null and v_tenant_id is not null then
    -- Insert into admin_users if not exists
    insert into public.admin_users (user_id, tenant_id, role)
    values (v_user_id, v_tenant_id, 'owner')
    on conflict (user_id, tenant_id) do nothing;
    
    raise notice 'Fixed association for user % and tenant %', v_user_id, v_tenant_id;
  else
    raise notice 'User or Tenant not found for fixing. User: %, Tenant: %', v_user_id, v_tenant_id;
  end if;
end $$;
