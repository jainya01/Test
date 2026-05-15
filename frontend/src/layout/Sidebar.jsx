import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../App.css";
import { authHeader } from "../utils/authHeader";
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
  faListCheck,
  // faList,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ADMIN_LINKS = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    exact: true,
    icon: faTableColumns,
  },
  { path: "/admin/customers", label: "Customers", icon: faUsers },
  { path: "/admin/callers", label: "Calling Executive", icon: faHeadset },
  { path: "/admin/reports", label: "Reports", icon: faChartColumn },
  { path: "/admin/services", label: "Services", icon: faListCheck },
  // { path: "/admin/leads", label: "My Leads", icon: faPhone },
  { path: "/admin/bulk-upload", label: "Bulk Upload", icon: faUpload },
  { path: "/admin/settings", label: "Settings", icon: faCog },
];

const CALLER_LINKS = [
  {
    path: "/caller/leads",
    label: "My Leads",
    exact: true,
    icon: faPhone,
  },
];

export default function Sidebar() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((s) => !s);
  const closeSidebar = () => setIsOpen(false);

  const role = localStorage.getItem("role");
  const navLinks = role === "admin" ? ADMIN_LINKS : CALLER_LINKS;

  const handleLogout = (e) => {
    e.stopPropagation();
    closeSidebar();
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // const [collapsed, setCollapsed] = useState(false);

  // const toggleDesktopSidebar = () => {
  //   setCollapsed((prev) => !prev);
  // };

  const [admin, setAdmin] = useState([]);
  const [caller, setCaller] = useState([]);
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const allData = async () => {
      try {
        const [adminRes, callerRes] = await Promise.allSettled([
          axios.get(`${API_URL}/alladmindata`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allcallers`, {
            headers: authHeader(),
          }),
        ]);

        if (adminRes.status === "fulfilled") {
          setAdmin(adminRes.value.data.result || []);
        }

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data || []);
        }
      } catch (error) {
        console.error("error", error);
      }
    };

    allData();
  }, []);

  const handleLoggedUser = () => {
    const role = localStorage.getItem("role");
    const id = Number(localStorage.getItem("id"));

    if (role === "admin") {
      const findAdmin = admin.find((item) => Number(item.id) === id);

      if (findAdmin) {
        setLoggedUser({
          name: findAdmin.name,
          email: findAdmin.email,
        });
      }
    }

    if (role === "caller") {
      const findCaller = caller.find((item) => Number(item.id) === id);

      if (findCaller) {
        setLoggedUser({
          name: findCaller.fullname,
          email: findCaller.email,
        });
      }
    }
  };

  useEffect(() => {
    if (admin.length > 0 || caller.length > 0) {
      handleLoggedUser();
    }
  }, [admin, caller]);

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
            to={role === "admin" ? "/admin/dashboard" : "/caller/leads"}
            className="text-decoration-none"
            onClick={closeSidebar}
          >
            <div className="d-flex">
              <div className="custom-box mt-0">
                <FontAwesomeIcon icon={faPhone} />
              </div>

              <div className="d-flex flex-column ms-2 font-alfasseh">
                <span className="text-dark fw-bold">CallTrack CRM</span>
                <span className="laundry-app text-dark">Laraib Travels</span>
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
              to={role === "admin" ? "/admin/dashboard" : "/caller/leads"}
              className="text-decoration-none"
              onClick={closeSidebar}
            >
              <div className="d-flex mt-2 mb-2">
                <div className="custom-box mt-0">
                  <FontAwesomeIcon icon={faPhone} />
                </div>

                <div className="d-flex flex-column ms-2 font-alfasseh">
                  <span className="text-light fw-bold">CallTrack CRM</span>
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
              <FontAwesomeIcon icon={faXmark} className="text-light" />
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
                onClick={closeSidebar}
              >
                <FontAwesomeIcon icon={link.icon} />
                <span className="ms-2 label-span">{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-0 mb-2">
            <hr className="mb-0 text-danger" />

            <div className="d-block d-flex align-items-center flex-row flex-nowrap justify-content-between rounded p-1 mt-2 w-100">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-2 short-sidebar text-white fw-bold custom-short">
                  {loggedUser?.name
                    ? loggedUser.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div className="d-flex flex-column">
                  <span className="fw-semibold text-nowrap custom-shorts">
                    {loggedUser?.name ?? "N/A"}
                  </span>

                  <small className="custom-shorts1">
                    {loggedUser?.email ?? "N/A"}
                  </small>
                </div>
              </div>

              <div onClick={handleLogout}>
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className="logout-color"
                  role="button"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        className="d-none d-md-block admin-sidebar"
        aria-label="Admin sidebar"
      >
        <div className="p-0 d-flex flex-column" style={{ minHeight: "100%" }}>
          <Link
            to={role === "admin" ? "/admin/dashboard" : "/caller/leads"}
            className="text-decoration-none"
          >
            <div className="d-flex mt-3">
              <div className="custom-box mt-0">
                <FontAwesomeIcon icon={faPhone} />
              </div>

              <div className="d-flex flex-column ms-2 font-alfasseh">
                <span className="text-light fw-bold">CallTrack CRM</span>
                <span className="laundry-app">Laraib Travels</span>
              </div>
            </div>
          </Link>

          <div className="mt-3 mb-2 custom-font-crm">
            {role === "admin" ? "Admin" : "Caller"}
          </div>

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

            <div className="d-none d-md-block d-lg-flex d-md-flex align-items-center justify-content-between rounded p-1 mt-2 w-100">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-2 short-sidebar text-white fw-bold custom-short">
                  {loggedUser?.name
                    ? loggedUser.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div className="d-flex flex-column">
                  <span className="fw-semibold text-nowrap custom-shorts">
                    {loggedUser?.name ?? "N/A"}
                  </span>

                  <small className="custom-shorts1">
                    {loggedUser?.email ?? "N/A"}
                  </small>
                </div>
              </div>

              <div onClick={handleLogout}>
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className="logout-color"
                  role="button"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* <div className="list-list-sidebar">
        <FontAwesomeIcon icon={faList} />
      </div> */}
    </>
  );
}
