-- Storage bucket for product gallery/video uploads
insert into storage.buckets (id, name, public)
values ('s72-product-assets', 's72-product-assets', true)
on conflict (id) do nothing;

-- product_assets table: gallery (1-6) and video (v1-v2) per product
create table if not exists public.product_assets (
  id uuid primary key default gen_random_uuid(),
  product_id varchar(50) not null,
  slot varchar(10) not null,
  type varchar(10) not null check (type in ('image','video')),
  url text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, slot)
);

create index if not exists product_assets_product_idx
  on public.product_assets (product_id);

alter table public.product_assets enable row level security;

-- Public read
create policy "product_assets read" on public.product_assets
  for select using (true);

-- Admin write
create policy "product_assets admin insert" on public.product_assets
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "product_assets admin update" on public.product_assets
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "product_assets admin delete" on public.product_assets
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger trg_product_assets_updated_at
  before update on public.product_assets
  for each row execute function public.tg_set_updated_at();

-- Storage RLS for s72-product-assets bucket
create policy "s72-product-assets public read" on storage.objects
  for select using (bucket_id = 's72-product-assets');

create policy "s72-product-assets admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 's72-product-assets' and public.has_role(auth.uid(), 'admin'));

create policy "s72-product-assets admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 's72-product-assets' and public.has_role(auth.uid(), 'admin'));

create policy "s72-product-assets admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 's72-product-assets' and public.has_role(auth.uid(), 'admin'));