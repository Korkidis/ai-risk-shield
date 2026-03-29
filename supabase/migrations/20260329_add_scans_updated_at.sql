alter table public.scans
  add column if not exists updated_at timestamptz;

update public.scans
set updated_at = coalesce(completed_at, created_at, now())
where updated_at is null;

alter table public.scans
  alter column updated_at set default now(),
  alter column updated_at set not null;

drop trigger if exists update_scans_updated_at on public.scans;

create trigger update_scans_updated_at
before update on public.scans
for each row execute function public.update_updated_at_column();
