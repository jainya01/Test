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
  faEdit,
  faEllipsis,
  faEye,
  faFile,
  faList,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

function CallerExecutive() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");
  const [caller, setCaller] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const [callerRes, logRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allcallers`, { headers: authHeader() }),
          axios.get(`${API_URL}/allcalllogs`, { headers: authHeader() }),
        ]);

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data);
        }

        if (logRes.status === "fulfilled") {
          setLogs(logRes.value.data.result);
        }
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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredCaller]);

  const allocateNumbers = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/assign-custom-leads`,
        {
          callerIds: selected,
        },
        {
          headers: authHeader(),
        },
      );

      setSelected("");
      toast.success("numbers allotted successfully");
    } catch (error) {
      toast.error("failed to allot numbers");
      console.error(error.response?.data || error.message);
    }
  };

  const convertedLeads = (callerId) => {
    const total = logs.filter(
      (item) => item.call_log_caller_id === callerId,
    ).length;

    const converted = logs.filter(
      (item) =>
        item.call_log_caller_id === callerId &&
        item.call_log_status === "Converted",
    ).length;

    return total ? ((converted / total) * 100).toFixed(2) : 0;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const sortedCaller = [...caller].sort(
    (a, b) => convertedLeads(b.id) - convertedLeads(a.id),
  );

  const paginatedData = sortedCaller.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCaller.length / itemsPerPage);
  const [selected, setSelected] = useState([]);
  const allChecked = paginatedData.length === selected.length;

  const isIndeterminate =
    selected.length > 0 && selected.length < paginatedData.length;

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
                  placeholder="Search caller name, email..."
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

          <div className="d-flex flex-row gap-2">
            <div>
              <Link className="btn user-added-btn" onClick={allocateNumbers}>
                Allot Numbers
              </Link>
            </div>

            <div>
              <Link className="btn user-added-btn" to="/admin/callers/create">
                + Add Caller
              </Link>
            </div>
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
                          <th>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={allChecked}
                              ref={(el) =>
                                el && (el.indeterminate = isIndeterminate)
                              }
                              onChange={(e) =>
                                setSelected(
                                  e.target.checked
                                    ? paginatedData.map((d) => d.id)
                                    : [],
                                )
                              }
                            />
                          </th>
                          <th className="py-2">RANK</th>
                          <th>CALLER</th>
                          <th>CONVERSION</th>
                          <th>BADGE</th>
                          <th>STATUS</th>
                          <th>ACT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(paginatedData) &&
                        paginatedData.length > 0 ? (
                          paginatedData.map((data, idx) => (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selected.includes(data.id)}
                                  onChange={(e) =>
                                    setSelected((prev) =>
                                      e.target.checked
                                        ? [...prev, data.id]
                                        : prev.filter((id) => id !== data.id),
                                    )
                                  }
                                />
                              </td>

                              <td>{idx + 1}</td>

                              <td>
                                <Link
                                  to={`/admin/callers/view/${data.id}`}
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

                              <td>{convertedLeads(data.id)}%</td>

                              <td>
                                <span
                                  className={`badge ${
                                    convertedLeads(data.id) >= 80
                                      ? "bg-success"
                                      : convertedLeads(data.id) >= 60
                                        ? "bg-primary"
                                        : convertedLeads(data.id) >= 40
                                          ? "bg-warning text-dark"
                                          : "bg-danger"
                                  }`}
                                >
                                  {convertedLeads(data.id) >= 80
                                    ? "Excellent"
                                    : convertedLeads(data.id) >= 60
                                      ? "Good"
                                      : convertedLeads(data.id) >= 40
                                        ? "Avg"
                                        : "Need Improvement"}
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

                              <td className="text-start">
                                <span className="d-flex flex-row flex-nowrap">
                                  <Link
                                    to={`/admin/callers/view/${data.id}`}
                                    title="View"
                                  >
                                    <FontAwesomeIcon
                                      icon={faEye}
                                      className="icons-color2 me-1"
                                    />
                                  </Link>

                                  <Link
                                    to={`/admin/callers/edit/${data.id}`}
                                    title="Edit"
                                  >
                                    <FontAwesomeIcon
                                      icon={faEdit}
                                      className="icons-color"
                                    />
                                  </Link>

                                  <span title="Delete">
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      className="icons-color1 ps-1"
                                      onClick={() => deleteData(data.id)}
                                    />
                                  </span>
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
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

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default CallerExecutive;
