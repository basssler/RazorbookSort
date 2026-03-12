import { Book } from "@/types";

function escapeCsv(value: string | number | null | undefined) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

export function buildBatchCsv(books: Book[]) {
  const headers = [
    "isbn_13",
    "isbn_10",
    "title",
    "authors",
    "publisher",
    "published_year",
    "bin_label",
    "intake_status",
    "quantity",
    "notes",
  ];

  const rows = books.map((book) =>
    [
      book.isbn_13,
      book.isbn_10,
      book.title,
      book.authors,
      book.publisher,
      book.published_year,
      book.bin_label,
      book.intake_status,
      book.quantity,
      book.notes,
    ]
      .map((value) => escapeCsv(value))
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
