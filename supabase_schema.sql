-- Enable Row Level Security (RLS) on all tables
-- Create tables

-- Hero Section
create table public.hero (
  id uuid not null default gen_random_uuid() primary key,
  name text,
  title text,
  subtitle text,
  cta_text text,
  cta_link text,
  social_links jsonb, -- { github: "url", linkedin: "url", etc. }
  resume_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.hero enable row level security;

-- About Section
create table public.about (
  id uuid not null default gen_random_uuid() primary key,
  title text,
  description text,
  profile_image_url text,
  extra_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.about enable row level security;

-- Skills Section
create table public.skills (
  id uuid not null default gen_random_uuid() primary key,
  category text not null, -- e.g., "Frontend", "Backend"
  skill_name text not null,
  created_at timestamptz default now()
);
alter table public.skills enable row level security;

-- Projects Section
create table public.projects (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  description text,
  tech_stack text[], -- Array of strings
  image_url text,
  github_link text,
  demo_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.projects enable row level security;

-- Experience Section
create table public.experience (
  id uuid not null default gen_random_uuid() primary key,
  company text not null,
  role text not null,
  period text, -- e.g., "Jan 2023 - Present"
  details text[], -- Array of bullet points
  skills_used text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.experience enable row level security;

-- Contact Info
create table public.contact_info (
  id uuid not null default gen_random_uuid() primary key,
  email text,
  phone text,
  location text,
  whatsapp text,
  linkedin text,
  github text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.contact_info enable row level security;

-- Messages (already exists? if not, create it)
create table if not exists public.messages (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;

-- RLS Policies
-- Allow public read access to portfolio content
create policy "Public can view hero" on public.hero for select using (true);
create policy "Public can view about" on public.about for select using (true);
create policy "Public can view skills" on public.skills for select using (true);
create policy "Public can view projects" on public.projects for select using (true);
create policy "Public can view experience" on public.experience for select using (true);
create policy "Public can view contact_info" on public.contact_info for select using (true);

-- Allow public to insert messages
create policy "Public can insert messages" on public.messages for insert with check (true);

-- Allow Admin (authenticated users) to do everything
-- Note: In a real app, you might want to restrict this to specific user IDs or roles.
-- For this simple setup, we'll assume any authenticated user is an admin (since you invite them).
create policy "Admin can do everything on hero" on public.hero for all using (auth.role() = 'authenticated');
create policy "Admin can do everything on about" on public.about for all using (auth.role() = 'authenticated');
create policy "Admin can do everything on skills" on public.skills for all using (auth.role() = 'authenticated');
create policy "Admin can do everything on projects" on public.projects for all using (auth.role() = 'authenticated');
create policy "Admin can do everything on experience" on public.experience for all using (auth.role() = 'authenticated');
create policy "Admin can do everything on contact_info" on public.contact_info for all using (auth.role() = 'authenticated');
create policy "Admin can view/update/delete messages" on public.messages for all using (auth.role() = 'authenticated');

-- Storage Buckets (You need to create these in the Supabase Dashboard Storage section)
-- Bucket: portfolio
-- Folder: profile
-- Folder: projects
