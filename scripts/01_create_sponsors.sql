-- Create the sponsors table
create table public.sponsors (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  sponsor_name text not null,
  title text not null,
  description text not null,
  cta_text text not null,
  cta_url text not null,
  image_url text not null,
  active boolean not null default false,
  starts_at timestamp with time zone null default now(),
  ends_at timestamp with time zone null,
  payment_id text null, -- DodoPayments Payment ID
  email text null, -- Contact email for the sponsor
  impressions_count bigint not null default 0,
  clicks_count bigint not null default 0,
  constraint sponsors_pkey primary key (id),
  constraint sponsors_payment_id_key unique (payment_id)
);

-- Enable Row Level Security (RLS)
alter table public.sponsors enable row level security;

-- Policy: Public read access for active ads (needed for the API/Extension)
create policy "Public can view active ads" on public.sponsors
  for select
  using (active = true);

-- Policy: Admin (Service Role) has full access
-- Note: Service role bypasses RLS, but it's good practice to have this if you ever use authenticated users.
create policy "Enable all access for service role" on public.sponsors
  for all     -- allow select, insert, update, delete
  to service_role
  using (true)
  with check (true);
