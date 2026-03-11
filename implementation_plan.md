# Razorbook Reach Intake — Implementation Plan v2

## Executive Summary

Razorbook Reach Intake is a mobile-first Next.js web app for nonprofit volunteers scanning donated books during high-volume intake sessions. It runs on volunteers' phones and feels like a native app. The core loop is: **Select Batch → Scan ISBN → Detect Duplicate → Confirm Minimal Details → Save → Return to Scanner**. V1 ships without authentication, role systems, or volunteer accounts — this is an internal tool first.

---

## Final Recommended Architecture

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14+ App Router | Server components, file-based routing, Vercel-native |
| Language | TypeScript | Type safety across client/server boundary |
| Styling | Tailwind CSS | Rapid mobile-first UI, utility-based |
| Database | Supabase (PostgreSQL) | Hosted DB + instant REST/realtime, free tier |
| Hosting | Vercel | Zero-config Next.js deploys, preview URLs |
| Barcode | `html5-qrcode` or `@zxing/browser` | Proven browser-camera barcode libraries |
| Metadata | Open Library API (optional) | Free ISBN → title/author/cover lookup |

---

## Route Structure

| Route | Purpose | Notes |
|---|---|---|
| `/` | Select or create active batch | Landing screen, batch picker |
| `/scan` | Camera barcode scanner | Core scanning page, manual entry fallback |
| `/confirm` | Confirm scanned book before save | Shows metadata, bin label, intake status |
| `/inventory` | Search, filter, export scanned books | Table/list view with CSV export |
| `/books/[id]/edit` | Edit an existing book record | Full edit form for any field |

Navigation: persistent bottom tab bar with **Scan**, **Inventory**, and **Batch** tabs. Active batch name displayed in header.

---

## Supabase Schema Recommendation

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE batches (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    source_location TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed'))
);

