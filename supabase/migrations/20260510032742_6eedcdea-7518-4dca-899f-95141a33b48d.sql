-- Public buckets serve files via direct URLs without needing a SELECT RLS policy.
-- Removing the broad SELECT prevents anonymous clients from listing bucket contents.
drop policy if exists "s72-product-assets public read" on storage.objects;