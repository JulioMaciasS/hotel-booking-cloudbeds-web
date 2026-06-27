create table if not exists public.cloudbeds_room_assignment_events (
  id bigint generated always as identity primary key,
  reservation_id text,
  event text,
  status text not null default 'processing'
    check (
      status = any (
        array[
          'processing',
          'success',
          'noop',
          'ignored',
          'failed',
          'unauthorized',
          'misconfigured'
        ]
      )
    ),
  checkin date,
  checkout date,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  bedding_preference text,
  preference jsonb not null default '{}'::jsonb,
  reservation_rooms jsonb not null default '[]'::jsonb,
  available_rooms jsonb not null default '[]'::jsonb,
  planned_assignments jsonb not null default '[]'::jsonb,
  executed_assignments jsonb not null default '[]'::jsonb,
  issues jsonb not null default '[]'::jsonb,
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.cloudbeds_room_assignment_events enable row level security;

create index if not exists cloudbeds_room_assignment_events_reservation_created_idx
  on public.cloudbeds_room_assignment_events (reservation_id, created_at desc);

create index if not exists cloudbeds_room_assignment_events_status_created_idx
  on public.cloudbeds_room_assignment_events (status, created_at desc);

create or replace function public.set_cloudbeds_room_assignment_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cloudbeds_room_assignment_events_updated_at
  on public.cloudbeds_room_assignment_events;

create trigger set_cloudbeds_room_assignment_events_updated_at
before update on public.cloudbeds_room_assignment_events
for each row execute function public.set_cloudbeds_room_assignment_events_updated_at();
