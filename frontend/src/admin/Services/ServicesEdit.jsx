import { useEffect, useState } from "react";
import "../../App.css";
import { authHeader } from "../../utils/authHeader";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

function ServicesEdit() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState({
    service_name: "",
    status: "",
    notes: "",
  });

  const { service_name, status, notes } = service;
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!service_name.trim()) {
      newErrors.service_name = "Service name is required";
    }

    if (!status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    try {
      await axios.put(`${API_URL}/servicesupdate/${id}`, service, {
        headers: authHeader(),
      });

      toast.success("Service updated successfully");
      setTimeout(() => {
        navigate("/admin/services");
      }, 1000);
    } catch (error) {
      console.error("error", error);
      toast.error("Failed to update service");
    }
  };

  const onInputChange = (e) => {
    setService({
      ...service,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/someservices/${id}`, {
          headers: authHeader(),
        });

        setService({
          service_name: res.data?.result?.[0]?.service_name || "",
          status: res.data?.result?.[0]?.status || "",
          notes: res.data?.result?.[0]?.notes || "",
        });
      } catch (error) {
        console.error("error", error);
      }
    };

    if (id) {
      fetchServices();
    }
  }, [API_URL, id]);

  return (
    <main className="content-wrapper">
      <div className="container-fluid border-bottom bg-light py-2">
        <div className="row align-items-center">
          <div className="col-10 col-md-11">
            <div className="row align-items-center">
              <div className="col-9 col-md-8 col-lg-4">
                <input
                  type="search"
                  className="form-control sector-wise"
                  placeholder="Search customers, calls, agents..."
                  aria-label="Search customers, calls, agents"
                  style={{ height: "37px" }}
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
        <div className="col-12">
          <div className="card shadow border-0">
            <div className="card-header profile-header">
              Edit Service: {service.service_name}
            </div>

            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="service_name">
                      Service Name
                      <span className="text-danger fw-bold ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="service_name"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter Service Name"
                      name="service_name"
                      value={service_name}
                      onChange={onInputChange}
                      required
                    />
                    {errors.service_name && (
                      <small className="text-danger mt-1">
                        {errors.service_name}
                      </small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="status">
                      Status
                      <span className="text-danger fw-bold ms-1">*</span>
                    </label>

                    <select
                      id="status"
                      className="form-select sector-wise mb-1"
                      name="status"
                      value={status}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    {errors.status && (
                      <small className="text-danger mt-1">
                        {errors.status}
                      </small>
                    )}
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label" htmlFor="notes">
                      Description (optional)
                    </label>

                    <textarea
                      id="notes"
                      className="form-control py-2 sector-wise"
                      placeholder="Add a short note..."
                      name="notes"
                      value={notes}
                      onChange={onInputChange}
                      style={{ height: "60px" }}
                    ></textarea>
                  </div>
                </div>

                <div className="col-md-6 d-flex flex-column">
                  <div>
                    <button
                      type="submit"
                      className="btn btn-success mb-2 submit-btn"
                    >
                      Update
                    </button>
                  </div>

                  <Link className="text-success" to="/admin/services">
                    Back
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={1500} />
    </main>
  );
}

export default ServicesEdit;
