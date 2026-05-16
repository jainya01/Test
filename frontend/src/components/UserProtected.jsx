import { Navigate, Outlet } from "react-router-dom";

const UserProtected = ({ allow = [] }) => {
  const token = localStorage.getItem("callerToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allow.length > 0 && !allow.includes(role)) {
    return <Navigate to="/caller/leads" replace />;
  }

  return <Outlet />;
};

export default UserProtected;
