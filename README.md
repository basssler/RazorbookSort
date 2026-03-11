# Razorbook Reach Intake

Expo React Native TypeScript app for fast volunteer book intake. It scans ISBN barcodes with the phone camera, normalizes the ISBN, checks a local SQLite inventory, fetches metadata from Google Books with Open Library fallback, and saves everything locally for offline-first workflow after lookup.

## Features

- Home, Scanner, Confirm Book, Inventory List, and Book Detail/Edit screens
- Camera ISBN scanning with duplicate handling
- ISBN normalization for ISBN-10 and ISBN-13
- Local storage with `expo-sqlite`
- Metadata lookup from Google Books API, then Open Library fallback
- CSV export from the local database
- Seed data for first-run demo inventory
- Large controls and low-friction UI for volunteer use

## Folder structure

```text
app/                     Expo Router screens
src/components/          Reusable UI and forms
src/constants/           Theme values
src/context/             App-level inventory state
src/data/                Seed inventory records
src/db/                  SQLite setup and queries
src/hooks/               Shared hooks
src/lib/                 ISBN, metadata, CSV, formatting helpers
src/types/               Shared TypeScript models
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm run start
```

3. Open on a device or simulator:

- Android: press `a`
- iOS: press `i`
- Expo Go or development build: scan the QR code from the Expo terminal

## Notes

- Camera permission is required to scan ISBN barcodes.
- Metadata fetch needs internet access at scan time. Saved inventory remains local in SQLite.
- CSV export writes a file into Expo's document or cache directory and opens the share sheet when available.
- Seed data is inserted only when the local `books` table is empty.

## Data model

Each book record stores:

- `isbn_10`
- `isbn_13`
- `title`
- `authors`
- `publisher`
- `published_date`
- `categories`
- `thumbnail_url`
- `condition`
- `audience_band`
- `is_ar_likely`
- `quantity`
- `intake_batch`
- `storage_location`
- `notes`
- `status`
- `scanned_at`
