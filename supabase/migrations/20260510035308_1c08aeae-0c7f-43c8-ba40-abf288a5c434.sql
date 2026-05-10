create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body_html text not null default '',
  cover_url text,
  category text not null default 'Field Guide',
  tags text[] not null default '{}',
  meta_description text not null default '',
  reading_minutes int not null default 4,
  published boolean not null default false,
  published_at timestamptz,
  author text not null default 'Survival72 Team',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create policy "Public read published posts" on public.blog_posts for select
  using (published = true or has_role(auth.uid(),'admin'));
create policy "Admins write posts" on public.blog_posts for all to authenticated
  using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));
create trigger blog_posts_updated before update on public.blog_posts
  for each row execute function public.tg_set_updated_at();
create index blog_posts_published_idx on public.blog_posts(published, published_at desc);
create index blog_posts_category_idx on public.blog_posts(category);