import { useEffect, useState } from "react";
import "../../App.css";
import { authHeader } from "../../utils/authHeader";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

function Services() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const allData = async () => {
      try {
        const [serviceRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allservicesdata`, {
            headers: authHeader(),
          }),
        ]);

        if (serviceRes.status === "fulfilled") {
          setServices(serviceRes.value.data.result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  const keyword = search.toLowerCase();

  const filteredServices = services.filter(
    (item) =>
      item.service_name?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword),
  );

  const itemsPerPage = 14;
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredServices.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredServices, totalPages]);

  const deleteData = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/servicedelete/${id}`, {
        headers: authHeader(),
      });

      setServices((prev) => prev.filter((item) => item.id !== id));

      toast.success("Service deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete Service");
    }
  };

  return (
    <main className="content-wrapper">
      <div className="container-fluid border-bottom bg-light py-2">
        <div className="row align-items-center">
          <div className="col-10 col-md-11">
            <div className="row align-items-center">
              <div className="col-9 col-md-8 col-lg-4">
                <input
                  type="text"
                  className="form-control sector-wise"
                  placeholder="Search Customers name, phone..."
                  style={{ height: "40px" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-2 col-md-1 d-flex justify-content-end align-items-center">
            <button className="btn border-0 position-relative">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-corner bg-danger">0</span>
            </button>

            <span className="text-nowrap ms-2 date-days">
              {new Date()
                .toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })
                .replace(",", "")}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2 p-lg-3">
        <div className="d-flex flex-wrap flex-row justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">Services</h5>
            <p className="text-muted mb-md-0 overview-lead">
              {filteredServices.length} of {services.length} services
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2 flex-wrap">
            <div>
              <Link className="btn user-added-btn" to="/admin/services/create">
                + Add Service
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-3 h-100">
              <div className="card-body p-0">
                <div className="mb-2 mt-3 ms-2 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0 daily-performance">Services</h5>
                  </div>
                </div>

                <div className="table-wrapper">
                  <div className="table-responsive custom-scrollbar">
                    <table className="table table-striped mb-0">
                      <thead className="table-secondary header-table text-nowrap">
                        <tr>
                          <th className="ps-2">S/N</th>
                          <th>SERVICE NAME</th>
                          <th>STATUS</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="body-table">
                        {Array.isArray(paginatedData) &&
                        paginatedData.length > 0 ? (
                          paginatedData
                            .sort((item) => item.updated_at)
                            .map((item, index) => (
                              <tr key={index}>
                                <td>
                                  {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>

                                <td>
                                  <Link
                                    to={`/admin/services/edit/${item.id}`}
                                    className="text-decoration-none text-dark"
                                  >
                                    <span className="short-name fw-bold">
                                      {item.service_name || "--"}
                                    </span>
                                  </Link>
                                </td>

                                <td
                                  className={
                                    item.status === "Active"
                                      ? "convert-no"
                                      : "convert-call"
                                  }
                                >
                                  <div className="d-flex align-items-center">
                                    <div
                                      className={`me-1 ${
                                        item.status === "Active"
                                          ? "custom-success"
                                          : "custom-active"
                                      }`}
                                    ></div>

                                    <span className="action-state">
                                      {item.status || "N/A"}
                                    </span>
                                  </div>
                                </td>

                                <td className="text-start">
                                  <span className="d-flex flex-row flex-nowrap">
                                    <Link
                                      to={`/admin/services/edit/${item.id}`}
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
                                        onClick={() => deleteData(item.id)}
                                      />
                                    </span>
                                  </span>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-3 fw-bold text-muted"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {filteredServices.length > itemsPerPage && (
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
                          Page {currentPage} of {totalPages}
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

      <ToastContainer position="bottom-right" autoClose={1500} />
    </main>
  );
}

export default Services;
