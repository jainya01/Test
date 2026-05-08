import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import AdminProtected from "./components/AdminProtected";
import User from "./User";
import HomePage from "./admin/HomePage";
import Reports from "./admin/Reports";
import CallerExecutive from "./admin/CallerExecutive";
import Customers from "./admin/Customers";
import Leads from "./admin/Leads";
import BulkUpload from "./admin/BulkUpload";
import Settings from "./admin/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<AdminProtected />}>
          <Route path="/admin" element={<User />}>
            <Route path="dashboard" element={<HomePage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<CallerExecutive />} />
            <Route path="customers" element={<Customers />} />
            <Route path="leads" element={<Leads />} />
            <Route path="bulk-upload" element={<BulkUpload />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
