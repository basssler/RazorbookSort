export type BookCondition = "Like New" | "Good" | "Acceptable" | "Damaged";
export type AudienceBand = "Picture Book" | "Early Reader" | "Middle Grade" | "Young Adult" | "Adult" | "Unknown";
export type IntakeStatus = "New Intake" | "Ready to Shelve" | "Needs Review" | "Hold";

export type BookRecord = {
  id: number;
  isbn_10: string | null;
  isbn_13: string | null;
  title: string;
  authors: string;
  publisher: string;
  published_date: string;
  categories: string;
  thumbnail_url: string;
  condition: BookCondition;
  audience_band: AudienceBand;
  is_ar_likely: boolean;
  quantity: number;
  intake_batch: string;
  storage_location: string;
  notes: string;
  status: IntakeStatus;
  scanned_at: string;
};

export type BookDraft = Omit<BookRecord, "id">;

export const CONDITION_OPTIONS: BookCondition[] = ["Like New", "Good", "Acceptable", "Damaged"];
export const AUDIENCE_OPTIONS: AudienceBand[] = [
  "Picture Book",
  "Early Reader",
  "Middle Grade",
  "Young Adult",
  "Adult",
  "Unknown",
];
export const STATUS_OPTIONS: IntakeStatus[] = ["New Intake", "Ready to Shelve", "Needs Review", "Hold"];

