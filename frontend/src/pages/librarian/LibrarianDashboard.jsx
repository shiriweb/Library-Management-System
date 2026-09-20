import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

function StatCard({ label, value, emphasis = false, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          emphasis ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>

      {note && (
        <p className="mt-2 text-xs text-slate-500">
          {note}
        </p>
      )}
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

      const response = await api.get(
        "/transactions/librarian-dashboard/"
      );

      setDashboard(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const refreshTimer = window.setInterval(
      loadDashboard,
      15000
    );

    return () => window.clearInterval(refreshTimer);
  }, [loadDashboard]);

  const isOverdue = (borrow) => {
    if (
      borrow.status === "returned" ||
      !borrow.due_date
    ) {
      return false;
    }

    const today = new Date();
    const dueDate = new Date(borrow.due_date);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return today > dueDate;
  };

  return (
    <AppLayout
      title="Librarian Dashboard"
      actions={
        <>
          <button
            onClick={() => navigate("/librarian/books")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Manage Books
          </button>

          <button
            onClick={() => navigate("/librarian/catalog")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Catalog Data
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            Loading dashboard...
          </p>
        </div>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Books"
              value={dashboard.total_books}
              note="Books in the library"
            />

            <StatCard
              label="Total Students"
              value={dashboard.total_students}
              note="Registered students"
            />

            <StatCard
              label="Currently Borrowed"
              value={dashboard.currently_borrowed}
              note="Books currently borrowed"
            />

            <StatCard
              label="Overdue Books"
              value={dashboard.overdue_books}
              emphasis
              note="Books past their due date"
            />

            <StatCard
              label="Waiting Queue"
              value={dashboard.waiting_queue}
              note="Students waiting for books"
            />

            <StatCard
              label="Unpaid Fines"
              value={dashboard.unpaid_fines}
              note={`Rs. ${dashboard.total_unpaid_fine_amount} total`}
            />
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Borrowing Records
              </h2>

             
            </div>

            {dashboard.recent_borrows.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  No borrowing records found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-600">
                      <th className="px-3 py-3 font-semibold">
                        Borrow ID
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Student
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Book
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Borrowed
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Due Date
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.recent_borrows.map((borrow) => {
                      const overdue = isOverdue(borrow);

                      return (
                        <tr
                          key={borrow.borrow_id}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-3 py-3 text-slate-600">
                            #{borrow.borrow_id}
                          </td>

                          <td className="px-3 py-3 font-medium text-slate-800">
                            {borrow.student}
                          </td>

                          <td className="px-3 py-3 text-slate-700">
                            {borrow.book_title}
                          </td>

                          <td className="px-3 py-3 text-slate-600">
                            {new Date(
                              borrow.borrowed_at
                            ).toLocaleDateString()}
                          </td>

                          <td
                            className={`px-3 py-3 font-medium ${
                              overdue
                                ? "text-red-600"
                                : "text-slate-600"
                            }`}
                          >
                            {borrow.due_date}
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex flex-col items-start gap-1.5">
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

                              {borrow.status !== "returned" && (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    overdue
                                      ? "bg-red-50 text-red-600"
                                      : "bg-green-50 text-green-600"
                                  }`}
                                >
                                  {overdue
                                    ? "Overdue"
                                    : "Not Overdue"}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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