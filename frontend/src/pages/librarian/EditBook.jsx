import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    description: "",
    published_date: "",
    total_copies: "",
    available_copies: "",
    category: "",
    authors: [],
    publisher: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          bookResponse,
          categoriesResponse,
          authorsResponse,
          publishersResponse,
        ] = await Promise.all([
          api.get(`/books/${id}/`),
          api.get("/books/categories/"),
          api.get("/books/authors/"),
          api.get("/books/publishers/"),
        ]);

        const book = bookResponse.data;

        setCategories(categoriesResponse.data);
        setAuthors(authorsResponse.data);
        setPublishers(publishersResponse.data);

        setFormData({
          title: book.title || "",
          isbn: book.isbn || "",
          description: book.description || "",
          published_date: book.published_date || "",
          total_copies: book.total_copies || "",
          available_copies: book.available_copies || "",
          category: book.category || "",
          authors: book.authors || [],
          publisher: book.publisher || "",
        });
      } catch (error) {
        console.error("BOOK ERROR:", error);
        setError("Unable to load book.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAuthorsChange = (event) => {
    const selectedAuthors = Array.from(event.target.selectedOptions, (option) =>
      Number(option.value),
    );

    setFormData({
      ...formData,
      authors: selectedAuthors,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Number(formData.available_copies) > Number(formData.total_copies)) {
      setError("Available copies cannot be greater than total copies.");
      return;
    }

    try {
      await api.put(`/books/${id}/`, {
        title: formData.title,
        isbn: formData.isbn,
        description: formData.description,
        published_date: formData.published_date,
        total_copies: Number(formData.total_copies),
        available_copies: Number(formData.available_copies),
        category: Number(formData.category),
        authors: formData.authors,
        publisher: formData.publisher ? Number(formData.publisher) : null,
      });

      navigate("/librarian/books");
    } catch (error) {
      console.error("UPDATE BOOK ERROR:", error);

      if (error.response) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError("Unable to connect to the server.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading book...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Edit Book</h1>

        <p className="text-gray-600 mt-2">Update book information.</p>

        {error && <p className="mt-6 text-red-600">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 mt-8 space-y-5"
        >
          <div>
            <label className="block text-gray-700 mb-2">Title</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">ISBN</label>

            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Published Date</label>

            <input
              type="date"
              name="published_date"
              value={formData.published_date}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Total Copies</label>

            <input
              type="number"
              name="total_copies"
              value={formData.total_copies}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Available Copies</label>

            <input
              type="number"
              name="available_copies"
              value={formData.available_copies}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Authors</label>

            <select
              multiple
              value={formData.authors.map(String)}
              onChange={handleAuthorsChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            >
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>

            <p className="text-sm text-gray-500 mt-1">
              Hold Ctrl and select one or more authors.
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Publisher</label>

            <select
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select Publisher</option>

              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Book
            </button>

            <button
              type="button"
              onClick={() => navigate("/librarian/books")}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBook;
