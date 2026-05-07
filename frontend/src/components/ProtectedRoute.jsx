import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allow }) => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
