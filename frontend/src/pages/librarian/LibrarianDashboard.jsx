import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

function StatCard({ label, value, emphasis = false, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p
        className={`mt-2 text-3xl font-bold ${
          emphasis ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>

      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

function LibrarianDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/transactions/librarian-dashboard/");

      setDashboard(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail || "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const refreshTimer = window.setInterval(loadDashboard, 15000);

    return () => window.clearInterval(refreshTimer);
  }, [loadDashboard]);

  return (
    <AppLayout
      title="Librarian Dashboard"
      subtitle="Library activity summary from the current backend services."
      actions={
        <>
          <button
            onClick={() => navigate("/librarian/books")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Manage Books
          </button>

          <button
            onClick={() => navigate("/librarian/catalog")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Catalog Data
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">Loading dashboard...</p>
      ) : dashboard ? (
        <>
          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Books" value={dashboard.total_books} />

            <StatCard label="Total Students" value={dashboard.total_students} />

            <StatCard
              label="Currently Borrowed"
              value={dashboard.currently_borrowed}
            />

            <StatCard
              label="Overdue Books"
              value={dashboard.overdue_books}
              emphasis
            />

            <StatCard label="Waiting Queue" value={dashboard.waiting_queue} />

            <StatCard
              label="Unpaid Fines"
              value={dashboard.unpaid_fines}
              note={`Rs. ${dashboard.total_unpaid_fine_amount} total`}
            />
          </div>

          {/* Recent Borrowing Records */}
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Borrowing Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View the latest borrowing activity and current status of each
                book.
              </p>
            </div>

            {dashboard.recent_borrows.length === 0 ? (
              <p className="text-sm text-slate-500">
                No borrowing records found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-600">
                      <th className="px-3 py-3">Borrow ID</th>

                      <th className="px-3 py-3">Student</th>

                      <th className="px-3 py-3">Book</th>

                      <th className="px-3 py-3">Borrowed</th>

                      <th className="px-3 py-3">Due Date</th>

                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.recent_borrows.map((borrow) => (
                      <tr
                        key={borrow.borrow_id}
                        className="border-b last:border-0"
                      >
                        {/* Borrow ID */}
                        <td className="px-3 py-3 text-slate-600">
                          #{borrow.borrow_id}
                        </td>

                        {/* Student */}
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {borrow.student}
                        </td>

                        {/* Book */}
                        <td className="px-3 py-3 text-slate-700">
                          {borrow.book_title}
                        </td>

                        {/* Borrowed Date */}
                        <td className="px-3 py-3 text-slate-600">
                          {new Date(borrow.borrowed_at).toLocaleDateString()}
                        </td>

                        {/* Due Date */}
                        <td className="px-3 py-3 text-slate-600">
                          {borrow.due_date}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              borrow.status === "returned"
                                ? "bg-green-100 text-green-700"
                                : borrow.status === "overdue"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {borrow.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </AppLayout>
  );
}

export default LibrarianDashboard;
