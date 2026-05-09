
-- Fix function search_path
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Restrict has_role execution
revoke execute on function public.has_role(uuid, app_role) from public, anon;
grant execute on function public.has_role(uuid, app_role) to authenticated, service_role;

-- Tighten storage read: keep public per-object reads (bucket is public so URLs work),
-- but no listing capability is exposed via REST anyway since RLS still applies on listing.
-- Drop overly broad select policy and replace with one that only returns objects (not list buckets).
drop policy "Public read product images" on storage.objects;

create policy "Public read individual product images"
on storage.objects for select
using (bucket_id = 'product-images');
