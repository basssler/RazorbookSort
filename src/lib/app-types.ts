export type { Batch, Book } from "@/types";
import type { Book } from "@/types";

export type LookupResponse =
  | {
      mode: "duplicate";
      book: Book;
    }
  | {
      mode: "new";
      draft: {
        isbn10: string | null;
        isbn13: string | null;
        normalizedIsbn: string;
        title: string;
        authors: string;
        quantity: number;
        notes: string;
      };
    };
