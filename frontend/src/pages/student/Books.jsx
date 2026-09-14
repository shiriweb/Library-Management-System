import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books/");
        setBooks(response.data);
      } catch (error) {
        console.error(error);
        setError("Unable to load books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Available Books</h1>

        <p className="text-gray-600 mt-2">
          Browse books available in the library.
        </p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-5 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Back to Dashboard
        </button>
        {loading && <p className="mt-6 text-gray-600">Loading books...</p>}

        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="mt-6 text-gray-600">No books available.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {book.title}
              </h2>

              <p className="text-gray-600 mt-2">ISBN: {book.isbn}</p>

              <p className="text-gray-600 mt-2">
                Available Copies: {book.available_copies}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Books;
