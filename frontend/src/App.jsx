import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import Books from "./pages/student/Books";
import MyBooks from "./pages/student/MyBooks";
import Fines from "./pages/student/Fines";
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import ManageBooks from "./pages/librarian/ManageBooks";
import AddBook from "./pages/librarian/AddBook";
import EditBook from "./pages/librarian/EditBook";
import CatalogData from "./pages/librarian/CatalogData";
import ProtectedRoute from "./routes/ProtectedRoute";

function HomeRedirect() {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={
        user.role === "LIBRARIAN"
          ? "/librarian/dashboard"
          : "/student/dashboard"
      }
      replace
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/books"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Books />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-books"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <MyBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fines"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Fines />
            </ProtectedRoute>
          }
        />

        <Route
          path="/librarian/dashboard"
          element={
            <ProtectedRoute allowedRole="LIBRARIAN">
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/books"
          element={
            <ProtectedRoute allowedRole="LIBRARIAN">
              <ManageBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/books/add"
          element={
            <ProtectedRoute allowedRole="LIBRARIAN">
              <AddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/books/edit/:id"
          element={
            <ProtectedRoute allowedRole="LIBRARIAN">
              <EditBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/catalog"
          element={
            <ProtectedRoute allowedRole="LIBRARIAN">
              <CatalogData />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
