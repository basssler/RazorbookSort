export type Batch = {
  id: string;
  name: string;
  source_location: string | null;
  status: string;
  created_at: string;
  location?: string | null;
  code?: string;
  intake_date?: string;
  notes?: string | null;
};

export type Book = {
  id: string;
  batch_id: string;
  isbn_10: string | null;
  isbn_13: string | null;
  title: string | null;
  authors: string | null;
  publisher: string | null;
  published_year: number | null;
  thumbnail_url: string | null;
  bin_label: string | null;
  intake_status: string | null;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  normalized_isbn?: string;
  status?: string;
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
