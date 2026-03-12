export const BIN_LABELS = [
  "Board Book",
  "Pre-K",
  "K-2",
  "3-5",
  "Middle School",
  "YA",
  "Adult / Other",
  "Unknown",
] as const;

export const INTAKE_STATUSES = ["Keep", "Review", "Reject"] as const;

export type BinLabel = (typeof BIN_LABELS)[number];
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

export type Batch = {
  id: string;
  name: string;
  source_location: string | null;
  status: string;
  created_at: string;
  location?: string | null;
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
  bin_label: BinLabel | null;
  intake_status: IntakeStatus | null;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
