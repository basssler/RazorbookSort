# Razorbook Reach Intake

Mobile-first Next.js App Router app for nonprofit volunteers scanning donated books on phones.

Core workflow:

`Select batch -> scan ISBN -> detect duplicate -> confirm minimal details -> save -> return to scanner`

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Browser camera scanning with `BarcodeDetector` when available

## Pages

- `/` Home Dashboard
- `/scanner` Scanner
- `/confirm` Confirm Book
- `/inventory` Inventory List
- `/edit/[id]` Edit Book

## Data model

Tables live in [supabase/schema.sql](C:/Users/maxba/Documents/GitHub/RazorbookSort/supabase/schema.sql).

- `batches`
- `books`

`books` are intentionally lean:

- `batch_id`
- `isbn_10`
- `isbn_13`
- `normalized_isbn`
- `title`
- `authors`
- `quantity`
- `status`
- `notes`

## Project structure

```text
app/
  api/                 Route handlers for batches, books, scan lookup, CSV export
  scanner/             Scanner page
  confirm/             Confirm page
  inventory/           Inventory page
  edit/[id]/           Edit page
src/components/        UI shell, forms, scanner client
src/lib/               Supabase, db queries, metadata lookup, ISBN utilities
supabase/schema.sql    Minimal schema and starter batches
```

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env.local` from `.env.example` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Run the SQL in [supabase/schema.sql](C:/Users/maxba/Documents/GitHub/RazorbookSort/supabase/schema.sql) against your Supabase project.

4. Start the app:

```bash
pnpm dev
```

## Vercel

This repo now targets Vercel as a standard Next.js app. The project config is in [vercel.json](C:/Users/maxba/Documents/GitHub/RazorbookSort/vercel.json).

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Notes

- Duplicate detection is scoped to `batch_id + normalized_isbn`.
- The primary duplicate action is quantity increment.
- Metadata lookup uses Google Books first and Open Library fallback.
- CSV export is per batch through `/api/batches/[id]/export`.
- If the browser does not support `BarcodeDetector`, volunteers can still use manual ISBN entry.
