import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Fines() {
  const navigate = useNavigate();

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const response = await api.get("/transactions/fines/");
        setFines(response.data);
      } catch (error) {
        console.error("FINES ERROR:", error);

        if (error.response) {
          setError(JSON.stringify(error.response.data));
        } else {
          setError("Unable to connect to the server.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  const handlePayFine = async (fineId) => {
    try {
      setPayingId(fineId);

      await api.post(`/transactions/fines/${fineId}/pay/`);

      setFines((currentFines) =>
        currentFines.map((fine) =>
          fine.id === fineId
            ? { ...fine, is_paid: true }
            : fine
        )
      );
    } catch (error) {
      console.error("PAY FINE ERROR:", error);

      if (error.response) {
        setError(
          error.response.data.detail || "Unable to pay fine."
        );
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">
          My Fines
        </h1>

        <p className="text-gray-600 mt-2">
          Check your library fines.
        </p>

        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-5 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Back to Dashboard
        </button>

        {loading && (
          <p className="mt-6 text-gray-600">
            Loading fines...
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && fines.length === 0 && (
          <p className="mt-6 text-gray-600">
            You have no fines.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {fines.map((fine) => (
            <div
              key={fine.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                Fine #{fine.id}
              </h2>

              <p className="text-gray-600 mt-2">
                Amount: Rs. {fine.amount}
              </p>

              <p className="text-gray-600 mt-2">
                Status: {fine.is_paid ? "Paid" : "Unpaid"}
              </p>

              {!fine.is_paid && (
                <button
                  onClick={() => handlePayFine(fine.id)}
                  disabled={payingId === fine.id}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {payingId === fine.id
                    ? "Paying..."
                    : "Pay Fine"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Fines;