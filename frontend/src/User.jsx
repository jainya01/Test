import Sidebar from "./layout/Sidebar";
import { Outlet } from "react-router-dom";

function User() {
  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default User;
