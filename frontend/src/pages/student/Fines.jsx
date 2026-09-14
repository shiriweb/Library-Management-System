import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

function Fines() {
  const [fines, setFines] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [fineResponse, borrowResponse, booksResponse] = await Promise.all([
        api.get("/transactions/fines/"),
        api.get("/transactions/borrows/"),
        api.get("/books/"),
      ]);
      setFines(fineResponse.data);
      setBorrows(borrowResponse.data);
      setBooks(booksResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load fines.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const borrowMap = useMemo(
    () => Object.fromEntries(borrows.map((borrow) => [borrow.id, borrow])),
    [borrows],
  );
  const bookMap = useMemo(
    () => Object.fromEntries(books.map((book) => [book.id, book])),
    [books],
  );

  const totalUnpaid = fines
    .filter((fine) => !fine.is_paid)
    .reduce((sum, fine) => sum + Number(fine.amount), 0);

  const markFinePaid = async (fine) => {
    try {
      setPayingId(fine.id);
      setError("");
      setMessage("");
      await api.post(`/transactions/fines/${fine.id}/pay/`);
      setMessage(`Fine #${fine.id} marked as paid.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to mark this fine as paid.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <AppLayout title="My Fines" subtitle={`Current unpaid total: Rs. ${totalUnpaid.toFixed(3)}`}>
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        The current backend records payment by marking the fine as paid; it does not process an online payment gateway.
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">Loading fines...</p>
      ) : fines.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">You have no fines.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fines.map((fine) => {
            const borrow = borrowMap[fine.borrow];
            const book = borrow ? bookMap[borrow.book] : null;

            return (
              <article key={fine.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fine #{fine.id}</p>
                    <h2 className="mt-1 font-bold text-slate-900">{book?.title || "Borrowed Book"}</h2>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      fine.is_paid
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {fine.is_paid ? "Paid" : "Unpaid"}
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-900">Rs. {fine.amount}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Created: {new Date(fine.created_at).toLocaleDateString()}
                </p>

                {!fine.is_paid && (
                  <button
                    onClick={() => markFinePaid(fine)}
                    disabled={payingId === fine.id}
                    className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {payingId === fine.id ? "Updating..." : "Mark as Paid"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default Fines;
