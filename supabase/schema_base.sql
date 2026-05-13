create extension if not exists pgcrypto;

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  organization_id uuid,
  client_name text not null,
  vehicle_plate text,
  case_type text not null,
  status text not null default 'draft',
  workflow_template text,
  requirement_template text,
  business_line text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  organization_id uuid,
  file_name text not null,
  file_type text,
  source_channel text,
  storage_path text,
  status text default 'uploaded',
  document_type text,
  confidence numeric(5,2),
  ocr_text text,
  ai_payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists case_document_checklist (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  document_label text not null,
  document_type text,
  expected_document_type text,
  status text not null default 'missing',
  validation_status text not null default 'missing',
  is_blocking boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  case_id uuid references cases(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists output_queue (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  case_type text not null,
  output_route text,
  output_mode text,
  status text not null default 'pending',
  destination_system text,
  created_at timestamptz not null default now()
);

create table if not exists output_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  case_type text,
  total_cases int not null default 0,
  status text not null default 'pending',
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists output_batch_cases (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references output_batches(id) on delete cascade,
  case_id uuid not null references cases(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists output_sessions (
  id uuid primary key default gen_random_uuid(),
  session_name text not null,
  case_type text,
  total_cases int not null default 0,
  status text not null default 'pending',
  output_route text,
  created_at timestamptz not null default now()
);

create table if not exists output_session_cases (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references output_sessions(id) on delete cascade,
  case_id uuid not null references cases(id) on delete cascade,
  status text not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists output_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  attempts int not null default 0,
  max_attempts int not null default 3,
  output_route text,
  destination_system text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists output_strategies (
  id uuid primary key default gen_random_uuid(),
  case_type text not null,
  output_route text,
  output_mode text,
  grouping_strategy text,
  destination_system text,
  created_at timestamptz not null default now()
);

create or replace function sync_document_to_checklist(p_document_id uuid)
returns int language plpgsql as $$
declare
  v_document documents%rowtype;
  v_count int := 0;
begin
  select * into v_document from documents where id = p_document_id;

  if not found then
    raise exception 'document % not found', p_document_id;
  end if;

  update case_document_checklist
  set
    document_id = v_document.id,
    document_type = coalesce(v_document.document_type, document_type),
    status = 'received',
    validation_status = case
      when coalesce(v_document.confidence, 0) < 0.85 then 'needs_review'
      else 'pending'
    end,
    updated_at = now()
  where case_id = v_document.case_id
    and (
      lower(coalesce(expected_document_type, '')) = lower(coalesce(v_document.document_type, ''))
      or lower(coalesce(document_type, '')) = lower(coalesce(v_document.document_type, ''))
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function process_output_queue()
returns jsonb language plpgsql as $$
declare
  v_total int := 0;
begin
  update output_queue
  set status = 'processed'
  where status = 'pending';

  get diagnostics v_total = row_count;

  return jsonb_build_object(
    'processed', v_total,
    'status', 'ok'
  );
end;
$$;

alter table cases enable row level security;
alter table documents enable row level security;
alter table case_document_checklist enable row level security;
alter table audit_logs enable row level security;
alter table output_queue enable row level security;
alter table output_batches enable row level security;
alter table output_batch_cases enable row level security;
alter table output_sessions enable row level security;
alter table output_session_cases enable row level security;
alter table output_jobs enable row level security;
alter table output_strategies enable row level security;

drop policy if exists demo_cases_all on cases;
create policy demo_cases_all on cases for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_documents_all on documents;
create policy demo_documents_all on documents for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_case_document_checklist_all on case_document_checklist;
create policy demo_case_document_checklist_all on case_document_checklist for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_audit_logs_all on audit_logs;
create policy demo_audit_logs_all on audit_logs for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_queue_all on output_queue;
create policy demo_output_queue_all on output_queue for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_batches_all on output_batches;
create policy demo_output_batches_all on output_batches for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_batch_cases_all on output_batch_cases;
create policy demo_output_batch_cases_all on output_batch_cases for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_sessions_all on output_sessions;
create policy demo_output_sessions_all on output_sessions for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_session_cases_all on output_session_cases;
create policy demo_output_session_cases_all on output_session_cases for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_jobs_all on output_jobs;
create policy demo_output_jobs_all on output_jobs for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_output_strategies_all on output_strategies;
create policy demo_output_strategies_all on output_strategies for all to anon, authenticated using(true) with check(true);

grant execute on function sync_document_to_checklist(uuid) to anon, authenticated;
grant execute on function process_output_queue() to anon, authenticated;
