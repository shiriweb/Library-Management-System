import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

function Books() {
  const [books, setBooks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");

      const [booksResponse, queueResponse] = await Promise.all([
        api.get("/books/"),
        api.get("/transactions/queue/"),
      ]);

      setBooks(booksResponse.data);
      setQueue(queueResponse.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load books."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const refreshTimer = window.setInterval(loadData, 15000);

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  const activeQueueByBook = useMemo(() => {
    const map = {};

    queue.forEach((entry) => {
      if (["waiting", "notified"].includes(entry.status)) {
        map[entry.book] = entry;
      }
    });

    return map;
  }, [queue]);

  const replaceBook = (freshBook) => {
    setBooks((current) =>
      current.map((book) =>
        book.id === freshBook.id ? freshBook : book
      )
    );
  };

  const getFreshBook = async (bookId) => {
    const response = await api.get(`/books/${bookId}/`);

    replaceBook(response.data);

    return response.data;
  };

  const borrowBook = async (book) => {
    try {
      setBusyId(book.id);
      setError("");
      setMessage("");


      const freshBook = await getFreshBook(book.id);

      if (Number(freshBook.available_copies) <= 0) {
        setError(
          `${freshBook.title} has no available copies now. You can join the queue.`
        );
        return;
      }

      const queueEntry = activeQueueByBook[book.id];

    
      await api.post("/transactions/borrows/", {
        book: book.id,
      });


      if (queueEntry?.status === "waiting") {
        try {
          await api.delete(
            `/transactions/queue/${queueEntry.id}/`
          );
        } catch {
        }
      }

      setMessage(`${freshBook.title} borrowed successfully.`);

      await loadData();
    } catch (requestError) {
      const data = requestError.response?.data;

      setError(
        data?.non_field_errors?.[0] ||
          data?.detail ||
          (typeof data === "string"
            ? data
            : "Unable to borrow this book.")
      );

      await loadData();
    } finally {
      setBusyId(null);
    }
  };

  const joinQueue = async (book) => {
    try {
      setBusyId(book.id);
      setError("");
      setMessage("");

      const freshBook = await getFreshBook(book.id);

      if (Number(freshBook.available_copies) > 0) {
        setMessage(
          `${freshBook.title} is available now (${freshBook.available_copies} ${
            Number(freshBook.available_copies) === 1
              ? "copy"
              : "copies"
          }). Borrow it instead of joining the queue.`
        );

        return;
      }

      await api.post("/transactions/queue/", {
        book: book.id,
      });

      setMessage(
        `You joined the queue for ${freshBook.title}.`
      );

      await loadData();
    } catch (requestError) {
      const data = requestError.response?.data;

      setError(
        data?.non_field_errors?.[0] ||
          data?.detail ||
          "Unable to join the queue."
      );

      await loadData();
    } finally {
      setBusyId(null);
    }
  };

  const cancelQueue = async (queueEntry, book) => {
    try {
      setBusyId(book.id);
      setError("");
      setMessage("");

      await api.delete(
        `/transactions/queue/${queueEntry.id}/`
      );

      setMessage(
        `You cancelled the queue for ${book.title}.`
      );

      await loadData();
    } catch (requestError) {
      const data = requestError.response?.data;

      setError(
        data?.detail ||
          "Unable to cancel the queue."
      );

      await loadData();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout
      title="Browse Books"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">
          Loading books...
        </p>
      ) : books.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
          No books found.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => {
            const queueEntry = activeQueueByBook[book.id];

            const availableCopies =
              Number(book.available_copies) || 0;

            const isAvailable = availableCopies > 0;

            return (
              <article
                key={book.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  {book.image ? (
                    <img
                      src={
                        book.image.startsWith("http")
                          ? book.image
                          : `http://127.0.0.1:8000${book.image}`
                      }
                      alt={book.title}
                      className="h-40 w-28 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <BookCover
                      isbn={book.isbn}
                      title={book.title}
                      className="h-40 w-28"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900">
                          {book.title}
                        </h2>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          ISBN: {book.isbn}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isAvailable
                          ? `${availableCopies} available`
                          : "Unavailable"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      <p>
                        Category:{" "}
                        {book.category_name || "—"}
                      </p>

                      <p>
                        Author:{" "}
                        {book.authors_details
                          ?.map((author) => author.name)
                          .join(", ") || "—"}
                      </p>

                      <p>
                        Publisher:{" "}
                        {book.publisher_name || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {book.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {book.description}
                  </p>
                )}

                <div className="mt-auto pt-5">
                  {queueEntry && (
                    <div
                      className={`mb-3 rounded-lg p-3 text-sm ${
                        queueEntry.status === "notified"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <div>
                        Queue status:{" "}
                        <span className="font-semibold capitalize">
                          {queueEntry.status}
                        </span>
                      </div>

                      {queueEntry.status === "notified" && (
                        <p className="mt-1">
                          A copy has been returned for the
                          queue. You can borrow it now.
                        </p>
                      )}

                      {queueEntry.status === "waiting" && (
                        <button
                          onClick={() =>
                            cancelQueue(queueEntry, book)
                          }
                          disabled={busyId === book.id}
                          className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busyId === book.id
                            ? "Cancelling..."
                            : "Cancel Queue"}
                        </button>
                      )}
                    </div>
                  )}

                  {isAvailable ? (
                    <button
                      onClick={() => borrowBook(book)}
                      disabled={busyId === book.id}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {busyId === book.id
                        ? "Checking..."
                        : "Borrow"}
                    </button>
                  ) : queueEntry ? (
                    <p className="text-sm text-slate-500">
                      You already have an active queue entry.
                    </p>
                  ) : (
                    <button
                      onClick={() => joinQueue(book)}
                      disabled={busyId === book.id}
                      className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:bg-amber-300"
                    >
                      {busyId === book.id
                        ? "Checking..."
                        : "Join Queue"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default Books;
