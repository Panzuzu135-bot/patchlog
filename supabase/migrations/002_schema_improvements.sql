-- ─────────────────────────────────────────
-- 1. INDEXES
-- ─────────────────────────────────────────
create index idx_changelog_entries_project_id on public.changelog_entries(project_id);
create index idx_changelog_entries_published_at on public.changelog_entries(published_at desc nulls last);
create index idx_subscriptions_stripe_customer_id on public.subscriptions(stripe_customer_id);
create index idx_projects_user_id on public.projects(user_id);

-- ─────────────────────────────────────────
-- 2. AUTO published_at TRIGGER
-- ─────────────────────────────────────────
create or replace function public.set_published_at()
returns trigger language plpgsql as $$
begin
  if new.published = true and (old.published = false or old.published is null) then
    new.published_at = now();
  elsif new.published = false then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger set_published_at
  before update on public.changelog_entries
  for each row execute function public.set_published_at();

-- ─────────────────────────────────────────
-- 3. FIX RLS — explicit per-operation policies
-- ─────────────────────────────────────────

-- PROJECTS: drop broad policies, replace with explicit ones
drop policy "owner can do everything" on public.projects;
drop policy "public can read by slug" on public.projects;

create policy "projects: owner select" on public.projects
  for select using (auth.uid() = user_id);

create policy "projects: public select" on public.projects
  for select using (true);

create policy "projects: owner insert" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "projects: owner update" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects: owner delete" on public.projects
  for delete using (auth.uid() = user_id);

-- CHANGELOG ENTRIES: drop and replace
drop policy "owner can do everything" on public.changelog_entries;
drop policy "public can read published" on public.changelog_entries;

create policy "entries: owner select" on public.changelog_entries
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = changelog_entries.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "entries: public select published" on public.changelog_entries
  for select using (published = true);

create policy "entries: owner insert" on public.changelog_entries
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = changelog_entries.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "entries: owner update" on public.changelog_entries
  for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = changelog_entries.project_id
        and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects
      where projects.id = changelog_entries.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "entries: owner delete" on public.changelog_entries
  for delete using (
    exists (
      select 1 from public.projects
      where projects.id = changelog_entries.project_id
        and projects.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 5. PROFILES TABLE
-- ─────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: public select" on public.profiles
  for select using (true);

create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Sync profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;

-- ─────────────────────────────────────────
-- 6. ADD 'security' TO entry_type ENUM
-- ─────────────────────────────────────────
alter type entry_type add value if not exists 'security';
