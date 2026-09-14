import { useMemo, useState } from "react";

function normalizeIsbn(isbn) {
  return String(isbn || "")
    .replace(/[^0-9Xx]/g, "")
    .toUpperCase();
}

function BookCover({ isbn, title, className = "h-44 w-32" }) {
  const cleanIsbn = useMemo(() => normalizeIsbn(isbn), [isbn]);
  const [failedIsbn, setFailedIsbn] = useState(null);
  const useFallback = !cleanIsbn || failedIsbn === cleanIsbn;

  const src = useFallback
    ? "/book-placeholder.svg"
    : `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(cleanIsbn)}-M.jpg?default=false`;

  return (
    <img
      src={src}
      alt={`${title || "Book"} cover`}
      loading="lazy"
      onError={() => setFailedIsbn(cleanIsbn)}
      className={`${className} shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover`}
    />
  );
}

export default BookCover;
