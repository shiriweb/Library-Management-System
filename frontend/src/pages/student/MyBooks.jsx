import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function MyBooks() {
  const navigate = useNavigate();

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [borrowResponse, booksResponse] = await Promise.all([
          api.get("/transactions/borrows/"),
          api.get("/books/"),
        ]);

        setBorrowedBooks(borrowResponse.data);
        setBooks(booksResponse.data);
      } catch (error) {
        console.error("MY BOOKS ERROR:", error);

        if (error.response) {
          setError(JSON.stringify(error.response.data));
        } else {
          setError("Unable to connect to the server.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBookTitle = (bookId) => {
    const book = books.find((book) => book.id === bookId);

    return book ? book.title : `Book #${bookId}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800">
          My Borrowed Books
        </h1>

        <p className="text-gray-600 mt-2">
          View the books you have borrowed.
        </p>

        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-5 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Back to Dashboard
        </button>

        {loading && (
          <p className="mt-6 text-gray-600">
            Loading your books...
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && borrowedBooks.length === 0 && (
          <p className="mt-6 text-gray-600">
            You have not borrowed any books.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

          {borrowedBooks.map((borrow) => (
            <div
              key={borrow.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {getBookTitle(borrow.book)}
              </h2>

              <p className="text-gray-600 mt-2">
                Borrowed: {borrow.borrowed_at}
              </p>

              <p className="text-gray-600 mt-2">
                Due Date: {borrow.due_date}
              </p>

              <p className="text-gray-600 mt-2">
                Status: {borrow.status}
              </p>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default MyBooks;