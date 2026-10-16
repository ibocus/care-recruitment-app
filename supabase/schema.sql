create table if not exists care_applications (
  id uuid primary key default gen_random_uuid(),
  reference_id text unique not null,
  applicant_name text,
  email text,
  phone text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists care_applications_created_at_idx on care_applications (created_at desc);

-- Recruitment pipeline: which stage a submitted application is at, run by
-- staff from the /admin panel. New applications default to the right to
-- work check, which gates entry to 'interview' — see src/data/pipeline.ts
-- for the transition rules enforced by the admin API.
alter table care_applications
  add column if not exists stage text not null default 'right_to_work_check',
  add column if not exists rtw_status text not null default 'pending',
  add column if not exists dbs_status text not null default 'pending',
  add column if not exists closed_reason text,
  add column if not exists stage_history jsonb not null default '[]'::jsonb;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'care_applications_stage_check') then
    alter table care_applications add constraint care_applications_stage_check
      check (stage in ('right_to_work_check', 'interview', 'references_dbs', 'offer', 'closed_not_eligible'));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'care_applications_rtw_status_check') then
    alter table care_applications add constraint care_applications_rtw_status_check
      check (rtw_status in ('pending', 'passed', 'failed'));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'care_applications_dbs_status_check') then
    alter table care_applications add constraint care_applications_dbs_status_check
      check (dbs_status in ('pending', 'applicant_applying', 'link_sent', 'completed'));
  end if;
end $$;

create index if not exists care_applications_stage_idx on care_applications (stage);

alter table care_applications enable row level security;

-- No public policies are created on purpose: this table is only written to
-- and read from the Vercel serverless function (api/apply.ts) using the
-- Supabase service role key, which bypasses row level security. Never
-- expose the service role key to the browser/frontend.
--
-- Table name is namespaced (care_applications, not applications)
-- since this project may hold tables for other apps too.
