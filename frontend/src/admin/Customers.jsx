import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faCalendar,
  faDownload,
  faEdit,
  faEye,
  faEyeSlash,
  faFile,
  faList,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

function Customers() {
  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("adminToken");
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [service, setService] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const maskPhoneNumber = (phone) => {
    if (!phone) return "";
    const phoneStr = phone.toString();
    return `${phoneStr.slice(0, 2)}xxxxxx${phoneStr.slice(-2)}`;
  };

  useEffect(() => {
    const allData = async () => {
      try {
        const [serviceRes, customersRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allservices`, {
            headers: authHeader(),
          }),
          axios.get(`${API_URL}/allcustomers`, {
            headers: authHeader(),
          }),
        ]);

        if (serviceRes.status === "fulfilled") {
          setService(serviceRes.value.data.result);
        }

        if (customersRes.status === "fulfilled") {
          setCustomers(customersRes.value.data.result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  const filteredCustomers = customers.filter((item) => {
    const keyword = search.toLowerCase();
    const name = item.name ? item.name.toLowerCase() : "";
    const phone = item.phone ? item.phone.toString() : "";
    const matchesSearch = name.includes(keyword) || phone.includes(keyword);
    const matchesStatus =
      selectedStatus === ""
        ? item.status && item.status.trim() !== "" && item.status !== "null"
        : item.status === selectedStatus;

    const matchesService =
      selectedService === "" ? true : item.service === selectedService;
    return matchesSearch && matchesStatus && matchesService;
  });

  const itemsPerPage = 14;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredCustomers.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredCustomers]);

  const deleteData = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/customersdelete/${id}`, {
        headers: authHeader(),
      });

      setCustomers((prev) => prev.filter((item) => item.id !== id));

      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete customer");
    }
  };

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
                  placeholder="Search Customers name, phone..."
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

      <div className="p-2 p-lg-3">
        <div className="d-flex flex-wrap flex-row justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">Customers</h5>
            <p className="text-muted mb-md-0 overview-lead">
              {paginatedData.length} of {paginatedData.length} leads
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2 flex-wrap">
            <div>
              <Link className="btn user-added-btn">Download CSV</Link>
            </div>

            <div>
              <Link className="btn user-added-btn" to="/admin/customers/create">
                + Add Customer
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
                    <h5 className="fw-bold mb-0 daily-performance">
                      Customers
                    </h5>
                  </div>

                  <div className="d-flex justify-content-end me-2 gap-1">
                    <div>
                      <select
                        className="form-select sector-wise"
                        value={selectedService}
                        onChange={(e) => {
                          setSelectedService(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Service</option>
                        <option value="Hajj">Hajj</option>
                        <option value="Umrah">Umrah</option>
                        <option value="Packages">Packages</option>
                        <option value="Misc">Misc</option>
                      </select>
                    </div>

                    <div>
                      <select
                        className="form-select sector-wise"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Status</option>
                        {Array.isArray(service) ? (
                          service
                            .filter((item) => item.status === "Active")
                            .map((item) => (
                              <option key={item.id} value={item.service_name}>
                                {item.service_name}
                              </option>
                            ))
                        ) : (
                          <option disabled>No services found</option>
                        )}
                      </select>
                    </div>

                    <div className="d-flex align-items-center flex-row text-nowrap border rounded px-2">
                      <div
                        className="pointer-cursor sector-wise d-flex align-items-center fw-bold"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                          className="me-1"
                        />
                        {showPassword ? "Hide numbers" : "Reveal numbers"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-wrapper">
                  <div className="table-responsive custom-scrollbar">
                    <table className="table table-striped mb-0">
                      <thead className="table-secondary header-table text-nowrap">
                        <tr>
                          <th className="ps-2">S/N</th>
                          <th>NAME</th>
                          <th>PHONE</th>
                          <th>SERVICE</th>
                          <th>STATUS</th>
                          <th>CALLER</th>
                          <th>ACT</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody className="body-table">
                        {Array.isArray(paginatedData) &&
                        paginatedData.length > 0 ? (
                          paginatedData.map((item, index) => (
                            <tr key={index}>
                              <td>
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>

                              <td>
                                <Link
                                  className="text-decoration-none text-dark"
                                  to={`/admin/customers/edit/${item.id}`}
                                >
                                  <span className="d-flex flex-row align-items-center fw-bold">
                                    <div className="avatar me-2 border">
                                      {item.name
                                        .split(" ")
                                        .map((word) => word[0])
                                        .join("")
                                        .toUpperCase()}
                                    </div>
                                    {item.name || "--"}
                                  </span>
                                </Link>
                              </td>

                              <td>
                                {showPassword
                                  ? item.phone
                                  : maskPhoneNumber(item.phone)}
                              </td>

                              <td>{item.service || "--"}</td>

                              <td>
                                <span
                                  className={
                                    {
                                      "Follow-up": "follow-up cus-res",
                                      "Not Interested":
                                        "non-interested-cust cus-res",
                                      Interested: "interested-cust cus-res",
                                      New: "new-customer cus-res",
                                      Converted: "convert-status cus-res",
                                    }[item.status] || ""
                                  }
                                >
                                  {item.status || "--"}
                                </span>
                              </td>

                              <td>{item.fullname || "--"}</td>

                              <td className="text-start">
                                <span className="d-flex flex-row flex-nowrap">
                                  <Link
                                    to={`/admin/customers/edit/${item.id}`}
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

                              <td className="view-right">
                                <span className="d-flex flex-row align-items-center">
                                  View
                                  <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="ms-1"
                                  />
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="8"
                              className="text-center py-3 fw-bold text-muted"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {filteredCustomers.length > itemsPerPage && (
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

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default Customers;
