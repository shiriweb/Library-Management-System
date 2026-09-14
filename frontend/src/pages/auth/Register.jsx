import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function formatApiError(error) {
  const data = error.response?.data;

  if (!data) return "Unable to create account. Please try again.";
  if (typeof data === "string") return data;

  return Object.entries(data)
    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`)
    .join(" | ");
}

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/accounts/register/", {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });

      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(formatApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-md md:p-9">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create Student Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registration uses the current backend student account service.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {[
            ["username", "Username", "text"],
            ["email", "Email", "email"],
            ["first_name", "First name", "text"],
            ["last_name", "Last name", "text"],
            ["password", "Password", "password"],
            ["confirmPassword", "Confirm password", "password"],
          ].map(([name, label, type]) => (
            <div key={name} className={name === "username" || name === "email" ? "md:col-span-2" : ""}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={["username", "email", "password", "confirmPassword"].includes(name)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 md:col-span-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
