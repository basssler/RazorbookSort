# Razorbook Reach Intake — Execution Roadmap

## Milestone Overview

| # | Milestone | Depends On | Key Deliverable |
|---|---|---|---|
| 1 | App Shell, Routes & Navigation | — | Deployed mobile shell with 5 stubbed routes and bottom nav |
| 2 | Supabase Schema, Seed & Active Batch | M1 | Live DB, batch selector, `useActiveBatch` hook |
| 3 | Inventory Read / Search / Edit | M2 | Working `/inventory` and `/books/[id]/edit` against real data |
| 4 | Scanner & Camera Integration | M1 | Camera barcode scanning + manual ISBN entry on `/scan` |
| 5 | Duplicate Detection | M2, M4 | Duplicate modal with Add Copy / Open Existing / Cancel |
| 6 | Confirm / Save Loop | M4, M5 | `/confirm` → save → redirect `/scan` with bin + status selectors |
| 7 | Metadata Lookup | M6 | Auto-fill from Open Library on `/confirm`, graceful fallback |
| 8 | CSV Export | M3 | Export button on `/inventory`, valid CSV download |
| 9 | Device Testing & Deploy Polish | M1–M8 | Production deploy, tested on real phones |

---

## Milestone 1 — App Shell, Routes & Navigation

**Goal:** Deployed mobile-first shell with all routes stubbed and working navigation.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Init Next.js App Router + TypeScript + Tailwind | Cursor |
| 2 | Build `layout.tsx` — mobile viewport meta, base font, Tailwind globals | Cursor |
| 3 | Build `AppShell.tsx` — header showing batch name placeholder | Cursor |
| 4 | Build `BottomNav.tsx` — Scan · Inventory · Batch tabs | Cursor |
| 5 | Stub route pages: `/`, `/scan`, `/confirm`, `/inventory`, `/books/[id]/edit` | Cursor |
| 6 | Push to GitHub, connect Vercel, trigger first deploy | Manual |

### Dependencies
None — this is the starting milestone.

### Risks
- Tailwind or Next.js config issues on init → verify `npx create-next-app` flags.

### Verification Checklist
- [ ] All 5 routes render placeholder text
- [ ] Bottom nav links work and highlight active tab
- [ ] App looks correct on a phone-width browser (375px)
- [ ] Vercel preview deploy succeeds and loads

---

## Milestone 2 — Supabase Schema, Seed & Active Batch

