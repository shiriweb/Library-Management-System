import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import BookForm from "../../components/BookForm";
import api from "../../services/api";

function AddBook() {
  const navigate = useNavigate();

  const createBook = async (payload) => {
    await api.post("/books/", payload);
    navigate("/librarian/books");
  };

  return (
    <AppLayout title="Add Book" subtitle="Create a book using the current librarian book API.">
      <BookForm
        submitLabel="Add Book"
        onSubmit={createBook}
        onCancel={() => navigate("/librarian/books")}
      />
    </AppLayout>
  );
}

export default AddBook;
