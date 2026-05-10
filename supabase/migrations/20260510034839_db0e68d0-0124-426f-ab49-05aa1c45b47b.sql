-- profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  phone text,
  govx_verified boolean not null default false,
  govx_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins manage profiles" on public.profiles for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));
create trigger profiles_updated before update on public.profiles for each row execute function public.tg_set_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  order_number text not null unique,
  status text not null default 'pending',
  currency text not null default 'AED',
  total numeric not null default 0,
  items jsonb not null default '[]'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Users read own orders" on public.orders for select to authenticated using (auth.uid() = user_id or has_role(auth.uid(),'admin'));
create policy "Admins write orders" on public.orders for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));
create trigger orders_updated before update on public.orders for each row execute function public.tg_set_updated_at();
create index orders_user_idx on public.orders(user_id);
create index orders_number_idx on public.orders(order_number);

-- tracking_events
create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  location text not null default '',
  lat double precision,
  lng double precision,
  note text not null default '',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.tracking_events enable row level security;
create policy "Public read tracking" on public.tracking_events for select using (true);
create policy "Admins write tracking" on public.tracking_events for all to authenticated using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));
create index tracking_order_idx on public.tracking_events(order_id, occurred_at desc);

-- realtime
alter publication supabase_realtime add table public.tracking_events;