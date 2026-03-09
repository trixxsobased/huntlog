create sequence if not exists bugs_seq start with 1 increment by 1;

create table if not exists bugs (
  id uuid primary key default gen_random_uuid(),
  bug_id text unique not null default ('HL-' || lpad(nextval('bugs_seq')::text, 4, '0')),
  title text not null,
  description text default '',
  steps_to_reproduce text default '',
  severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'low',
  status text check (status in ('new', 'triaged', 'needs_more_info', 'resolved', 'duplicate', 'out_of_scope', 'informative', 'n_a')) default 'new',
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  cvss_score numeric(3,1) check (cvss_score >= 0 and cvss_score <= 10.0),
  cvss_vector text,
  vulnerability_type text,
  target_url text,
  expected_behavior text,
  actual_behavior text,
  impact text,
  remediation text,
  program_name text,
  h1_report_id text,
  h1_report_url text,
  bounty_amount numeric(10, 2)
);

create table if not exists bug_attachments (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid references bugs(id) on delete cascade not null,
  file_url text not null,
  file_name text not null,
  uploaded_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

create table if not exists programs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  platform text not null check (platform in ('HackerOne', 'Bugcrowd', 'Intigriti', 'YesWeHack', 'Synack', 'Other')),
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

create index if not exists programs_user_id_idx on programs(user_id);

alter table bugs enable row level security;
alter table bug_attachments enable row level security;
alter table programs enable row level security;

-- Bugs Policies
create policy "Users can view their own bugs" on bugs for select using (auth.uid() = user_id);
create policy "Users can insert their own bugs" on bugs for insert with check (auth.uid() = user_id);
create policy "Users can update their own bugs" on bugs for update using (auth.uid() = user_id);
create policy "Users can delete their own bugs" on bugs for delete using (auth.uid() = user_id);

-- Bug Attachments Policies
create policy "Users can view attachments of their bugs" on bug_attachments for select using (uploaded_by = auth.uid());
create policy "Users can upload attachments to their bugs" on bug_attachments for insert with check (uploaded_by = auth.uid());
create policy "Users can delete their attachments" on bug_attachments for delete using (uploaded_by = auth.uid());

-- Programs Policies
create policy "Users can view own programs" on programs for select using (auth.uid() = user_id);
create policy "Users can insert own programs" on programs for insert with check (auth.uid() = user_id);
create policy "Users can update own programs" on programs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own programs" on programs for delete using (auth.uid() = user_id);

-- Triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bugs_updated_at
  before update on bugs
  for each row
  execute function update_updated_at();

-- Storage setup
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', true) on conflict do nothing;

create policy "Users can upload attachments" on storage.objects for insert with check (bucket_id = 'attachments' and auth.uid() = owner);
create policy "Users can view attachments" on storage.objects for select using (bucket_id = 'attachments');
create policy "Users can delete attachments" on storage.objects for delete using (bucket_id = 'attachments' and auth.uid() = owner);
