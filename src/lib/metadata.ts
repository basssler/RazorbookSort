import { inferArLikely, inferAudienceBand } from "@/lib/isbn";
import { BookDraft } from "@/types/book";

type MetadataResult = Pick<
  BookDraft,
  "title" | "authors" | "publisher" | "published_date" | "categories" | "thumbnail_url" | "audience_band" | "is_ar_likely"
>;

function authorsToString(authors?: string[]) {
  return authors?.join(", ") ?? "";
}

function categoriesToString(categories?: string[]) {
  return categories?.join(", ") ?? "";
}

async function fetchGoogleBooks(isbn: string): Promise<MetadataResult | null> {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const volume = payload.items?.[0]?.volumeInfo;
  if (!volume) {
    return null;
  }

  const categories = categoriesToString(volume.categories);
  return {
    title: volume.title ?? "",
    authors: authorsToString(volume.authors),
    publisher: volume.publisher ?? "",
    published_date: volume.publishedDate ?? "",
    categories,
    thumbnail_url: volume.imageLinks?.thumbnail ?? "",
    audience_band: inferAudienceBand(categories),
    is_ar_likely: inferArLikely(categories, volume.title ?? ""),
  };
}

async function fetchOpenLibrary(isbn: string): Promise<MetadataResult | null> {
  const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=details`);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const book = payload[`ISBN:${isbn}`];
  const details = book?.details;
  if (!details) {
    return null;
  }

  const categories = Array.isArray(details.subjects)
    ? details.subjects
        .map((subject: { name?: string } | string) => (typeof subject === "string" ? subject : subject.name ?? ""))
        .filter(Boolean)
        .slice(0, 5)
        .join(", ")
    : "";

  return {
    title: details.title ?? "",
    authors: Array.isArray(details.authors)
      ? details.authors
          .map((author: { name?: string }) => author.name ?? "")
          .filter(Boolean)
          .join(", ")
      : "",
    publisher: Array.isArray(details.publishers)
      ? details.publishers
          .map((publisher: { name?: string }) => publisher.name ?? "")
          .filter(Boolean)
          .join(", ")
      : "",
    published_date: details.publish_date ?? "",
    categories,
    thumbnail_url: book.thumbnail_url ?? "",
    audience_band: inferAudienceBand(categories),
    is_ar_likely: inferArLikely(categories, details.title ?? ""),
  };
}

export async function fetchBookMetadata(isbn13: string, isbn10?: string | null) {
  const google = await fetchGoogleBooks(isbn13);
  if (google) {
    return google;
  }

  if (isbn10) {
    const google10 = await fetchGoogleBooks(isbn10);
    if (google10) {
      return google10;
    }
  }

  const openLibrary = await fetchOpenLibrary(isbn13);
  if (openLibrary) {
    return openLibrary;
  }

  if (isbn10) {
    return fetchOpenLibrary(isbn10);
  }

  return null;
}

