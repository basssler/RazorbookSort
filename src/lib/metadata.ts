export async function fetchBookMetadataByIsbn(isbn: string) {
  async function fromGoogle(candidate: string) {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${candidate}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    const volume = payload.items?.[0]?.volumeInfo;
    if (!volume) {
      return null;
    }

    return {
      title: volume.title ?? "",
      authors: Array.isArray(volume.authors) ? volume.authors.join(", ") : "",
    };
  }

  async function fromOpenLibrary(candidate: string) {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${candidate}&format=json&jscmd=details`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const details = payload[`ISBN:${candidate}`]?.details;
    if (!details) {
      return null;
    }

    return {
      title: details.title ?? "",
      authors: Array.isArray(details.authors)
        ? details.authors.map((author: { name?: string }) => author.name ?? "").filter(Boolean).join(", ")
        : "",
    };
  }

  return (await fromGoogle(isbn)) ?? (await fromOpenLibrary(isbn));
}

