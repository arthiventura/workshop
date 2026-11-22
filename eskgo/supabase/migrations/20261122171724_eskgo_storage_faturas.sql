-- Eskgo · 4/5 · storage: bucket privado das faturas (estágio 2)
-- Caminho dos arquivos: {auth.uid()}/{yyyy-mm}/{uuid}.{pdf|jpg|png|heic}
-- Limite igual ao da tela Fatura (15 MB). Tamanho e MIME são aplicados pela Storage API.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'faturas', 'faturas', false, 15728640,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- cada pessoa só mexe na própria pasta: o primeiro segmento do caminho é o uid dela
create policy faturas_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy faturas_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy faturas_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy faturas_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);