CREATE TABLE books (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id        UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    isbn_10         TEXT,
    isbn_13         TEXT,
    title           TEXT,
    author          TEXT,
    publisher       TEXT,
    published_year  INT,
    thumbnail_url   TEXT,
    bin_label       TEXT CHECK (bin_label IN (
                        'Board Book', 'Pre-K', 'K-2', '3-5',
                        'Middle School', 'YA', 'Adult / Other', 'Unknown'
                    )),
    intake_status   TEXT DEFAULT 'Keep' CHECK (intake_status IN ('Keep', 'Review', 'Reject')),
    quantity        INT DEFAULT 1,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent true duplicate rows per batch (one record per ISBN per batch; quantity tracks copies)
CREATE UNIQUE INDEX uq_books_isbn13_batch ON books (isbn_13, batch_id)
    WHERE isbn_13 IS NOT NULL;
CREATE UNIQUE INDEX uq_books_isbn10_batch ON books (isbn_10, batch_id)
    WHERE isbn_10 IS NOT NULL AND isbn_13 IS NULL;

-- Fast lookups
CREATE INDEX idx_books_batch_id ON books (batch_id);
CREATE INDEX idx_books_isbn13 ON books (isbn_13);
```

### Duplicate Strategy

Duplicates are detected by ISBN within the same batch. On scan:
1. Query for existing book record matching the scanned ISBN + active `batch_id`.
2. If found → show **Duplicate Modal** with three options:
   - **Add Another Copy** → increment `quantity` on existing record
   - **Open Existing Record** → navigate to `/books/[id]/edit`
   - **Cancel** → return to scanner
3. If not found → proceed to `/confirm`.

No `is_duplicate` boolean column. The unique constraint + quantity field handle this cleanly.

---

## Repository Structure

```
src/
├── app/
│   ├── layout.tsx              # App shell, viewport meta, Tailwind, bottom nav
│   ├── page.tsx                # Home: Select / Create Batch
│   ├── scan/
│   │   └── page.tsx            # Scanner page
│   ├── confirm/
│   │   └── page.tsx            # Confirm scanned book
│   ├── inventory/
│   │   └── page.tsx            # Search, filter, export
│   └── books/
│       └── [id]/
│           └── edit/
│               └── page.tsx    # Edit existing book
├── components/
│   ├── ui/                     # Button, Modal, Input, Select, Badge, Toast
│   ├── scanner/
│   │   ├── BarcodeScanner.tsx  # Camera viewfinder + scan logic
│   │   ├── ManualEntry.tsx     # Manual ISBN input fallback
│   │   └── DuplicateModal.tsx  # Duplicate detection modal
│   └── layout/
│       ├── AppShell.tsx        # Header + bottom nav wrapper
│       └── BottomNav.tsx       # Tab bar (Scan, Inventory, Batch)
├── services/
│   ├── books.ts                # CRUD operations for books table
│   ├── batches.ts              # CRUD operations for batches table
│   ├── scanner.ts              # ISBN parsing, normalization (10↔13)
│   ├── metadata.ts             # Open Library API lookup
│   └── export.ts               # CSV generation and download
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server-side Supabase client
│   └── utils.ts                # Shared helpers
└── types/
    └── index.ts                # Book, Batch, BinLabel, IntakeStatus types
supabase/
├── migrations/
│   └── 001_initial_schema.sql
└── seed.sql                    # Sample batches + books for dev
```

---

## Implementation Phases

### Phase 1 — App Shell & Routes
- Initialize Next.js with App Router, TypeScript, Tailwind
- Build `layout.tsx` with mobile viewport, app header, bottom tab bar
- Stub all five route pages with placeholder content
- Confirm Vercel deploys the shell successfully

### Phase 2 — Supabase Schema & Seed Data
- Create Supabase project, set environment variables
- Run migration `001_initial_schema.sql`
- Write `seed.sql` with 2 sample batches + 5–10 sample books
- Set up `lib/supabase/client.ts` and `lib/supabase/server.ts`
- Verify connection from the app

### Phase 3 — Inventory Read / Search / Edit
- Build `services/books.ts` and `services/batches.ts` (CRUD)
- Implement `/inventory` page: list books in active batch, search by title/ISBN, filter by bin label / intake status
- Implement `/books/[id]/edit` page: full edit form for all book fields
- Implement batch selector on `/` (home page)

### Phase 4 — Scanner Page & Camera Integration
- Integrate `html5-qrcode` (or `@zxing/browser`) in `BarcodeScanner.tsx`
- Handle camera permission request + denial fallback
- Build `ManualEntry.tsx` for manual ISBN input
- Add audio/haptic feedback on successful scan
- Route scanned ISBN to `/confirm` with data in query params or state

### Phase 5 — Duplicate Detection
- Build `DuplicateModal.tsx` with three actions (Add Copy, Open Existing, Cancel)
- Wire duplicate check query into the scan → confirm transition
- Implement quantity increment on "Add Another Copy"

### Phase 6 — Confirm / Save Loop
- Build `/confirm` page with:
  - Scanned ISBN + any auto-filled metadata displayed
  - `bin_label` selector (Board Book, Pre-K, K-2, 3-5, Middle School, YA, Adult / Other, Unknown)
  - `intake_status` selector (Keep, Review, Reject)
  - **Save + Scan Next** primary action
- On save → insert to Supabase → redirect to `/scan`

### Phase 7 — Metadata Lookup
- Build `services/metadata.ts` using Open Library Covers/Books API
- Auto-fill title, author, publisher, year, thumbnail on `/confirm` when ISBN is found
- Graceful fallback: if lookup fails or times out, show empty fields for manual entry
- Keep lookup async and non-blocking to the save flow

### Phase 8 — CSV Export
- Build `services/export.ts` to generate CSV from books in a batch
- Add export button on `/inventory` page
- Include all relevant fields: ISBN, title, author, bin label, status, quantity, notes

### Phase 9 — Deployment & Device Testing
- Final Vercel production deploy
- Full testing matrix (see Verification Plan below)
- UI polish pass: touch targets ≥ 44px, font sizes, contrast

---

## Risks and Edge Cases

| Risk | Mitigation |
|---|---|
| **Camera denied** | Always show manual ISBN entry fallback; clear error message with instructions to re-enable |
| **Poor lighting / damaged barcode** | Scan overlay guide, flashlight toggle if supported, manual entry |
| **No network / flaky connection** | Graceful error toasts on failed saves; consider localStorage queue for retry in a future version |
| **Intentional vs accidental duplicates** | Duplicate modal with explicit choices (Add Copy vs Open Existing vs Cancel) |
| **Camera resource leak** | Robust cleanup on component unmount; only initialize camera when scanner page is active |
| **ISBN-10 vs ISBN-13 mismatch** | Normalize all scanned ISBNs; store both `isbn_10` and `isbn_13` when possible |
| **Metadata API rate limits / downtime** | Timeout after 3s, proceed with manual entry; do not block the save loop |
| **Large batch sizes** | Paginate inventory queries; virtual scrolling if needed in future |

---

## Verification Plan

### Automated / Dev Testing
- Unit tests for ISBN-10 ↔ ISBN-13 normalization logic in `services/scanner.ts`
- Unit tests for CSV generation in `services/export.ts`
- Integration tests for `services/books.ts` CRUD against Supabase

### Browser & Device Testing
- **iPhone Safari** (primary target): full scan → confirm → save loop
- **Android Chrome**: same loop, verify camera API compatibility
- Test on at least one low-end device to verify performance

### Scenario Tests
| Scenario | Expected Result |
|---|---|
| Scan a new ISBN | → goes to `/confirm`, fields populate, save succeeds |
| Scan same ISBN again in same batch | → duplicate modal appears with 3 options |
| "Add Another Copy" on duplicate | → quantity increments, returns to scanner |
| "Open Existing Record" on duplicate | → navigates to `/books/[id]/edit` |
| Deny camera permission | → manual entry input appears, scanner disables gracefully |
| Scan in low light | → overlay guide visible, flashlight toggle available |
| Metadata lookup fails / times out | → empty fields shown, volunteer can type minimal info |
| Export CSV | → CSV file downloads with correct columns and data |
| Edit a book from inventory | → changes save, inventory reflects update |

### Simulated Live Session
Run one full simulated intake session:
- Create a batch
- Scan 15–20 books (mix of real ISBNs and manual entry)
- Trigger at least 3 duplicates
- Edit 2 records from inventory
- Export CSV and verify contents
- Complete on a real phone

---

## Open Questions

1. **Metadata API choice**: Open Library is free with no API key. Is this acceptable, or is there a preferred book metadata source?
2. **Offline mode**: Should v1 include any offline queueing (localStorage), or is "retry on reconnect" sufficient for now?
