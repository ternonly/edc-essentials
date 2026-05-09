-- 1) products: add long description + video
alter table public.products
  add column if not exists description text not null default '',
  add column if not exists video_url text;

-- 2) product images gallery
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_id_idx on public.product_images(product_id);

alter table public.product_images enable row level security;

create policy "Public read product images"
  on public.product_images for select
  using (true);

create policy "Admins insert product images"
  on public.product_images for insert to authenticated
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins update product images"
  on public.product_images for update to authenticated
  using (has_role(auth.uid(), 'admin'));

create policy "Admins delete product images"
  on public.product_images for delete to authenticated
  using (has_role(auth.uid(), 'admin'));

-- 3) product reviews
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author text not null,
  rating int not null default 5 check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);

alter table public.product_reviews enable row level security;

create policy "Public read product reviews"
  on public.product_reviews for select
  using (active = true or has_role(auth.uid(), 'admin'));

create policy "Admins write product reviews"
  on public.product_reviews for all to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

-- 4) site content KV (group + key, JSON value)
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  group_key text not null,
  item_key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (group_key, item_key)
);

alter table public.site_content enable row level security;

create policy "Public read site content"
  on public.site_content for select
  using (true);

create policy "Admins write site content"
  on public.site_content for all to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.tg_set_updated_at();

-- 5) Allow admins to upload to product-images bucket (public read already on bucket)
create policy "Admins upload product images storage"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and has_role(auth.uid(), 'admin'));

create policy "Admins update product images storage"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and has_role(auth.uid(), 'admin'));

create policy "Admins delete product images storage"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and has_role(auth.uid(), 'admin'));