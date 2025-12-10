-- ==========================================
-- FINAL STORAGE FIX SCRIPT
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Enable RLS on objects (safe to run even if enabled)
alter table storage.objects enable row level security;

-- 2. Drop existing policies to start fresh
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated can upload" on storage.objects;
drop policy if exists "Authenticated can update" on storage.objects;
drop policy if exists "Authenticated can delete" on storage.objects;

-- 3. Create Policies (Covering BOTH 'Portfolio' and 'portfolio' to be safe)

-- Public Read Access
create policy "Public Access"
on storage.objects for select
using ( bucket_id in ('Portfolio', 'portfolio') );

-- Authenticated Upload Access
create policy "Authenticated can upload"
on storage.objects for insert
with check ( 
  bucket_id in ('Portfolio', 'portfolio') 
  and auth.role() = 'authenticated' 
);

-- Authenticated Update Access
create policy "Authenticated can update"
on storage.objects for update
using ( 
  bucket_id in ('Portfolio', 'portfolio') 
  and auth.role() = 'authenticated' 
);

-- Authenticated Delete Access
create policy "Authenticated can delete"
on storage.objects for delete
using ( 
  bucket_id in ('Portfolio', 'portfolio') 
  and auth.role() = 'authenticated' 
);

-- 4. Verify Database Policies (Just in case)
-- Ensure About table is writable
drop policy if exists "Admin can do everything on about" on public.about;
create policy "Admin can do everything on about" on public.about for all using (auth.role() = 'authenticated');
