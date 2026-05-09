import { useEffect, useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { authHeader } from "../utils/authHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendar,
  faDownload,
  faEllipsis,
  faFile,
  faList,
} from "@fortawesome/free-solid-svg-icons";

function CallerExecutive() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");

  const users = [
    {
      id: 1,
      name: "Aisha Khan",
      initials: "AK",
      email: "aisha@mail.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Bilal Ahmed",
      initials: "BA",
      email: "bilal@mail.com",
      role: "Caller",
      status: "Active",
    },
    {
      id: 3,
      name: "Sana Yosuf",
      initials: "SY",
      email: "sana@mail.com",
      role: "Caller",
      status: "Active",
    },
    {
      id: 4,
      name: "Omar Farooq",
      initials: "OF",
      email: "omar@mail.com",
      role: "Caller",
      status: "Inactive",
    },
  ];

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const [caller, setCaller] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const response = await axios.get(`${API_URL}/allcallers`, {
          headers: authHeader(),
        });
        setCaller(response.data.data);
      } catch (error) {
        console.error("error", error);
      }
    };
    allData();
  }, []);

  const deleteData = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this caller?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/callerdelete/${id}`, {
        headers: authHeader(),
      });
      setCaller((prev) => prev.filter((item) => item.id !== id));
      toast.success("Caller deleted successfully");
    } catch (error) {
      toast.error("Failed to delete caller");
    }
  };

  const filteredCaller = caller.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.fullname?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword)
    );
  });

  const itemsPerPage = 11;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredCaller.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCaller.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredCaller]);

  return (
    <div className="content-wrapper">
      <div className="container-fluid border-bottom bg-light py-2">
        <div className="row align-items-center">
          <div className="col-10 col-md-11">
            <div className="row align-items-center">
              <div className="col-auto">
                <button className="btn border-0">
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>

              <div className="col-9 col-md-8 col-lg-4">
                <input
                  type="text"
                  className="form-control sector-wise"
                  placeholder="Search customers, calls, agents..."
                  style={{ height: "40px" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-2 col-md-1 d-flex justify-content-end">
            <button className="btn border-0 position-relative">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-corner bg-danger">0</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-2 p-lg-3 mt-2">
        <div className="d-flex flex-row flex-wrap justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">Caller Management</h5>
            <p className="text-muted mb-md-0 fw-bold overview-lead">
              Manage telecallers
            </p>
          </div>

          <div>
            <Link className="btn user-added-btn" to="/admin/callers/create">
              + Add Caller
            </Link>
          </div>
        </div>

        <div className="row g-2 mt-3">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-3 h-100">
              <div className="card-body p-0">
                <div className="table-wrapper">
                  <div className="table-responsive custom-scrollbar custom-scrollbar1">
                    <table className="table table-striped mb-0">
                      <thead className="table-secondary header-table text-nowrap">
                        <tr>
                          <th className="ps-2 py-2">S/N</th>
                          <th>NAME</th>
                          <th>EMAIL</th>
                          <th>ROLE</th>
                          <th>STATUS</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(paginatedData) &&
                        paginatedData.length > 0 ? (
                          paginatedData.map((data, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>

                              <td>
                                <Link
                                  to={`/admin/callers/edit/${data.id}`}
                                  className="text-decoration-none text-dark"
                                >
                                  <span className="d-flex flex-row align-items-center fw-bold">
                                    <div className="avatar me-2 border">
                                      {data?.fullname
                                        ? data.fullname
                                            .split(" ")
                                            .map((word) => word[0])
                                            .join("")
                                            .toUpperCase()
                                        : ""}
                                    </div>

                                    <span className="short-name">
                                      {data?.fullname || "N/A"}
                                    </span>
                                  </span>
                                </Link>
                              </td>

                              <td className="convert-call">{data.email}</td>

                              <td>
                                <span
                                  className={
                                    data.role === "Admin"
                                      ? "admin-box"
                                      : "caller-box"
                                  }
                                >
                                  {data.role}
                                </span>
                              </td>

                              <td
                                className={
                                  data.status === "Active"
                                    ? "convert-no"
                                    : "convert-call"
                                }
                              >
                                <div className="d-flex align-items-center">
                                  <div
                                    className={`me-1 ${
                                      data.status === "Active"
                                        ? "custom-success"
                                        : "custom-active"
                                    }`}
                                  ></div>

                                  {data.status || "N/A"}
                                </div>
                              </td>

                              <td className="text-start lh-lg">
                                <button
                                  className="btn btn-sm border-0 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                      openMenuId === data.id ? null : data.id,
                                    );
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEllipsis} />
                                </button>

                                {openMenuId === data.id && (
                                  <div
                                    className="position-absolute bg-white border rounded shadow-sm px-3"
                                    style={{
                                      right: 0,
                                      top: "25px",
                                      zIndex: 1000,
                                      width: "120px",
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button className="dropdown-item text-success">
                                      Active
                                    </button>

                                    <button className="dropdown-item text-warning">
                                      Inactive
                                    </button>

                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => deleteData(data.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-3 fw-bold text-muted"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center align-items-center flex-wrap mt-3 mb-3 gap-2">
                        <button
                          className={`btn rounded-pill px-3 py-1 shadow-sm ${
                            currentPage <= 1
                              ? "btn-light border text-muted"
                              : "btn-success border-0"
                          }`}
                          disabled={currentPage <= 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          ← Prev
                        </button>

                        <span className="fw-semibold px-2">
                          Page {currentPage} of {totalPages || 1}
                        </span>

                        <button
                          className={`btn rounded-pill px-3 py-1 shadow-sm ${
                            currentPage >= totalPages
                              ? "btn-light border text-muted"
                              : "btn-success border-0"
                          }`}
                          disabled={currentPage >= totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallerExecutive;
