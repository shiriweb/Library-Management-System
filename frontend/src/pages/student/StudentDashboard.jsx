import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewBooks = () => {
    navigate("/student/books");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Library</h1>

            <p className="text-sm text-gray-500">Student Portal</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.username}</span>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.first_name || user?.username}!
          </h2>

          <p className="text-gray-600 mt-2">
            Manage your library activities from here.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Browse Books
            </h3>

            <p className="text-gray-500 mt-2">
              Explore books available in the library.
            </p>
            <button
              onClick={handleViewBooks}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Books
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              My Borrowed Books
            </h3>

            <p className="text-gray-500 mt-2">
              View the books you currently have borrowed.
            </p>

            <button
              onClick={() => navigate("/student/my-books")}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              My Books
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">My Fines</h3>

            <p className="text-gray-500 mt-2">
              Check your outstanding library fines.
            </p>

            <button
              onClick={() => navigate("/student/fines")}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Fines
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
