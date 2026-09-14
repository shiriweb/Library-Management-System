import { useCallback, useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
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
      const response = await api.get("/transactions/student-dashboard/");
      setDashboard(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [loadDashboard]);

  const notifiedQueue = dashboard?.queue?.filter((entry) => entry.status === "notified") || [];

  const leaveQueue = async (queueId) => {
    try {
      setBusyId(queueId);
      setError("");
      await api.delete(`/transactions/queue/${queueId}/`);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to leave queue.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout
      title="Student Dashboard"
      subtitle="Your current borrowing, queue and fine information from the library backend."
    >
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notifiedQueue.length > 0 && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">Book available for you</p>
          {notifiedQueue.map((entry) => (
            <p key={entry.queue_id} className="mt-1">
              {entry.book_title} has an available copy. Open Books and borrow it.
            </p>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">Loading dashboard...</p>
      ) : dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Borrowed" value={dashboard.total_borrowed} />
            <StatCard label="Currently Borrowed" value={dashboard.current_borrows.length} />
            <StatCard label="Overdue Books" value={dashboard.overdue_borrows.length} />
            <StatCard
              label="Unpaid Fine"
              value={`Rs. ${dashboard.unpaid_fines}`}
              note={`${dashboard.waiting_queue} waiting queue item(s)`}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Current Books</h2>
              {dashboard.current_borrows.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No books currently borrowed.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {dashboard.current_borrows.map((borrow) => (
                    <div key={borrow.borrow_id} className="rounded-lg bg-slate-50 p-3">
                      <p className="font-semibold text-slate-800">{borrow.book_title}</p>
                      <p className="mt-1 text-sm text-slate-500">Due: {borrow.due_date}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">My Queue</h2>
              {dashboard.queue.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">You are not in any book queue.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {dashboard.queue.map((entry) => (
                    <div
                      key={entry.queue_id}
                      className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{entry.book_title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Status: <span className="font-medium capitalize">{entry.status}</span>
                        </p>
                      </div>
                      {["waiting", "notified"].includes(entry.status) && (
                        <button
                          onClick={() => leaveQueue(entry.queue_id)}
                          disabled={busyId === entry.queue_id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busyId === entry.queue_id ? "Removing..." : "Leave Queue"}
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
              <h2 className="font-semibold text-amber-900">Overdue Books</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {dashboard.overdue_borrows.map((borrow) => (
                  <div key={borrow.borrow_id} className="rounded-lg bg-white p-3 text-sm">
                    <p className="font-semibold text-slate-800">{borrow.book_title}</p>
                    <p className="mt-1 text-amber-700">Due date: {borrow.due_date}</p>
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
