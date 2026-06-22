import { useEffect, useState } from "react";
import "../../App.css";
import { authHeader } from "../../utils/authHeader";
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
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    status: "",
    notes: "",
  });

  const { fullname, phone, email, password, confirmPassword, status, notes } =
    call;

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

      toast.success("Caller updated successfully");

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
          phone: res.data?.data?.phone || "",
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
  }, [API_URL, id]);

  return (
    <>
      <title>Edit Caller | Signal CRM</title>
      <meta
        name="description"
        content="Edit telecaller details, update roles, adjust permissions, and manage caller account settings for efficient CRM calling team operations system"
      />

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

        <div className="p-2 p-lg-3 mt-2">
          <div className="col-12">
            <div className="card shadow border-0">
              <div className="card-header profile-header">
                Edit Caller: {call.fullname}
              </div>

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
                        value={fullname || ""}
                        onChange={onInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="phone">
                        Phone <span className="text-danger fw-bold">*</span>
                      </label>

                      <input
                        type="tel"
                        id="phone"
                        className="form-control sector-wise mb-1"
                        placeholder="Enter Phone No"
                        name="phone"
                        value={phone || ""}
                        onChange={onInputChange}
                        required
                      />
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
                        value={email || ""}
                        onChange={onInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="status">
                        Status <span className="text-danger fw-bold">*</span>
                      </label>

                      <select
                        id="status"
                        className="form-select sector-wise mb-1"
                        name="status"
                        value={status || ""}
                        onChange={onInputChange}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div
                      className="col-md-6 mb-3"
                      style={{ position: "relative" }}
                    >
                      <label className="form-label" htmlFor="password">
                        New Password
                      </label>

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`form-control sector-wise pe-5 ${
                          passwordError ? "border border-danger" : ""
                        }`}
                        placeholder="New Password"
                        name="password"
                        value={password || ""}
                        autoComplete="new-password"
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

                    <div
                      className="col-md-6 mb-3"
                      style={{ position: "relative" }}
                    >
                      <label className="form-label" htmlFor="confirmPassword">
                        Confirm Password
                      </label>

                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        className={`form-control sector-wise pe-5 ${
                          passwordError ? "border border-danger" : ""
                        }`}
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={confirmPassword || ""}
                        autoComplete="new-password"
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

                    <div className="col-12 mb-3">
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
                        Update
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
    </>
  );
}

export default CallersEdit;
