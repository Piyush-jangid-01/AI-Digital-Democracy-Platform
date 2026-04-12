import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/" />;
  }

  // Citizens trying to access admin pages → back to citizen dashboard
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/citizen" />;
  }

  // Admins trying to access citizen dashboard → back to admin
  if (!adminOnly && user.role === "admin" && window.location.pathname === "/citizen") {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedRoute;