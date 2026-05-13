create table if not exists exported_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  output_batch_id uuid references output_batches(id),
  file_name text not null,
  file_path text,
  file_format text default 'csv',
  total_rows int default 0,
  status text default 'generated',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table output_jobs
add column if not exists retry_after timestamptz,
add column if not exists last_error text;

create or replace function retry_failed_jobs()
returns int language plpgsql as $$
declare v_total int := 0;
begin
  update output_jobs set status='retrying', attempts=coalesce(attempts,0)+1, updated_at=now()
  where status='failed' and coalesce(attempts,0) < coalesce(max_attempts,3);
  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

alter table exported_files enable row level security;
drop policy if exists demo_exported_files_all on exported_files;
create policy demo_exported_files_all on exported_files for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_audit_logs_all on audit_logs;
create policy demo_audit_logs_all on audit_logs for all to anon, authenticated using(true) with check(true);

grant execute on function retry_failed_jobs() to anon, authenticated;
