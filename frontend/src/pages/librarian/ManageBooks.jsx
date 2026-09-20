import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import BookCover from "../../components/BookCover";
import api from "../../services/api";

function ManageBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/books/");

      console.log("Books from API:", response.data);

      setBooks(response.data);
    } catch (requestError) {
      console.error("Unable to load books:", requestError);

      setError(
        requestError.response?.data?.detail ||
          "Unable to load books."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) {
      return;
    }

    try {
      setDeletingId(book.id);
      setError("");

      await api.delete(`/books/${book.id}/`);

      setBooks((current) =>
        current.filter((item) => item.id !== book.id)
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to delete this book. It may be protected by existing library records."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout
      title="Manage Books"
      actions={
        <button
          onClick={() => navigate("/librarian/books/add")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Book
        </button>
      }
    >


      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">
            Loading books...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4">
                  Cover
                </th>

                <th className="px-5 py-4">
                  Title
                </th>

                <th className="px-5 py-4">
                  ISBN
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  Copies
                </th>

                <th className="px-5 py-4">
                  Available
                </th>

                <th className="px-5 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4">
                      <div className="flex h-24 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {book.image ? (
                          <img
                            src={
                              book.image.startsWith("http")
                                ? book.image
                                : `http://127.0.0.1:8000${book.image}`
                            }
                            alt={book.title}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <BookCover
                            isbn={book.isbn}
                            title={book.title}
                            className="h-24 w-16"
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {book.title}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {book.isbn}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {book.category_name || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {book.total_copies}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          Number(book.available_copies) > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {book.available_copies}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/librarian/books/edit/${book.id}`
                            )
                          }
                          className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Edit / Stock
                        </button>

                        <button
                          onClick={() => handleDelete(book)}
                          disabled={deletingId === book.id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === book.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

export default ManageBooks;
