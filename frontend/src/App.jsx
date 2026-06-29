import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const Login = lazy(() => import("./components/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const CallerLogin = lazy(() => import("./pages/CallerLogin"));

const AdminProtected = lazy(() => import("./components/AdminProtected"));
const UserProtected = lazy(() => import("./components/UserProtected"));
import User from "./User";

const HomePage = lazy(() => import("./admin/HomePage"));

const Customers = lazy(() => import("./admin/Customers/Customers"));
const CustomersCreate = lazy(() => import("./admin/Customers/CustomersCreate"));
const CustomersEdit = lazy(() => import("./admin/Customers/CustomersEdit"));

const CallerExecutive = lazy(() => import("./admin/Callers/CallerExecutive"));
const CallersCreate = lazy(() => import("./admin/Callers/CallersCreate"));
const CallersEdit = lazy(() => import("./admin/Callers/CallersEdit"));
const CallerView = lazy(() => import("./admin/Callers/CallerView"));

const Reports = lazy(() => import("./admin/Reports"));

const Status = lazy(() => import("./admin/Status/Status"));
const StatusCreate = lazy(() => import("./admin/Status/StatusCreate"));
const StatusEdit = lazy(() => import("./admin/Status/StatusEdit"));

const Services = lazy(() => import("./admin/Services/Services"));
const ServicesCreate = lazy(() => import("./admin/Services/ServicesCreate"));
const ServicesEdit = lazy(() => import("./admin/Services/ServicesEdit"));

const BulkUpload = lazy(() => import("./admin/BulkUpload"));
const Settings = lazy(() => import("./admin/Settings"));

// const Leads = lazy(() => import("./admin/Leads"));
const CallerLeads = lazy(() => import("./caller/CallerLeads"));

function App() {
  return (
    <BrowserRouter basename="/test">
      <Suspense>
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

              <Route path="status" element={<Status />} />
              <Route path="status/create" element={<StatusCreate />} />
              <Route path="status/edit/:id" element={<StatusEdit />} />

              {/* <Route path="leads" element={<Leads />} /> */}
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
