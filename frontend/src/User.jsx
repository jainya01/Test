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

// Indexing in MySQL is a technique that speeds up data retrieval by creating a structured lookup (like a pointer system) instead of scanning the whole table.

// Indexing improves database performance by allowing MySQL to quickly locate rows without scanning the entire table. It works like a book index, helping the database jump directly to the required data instead of reading everything.