**Goal:** Live database with batch selector and persistent active batch wiring.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Create Supabase project | Manual (dashboard) |
| 2 | Write `supabase/migrations/001_initial_schema.sql` (batches + books tables, indexes) | Cursor |
| 3 | Run migration via Supabase SQL editor or CLI | Manual |
| 4 | Write `supabase/seed.sql` — 2 batches, 8 books | Cursor |
| 5 | Run seed | Manual |
| 6 | Create `lib/supabase/client.ts` and `lib/supabase/server.ts` | Cursor |
| 7 | Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` and Vercel | Manual |
| 8 | Build `hooks/useActiveBatch.ts` — read/write `localStorage`, React context | Cursor |
| 9 | Build `/` page — list batches from DB, create batch, select → persist | Cursor |
| 10 | Add guard redirect on `/scan`, `/confirm`, `/inventory` if no active batch | Cursor |

### Dependencies
Milestone 1 (routes and shell exist).

### Risks
- Env vars misconfigured → app silently fails on Supabase calls. Verify with a test query on load.
- `localStorage` not available during SSR → guard with `typeof window !== 'undefined'`.

### Verification Checklist
- [ ] Supabase tables exist with correct columns and constraints
- [ ] Seed data visible in Supabase dashboard
- [ ] `/` page lists batches from the database
- [ ] Creating a new batch works and appears in the list
- [ ] Selecting a batch stores `activeBatchId` in `localStorage`
- [ ] Navigating to `/scan` with no active batch redirects to `/`
- [ ] Header shows selected batch name

---

## Milestone 3 — Inventory Read / Search / Edit

**Goal:** Volunteers can browse, search, filter, and edit scanned books.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Build `services/batches.ts` — list, create, get by ID | Cursor |
| 2 | Build `services/books.ts` — list by batch, get by ID, create, update | Cursor |
| 3 | Define types in `types/index.ts` — `Book`, `Batch`, `BinLabel`, `IntakeStatus` | Cursor |
| 4 | Build `/inventory` — list books in active batch, search by title/ISBN | Cursor |
| 5 | Add filter dropdowns for `bin_label` and `intake_status` | Cursor |
| 6 | Build `/books/[id]/edit` — form for all book fields, save button | Cursor |
| 7 | Wire edit form to `services/books.ts` update (sets `updated_at`) | Cursor |

### Dependencies
Milestone 2 (database, seed data, active batch).

### Risks
- Empty state UX: no books in batch yet → show clear empty state message.
- Edit form must handle optional fields gracefully.

### Verification Checklist
- [ ] `/inventory` shows seed books for the active batch
- [ ] Search filters results by title and ISBN
- [ ] Bin label and intake status filters work
- [ ] Clicking a book navigates to `/books/[id]/edit`
- [ ] Editing and saving a book updates the record (verify in Supabase dashboard)
- [ ] `updated_at` changes on save

---

## Milestone 4 — Scanner & Camera Integration

**Goal:** Volunteers can scan a book barcode or type an ISBN on `/scan`.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Install `html5-qrcode` | Cursor |
| 2 | Build `components/scanner/BarcodeScanner.tsx` — camera viewfinder, scan callback | Cursor |
| 3 | Handle camera permission prompt and denial state | Cursor |
| 4 | Build `components/scanner/ManualEntry.tsx` — text input + submit | Cursor |
| 5 | Build `services/scanner.ts` — ISBN-10 ↔ ISBN-13 normalization | Cursor |
| 6 | Add audio feedback on successful scan (short beep) | Cursor |
| 7 | On scan success → pass ISBN to next step (query param or state) | Cursor |
| 8 | Test camera on phone browser | Manual (real device) |

### Dependencies
Milestone 1 (route exists). No DB dependency — this milestone is purely camera + ISBN parsing.

### Risks
- `html5-qrcode` API surface can be tricky — cleanup on unmount is critical.
- iOS Safari requires HTTPS for camera — Vercel preview URLs are HTTPS by default.
- Some devices are slow to initialize camera — show loading state.

### Verification Checklist
- [ ] Camera viewfinder renders on `/scan`
- [ ] Scanning a barcode returns correct ISBN string
- [ ] Audio beep plays on successful scan
- [ ] Denying camera shows manual entry input instead
- [ ] Manual entry accepts ISBN and proceeds
- [ ] ISBN-10 and ISBN-13 normalization works (unit test)
- [ ] Camera cleans up when navigating away from `/scan`

---

## Milestone 5 — Duplicate Detection

**Goal:** When a scanned ISBN already exists in the active batch, the volunteer sees a modal with three options.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Build `components/scanner/DuplicateModal.tsx` — 3 buttons: Add Another Copy, Open Existing Record, Cancel | Cursor |
| 2 | Wire scan result to a duplicate check query (`services/books.ts`) | Cursor |
| 3 | Add Another Copy → `UPDATE quantity + 1, updated_at` → redirect `/scan` | Cursor |
| 4 | Open Existing Record → navigate to `/books/[id]/edit` | Cursor |
| 5 | Cancel → return to `/scan`, no DB write | Cursor |

### Dependencies
Milestones 2 (DB + services) and 4 (scanner produces ISBN).

### Risks
- Race conditions if volunteer scans very fast — debounce or disable scanner while modal is open.

### Verification Checklist
- [ ] Scanning a new ISBN does **not** trigger the modal
- [ ] Scanning an ISBN that exists in the batch triggers the modal
- [ ] "Add Another Copy" increments quantity (verify in DB)
- [ ] "Add Another Copy" updates `updated_at`
- [ ] "Open Existing Record" navigates to `/books/[id]/edit`
- [ ] "Cancel" returns to scanner with no data change
- [ ] Scanner is paused while modal is open

---

## Milestone 6 — Confirm / Save Loop

**Goal:** After scanning a non-duplicate ISBN, the volunteer confirms minimal details and saves.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Build `/confirm` page — receives ISBN from scanner | Cursor |
| 2 | Display ISBN and any pre-filled metadata fields (title, authors, publisher, year, thumbnail) | Cursor |
| 3 | Add `bin_label` selector: Board Book, Pre-K, K-2, 3-5, Middle School, YA, Adult / Other, Unknown | Cursor |
| 4 | Add `intake_status` selector: Keep, Review, Reject (default: Keep) | Cursor |
| 5 | "Save + Scan Next" button → validate minimum fields → insert via `services/books.ts` → redirect `/scan` | Cursor |
| 6 | Guard: ISBN + bin_label + intake_status required; all other fields optional | Cursor |
| 7 | Handle redirect to `/` if no active batch | Cursor |

### Dependencies
Milestones 4 (scanner) and 5 (duplicate check happens before reaching `/confirm`).

### Risks
- Losing ISBN data between route transitions → use query params (`/confirm?isbn=...`).
- Volunteer accidentally navigates away → consider a simple "unsaved" warning.

### Verification Checklist
- [ ] `/confirm` shows the scanned ISBN
- [ ] Bin label selector renders all 8 options
- [ ] Intake status selector renders 3 options, defaults to "Keep"
- [ ] Save succeeds with only ISBN + bin + status (no metadata)
- [ ] Save inserts correct record in Supabase
- [ ] After save, app redirects to `/scan` ready for next book
- [ ] Full loop works: scan → confirm → save → scan → confirm → save

---

## Milestone 7 — Metadata Lookup

**Goal:** Auto-fill book details from Open Library after scanning.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Build `services/metadata.ts` — fetch from Open Library by ISBN, 3s timeout | Cursor |
| 2 | Map API response → `title`, `authors`, `publisher`, `published_year`, `thumbnail_url` | Cursor |
| 3 | Fire lookup on `/confirm` mount — show loading state for metadata fields | Cursor |
| 4 | On success → auto-fill fields (volunteer can still edit before save) | Cursor |
| 5 | On failure/timeout → fields remain empty, save still allowed | Cursor |

### Dependencies
Milestone 6 (confirm page exists).

### Risks
- Open Library may be slow or return incomplete data → 3s hard timeout, allow partial fill.
- Rate limiting on high-volume sessions → no mitigation needed for v1 volumes.

### Verification Checklist
- [ ] Scanning a well-known ISBN auto-fills title, authors, and cover thumbnail
- [ ] Scanning a rare/unknown ISBN shows empty fields gracefully
- [ ] Lookup timeout after 3s does not block the UI
- [ ] Volunteer can edit auto-filled fields before saving
- [ ] Save works regardless of whether metadata was found

---

## Milestone 8 — CSV Export

**Goal:** Export button on `/inventory` downloads a CSV of books in the active batch.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Build `services/export.ts` — generate CSV string from book records | Cursor |
| 2 | CSV columns: isbn_13, isbn_10, title, authors, publisher, published_year, bin_label, intake_status, quantity, notes | Cursor |
| 3 | Add "Export CSV" button on `/inventory` page | Cursor |
| 4 | Trigger browser download of generated CSV file | Cursor |

### Dependencies
Milestone 3 (inventory page exists with data).

### Risks
- Large batches → CSV generation is client-side and synchronous. Fine for v1 volumes.

### Verification Checklist
- [ ] Button visible on `/inventory`
- [ ] Downloaded file is valid CSV with correct headers
- [ ] Data matches what is displayed in inventory
- [ ] File name includes batch name and date

---

## Milestone 9 — Device Testing & Deploy Polish

**Goal:** Production-ready deploy, verified on real phones, polished UI.

### Tasks
| # | Task | Where |
|---|---|---|
| 1 | Full scan/confirm/save loop on iPhone Safari | Manual (real device) |
| 2 | Full scan/confirm/save loop on Android Chrome | Manual (real device) |
| 3 | Test camera denial → manual entry fallback | Manual |
| 4 | Test low-light and damaged barcode scenarios | Manual |
| 5 | UI polish: touch targets ≥ 44px, font sizing, color contrast | Cursor |
| 6 | Review all error states and loading states | Cursor |
| 7 | Set production env vars on Vercel | Manual |
| 8 | Final production deploy | Manual |
| 9 | Simulated live intake session (see below) | Manual |

### Simulated Live Session
On a real phone:
1. Create a batch named "Test Intake 2026-03-15"
2. Scan 15–20 books (mix of camera and manual entry)
3. Trigger 3+ duplicates — exercise all 3 modal options
4. Edit 2 records from `/inventory`
5. Export CSV and verify contents match
6. Close batch

### Dependencies
All previous milestones complete.

### Risks
- Camera behaves differently across devices — test early in M4, final confirmation here.
- Touch targets too small on smaller phones — audit all buttons and selectors.

### Verification Checklist
- [ ] Full loop works on iPhone Safari
- [ ] Full loop works on Android Chrome
- [ ] Camera denial handled gracefully on both platforms
- [ ] All touch targets ≥ 44px
- [ ] No console errors in production build
- [ ] Simulated live session completed successfully

---

## Final Go-Live Readiness Checklist

- [ ] All 9 milestones verified
- [ ] Production Vercel deploy live with correct env vars
- [ ] Supabase project on appropriate plan (free tier OK for v1)
- [ ] Tested on at least 1 iPhone and 1 Android device
- [ ] CSV export produces valid file
- [ ] Simulated 15–20 book intake session completed
- [ ] No blocking bugs
- [ ] Share production URL with team
