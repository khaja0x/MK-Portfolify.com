-- =====================================================
-- Multi-Tenant Portfolio System - Database Migration
-- =====================================================
-- This migration adds multi-tenancy support to the portfolio system
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Create Tenants Table
-- =====================================================

create table if not exists public.tenants (
  id uuid not null default gen_random_uuid() primary key,
  tenant_id text unique not null, -- URL-friendly identifier (e.g., "john-doe", "acme-corp")
  name text not null, -- Display name
  subdomain text unique, -- Optional: for future subdomain routing
  custom_domain text unique, -- Optional: for custom domains
  logo_url text,
  theme_config jsonb default '{
    "primaryColor": "#0EA5E9",
    "fontFamily": "Inter",
    "darkMode": false
  }'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraints
  constraint tenant_id_format check (tenant_id ~ '^[a-z0-9-]+$'),
  constraint tenant_id_length check (char_length(tenant_id) >= 3 and char_length(tenant_id) <= 50)
);

-- Enable RLS
alter table public.tenants enable row level security;

-- Create indexes for performance
create index if not exists idx_tenants_tenant_id on public.tenants(tenant_id);
create index if not exists idx_tenants_subdomain on public.tenants(subdomain) where subdomain is not null;
create index if not exists idx_tenants_is_active on public.tenants(is_active);

-- Add comment
comment on table public.tenants is 'Stores tenant/organization information for multi-tenant portfolio system';

-- =====================================================
-- STEP 2: Create Admin Users Table
-- =====================================================

create table if not exists public.admin_users (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  role text default 'admin' not null, -- 'owner', 'admin', 'editor'
  created_at timestamptz default now(),
  
  -- Constraints
  unique(user_id, tenant_id),
  constraint valid_role check (role in ('owner', 'admin', 'editor'))
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Create indexes
create index if not exists idx_admin_users_user_id on public.admin_users(user_id);
create index if not exists idx_admin_users_tenant_id on public.admin_users(tenant_id);

-- Add comment
comment on table public.admin_users is 'Links authenticated users to tenants with specific roles';

-- =====================================================
-- STEP 3: Add tenant_id to Existing Tables
-- =====================================================

-- Hero Section
alter table public.hero add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_hero_tenant on public.hero(tenant_id);

-- About Section
alter table public.about add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_about_tenant on public.about(tenant_id);

-- Skills Section
alter table public.skills add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_skills_tenant on public.skills(tenant_id);

-- Projects Section
alter table public.projects add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_projects_tenant on public.projects(tenant_id);

-- Experience Section
alter table public.experience add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_experience_tenant on public.experience(tenant_id);

-- Contact Info
alter table public.contact_info add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_contact_info_tenant on public.contact_info(tenant_id);

-- Messages
alter table public.messages add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
create index if not exists idx_messages_tenant on public.messages(tenant_id);

-- =====================================================
-- STEP 4: Create Default Tenant for Existing Data
-- =====================================================

-- Insert default tenant (if not exists)
insert into public.tenants (tenant_id, name, is_active)
values ('default', 'Default Portfolio', true)
on conflict (tenant_id) do nothing;

-- Get the default tenant ID
do $$
declare
  default_tenant_id uuid;
begin
  select id into default_tenant_id from public.tenants where tenant_id = 'default';
  
  -- Update existing records to belong to default tenant
  update public.hero set tenant_id = default_tenant_id where tenant_id is null;
  update public.about set tenant_id = default_tenant_id where tenant_id is null;
  update public.skills set tenant_id = default_tenant_id where tenant_id is null;
  update public.projects set tenant_id = default_tenant_id where tenant_id is null;
  update public.experience set tenant_id = default_tenant_id where tenant_id is null;
  update public.contact_info set tenant_id = default_tenant_id where tenant_id is null;
  update public.messages set tenant_id = default_tenant_id where tenant_id is null;
end $$;

-- =====================================================
-- STEP 5: Make tenant_id NOT NULL (after migration)
-- =====================================================

-- Now that all records have tenant_id, make it required
alter table public.hero alter column tenant_id set not null;
alter table public.about alter column tenant_id set not null;
alter table public.skills alter column tenant_id set not null;
alter table public.projects alter column tenant_id set not null;
alter table public.experience alter column tenant_id set not null;
alter table public.contact_info alter column tenant_id set not null;
alter table public.messages alter column tenant_id set not null;

-- =====================================================
-- STEP 6: Update Triggers for updated_at
-- =====================================================

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger to tenants table
drop trigger if exists update_tenants_updated_at on public.tenants;
create trigger update_tenants_updated_at
  before update on public.tenants
  for each row
  execute function public.update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tenant count
-- select count(*) as tenant_count from public.tenants;

-- Check admin users
-- select * from public.admin_users;

-- Check data migration
-- select 
--   'hero' as table_name, count(*) as total, count(tenant_id) as with_tenant
-- from public.hero
-- union all
-- select 'projects', count(*), count(tenant_id) from public.projects;
