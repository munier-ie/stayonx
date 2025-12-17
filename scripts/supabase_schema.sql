-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public User Data)
-- Linked to auth.users via specific ID
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  twitter_handle text unique,
  avatar_url text,
  goals jsonb default '{"reply": 5, "tweet": 1, "dm": 1}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (Profiles)
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- ACTIVITIES (Daily Log)
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default CURRENT_DATE not null,
  reply_count int default 0,
  tweet_count int default 0,
  dm_count int default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date) -- One record per user per day
);
alter table public.activities enable row level security;
create policy "Activities are viewable by everyone" on public.activities for select using (true);
-- Only the backend (Service Role) typically writes these, but for MVP we might allow authenticated users to push (if using client-side sync)
-- For now, we assume Backend writes, so we might need a Service Role policy or allow user insert for the "sync" endpoint if called from client.
create policy "Users can insert own activity" on public.activities for insert with check (auth.uid() = user_id);
create policy "Users can update own activity" on public.activities for update using (auth.uid() = user_id);


-- SPACES (Teams)
create table public.spaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  visibility text check (visibility in ('public', 'private', 'secret')) default 'public',
  goals jsonb default '{"reply": 5, "tweet": 1, "dm": 1}'::jsonb,
  streak_count int default 0,
  last_streak_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.spaces enable row level security;
create policy "Public spaces are viewable" on public.spaces for select using (true);
create policy "Authenticated users can create spaces" on public.spaces for insert with check (auth.role() = 'authenticated');
create policy "Owner can update space" on public.spaces for update using (auth.uid() = owner_id);

-- MEMBERS (Space Membership)
create table public.members (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(space_id, user_id)
);
alter table public.members enable row level security;
create policy "Memberships are viewable" on public.members for select using (true);
create policy "Users can join public spaces" on public.members for insert with check (auth.role() = 'authenticated');
create policy "Users can leave spaces" on public.members for delete using (auth.uid() = user_id);

-- STREAKS (Individual)
create table public.streaks (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  current_streak int default 0,
  last_met_date date,
  longest_streak int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.streaks enable row level security;
create policy "Streaks are viewable" on public.streaks for select using (true);
