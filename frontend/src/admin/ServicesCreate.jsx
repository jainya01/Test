import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function ServicesCreate() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const [service, setService] = useState({
    service_name: "",
    service_code: "",
    price: "",
    status: "",
    notes: "",
  });

  const { service_name, service_code, price, status, notes } = service;

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!service_name.trim()) {
      newErrors.service_name = "Service name is required";
    }

    if (!service_code.trim()) {
      newErrors.service_code = "Service code is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
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
      await axios.post(`${API_URL}/servicespost`, service, {
        headers: authHeader(),
      });

      toast.success("Service created successfully");

      setTimeout(() => {
        navigate("/admin/services");
      }, 1000);
    } catch (error) {
      toast.error("Failed to add service");
    }
  };

  const onInputChange = (e) => {
    setService({
      ...service,
      [e.target.name]: e.target.value,
    });
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
                  placeholder="Search customers, calls, agents..."
                  style={{ height: "40px" }}
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
        <div className="row g-2 mt-3 d-flex justify-content-center">
          <div className="col-lg-6 col-12">
            <div className="card p-0 d-flex justify-content-center align-items-center">
              <h5 className="mt-3 mb-0">Create a Service</h5>
              <hr className="border border-dark w-100 mt-3" />

              <form onSubmit={handleFormSubmit}>
                <div className="row g-3 px-3 py-2">
                  <div className="col-12">
                    <label className="form-label">
                      Service Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter service name"
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

                  <div className="col-12">
                    <label className="form-label">
                      Service Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter status code"
                      name="service_code"
                      value={service_code}
                      onChange={onInputChange}
                      required
                    />
                    {errors.service_code && (
                      <small className="text-danger mt-1">
                        {errors.service_code}
                      </small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Price <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control custom-text mb-1"
                      placeholder="Price"
                      name="price"
                      value={price}
                      onChange={onInputChange}
                      required
                    />
                    {errors.price && (
                      <small className="text-danger mt-1">{errors.price}</small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select custom-text mb-1"
                      name="status"
                      value={status}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    {errors.status && (
                      <small className="text-danger mt-1">
                        {errors.status}
                      </small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control py-2"
                      placeholder="Description..."
                      name="notes"
                      value={notes}
                      onChange={onInputChange}
                      style={{ height: "90px" }}
                    ></textarea>
                  </div>

                  <div className="col-12 mt-3 mb-4">
                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-2"
                    >
                      Submit
                    </button>

                    <Link className="mt-2 text-success" to="/admin/services">
                      Back
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default ServicesCreate;
