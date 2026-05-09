import { Navigate, Outlet } from "react-router-dom";

const UserProtected = ({ allow = [] }) => {
  const token = localStorage.getItem("callerToken");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allow.length && !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UserProtected;
