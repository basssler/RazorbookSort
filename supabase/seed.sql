insert into public.batches (name, source_location, status)
values
  ('South Side School Pickup', 'Warehouse Shelf A', 'open'),
  ('Community Church Donation Drive', 'North Hall Cart 3', 'open')
on conflict do nothing;

with seeded_batches as (
  select id, name
  from public.batches
  where name in ('South Side School Pickup', 'Community Church Donation Drive')
)
insert into public.books (
  batch_id,
  isbn_10,
  isbn_13,
  title,
  authors,
  publisher,
  published_year,
  thumbnail_url,
  bin_label,
  intake_status,
  quantity,
  notes
)
select
  batch.id,
  book.isbn_10,
  book.isbn_13,
  book.title,
  book.authors,
  book.publisher,
  book.published_year,
  book.thumbnail_url,
  book.bin_label,
  book.intake_status,
  book.quantity,
  book.notes
from seeded_batches as batch
join (
  values
    ('South Side School Pickup', '0064400557', '9780064400558', 'The Boxcar Children', 'Gertrude Chandler Warner', 'HarperCollins', 1989, null, '3-5', 'Keep', 2, 'Popular chapter book'),
    ('South Side School Pickup', '0590425600', '9780590425605', 'Clifford the Big Red Dog', 'Norman Bridwell', 'Scholastic', 1993, null, 'Pre-K', 'Keep', 1, null),
    ('South Side School Pickup', '0060256656', '9780060256654', 'Where the Wild Things Are', 'Maurice Sendak', 'HarperCollins', 1988, null, 'K-2', 'Keep', 1, null),
    ('South Side School Pickup', '0142403873', '9780142403877', 'The Lightning Thief', 'Rick Riordan', 'Disney-Hyperion', 2006, null, 'Middle School', 'Review', 1, 'Cover has light wear'),
    ('Community Church Donation Drive', '0439554934', '9780439554930', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Scholastic', 1999, null, 'Middle School', 'Keep', 3, null),
    ('Community Church Donation Drive', '0061120081', '9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 2006, null, 'YA', 'Review', 1, null),
    ('Community Church Donation Drive', '1524763136', '9781524763138', 'Becoming', 'Michelle Obama', 'Crown', 2018, null, 'Adult / Other', 'Keep', 1, 'Clean hardcover'),
    ('Community Church Donation Drive', '0679805273', '9780679805274', 'Green Eggs and Ham', 'Dr. Seuss', 'Random House', 1988, null, 'Board Book', 'Reject', 1, 'Damaged spine')
) as book(batch_name, isbn_10, isbn_13, title, authors, publisher, published_year, thumbnail_url, bin_label, intake_status, quantity, notes)
  on book.batch_name = batch.name
where not exists (
  select 1
  from public.books existing
  where existing.batch_id = batch.id
    and existing.isbn_13 = book.isbn_13
);
