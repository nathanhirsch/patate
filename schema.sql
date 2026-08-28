-- Packaging preference test — database schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table votes (
  id          bigint generated always as identity primary key,
  session_id  uuid        not null,
  round       int         not null,
  winner      text        not null,
  loser       text        not null,
  created_at  timestamptz not null default now()
);

create table responses (
  id          bigint generated always as identity primary key,
  session_id  uuid        not null,
  guess       text,
  why         text,
  email       text,
  created_at  timestamptz not null default now()
);

alter table votes     enable row level security;
alter table responses enable row level security;

-- Anyone can vote, and anyone can read votes (needed for the public leaderboard).
create policy "anon can insert votes" on votes     for insert to anon with check (true);
create policy "anon can read votes"   on votes     for select to anon using (true);

-- Anyone can submit contact info. Nobody can read it back from the client.
create policy "anon can insert responses" on responses for insert to anon with check (true);

-- The asymmetry is deliberate: email addresses must never be readable with the
-- anon key. Read them in the Supabase dashboard. Do not add a select policy on
-- responses.
