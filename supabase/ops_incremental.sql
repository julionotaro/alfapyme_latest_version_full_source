create table if not exists exported_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
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

create or replace function reconcile_case_checklist(
  p_case_id uuid,
  p_items jsonb
)
returns int language plpgsql as $$
declare
  v_item jsonb;
  v_total int := 0;
  v_existing_id uuid;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a jsonb array';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select cdc.id
      into v_existing_id
    from case_document_checklist cdc
    where cdc.case_id = p_case_id
      and (
        lower(coalesce(cdc.expected_document_type, '')) = lower(coalesce(v_item->>'expected_document_type', ''))
        or lower(coalesce(cdc.document_label, '')) = lower(coalesce(v_item->>'document_label', ''))
      )
    order by cdc.updated_at desc nulls last, cdc.id
    limit 1;

    if v_existing_id is null then
      insert into case_document_checklist (
        case_id,
        document_label,
        expected_document_type,
        is_blocking,
        status,
        validation_status,
        document_id,
        updated_at
      ) values (
        p_case_id,
        v_item->>'document_label',
        nullif(v_item->>'expected_document_type', ''),
        coalesce((v_item->>'is_blocking')::boolean, false),
        coalesce(v_item->>'status', 'missing'),
        coalesce(v_item->>'validation_status', 'missing'),
        nullif(v_item->>'document_id', '')::uuid,
        now()
      );
      v_total := v_total + 1;
    else
      update case_document_checklist
      set
        document_label = v_item->>'document_label',
        expected_document_type = nullif(v_item->>'expected_document_type', ''),
        is_blocking = coalesce((v_item->>'is_blocking')::boolean, is_blocking),
        status = coalesce(v_item->>'status', status),
        validation_status = coalesce(v_item->>'validation_status', validation_status),
        document_id = nullif(v_item->>'document_id', '')::uuid,
        updated_at = now()
      where id = v_existing_id;
      v_total := v_total + 1;
    end if;
  end loop;

  return v_total;
end;
$$;

alter table exported_files enable row level security;
drop policy if exists demo_exported_files_all on exported_files;
create policy demo_exported_files_all on exported_files for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_audit_logs_all on audit_logs;
create policy demo_audit_logs_all on audit_logs for all to anon, authenticated using(true) with check(true);

grant execute on function retry_failed_jobs() to anon, authenticated;
grant execute on function reconcile_case_checklist(uuid, jsonb) to anon, authenticated;
