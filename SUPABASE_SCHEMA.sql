-- Run this entire block in your Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New Query → paste → Run

-- Teams table
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  invite_code text unique not null,
  created_by text not null,
  duration integer default 30,
  created_at timestamp with time zone default now()
);

-- Team members table
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade,
  user_id text not null,
  user_name text not null,
  user_email text,
  role text default 'member' check (role in ('admin', 'member')),
  created_at timestamp with time zone default now(),
  unique(team_id, user_id)
);

-- Member weekly data
create table if not exists member_week_data (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references team_members(id) on delete cascade,
  week_key text not null,
  metrics jsonb default '[]',
  time jsonb default '[]',
  notes text default '',
  updated_at timestamp with time zone default now(),
  unique(member_id, week_key)
);

-- Team shared notes
create table if not exists team_notes (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade,
  week_key text not null,
  notes text default '',
  updated_at timestamp with time zone default now(),
  unique(team_id, week_key)
);

-- Enable Row Level Security (keeps data private)
alter table teams enable row level security;
alter table team_members enable row level security;
alter table member_week_data enable row level security;
alter table team_notes enable row level security;

-- For now, allow all operations (you can tighten this later)
create policy "Allow all on teams" on teams for all using (true) with check (true);
create policy "Allow all on team_members" on team_members for all using (true) with check (true);
create policy "Allow all on member_week_data" on member_week_data for all using (true) with check (true);
create policy "Allow all on team_notes" on team_notes for all using (true) with check (true);
