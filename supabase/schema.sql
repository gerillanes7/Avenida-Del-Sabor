-- Ciudad Sabrosa: one public restaurant per player.
-- Run this once in Supabase (SQL Editor > New query > Run).

create table if not exists public.restaurants (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 28),
  owner       text not null check (char_length(owner) between 1 and 18),
  level       int  not null default 1 check (level between 1 and 999),
  served      int  not null default 0 check (served >= 0),
  stars       int  not null default 1 check (stars between 1 and 5),
  state       jsonb not null check (pg_column_size(state) < 200000),
  updated_at  timestamptz not null default now()
);

create index if not exists restaurants_updated_at on public.restaurants (updated_at desc);

alter table public.restaurants enable row level security;

-- Anyone, signed in or not, can look at restaurants to visit them.
drop policy if exists "restaurants are public" on public.restaurants;
create policy "restaurants are public" on public.restaurants
  for select using (true);

-- Each player can create and change only their own restaurant.
drop policy if exists "players insert their own restaurant" on public.restaurants;
create policy "players insert their own restaurant" on public.restaurants
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "players update their own restaurant" on public.restaurants;
create policy "players update their own restaurant" on public.restaurants
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "players delete their own restaurant" on public.restaurants;
create policy "players delete their own restaurant" on public.restaurants
  for delete to authenticated using (auth.uid() = id);
