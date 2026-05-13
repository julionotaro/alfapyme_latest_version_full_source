insert into cases (
  public_id,
  client_name,
  organization_id,
  vehicle_plate,
  case_type,
  status,
  workflow_template,
  requirement_template,
  business_line
)
values (
  'EXP-0001',
  'Cliente Demo',
  null,
  '1234ABC',
  'transferencia',
  'draft',
  'gestoria_dgt',
  'gestoria_dgt',
  'gestoria_dgt'
)
on conflict (public_id) do update
set
  client_name = excluded.client_name,
  vehicle_plate = excluded.vehicle_plate,
  case_type = excluded.case_type,
  status = excluded.status,
  workflow_template = excluded.workflow_template,
  requirement_template = excluded.requirement_template,
  business_line = excluded.business_line,
  updated_at = now();

insert into output_strategies (
  case_type,
  output_route,
  output_mode,
  grouping_strategy,
  destination_system
)
select 'transferencia', 'csv', 'batch', 'case_type', 'dgt_demo'
where not exists (
  select 1
  from output_strategies
  where case_type = 'transferencia'
    and output_route = 'csv'
    and destination_system = 'dgt_demo'
);
