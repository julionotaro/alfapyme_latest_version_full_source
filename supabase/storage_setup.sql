insert into storage.buckets (id, name, public)
select 'case-documents', 'case-documents', false
where not exists (
  select 1 from storage.buckets where id = 'case-documents'
);

drop policy if exists demo_case_documents_all on storage.objects;
create policy demo_case_documents_all
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'case-documents')
with check (bucket_id = 'case-documents');
