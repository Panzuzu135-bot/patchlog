-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  widget_color text not null default '#6366f1',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "owner can do everything" on public.projects
  for all using (auth.uid() = user_id);

-- Public read for widget (by slug)
create policy "public can read by slug" on public.projects
  for select using (true);

-- ─────────────────────────────────────────
-- CHANGELOG ENTRIES
-- ─────────────────────────────────────────
create type entry_type as enum ('feature', 'fix', 'improvement', 'breaking');

create table public.changelog_entries (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  content      text not null,
  version      text,
  type         entry_type not null default 'improvement',
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.changelog_entries enable row level security;

-- Owner full access
create policy "owner can do everything" on public.changelog_entries
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = changelog_entries.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Public read only published entries (for the widget)
create policy "public can read published" on public.changelog_entries
  for select using (published = true);

-- ─────────────────────────────────────────
-- SUBSCRIPTIONS (Stripe)
-- ─────────────────────────────────────────
create type subscription_plan as enum ('free', 'pro');

create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   subscription_plan not null default 'free',
  status                 text not null default 'active',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "owner read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- AUTO updated_at trigger
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.changelog_entries
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────
-- Auto-create free subscription on signup
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
