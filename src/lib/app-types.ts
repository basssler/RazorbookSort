export type Batch = {
  id: string;
  name: string;
  code: string;
  intake_date: string;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export type Book = {
  id: string;
  batch_id: string;
  isbn_10: string | null;
  isbn_13: string | null;
  normalized_isbn: string;
  title: string;
  authors: string | null;
  quantity: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardData = {
  batches: Batch[];
  selectedBatch: Batch | null;
  totalBatches: number;
  totalTitles: number;
  totalCopies: number;
  recentBooks: Book[];
};

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

