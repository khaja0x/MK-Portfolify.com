-- ==========================================
-- FIX PERMISSIONS V2 (Safe Version)
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Storage Policies for 'Portfolio' bucket
-- We skip enabling RLS as it's usually on by default and can cause permission errors.

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'Portfolio' );

create policy "Authenticated can upload"
on storage.objects for insert
with check ( bucket_id = 'Portfolio' and auth.role() = 'authenticated' );

create policy "Authenticated can update"
on storage.objects for update
using ( bucket_id = 'Portfolio' and auth.role() = 'authenticated' );

create policy "Authenticated can delete"
on storage.objects for delete
using ( bucket_id = 'Portfolio' and auth.role() = 'authenticated' );


-- 2. Database Table Permissions
-- We grant ALL permissions to authenticated users for all tables.

-- Helper function to recreate policy
create or replace procedure recreate_admin_policy(table_name text)
language plpgsql
as $$
begin
  execute format('drop policy if exists "Admin can do everything" on %I', table_name);
  execute format('drop policy if exists "Admin can do everything on %s" on %I', table_name, table_name);
  execute format('create policy "Admin can do everything on %s" on %I for all using (auth.role() = ''authenticated'')', table_name, table_name);
end;
$$;

-- Apply to all tables
call recreate_admin_policy('hero');
call recreate_admin_policy('about');
call recreate_admin_policy('skills');
call recreate_admin_policy('projects');
call recreate_admin_policy('experience');
call recreate_admin_policy('contact_info');
call recreate_admin_policy('messages');

-- 3. Ensure 'messages' allows public inserts (for contact form)
drop policy if exists "Public can insert messages" on public.messages;
create policy "Public can insert messages" on public.messages for insert with check (true);

-- 4. Ensure public read access exists
create or replace procedure recreate_public_read_policy(table_name text)
language plpgsql
as $$
begin
  execute format('drop policy if exists "Public can view" on %I', table_name);
  execute format('drop policy if exists "Public can view %s" on %I', table_name, table_name);
  execute format('create policy "Public can view %s" on %I for select using (true)', table_name, table_name);
end;
$$;

call recreate_public_read_policy('hero');
call recreate_public_read_policy('about');
call recreate_public_read_policy('skills');
call recreate_public_read_policy('projects');
call recreate_public_read_policy('experience');
call recreate_public_read_policy('contact_info');
