const ISBN_13_PREFIX = "978";

export type NormalizedIsbn = {
  raw: string;
  isbn10: string | null;
  isbn13: string | null;
};

function clean(raw: string) {
  return raw.toUpperCase().replace(/[^0-9X]/g, "");
}

function computeIsbn10Check(base: string) {
  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(base[index]) * (10 - index);
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 10) {
    return "X";
  }
  if (remainder === 11) {
    return "0";
  }
  return String(remainder);
}

function computeIsbn13Check(base: string) {
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    const digit = Number(base[index]);
    sum += index % 2 === 0 ? digit : digit * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

export function isValidIsbn10(candidate: string) {
  if (!/^[0-9]{9}[0-9X]$/.test(candidate)) {
    return false;
  }
  return candidate[9] === computeIsbn10Check(candidate.slice(0, 9));
}

export function isValidIsbn13(candidate: string) {
  if (!/^[0-9]{13}$/.test(candidate)) {
    return false;
  }
  return candidate[12] === computeIsbn13Check(candidate.slice(0, 12));
}

export function isbn10To13(isbn10: string) {
  const base = `${ISBN_13_PREFIX}${isbn10.slice(0, 9)}`;
  return `${base}${computeIsbn13Check(base)}`;
}

export function isbn13To10(isbn13: string) {
  if (!isbn13.startsWith(ISBN_13_PREFIX)) {
    return null;
  }
  const base = isbn13.slice(3, 12);
  return `${base}${computeIsbn10Check(base)}`;
}

export function normalizeIsbn(raw: string): NormalizedIsbn | null {
  const candidate = clean(raw);

  if (candidate.length === 13 && isValidIsbn13(candidate)) {
    return {
      raw: candidate,
      isbn10: isbn13To10(candidate),
      isbn13: candidate,
    };
  }

  if (candidate.length === 10 && isValidIsbn10(candidate)) {
    return {
      raw: candidate,
      isbn10: candidate,
      isbn13: isbn10To13(candidate),
    };
  }

  return null;
}

export function inferAudienceBand(categories: string) {
  const value = categories.toLowerCase();
  if (value.includes("picture")) {
    return "Picture Book" as const;
  }
  if (value.includes("early reader") || value.includes("beginner")) {
    return "Early Reader" as const;
  }
  if (value.includes("young adult") || value.includes("teen")) {
    return "Young Adult" as const;
  }
  if (value.includes("juvenile") || value.includes("middle grade") || value.includes("children")) {
    return "Middle Grade" as const;
  }
  if (value.length > 0) {
    return "Adult" as const;
  }
  return "Unknown" as const;
}

export function inferArLikely(categories: string, title: string) {
  const combined = `${categories} ${title}`.toLowerCase();
  return combined.includes("juvenile") || combined.includes("reader") || combined.includes("middle grade");
}

