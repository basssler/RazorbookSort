export type BookMetadata = {
  title: string;
  authors: string;
  publisher: string;
  publishedYear: string;
  thumbnailUrl: string;
};

const METADATA_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Metadata lookup timed out.")), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function fetchOpenLibraryMetadataByIsbn(isbn: string): Promise<BookMetadata | null> {
  const response = await withTimeout(
    fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=details`, {
      cache: "no-store",
    }),
    METADATA_TIMEOUT_MS,
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Record<string, { details?: Record<string, unknown>; thumbnail_url?: string }>;
  const details = payload[`ISBN:${isbn}`]?.details;

  if (!details) {
    return null;
  }

  const authors = Array.isArray(details.authors)
    ? details.authors
        .map((author) => (typeof author === "object" && author && "name" in author ? String((author as { name?: string }).name ?? "") : ""))
        .filter(Boolean)
        .join(", ")
    : "";

  const publishers = Array.isArray(details.publishers)
    ? details.publishers
        .map((publisher) =>
          typeof publisher === "object" && publisher && "name" in publisher ? String((publisher as { name?: string }).name ?? "") : "",
        )
        .filter(Boolean)
        .join(", ")
    : "";

  const publishDate = typeof details.publish_date === "string" ? details.publish_date : "";
  const publishedYear = publishDate.match(/\b(18|19|20)\d{2}\b/)?.[0] ?? "";

  const coverIds = Array.isArray(details.covers) ? details.covers : [];
  const firstCoverId = typeof coverIds[0] === "number" ? coverIds[0] : null;
  const cover = firstCoverId ? `https://covers.openlibrary.org/b/id/${firstCoverId}-L.jpg` : "";

  return {
    title: typeof details.title === "string" ? details.title : "",
    authors,
    publisher: publishers,
    publishedYear,
    thumbnailUrl: cover,
  };
}
