import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import BookForm from "../../components/BookForm";
import api from "../../services/api";

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBook = async () => {
      try {
        const response = await api.get(`/books/${id}/`);
        setBook(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load this book.");
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const updateBook = async (payload) => {
    await api.put(`/books/${id}/`, payload);
    navigate("/librarian/books");
  };

  return (
    <AppLayout title="Edit Book" subtitle="Update catalog details or stock. Use Dashboard Return for returned loans so queue notification runs.">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">Loading book...</p>
      ) : book ? (
        <BookForm
          initialData={{
            ...book,
            published_date: book.published_date || "",
            publisher: book.publisher || "",
            authors: book.authors || [],
          }}
          submitLabel="Update Book"
          onSubmit={updateBook}
          onCancel={() => navigate("/librarian/books")}
        />
      ) : null}
    </AppLayout>
  );
}

export default EditBook;
