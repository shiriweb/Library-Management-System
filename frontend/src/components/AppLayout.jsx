import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const studentLinks = [
  ["Dashboard", "/student/dashboard"],
  ["Books", "/student/books"],
  ["My Books", "/student/my-books"],
  ["Fines", "/student/fines"],
];

const librarianLinks = [
  ["Dashboard", "/librarian/dashboard"],
  ["Manage Books", "/librarian/books"],
  ["Catalog Data", "/librarian/catalog"],
];

function AppLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.role === "LIBRARIAN" ? librarianLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">

          {/* Logo and Portal Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl font-extrabold tracking-wide text-white shadow-sm">
              SL
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">
                Smart Library
              </p>

              <p className="text-sm text-slate-500">
                {user?.role === "LIBRARIAN"
                  ? "Librarian Portal"
                  : "Student Portal"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-2">
            {links.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User Information and Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {user?.first_name || user?.username}
              </p>

              <p className="text-xs text-slate-500">
                {user?.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-7 md:px-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 text-slate-600">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>

        {children}
      </main>
    </div>
  );
}

export default AppLayout;