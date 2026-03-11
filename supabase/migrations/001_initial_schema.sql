create extension if not exists pgcrypto;

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_location text,
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  isbn_10 text,
  isbn_13 text,
  title text,
  authors text,
  publisher text,
  published_year integer,
  thumbnail_url text,
  bin_label text,
  intake_status text,
  quantity integer not null default 1,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists books_batch_idx on public.books(batch_id);
create index if not exists books_batch_isbn_10_idx on public.books(batch_id, isbn_10);
create index if not exists books_batch_isbn_13_idx on public.books(batch_id, isbn_13);

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

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.batches to anon, authenticated;
grant select, insert, update, delete on public.books to anon, authenticated;
