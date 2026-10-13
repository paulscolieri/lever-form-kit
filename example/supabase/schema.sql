-- Run once in the Supabase SQL editor. One row per quote request.
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  address text,
  notes text,
  lot_size text not null,
  add_ons text[] not null default '{}',
  frequency text not null,
  rush boolean not null default false,
  eligible boolean not null,
  reason text,
  line_items jsonb not null default '[]',
  total_cents integer not null
);

-- No policies on purpose: with RLS on, only the service role key (server-side) can read or write.
alter table quotes enable row level security;
