-- ================================================================
-- Prode Mundial 2026 - Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ================================================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

-- Groups
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

-- Group members
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member', -- 'admin' | 'member'
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Matches (synced from football-data.org)
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  api_id integer unique,
  home_team text not null,
  away_team text not null,
  home_team_crest text,
  away_team_crest text,
  match_date timestamptz not null,
  stage text not null,
  group_name text,
  home_score integer,
  away_score integer,
  status text not null default 'SCHEDULED',
  updated_at timestamptz default now()
);

-- Predictions
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references groups(id) on delete cascade not null,
  match_id uuid references matches(id) on delete cascade not null,
  predicted_home integer not null,
  predicted_away integer not null,
  points integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id, group_id)
);

-- Champion predictions
create table if not exists champion_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references groups(id) on delete cascade not null,
  team_name text not null,
  team_crest text,
  points integer,
  created_at timestamptz default now(),
  unique(user_id, group_id)
);

-- ================================================================
-- Row Level Security
-- ================================================================

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table champion_predictions enable row level security;

-- Profiles: own profile only for write, public read
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Groups: any authenticated user can create and read
create policy "groups_select" on groups for select using (auth.role() = 'authenticated');
create policy "groups_insert" on groups for insert with check (auth.role() = 'authenticated');

-- Group members: members of the group can see each other
create policy "group_members_select" on group_members for select using (auth.role() = 'authenticated');
create policy "group_members_insert" on group_members for insert with check (auth.uid() = user_id);

-- Matches: public read, only service role can write (via sync API)
create policy "matches_select" on matches for select using (true);

-- Predictions: group members can read all, but only owner can write
create policy "predictions_select" on predictions for select using (auth.role() = 'authenticated');
create policy "predictions_insert" on predictions for insert with check (auth.uid() = user_id);
create policy "predictions_update" on predictions for update using (auth.uid() = user_id);

-- Champion predictions: same
create policy "champion_select" on champion_predictions for select using (auth.role() = 'authenticated');
create policy "champion_insert" on champion_predictions for insert with check (auth.uid() = user_id);
create policy "champion_update" on champion_predictions for update using (auth.uid() = user_id);

-- ================================================================
-- Realtime
-- ================================================================

-- Enable realtime for live score updates and leaderboard
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table predictions;
alter publication supabase_realtime add table champion_predictions;
