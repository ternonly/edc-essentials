
-- 1. Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Users see own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

-- 2. Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  module_label text not null,
  name text not null,
  price numeric(10,2) not null default 0,
  image_url text,
  specs jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Public can view active products"
on public.products for select
using (active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins insert products"
on public.products for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update products"
on public.products for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete products"
on public.products for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at
before update on public.products
for each row execute function public.tg_set_updated_at();

-- 3. Storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admins upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
