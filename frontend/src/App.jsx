import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import AdminLogin from "./pages/AdminLogin";
import CallerLogin from "./pages/CallerLogin";

import AdminProtected from "./components/AdminProtected";
import UserProtected from "./components/UserProtected";

import User from "./User";
import HomePage from "./admin/HomePage";
import Reports from "./admin/Reports";
import CallerExecutive from "./admin/CallerExecutive";
import Customers from "./admin/Customers";
import Leads from "./admin/Leads";
import BulkUpload from "./admin/BulkUpload";
import Settings from "./admin/Settings";
import CallerLeads from "./caller/CallerLeads";
import CallersCreate from "./admin/CallersCreate";
import CallersEdit from "./admin/CallersEdit";
import Services from "./admin/Services";
import ServicesCreate from "./admin/ServicesCreate";
import ServicesEdit from "./admin/ServicesEdit";
import CustomersCreate from "./admin/CustomersCreate";
import CustomersEdit from "./admin/CustomersEdit";
import CallerView from "./admin/CallerView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="caller/login" element={<CallerLogin />} />

        <Route element={<AdminProtected />}>
          <Route path="/admin" element={<User />}>
            <Route path="dashboard" element={<HomePage />} />

            <Route path="customers" element={<Customers />} />
            <Route path="customers/create" element={<CustomersCreate />} />
            <Route path="customers/edit/:id" element={<CustomersEdit />} />

            <Route path="callers" element={<CallerExecutive />} />
            <Route path="callers/create" element={<CallersCreate />} />
            <Route path="callers/edit/:id" element={<CallersEdit />} />
            <Route path="callers/view/:id" element={<CallerView />} />

            <Route path="reports" element={<Reports />} />

            <Route path="services" element={<Services />} />
            <Route path="services/create" element={<ServicesCreate />} />
            <Route path="services/edit/:id" element={<ServicesEdit />} />

            <Route path="leads" element={<Leads />} />
            <Route path="bulk-upload" element={<BulkUpload />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<UserProtected />}>
          <Route path="/caller" element={<User />}>
            <Route path="leads" element={<CallerLeads />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
