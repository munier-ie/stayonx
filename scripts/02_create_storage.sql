-- Create a new storage bucket called 'ad-assets'
insert into storage.buckets (id, name, public)
values ('ad-assets', 'ad-assets', true);

-- Allow public access to read files in 'ad-assets'
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'ad-assets' );

-- Allow anyone (guest/anon) to upload files to 'ad-assets'
-- Note: In production, you might want to restrict this to only verified payments (via edge function)
-- but for this flow where the client uploads directly, we allow it.
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'ad-assets' );
