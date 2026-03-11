import { BookRecord } from "@/types/book";

const headers: Array<keyof BookRecord> = [
  "id",
  "isbn_10",
  "isbn_13",
  "title",
  "authors",
  "publisher",
  "published_date",
  "categories",
  "thumbnail_url",
  "condition",
  "audience_band",
  "is_ar_likely",
  "quantity",
  "intake_batch",
  "storage_location",
  "notes",
  "status",
  "scanned_at",
];

function escapeValue(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, "\"\"")}"`;
}

export function booksToCsv(books: BookRecord[]) {
  const rows = [
    headers.join(","),
    ...books.map((book) =>
      headers
        .map((header) => {
          const value = header === "is_ar_likely" ? (book.is_ar_likely ? "true" : "false") : book[header];
          return escapeValue(value);
        })
        .join(","),
    ),
  ];

  return rows.join("\n");
}

