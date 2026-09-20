import { useCallback, useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
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

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(
        "/transactions/student-dashboard/"
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

  const notifiedQueue =
    dashboard?.queue?.filter(
      (entry) => entry.status === "notified"
    ) || [];

  const leaveQueue = async (queueId) => {
    try {
      setBusyId(queueId);
      setError("");

      await api.delete(
        `/transactions/queue/${queueId}/`
      );

      await loadDashboard();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to leave queue."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout
      title="Student Dashboard"
      subtitle="View your borrowed books, queue status, overdue books and fines."
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {notifiedQueue.length > 0 && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
              ✓
            </div>

            <div>
              <p className="font-semibold text-green-900">
                Book available for you
              </p>

              {notifiedQueue.map((entry) => (
                <p
                  key={entry.queue_id}
                  className="mt-1 text-sm text-green-800"
                >
                  <span className="font-medium">
                    {entry.book_title}
                  </span>{" "}
                  has an available copy. Open Books and borrow it.
                </p>
              ))}
            </div>
          </div>
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
              label="Total Borrowed"
              value={dashboard.total_borrowed}
              note="Books borrowed in total"
            />

            <StatCard
              label="Currently Borrowed"
              value={dashboard.current_borrows.length}
              note="Books currently with you"
            />

            <StatCard
              label="Overdue Books"
              value={dashboard.overdue_borrows.length}
              note="Books past their due date"
            />

            <StatCard
              label="Unpaid Fine"
              value={`Rs. ${dashboard.unpaid_fines}`}
              note={`${dashboard.waiting_queue} waiting queue item(s)`}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Current Books
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Books you currently have borrowed
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  📚
                </div>
              </div>

              {dashboard.current_borrows.length === 0 ? (
                <div className="mt-5 rounded-lg bg-slate-50 p-5 text-center">
                  <p className="text-sm text-slate-500">
                    No books currently borrowed.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {dashboard.current_borrows.map((borrow) => (
                    <div
                      key={borrow.borrow_id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {borrow.book_title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Due:{" "}
                            <span className="font-medium text-slate-700">
                              {borrow.due_date}
                            </span>
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Borrowed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    My Queue
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Books you are waiting for
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  ⏳
                </div>
              </div>

              {dashboard.queue.length === 0 ? (
                <div className="mt-5 rounded-lg bg-slate-50 p-5 text-center">
                  <p className="text-sm text-slate-500">
                    You are not in any book queue.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {dashboard.queue.map((entry) => (
                    <div
                      key={entry.queue_id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {entry.book_title}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          Status:
                        </p>

                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            entry.status === "notified"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>

                      {["waiting", "notified"].includes(
                        entry.status
                      ) && (
                        <button
                          onClick={() =>
                            leaveQueue(entry.queue_id)
                          }
                          disabled={
                            busyId === entry.queue_id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyId === entry.queue_id
                            ? "Removing..."
                            : "Leave Queue"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {dashboard.overdue_borrows.length > 0 && (
            <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  !
                </div>

                <div>
                  <h2 className="font-semibold text-amber-900">
                    Overdue Books
                  </h2>

                  <p className="mt-1 text-sm text-amber-800">
                    Please return these books to avoid additional fines.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {dashboard.overdue_borrows.map((borrow) => (
                  <div
                    key={borrow.borrow_id}
                    className="rounded-lg border border-amber-100 bg-white p-4"
                  >
                    <p className="font-semibold text-slate-800">
                      {borrow.book_title}
                    </p>

                    <p className="mt-2 text-sm text-amber-700">
                      Due date:{" "}
                      <span className="font-semibold">
                        {borrow.due_date}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}
    </AppLayout>
  );
}

export default StudentDashboard;