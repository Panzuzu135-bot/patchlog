-- 1. Fix handle_new_user: solo crea profile, ya no toca subscriptions
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- 2. Eliminar tabla subscriptions y su tipo enum
drop table if exists public.subscriptions cascade;
drop type if exists subscription_plan;

-- 3. Renombrar widget_color → brand_color en projects
alter table public.projects rename column widget_color to brand_color;

-- 4. Crear tabla follows con RLS
create table public.follows (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, project_id)
);

alter table public.follows enable row level security;

create policy "follows: select" on public.follows
  for select using (true);

create policy "follows: owner insert" on public.follows
  for insert with check (auth.uid() = user_id);

create policy "follows: owner delete" on public.follows
  for delete using (auth.uid() = user_id);

create index idx_follows_user_id on public.follows(user_id);
create index idx_follows_project_id on public.follows(project_id);
