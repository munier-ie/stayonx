-- Space Activity Table
-- Tracks events like member joins, leaves, and badge achievements within a space

create table public.space_activity (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_type text check (event_type in ('member_joined', 'member_left', 'badge_earned', 'space_created')) not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for efficient querying
create index idx_space_activity_space_id on public.space_activity(space_id);
create index idx_space_activity_created_at on public.space_activity(created_at desc);

-- Row Level Security
alter table public.space_activity enable row level security;

-- Everyone can read activity (needed for dashboard feed)
create policy "Space activity is viewable by everyone" 
  on public.space_activity for select using (true);

-- Authenticated users can insert activity
create policy "Authenticated users can insert space activity" 
  on public.space_activity for insert with check (auth.role() = 'authenticated');
