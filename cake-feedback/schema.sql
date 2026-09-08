-- Morizot Passage — cake feedback
-- Run this in the Supabase SQL editor (SQL Editor → New query → paste → Run).

create table public.cake_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating smallint not null check (rating between 1 and 5),
  change_one_thing text not null,
  occasions text[] not null,
  price text not null,
  email text,
  source text not null default 'unknown',
  user_agent text
);

alter table public.cake_feedback enable row level security;

-- The anon key (used in index.html) may INSERT only.
-- No select, update, or delete is possible from the client.
grant insert on table public.cake_feedback to anon;

create policy "anon insert only"
  on public.cake_feedback
  for insert
  to anon
  with check (true);

-- Read your responses from the Supabase dashboard (Table editor), which uses
-- the service role and is unaffected by the policy above.
