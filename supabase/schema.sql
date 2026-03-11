create extension if not exists pgcrypto;

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  intake_date date not null default current_date,
  location text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  isbn_10 text,
  isbn_13 text,
  normalized_isbn text not null,
  title text not null default '',
  authors text,
  quantity integer not null default 1,
  status text not null default 'intake',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists books_batch_normalized_isbn_idx
  on public.books(batch_id, normalized_isbn);

create index if not exists books_search_idx
  on public.books(batch_id, title, authors, isbn_13, isbn_10);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
before update on public.books
for each row
execute procedure public.handle_updated_at();

insert into public.batches (name, code, intake_date, location, notes)
values
  ('March School Pickup', 'MAR-SCHOOL', current_date, 'Warehouse A', 'Default volunteer batch'),
  ('Weekend Church Drive', 'WEEKEND-CHURCH', current_date, 'North Hall', 'Community drive')
on conflict (code) do nothing;

