import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faXmark,
  faRightFromBracket,
  faUsers,
  faChartColumn,
  faPhone,
  faHeadset,
  faCog,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

const NAV_LINKS = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    exact: true,
    icon: faTableColumns,
  },
  { path: "/admin/customers", label: "Customers", icon: faUsers },
  { path: "/admin/users", label: "Calling Executive", icon: faHeadset },
  { path: "/admin/reports", label: "Reports", icon: faChartColumn },
  { path: "/admin/leads", label: "My Leads", icon: faPhone },
  { path: "/admin/bulk-upload", label: "Bulk Upload", icon: faUpload },
  { path: "/admin/settings", label: "Settings", icon: faCog },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((s) => !s);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = (e) => {
    e.stopPropagation();
    closeSidebar();
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const [navLinks, setNavLinks] = useState(NAV_LINKS);

  return (
    <>
      <nav className="navbar navbar-light bg-light d-md-none mobile-navbar-toggle">
        <div className="container-fluid">
          <button
            className="btn btn-outline-success hamburger-btn"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <Link
            to="/admin/dashboard"
            className="text-decoration-none"
            onClick={closeSidebar}
          >
            <div className="d-flex">
              <div className="custom-box mt-0">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <div className="d-flex flex-column ms-2 font-alfasseh">
                <span className="text-dark fw-bold">CallTrack CRM</span>
                <span className="laundry-app">Laraib Travels</span>
              </div>
            </div>
          </Link>
        </div>
      </nav>

      <hr className="mt-2 mb-3 d-block d-lg-none d-md-none" />

      {isOpen && <div className="mobile-overlay" onClick={closeSidebar}></div>}

      <div className={`mobile-sidebar d-md-none ${isOpen ? "open" : ""}`}>
        <div className="p-0 d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center">
            <Link
              to="/admin/dashboard"
              className="text-decoration-none"
              onClick={closeSidebar}
            >
              <div className="d-flex mt-2 mb-2">
                <div className="custom-box mt-0">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div className="d-flex flex-column ms-2 font-alfasseh">
                  <span className="text-dark fw-bold">CallTrack CRM</span>
                  <span className="laundry-app">Laraib Travels</span>
                </div>
              </div>
            </Link>

            <button
              title="Close"
              className="btn-closed"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="text-dark" />
            </button>
          </div>

          <hr className="text-dark mt-0 mb-2" />

          <div className="list-group list-group-flush me-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                className={({ isActive }) =>
                  [
                    "list-group-item rounded-2 list-group-item-action mb-0 ms-2 border-0",
                    isActive ? "active" : "",
                  ].join(" ")
                }
                onClick={() => {
                  closeSidebar();
                }}
              >
                <FontAwesomeIcon icon={link.icon} />
                <span className="ms-2 label-span">{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-0 mb-2">
            <hr className="mb-0 text-danger" />
            <div
              className="text-start mt-2 d-flex align-items-center logout-color ps-3 py-2"
              onClick={handleLogout}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="logout-col1or fw-light me-2"
              />
              Logout
            </div>
          </div>
        </div>
      </div>

      <aside
        className="d-none d-md-block admin-sidebar"
        aria-label="Admin sidebar"
      >
        <div className="p-0 d-flex flex-column" style={{ minHeight: "100%" }}>
          <Link to="/admin/dashboard" className="text-decoration-none">
            <div className="d-flex mt-3">
              <div className="custom-box mt-0">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <div className="d-flex flex-column ms-2 font-alfasseh">
                <span className="text-dark fw-bold">CallTrack CRM</span>
                <span className="laundry-app">Laraib Travels</span>
              </div>
            </div>
          </Link>

          <div className="mt-3 mb-2 custom-font-crm">Admin</div>

          <div className="list-group rounded-0 me-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                className={({ isActive }) =>
                  [
                    "list-group-item list-group-item-action mb-0 ms-2 border-0",
                    isActive ? "active" : "",
                  ].join(" ")
                }
              >
                <FontAwesomeIcon icon={link.icon} />
                <span className="ms-2 label-span">{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-0 mb-2">
            <hr className="mb-0 text-danger" />
            <div
              className="text-start mt-2 d-flex align-items-center logout-color ps-3 py-2"
              onClick={handleLogout}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="fw-light me-2"
              />
              Logout
            </div>
          </div>
        </div>
      </aside>

      <div className="content-wrapper"></div>
    </>
  );
}
