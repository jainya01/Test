import { useState } from "react";
import "../../App.css";
import { authHeader } from "../../utils/authHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function CallersCreate() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [call, setCall] = useState({
    fullname: "",
    phone: "",
    email: "",
    password: "",
    status: "",
    notes: "",
  });

  const { fullname, phone, email, password, status, notes } = call;

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone No is required";
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
      console.error("error", error);
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
            <div className="card-header profile-header">Create New Caller</div>

            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="fullname">
                      Name <span className="text-danger fw-bold">*</span>
                    </label>

                    <input
                      type="text"
                      id="fullname"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter Full Name"
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="phone">
                      Phone No <span className="text-danger fw-bold">*</span>
                    </label>

                    <input
                      type="tel"
                      id="phone"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter Phone No"
                      name="phone"
                      value={phone}
                      onChange={onInputChange}
                      required
                    />

                    {errors.phone && (
                      <small className="text-danger mt-1">{errors.phone}</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="email">
                      Email <span className="text-danger fw-bold">*</span>
                    </label>

                    <input
                      type="email"
                      id="email"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter Email"
                      name="email"
                      value={email}
                      onChange={onInputChange}
                      required
                    />

                    {errors.email && (
                      <small className="text-danger mt-1">{errors.email}</small>
                    )}
                  </div>

                  <div
                    className="col-md-6 mb-3"
                    style={{ position: "relative" }}
                  >
                    <label className="form-label" htmlFor="password">
                      Password <span className="text-danger fw-bold">*</span>
                    </label>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control sector-wise pe-5"
                      placeholder="Enter Password"
                      name="password"
                      value={password}
                      onChange={onInputChange}
                      autoComplete="new-password"
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="status">
                      Status <span className="text-danger fw-bold">*</span>
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="notes">
                      Notes (optional)
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
                      className="btn btn-success submit-btn mb-2"
                    >
                      Submit
                    </button>
                  </div>

                  <Link className="text-success" to="/admin/callers">
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

export default CallersCreate;
