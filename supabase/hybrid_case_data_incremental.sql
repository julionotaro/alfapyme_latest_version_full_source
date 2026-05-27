create table if not exists document_field_extractions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  field_key text not null,
  field_value text not null,
  normalized_value text,
  confidence numeric(5,2),
  source_fragment text,
  page_number int,
  is_canonical_candidate boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_document_field_extractions_case on document_field_extractions(case_id, field_key);
create index if not exists idx_document_field_extractions_document on document_field_extractions(document_id);

create table if not exists case_canonical_data (
  case_id uuid primary key references cases(id) on delete cascade,
  canonical_data jsonb not null default '{}'::jsonb,
  conflict_data jsonb not null default '[]'::jsonb,
  completeness int not null default 0,
  updated_at timestamptz not null default now()
);

alter table document_field_extractions enable row level security;
alter table case_canonical_data enable row level security;

drop policy if exists demo_document_field_extractions_all on document_field_extractions;
create policy demo_document_field_extractions_all on document_field_extractions for all to anon, authenticated using(true) with check(true);

drop policy if exists demo_case_canonical_data_all on case_canonical_data;
create policy demo_case_canonical_data_all on case_canonical_data for all to anon, authenticated using(true) with check(true);
