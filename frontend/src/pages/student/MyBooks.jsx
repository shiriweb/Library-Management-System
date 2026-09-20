import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/AppLayout";
import BookCover from "../../components/BookCover";
import api from "../../services/api";
function MyBooks() {
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const loadData = useCallback(async () => {
    try {
      setError("");
      const [borrowResponse, booksResponse] = await Promise.all([
        api.get("/transactions/borrows/"),
        api.get("/books/"),
      ]);
      setBorrows(borrowResponse.data);
      setBooks(booksResponse.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail || "Unable to load borrowed books.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const bookMap = useMemo(
    () => Object.fromEntries(books.map((book) => [book.id, book])),
    [books],
  );
  const visibleBorrows = useMemo(() => {
    if (filter === "all") {
      return borrows;
    }
    if (filter === "current") {
      return borrows.filter((borrow) =>
        ["borrowed", "overdue"].includes(borrow.status),
      );
    }
    return borrows.filter((borrow) => borrow.status === filter);
  }, [borrows, filter]);
  const returnBook = async (borrow) => {
    try {
      setReturningId(borrow.id);
      setError("");
      setMessage("");
      const response = await api.post(
        `/transactions/borrows/${borrow.id}/return/`,
      );
      const fineText = response.data.fine
        ? ` Fine created: Rs. ${response.data.fine.amount}.`
        : "";
      const queueText = response.data.queue_notified
        ? ` The first waiting student (${response.data.queue_notified}) was notified.`
        : "";
      setMessage(`Book returned successfully.${fineText}${queueText}`);
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail || "Unable to return this book.",
      );
    } finally {
      setReturningId(null);
    }
  };
  return (
    <AppLayout
      title="My Books"
      subtitle="Your complete borrowing history and return actions."
    >
      {" "}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {" "}
          {error}{" "}
        </div>
      )}{" "}
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {" "}
          {message}{" "}
        </div>
      )}{" "}
      <div className="mb-5 flex flex-wrap gap-2">
        {" "}
        {[
          ["all", "All"],
          ["current", "Current"],
          ["overdue", "Overdue"],
          ["returned", "Returned"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${filter === value ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {" "}
            {label}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      {loading ? (
        <p className="text-slate-600"> Loading borrowing history... </p>
      ) : visibleBorrows.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
          {" "}
          No borrowing records found.{" "}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {" "}
          {visibleBorrows.map((borrow) => {
            const book = bookMap[borrow.book];
            const canReturn = borrow.status !== "returned";
            return (
              <article
                key={borrow.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {" "}
                <div className="mb-4 flex gap-4">
                  {" "}
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {" "}
                    {book?.image ? (
                      <img
                        src={
                          book.image.startsWith("http")
                            ? book.image
                            : `http://127.0.0.1:8000${book.image}`
                        }
                        alt={book.title || `Book #${borrow.book}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookCover
                        isbn={book?.isbn}
                        title={book?.title || `Book #${borrow.book}`}
                        className="h-28 w-20"
                      />
                    )}{" "}
                  </div>{" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <div className="flex items-start justify-between gap-3">
                      {" "}
                      <h2 className="font-bold text-slate-900">
                        {" "}
                        {book?.title || `Book #${borrow.book}`}{" "}
                      </h2>{" "}
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                        {" "}
                        {borrow.status}{" "}
                      </span>{" "}
                    </div>{" "}
                    <p className="mt-2 text-xs text-slate-500">
                      {" "}
                      ISBN: {book?.isbn || "—"}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-2 text-sm text-slate-600">
                  {" "}
                  <p>
                    {" "}
                    Borrowed:{" "}
                    {new Date(borrow.borrowed_at).toLocaleDateString()}{" "}
                  </p>{" "}
                  <p> Due date: {borrow.due_date} </p>{" "}
                  {borrow.returned_at && (
                    <p>
                      {" "}
                      Returned:{" "}
                      {new Date(borrow.returned_at).toLocaleDateString()}{" "}
                    </p>
                  )}{" "}
                </div>{" "}
                {canReturn && (
                  <button
                    onClick={() => returnBook(borrow)}
                    disabled={returningId === borrow.id}
                    className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {" "}
                    {returningId === borrow.id
                      ? "Returning..."
                      : "Return Book"}{" "}
                  </button>
                )}{" "}
              </article>
            );
          })}{" "}
        </div>
      )}{" "}
    </AppLayout>
  );
}
export default MyBooks;
