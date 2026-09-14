import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function LibrarianDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get(
          "/transactions/librarian-dashboard/"
        );

        setDashboard(response.data);
      } catch (error) {
        console.error("LIBRARIAN DASHBOARD ERROR:", error);

        if (error.response) {
          setError(
            error.response.data.detail ||
            "Unable to load dashboard."
          );
        } else {
          setError("Unable to connect to the server.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Librarian Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Welcome to Smart Library.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <p className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {dashboard && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                  Total Books
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboard.total_books}
                </h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                  Total Students
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboard.total_students}
                </h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                  Currently Borrowed
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboard.currently_borrowed}
                </h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                  Overdue Books
                </p>

                <h2 className="text-3xl font-bold text-red-600 mt-2">
                  {dashboard.overdue_books}
                </h2>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                  Students Waiting in Queue
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboard.waiting_queue}
                </h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">
                  Unpaid Fines
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboard.unpaid_fines}
                </h2>

                <p className="text-gray-600 mt-2">
                  Total: Rs.{" "}
                  {dashboard.total_unpaid_fine_amount}
                </p>
              </div>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">

              <h2 className="text-xl font-semibold text-gray-800">
                Recent Borrowing Records
              </h2>

              {dashboard.recent_borrows.length === 0 ? (
                <p className="text-gray-600 mt-4">
                  No borrowing records found.
                </p>
              ) : (
                <div className="overflow-x-auto mt-4">

                  <table className="w-full text-left">

                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-2">
                          Student
                        </th>

                        <th className="py-3 px-2">
                          Book
                        </th>

                        <th className="py-3 px-2">
                          Borrowed
                        </th>

                        <th className="py-3 px-2">
                          Due Date
                        </th>

                        <th className="py-3 px-2">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.recent_borrows.map(
                        (borrow) => (
                          <tr
                            key={borrow.borrow_id}
                            className="border-b"
                          >
                            <td className="py-3 px-2">
                              {borrow.student}
                            </td>

                            <td className="py-3 px-2">
                              {borrow.book_title}
                            </td>

                            <td className="py-3 px-2">
                              {new Date(
                                borrow.borrowed_at
                              ).toLocaleDateString()}
                            </td>

                            <td className="py-3 px-2">
                              {borrow.due_date}
                            </td>

                            <td className="py-3 px-2">
                              {borrow.status}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default LibrarianDashboard;