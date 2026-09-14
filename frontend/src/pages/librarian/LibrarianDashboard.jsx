import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LibrarianDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">
          Librarian Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Welcome to Smart Library.
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default LibrarianDashboard;