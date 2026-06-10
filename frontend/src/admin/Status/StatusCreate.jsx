import { useEffect, useState } from "react";
import { authHeader } from "../../utils/authHeader";
import "../../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function ServicesCreate() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const [service, setService] = useState({
    status_name: "",
    status_code: "",
    status: "",
    notes: "",
  });

  const { status_name, status_code, status, notes } = service;

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!status_name.trim()) {
      newErrors.status_name = "Status name is required";
    }

    if (!status_code.trim()) {
      newErrors.status_code = "Service code is required";
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
      await axios.post(`${API_URL}/statuspost`, service, {
        headers: authHeader(),
      });

      toast.success("Status created successfully");

      setTimeout(() => {
        navigate("/admin/status");
      }, 1000);
    } catch (error) {
      toast.error("Failed to add status");
    }
  };

  const onInputChange = (e) => {
    setService({
      ...service,
      [e.target.name]: e.target.value,
    });
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

      <div className="p-2 p-lg-3">
        <div className="row d-flex justify-content-center">
          <div className="p-2 p-lg-3">
            <div className="col-12">
              <div className="card shadow border-0">
                <div className="card-header profile-header">
                  Create New Status
                </div>

                <div className="card-body">
                  <form onSubmit={handleFormSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label" htmlFor="status_name">
                          Status Name
                          <span className="text-danger fw-bold ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          id="status_name"
                          className="form-control sector-wise mb-1"
                          placeholder="Enter status name"
                          name="status_name"
                          value={status_name}
                          onChange={onInputChange}
                          required
                        />

                        {errors.status_name && (
                          <small className="text-danger mt-1">
                            {errors.status_name}
                          </small>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label" htmlFor="status_code">
                          Status Code
                          <span className="text-danger fw-bold ms-1">*</span>
                        </label>

                        <input
                          type="text"
                          id="status_code"
                          className="form-control sector-wise mb-1"
                          placeholder="Enter status code"
                          name="status_code"
                          value={status_code}
                          onChange={onInputChange}
                          required
                        />

                        {errors.status_code && (
                          <small className="text-danger mt-1">
                            {errors.status_code}
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

                      <div className="col-md-6 mb-3">
                        <label className="form-label" htmlFor="notes">
                          Description (optional)
                        </label>

                        <textarea
                          id="notes"
                          className="form-control py-2 sector-wise"
                          placeholder="Description..."
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
                          Submit
                        </button>
                      </div>

                      <Link className="text-success" to="/admin/status">
                        Back
                      </Link>
                    </div>
                  </form>
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

export default ServicesCreate;
