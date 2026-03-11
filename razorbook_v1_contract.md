# Razorbook Reach Intake V1 Contract

## Product Purpose
Razorbook Reach Intake is a mobile-first web app for Razorbook Reach volunteers to scan donated books on their phones during high-volume intake sessions.

The goal of v1 is to make book intake fast, simple, and repeatable during live sorting events, donation drop-offs, and storage-room organization.

---

## Primary User
- Razorbook Reach volunteers
- Razorbook Reach officers overseeing intake and inventory cleanup

---

## Core Workflow
Select batch → scan ISBN → detect duplicate → confirm minimal details → save → return to scanner

---

## Primary Screens
1. Home
2. Scanner
3. Confirm Book
4. Inventory
5. Edit Book

---

## Final Route Structure
- `/` → Home / Select Active Batch
- `/scan` → Scanner
- `/confirm` → Confirm scanned book before save
- `/inventory` → Search, filter, and export scanned books
- `/books/[id]/edit` → Edit existing book record

---

## Final Bin Labels
- Board Book
- Pre-K
- K-2
- 3-5
- Middle School
- YA
- Adult / Other
- Unknown

---

## Final Intake Status Labels
- Keep
- Review
- Reject

---

## Duplicate Handling
If a scanned ISBN already exists in the same batch:

- **Add Another Copy** → increment `quantity` and update `updated_at`
- **Open Existing Record** → open the existing book record
- **Cancel** → return to scanner without saving

Duplicate detection is based on ISBN within the active batch.

---

## Save Requirements
A book can still be saved even if metadata lookup fails, as long as the following are available:

- ISBN
- bin label
- intake status

Metadata lookup should improve speed and reduce typing, but it must never block intake.

---

## Metadata Strategy
After scan:

- attempt ISBN-based metadata lookup
- auto-fill fields when possible
- allow manual fallback when lookup fails

Preferred metadata fields for v1:
- title
- authors
- publisher
- published year
- thumbnail URL

---

## Active Batch Rules
A volunteer must have an active batch selected before scanning.

The active batch should:
- be selected from the Home screen
- persist for the current session
- remain available as the default batch until changed

---

## V1 Scope
Included in v1:

- batch selection
- phone camera barcode scanning in browser
- manual ISBN entry fallback
- duplicate detection
- confirm/save flow
- quantity increment for duplicates
- inventory search
- inventory filtering
- edit book record
- CSV export by batch
- mobile-first responsive UI

---

## Out of Scope for V1
Not included in v1:

- authentication
- role-based permissions
- volunteer accounts
- advanced admin controls
- analytics dashboards
- native mobile app
- app store deployment
- full offline sync system
- multi-user realtime collaboration
- advanced genre/catalog classification beyond current intake workflow

---

## Final Data Model Direction

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

---

## Product Rules
1. The scanner is the center of the app.
2. Intake speed matters more than metadata completeness.
3. Volunteers should be able to continue even when metadata lookup fails.
4. Duplicate handling must be explicit and low-friction.
5. The main save action must support continuous scanning.
6. The app should stay simple enough for first-time volunteers to use with little explanation.

---

## UX Rules
- mobile-first layout
- large tap targets
- clear labels
- minimal friction on confirm screen
- Save + Scan Next as the primary loop behavior
- scanner-first, throughput-first design
- keep volunteer flows simpler than edit/admin flows

---

## Technical Direction
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- browser camera barcode scanning

---

## Definition of V1 Success
V1 is successful if a volunteer can:

1. select a batch quickly
2. scan books from a phone browser
3. detect duplicates clearly
4. confirm minimal details in seconds
5. save and return to scanner without breaking rhythm
6. search and export batch inventory reliably

---

## Source of Truth Rule
This file defines what Razorbook Reach Intake v1 is.

If the implementation plan, execution roadmap, or generated code conflicts with this contract, this contract should be treated as the source of truth for product scope and behavior.
