import * as SQLite from "expo-sqlite";

import { seedBooks } from "@/data/seedBooks";
import { booksToCsv } from "@/lib/csv";
import { BookDraft, BookRecord } from "@/types/book";

const DATABASE_NAME = "razorbook-reach-intake.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function toBoolean(value: unknown) {
  return Boolean(Number(value));
}

function mapBook(row: Record<string, unknown>): BookRecord {
  return {
    id: Number(row.id),
    isbn_10: (row.isbn_10 as string | null) ?? null,
    isbn_13: (row.isbn_13 as string | null) ?? null,
    title: String(row.title ?? ""),
    authors: String(row.authors ?? ""),
    publisher: String(row.publisher ?? ""),
    published_date: String(row.published_date ?? ""),
    categories: String(row.categories ?? ""),
    thumbnail_url: String(row.thumbnail_url ?? ""),
    condition: row.condition as BookRecord["condition"],
    audience_band: row.audience_band as BookRecord["audience_band"],
    is_ar_likely: toBoolean(row.is_ar_likely),
    quantity: Number(row.quantity ?? 1),
    intake_batch: String(row.intake_batch ?? ""),
    storage_location: String(row.storage_location ?? ""),
    notes: String(row.notes ?? ""),
    status: row.status as BookRecord["status"],
    scanned_at: String(row.scanned_at ?? new Date().toISOString()),
  };
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return databasePromise;
}

export async function initDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn_10 TEXT,
      isbn_13 TEXT,
      title TEXT NOT NULL,
      authors TEXT NOT NULL DEFAULT '',
      publisher TEXT NOT NULL DEFAULT '',
      published_date TEXT NOT NULL DEFAULT '',
      categories TEXT NOT NULL DEFAULT '',
      thumbnail_url TEXT NOT NULL DEFAULT '',
      condition TEXT NOT NULL DEFAULT 'Good',
      audience_band TEXT NOT NULL DEFAULT 'Unknown',
      is_ar_likely INTEGER NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      intake_batch TEXT NOT NULL DEFAULT '',
      storage_location TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'New Intake',
      scanned_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON books(isbn_13);
    CREATE INDEX IF NOT EXISTS idx_books_isbn10 ON books(isbn_10);
  `);
}

export async function seedIfEmpty() {
  const db = await getDatabase();
  const countRow = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM books");
  if ((countRow?.count ?? 0) > 0) {
    return;
  }

  for (const book of seedBooks) {
    await insertBook(book);
  }
}

export async function listBooks(search = "") {
  const db = await getDatabase();
  const normalizedSearch = `%${search.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `
      SELECT *
      FROM books
      WHERE
        ? = '%%'
        OR LOWER(title) LIKE ?
        OR LOWER(authors) LIKE ?
        OR LOWER(COALESCE(isbn_13, '')) LIKE ?
        OR LOWER(COALESCE(isbn_10, '')) LIKE ?
      ORDER BY datetime(scanned_at) DESC, id DESC
    `,
    normalizedSearch,
    normalizedSearch,
    normalizedSearch,
    normalizedSearch,
    normalizedSearch,
  );

  return rows.map(mapBook);
}

export async function getBookById(id: number) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>("SELECT * FROM books WHERE id = ?", id);
  return row ? mapBook(row) : null;
}

export async function findBookByIsbn(isbn10: string | null, isbn13: string | null) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `
      SELECT *
      FROM books
      WHERE (? IS NOT NULL AND isbn_10 = ?)
         OR (? IS NOT NULL AND isbn_13 = ?)
      ORDER BY datetime(scanned_at) DESC, id DESC
      LIMIT 1
    `,
    isbn10,
    isbn10,
    isbn13,
    isbn13,
  );

  return row ? mapBook(row) : null;
}

export async function insertBook(book: BookDraft) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `
      INSERT INTO books (
        isbn_10,
        isbn_13,
        title,
        authors,
        publisher,
        published_date,
        categories,
        thumbnail_url,
        condition,
        audience_band,
        is_ar_likely,
        quantity,
        intake_batch,
        storage_location,
        notes,
        status,
        scanned_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    book.isbn_10,
    book.isbn_13,
    book.title,
    book.authors,
    book.publisher,
    book.published_date,
    book.categories,
    book.thumbnail_url,
    book.condition,
    book.audience_band,
    book.is_ar_likely ? 1 : 0,
    book.quantity,
    book.intake_batch,
    book.storage_location,
    book.notes,
    book.status,
    book.scanned_at,
  );

  return getBookById(result.lastInsertRowId);
}

export async function updateBook(id: number, book: BookDraft) {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE books SET
        isbn_10 = ?,
        isbn_13 = ?,
        title = ?,
        authors = ?,
        publisher = ?,
        published_date = ?,
        categories = ?,
        thumbnail_url = ?,
        condition = ?,
        audience_band = ?,
        is_ar_likely = ?,
        quantity = ?,
        intake_batch = ?,
        storage_location = ?,
        notes = ?,
        status = ?,
        scanned_at = ?
      WHERE id = ?
    `,
    book.isbn_10,
    book.isbn_13,
    book.title,
    book.authors,
    book.publisher,
    book.published_date,
    book.categories,
    book.thumbnail_url,
    book.condition,
    book.audience_band,
    book.is_ar_likely ? 1 : 0,
    book.quantity,
    book.intake_batch,
    book.storage_location,
    book.notes,
    book.status,
    book.scanned_at,
    id,
  );

  return getBookById(id);
}

export async function incrementQuantity(id: number) {
  const db = await getDatabase();
  await db.runAsync("UPDATE books SET quantity = quantity + 1, scanned_at = ? WHERE id = ?", new Date().toISOString(), id);
  return getBookById(id);
}

export async function getStats() {
  const db = await getDatabase();
  const stats = await db.getFirstAsync<{
    totalTitles: number;
    totalCopies: number;
    latestScan: string | null;
  }>(
    `
      SELECT
        COUNT(*) AS totalTitles,
        COALESCE(SUM(quantity), 0) AS totalCopies,
        MAX(scanned_at) AS latestScan
      FROM books
    `,
  );

  return {
    totalTitles: stats?.totalTitles ?? 0,
    totalCopies: stats?.totalCopies ?? 0,
    latestScan: stats?.latestScan ?? null,
  };
}

export async function exportBooksCsv() {
  const books = await listBooks();
  return booksToCsv(books);
}
