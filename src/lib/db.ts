import { LookupResponse } from "@/lib/app-types";
import { createBatch, getBatchById, listBatches } from "@/services/batches";
import {
  createBookRecord,
  findDuplicateBookForBatch,
  getBookById,
  incrementBookQuantityById,
  listBooksByBatch,
  updateBookById,
} from "@/services/books";
import { Book } from "@/types";

export { createBatch, getBatchById, listBatches };

export async function listBooks(options: {
  batchId?: string | null;
  search?: string;
  binLabel?: string;
  intakeStatus?: string;
}) {
  if (!options.batchId) {
    return [];
  }

  return listBooksByBatch({
    batchId: options.batchId,
    search: options.search,
    binLabel: options.binLabel,
    intakeStatus: options.intakeStatus,
  });
}

export async function getBook(id: string) {
  return getBookById(id);
}

export async function lookupIsbnForBatch(_: string, __: string): Promise<LookupResponse> {
  throw new Error("Duplicate lookup is handled by the scan API.");
}

export async function findDuplicateBook(input: { batchId: string; isbn10?: string | null; isbn13?: string | null }) {
  return findDuplicateBookForBatch(input);
}

export async function incrementBookQuantity(id: string): Promise<Book> {
  return incrementBookQuantityById(id);
}

export async function createBook(input: {
  batchId: string;
  isbn10: string | null;
  isbn13: string | null;
  title?: string;
  authors?: string;
  publisher?: string;
  publishedYear?: number | null;
  thumbnailUrl?: string;
  binLabel?: string;
  intakeStatus?: string;
  quantity?: number;
  notes?: string;
}): Promise<Book> {
  return createBookRecord({
    batchId: input.batchId,
    isbn10: input.isbn10,
    isbn13: input.isbn13,
    title: input.title ?? "",
    authors: input.authors ?? "",
    publisher: input.publisher ?? "",
    publishedYear: input.publishedYear ?? null,
    thumbnailUrl: input.thumbnailUrl ?? "",
    binLabel: input.binLabel ?? "",
    intakeStatus: input.intakeStatus ?? "",
    quantity: input.quantity ?? 1,
    notes: input.notes ?? "",
  });
}

export async function updateBook(input: {
  id: string;
  isbn10: string | null;
  isbn13: string | null;
  title: string;
  authors: string;
  publisher?: string;
  publishedYear?: number | null;
  thumbnailUrl?: string;
  binLabel?: string;
  intakeStatus?: string;
  quantity: number;
  notes: string;
}) {
  return updateBookById({
    id: input.id,
    isbn10: input.isbn10,
    isbn13: input.isbn13,
    title: input.title,
    authors: input.authors,
    publisher: input.publisher ?? "",
    publishedYear: input.publishedYear ?? null,
    thumbnailUrl: input.thumbnailUrl ?? "",
    binLabel: input.binLabel ?? "",
    intakeStatus: input.intakeStatus ?? "",
    quantity: input.quantity,
    notes: input.notes,
  });
}

export async function exportBatchCsv(_: string): Promise<{ filename: string; content: string }> {
  throw new Error("CSV export is not implemented until milestone 8.");
}
