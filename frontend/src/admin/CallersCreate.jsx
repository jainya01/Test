import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEye,
  faEyeSlash,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

function CallersCreate() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [call, setCall] = useState({
    fullname: "",
    email: "",
    password: "",
    status: "",
    notes: "",
  });

  const { fullname, email, password, status, notes } = call;

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!status) {
      newErrors.status = "Status is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    try {
      await axios.post(`${API_URL}/callerspost`, call, {
        headers: authHeader(),
      });

      toast.success("Caller created successfully");

      setTimeout(() => {
        navigate("/admin/callers");
      }, 1000);
    } catch (error) {
      toast.error("Failed to add caller");
    }
  };

  const onInputChange = (e) => {
    setCall({
      ...call,
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
              <h5 className="mt-3 mb-0">Create a Caller</h5>
              <hr className="border border-dark w-100 mt-3" />

              <form onSubmit={handleFormSubmit}>
                <div className="row g-3 px-3 py-2">
                  <div className="col-12">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter full name"
                      name="fullname"
                      value={fullname}
                      onChange={onInputChange}
                      required
                    />
                    {errors.fullname && (
                      <small className="text-danger mt-1">
                        {errors.fullname}
                      </small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control custom-text mb-1"
                      placeholder="Enter email"
                      name="email"
                      value={email}
                      onChange={onInputChange}
                      required
                    />
                    {errors.email && (
                      <small className="text-danger mt-1">{errors.email}</small>
                    )}
                  </div>

                  <div className="position-relative col-12">
                    <label className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control custom-text pe-5"
                      placeholder="Enter Password"
                      name="password"
                      value={password}
                      onChange={onInputChange}
                      required
                    />

                    {errors.password && (
                      <small className="text-danger mt-1">
                        {errors.password}
                      </small>
                    )}

                    <span
                      className="eye-login1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="me-1"
                      />
                    </span>
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
                    <label className="form-label">Notes</label>
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

                    <Link className="mt-2 text-success" to="/admin/callers">
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

export default CallersCreate;
