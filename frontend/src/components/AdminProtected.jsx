import { Navigate, Outlet } from "react-router-dom";

const AdminProtected = ({ allow = [] }) => {
  const token = localStorage.getItem("adminToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allow.length && !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtected;
