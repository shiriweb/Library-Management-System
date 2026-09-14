import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import Books from "./pages/student/Books";
import MyBooks from "./pages/student/MyBooks";
import Fines from "./pages/student/Fines";
import ManageBooks from "./pages/librarian/ManageBooks";
import AddBook from "./pages/librarian/AddBook";
import EditBook from "./pages/librarian/EditBook";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian/dashboard"
          element={
            <ProtectedRoute>
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-books"
          element={
            <ProtectedRoute>
              <MyBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fines"
          element={
            <ProtectedRoute>
              <Fines />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
