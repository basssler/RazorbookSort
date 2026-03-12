import { normalizeIsbn } from "@/lib/isbn";

export type ScannerLookupResult = {
  isbn10: string | null;
  isbn13: string | null;
  normalizedIsbn: string;
};

export function normalizeScannedIsbn(rawIsbn: string): ScannerLookupResult {
  const normalized = normalizeIsbn(rawIsbn);

  if (!normalized) {
    throw new Error("Enter or scan a valid ISBN-10 or ISBN-13 code.");
  }

  return {
    isbn10: normalized.isbn10,
    isbn13: normalized.isbn13,
    normalizedIsbn: normalized.isbn13 ?? normalized.isbn10 ?? normalized.raw,
  };
}
