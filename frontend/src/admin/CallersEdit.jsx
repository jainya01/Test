import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function CallersEdit() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [call, setCall] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    status: "",
    notes: "",
  });

  const { fullname, email, password, confirmPassword, status, notes } = call;

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (call.password || call.confirmPassword) {
      if (call.password !== call.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    try {
      await axios.put(`${API_URL}/callerupdate/${id}`, call, {
        headers: authHeader(),
      });

      toast.success("Caller credentials updated successfully");

      setTimeout(() => {
        navigate("/admin/callers");
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update caller");
    }
  };

  const onInputChange = (e) => {
    setCall({
      ...call,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    const updatedCall = {
      ...call,
      [name]: value,
    };

    setCall(updatedCall);

    if (updatedCall.password && updatedCall.confirmPassword) {
      if (updatedCall.password !== updatedCall.confirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  };

  useEffect(() => {
    const fetchCaller = async () => {
      try {
        const res = await axios.get(`${API_URL}/somecallers/${id}`, {
          headers: authHeader(),
        });
        setCall({
          fullname: res.data?.data?.fullname || "",
          email: res.data?.data?.email || "",
          password: "",
          confirmPassword: "",
          status: res.data?.data?.status || "",
          notes: res.data?.data?.notes || "",
        });
      } catch (error) {
        console.error("error", error);
      }
    };

    if (id) {
      fetchCaller();
    }
  }, [id]);

  return (
    <div className="content-wrapper">
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

      <div className="p-2 p-lg-3 mt-2">
        <div className="row g-2 mt-3 d-flex justify-content-center">
          <div className="col-lg-6 col-12">
            <div className="card p-0 d-flex justify-content-center align-items-center">
              <h5 className="mt-3 mb-0">Edit Caller: {call.fullname}</h5>
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
                      value={fullname || ""}
                      onChange={onInputChange}
                      required
                    />
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
                      value={email || ""}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="position-relative col-12">
                    <label className="form-label">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control custom-text pe-5 ${
                        passwordError ? "border border-danger" : ""
                      }`}
                      placeholder="New Password"
                      name="password"
                      value={password || ""}
                      autoComplete="password"
                      onChange={handlePasswordChange}
                    />

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

                  <div className="position-relative col-12">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control custom-text pe-5 ${
                        passwordError ? "border border-danger" : ""
                      }`}
                      placeholder="Confirm Password"
                      name="confirmPassword"
                      value={confirmPassword || ""}
                      autoComplete="confirm password"
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="eye-login1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="me-1"
                      />
                    </span>
                    {passwordError && (
                      <small className="text-danger d-block mt-1">
                        {passwordError}
                      </small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select custom-text mb-1"
                      name="status"
                      value={status || ""}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
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
                      Update
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

      <ToastContainer position="bottom-right" autoClose={1500} />
    </div>
  );
}

export default CallersEdit;
