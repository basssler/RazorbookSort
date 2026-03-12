# Razorbook Reach Intake

Razorbook Reach Intake is a mobile-first web app for Razorbook Reach volunteers to scan donated books on their phones during high-volume intake sessions.

The app is designed to make book intake fast, simple, and repeatable during live sorting events, donation drop-offs, and storage-room organization.

## Core Workflow

Select batch → scan ISBN → detect duplicate → confirm minimal details → save → return to scanner

## V1 Scope

Included in v1:
- batch selection
- browser-based phone camera barcode scanning
- manual ISBN entry fallback
- duplicate detection within the active batch
- confirm/save flow
- quantity increment for duplicates
- inventory search and filtering
- edit book record
- CSV export by batch
- mobile-first responsive UI

Out of scope for v1:
- authentication
- role-based permissions
- volunteer accounts
- advanced admin controls
- analytics dashboards
- native mobile app
- app store deployment
- full offline sync system
- multi-user realtime collaboration

## Final Routes

- `/` → Home / Select Active Batch
- `/scan` → Scanner
- `/confirm` → Confirm scanned book before save
- `/inventory` → Search, filter, and export scanned books
- `/books/[id]/edit` → Edit existing book record

## Final Bin Labels

- Board Book
- Pre-K
- K-2
- 3-5
- Middle School
- YA
- Adult / Other
- Unknown

## Final Intake Status Labels

- Keep
- Review
- Reject

## Duplicate Handling

If a scanned ISBN already exists in the same batch:
- **Add Another Copy** → increment `quantity` and update `updated_at`
- **Open Existing Record** → open the existing book record
- **Cancel** → return to scanner without saving

Duplicate detection is based on ISBN within the active batch.

## Save Requirements

A book can still be saved even if metadata lookup fails, as long as these are available:
- ISBN
- bin label
- intake status

Metadata lookup should improve speed and reduce typing, but it must never block intake.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- Browser camera barcode scanning

## Suggested Repository Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    scan/
      page.tsx
    confirm/
      page.tsx
    inventory/
      page.tsx
    books/
      [id]/
        edit/
          page.tsx

  components/
    ui/
    scanner/
      BarcodeScanner.tsx
      ManualEntry.tsx
      DuplicateModal.tsx
    layout/
      MobileNavigation.tsx
      Header.tsx
    books/
      BookCard.tsx
      BinSelector.tsx
      StatusSelector.tsx

  lib/
    supabase/
      client.ts
      server.ts
    utils.ts

  services/
    scanner/
      normalizeIsbn.ts
      duplicateCheck.ts
    metadata/
      lookupBookByIsbn.ts
    books/
      saveBook.ts
      updateBook.ts
      searchBooks.ts
    export/
      generateCsv.ts

  types/
    database.ts
    app.ts
```

## Data Model Direction

### Batches
Fields:
- `id`
- `name`
- `source_location`
- `created_at`
- `status`

### Books
Fields:
- `id`
- `batch_id`
- `isbn_10`
- `isbn_13`
- `title`
- `authors`
- `publisher`
- `published_year`
- `thumbnail_url`
- `bin_label`
- `intake_status`
- `quantity`
- `notes`
- `created_at`
- `updated_at`

## Product Rules

1. The scanner is the center of the app.
2. Intake speed matters more than metadata completeness.
3. Volunteers should be able to continue even when metadata lookup fails.
4. Duplicate handling must be explicit and low-friction.
5. The main save action must support continuous scanning.
6. The app should stay simple enough for first-time volunteers to use with little explanation.

## Local Development

### Prerequisites
- Node.js 18+
- pnpm or npm
- Supabase project
- Vercel account for deployment

### Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If you use any server-only admin logic later, keep those keys server-side only.

### Install and Run

Using pnpm:

```bash
pnpm install
pnpm dev
```

Using npm:

```bash
npm install
npm run dev
```

The app will run locally at:

```text
http://localhost:3000
```

## Deployment

Recommended deployment path:
1. Push the repo to GitHub
2. Import the repo into Vercel
3. Add environment variables in Vercel
4. Deploy preview builds and test on real phones

## Verification Checklist

Before calling v1 ready, verify:
- batch selection works
- camera permission prompt works on phone
- ISBN scan works on iPhone Safari and Android Chrome
- duplicate detection works within the active batch
- Add Another Copy increments quantity correctly
- Open Existing Record routes correctly
- metadata lookup failure does not block save
- Save + Scan Next returns cleanly to the scanner
- inventory search and filters work
- CSV export downloads correctly

## Definition of V1 Success

V1 is successful if a volunteer can:
1. select a batch quickly
2. scan books from a phone browser
3. detect duplicates clearly
4. confirm minimal details in seconds
5. save and return to scanner without breaking rhythm
6. search and export batch inventory reliably

## Source of Truth

If project plans, generated code, or future notes conflict, the product contract should be treated as the source of truth for v1 product scope and behavior.
