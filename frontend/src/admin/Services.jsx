import { useEffect, useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { authHeader } from "../utils/authHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEdit,
  faList,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

function Services() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [service, setService] = useState([]);

  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const allData = async () => {
      try {
        const response = await axios.get(`${API_URL}/allservices`, {
          headers: authHeader(),
        });
        setService(response.data.result);
      } catch (error) {
        console.error("error", error);
      }
    };
    allData();
  }, []);

  const deleteData = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/servicesdelete/${id}`, {
        headers: authHeader(),
      });
      setService((prev) => prev.filter((item) => item.id !== id));
      toast.success("Service deleted successfully");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const filteredServices = service.filter((item) => {
    const keyword = search.toLowerCase();
    return item.service_name?.toLowerCase().includes(keyword);
  });

  const itemsPerPage = 13;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedData = filteredServices.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredServices]);

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
                  placeholder="Search service name..."
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
            <h5 className="fw-bold overview-dashboard">
              Service Status Management
            </h5>
            <p className="text-muted mb-md-0 fw-bold overview-lead">
              Manage service status
            </p>
          </div>

          <div>
            <Link className="btn user-added-btn" to="/admin/services/create">
              + Add service
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
                          <th>SERVICE NAME</th>
                          <th>SERVICE CODE</th>
                          <th>PRICE</th>
                          <th>STATUS</th>
                          <th>ACT</th>
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
                                  to={`/admin/services/edit/${data.id}`}
                                  className="text-decoration-none text-dark"
                                >
                                  <span className="short-name fw-bold">
                                    {data?.service_name || "N/A"}
                                  </span>
                                </Link>
                              </td>

                              <td className="convert-code">
                                {data.service_code}
                              </td>

                              <td className="price-no">{data.price}</td>

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

                                  <span className="action-state">
                                    {data.status || "N/A"}
                                  </span>
                                </div>
                              </td>

                              <td className="text-start">
                                <span className="d-flex flex-nowrap">
                                  <Link
                                    to={`/admin/services/edit/${data.id}`}
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
                                      className="icons-color1 ps-2"
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

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default Services;
