import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("access_token");
  const { user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const fallback =
      user.role === "LIBRARIAN"
        ? "/librarian/dashboard"
        : "/student/dashboard";

    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default ProtectedRoute;
