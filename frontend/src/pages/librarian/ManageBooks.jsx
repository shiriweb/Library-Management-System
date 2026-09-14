import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ManageBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books/");
      setBooks(response.data);
    } catch (error) {
      console.error("BOOKS ERROR:", error);

      if (error.response) {
        setError(error.response.data.detail || "Unable to load books.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (bookId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(bookId);
      setError("");

      await api.delete(`/books/${bookId}/`);

      setBooks((currentBooks) =>
        currentBooks.filter((book) => book.id !== bookId),
      );
    } catch (error) {
      console.error("DELETE BOOK ERROR:", error);

      if (error.response) {
        setError(error.response.data.detail || "Unable to delete book.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Manage Books</h1>

        <p className="text-gray-600 mt-2">View and manage library books.</p>

        <button
          onClick={() => navigate("/librarian/books/add")}
          className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Book
        </button>

        {error && <p className="mt-6 text-red-600">{error}</p>}

        <div className="bg-white rounded-xl shadow-sm mt-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-4 px-4">Title</th>

                <th className="py-4 px-4">ISBN</th>

                <th className="py-4 px-4">Total Copies</th>

                <th className="py-4 px-4">Available Copies</th>

                <th className="py-4 px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-6 px-4 text-center text-gray-600"
                  >
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="border-b">
                    <td className="py-4 px-4">{book.title}</td>

                    <td className="py-4 px-4">{book.isbn}</td>

                    <td className="py-4 px-4">{book.total_copies}</td>

                    <td className="py-4 px-4">{book.available_copies}</td>

                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/librarian/books/edit/${book.id}`)
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(book.id)}
                          disabled={deletingId === book.id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                        >
                          {deletingId === book.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageBooks;
