import { useEffect, useState } from "react";
import api from "../services/api";
import BookCover from "./BookCover";

const emptyBook = {
  title: "",
  isbn: "",
  description: "",
  published_date: "",
  total_copies: "",
  available_copies: "",
  category: "",
  authors: [],
  publisher: "",
  image: null,
};

function BookForm({ initialData = emptyBook, submitLabel, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    ...emptyBook,
    ...initialData,
  });

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image || null
  );

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [
          categoryResponse,
          authorResponse,
          publisherResponse,
        ] = await Promise.all([
          api.get("/books/categories/"),
          api.get("/books/authors/"),
          api.get("/books/publishers/"),
        ]);

        setCategories(categoryResponse.data);
        setAuthors(authorResponse.data);
        setPublishers(publisherResponse.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load category, author or publisher data."
        );
      }
    };

    loadCatalog();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setFormData((current) => ({
      ...current,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  const handleAuthorsChange = (event) => {
    const selected = Array.from(
      event.target.selectedOptions,
      (option) => Number(option.value)
    );

    setFormData((current) => ({
      ...current,
      authors: selected,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      Number(formData.available_copies) >
      Number(formData.total_copies)
    ) {
      setError(
        "Available copies cannot be greater than total copies."
      );
      return;
    }

    if (formData.authors.length === 0) {
      setError("Select at least one author.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("isbn", formData.isbn);
      data.append("description", formData.description);
      data.append(
        "published_date",
        formData.published_date || ""
      );
      data.append("total_copies", formData.total_copies);
      data.append("available_copies", formData.available_copies);
      data.append("category", formData.category);

      formData.authors.forEach((authorId) => {
        data.append("authors", authorId);
      });

      if (formData.publisher) {
        data.append("publisher", formData.publisher);
      }

      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }

      await onSubmit(data);
    } catch (requestError) {
      const data = requestError.response?.data;

      setError(
        data
          ? JSON.stringify(data)
          : "Unable to save book."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">

        {/* Title */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Title
          </label>

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </div>

        {/* ISBN */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            ISBN
          </label>

          <div className="flex items-start gap-4">
            <input
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5"
            />

          </div>
        </div>

        {/* Published Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Published Date
          </label>

          <input
            type="date"
            name="published_date"
            value={formData.published_date || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </div>

        {/* Total Copies */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Total Copies
          </label>

          <input
            type="number"
            min="1"
            name="total_copies"
            value={formData.total_copies}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </div>

        {/* Available Copies */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Available Copies
          </label>

          <input
            type="number"
            min="0"
            name="available_copies"
            value={formData.available_copies}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publisher */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Publisher
          </label>

          <select
            name="publisher"
            value={formData.publisher || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          >
            <option value="">No publisher</option>

            {publishers.map((publisher) => (
              <option key={publisher.id} value={publisher.id}>
                {publisher.name}
              </option>
            ))}
          </select>
        </div>

        {/* Authors */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Authors
          </label>

          <select
            multiple
            value={formData.authors.map(String)}
            onChange={handleAuthorsChange}
            className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2.5"
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        {/* Book Image */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Book Image
          </label>

          <div className="flex flex-col gap-4 rounded-lg border border-slate-300 p-4 sm:flex-row sm:items-center">
            
            <div className="flex h-40 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Book preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-2 text-center text-xs text-slate-400">
                  No image selected
                </span>
              )}
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-600"
              />

              <p className="mt-2 text-xs text-slate-500">
                Upload a book cover image. JPG, PNG or WebP recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {saving ? "Saving..." : submitLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default BookForm;