import { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../utils/authHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faHeadphones,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

const CallerLogin = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [admin, setAdmin] = useState({
    email: "",
    password: "",
  });

  const { email, password } = admin;

  const handleCallerLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/callerlogin`, admin);
      const { token, role, id } = response.data;
      localStorage.setItem("callerToken", token);
      localStorage.setItem("role", role);
      localStorage.setItem("id", id);

      navigate("/caller/leads", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const handleChange = (e) => {
    setAdmin({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  const [caller, setCaller] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const [callerRes, logsRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allcallers`, { headers: authHeader() }),
          axios.get(`${API_URL}/allcalllogs`, { headers: authHeader() }),
        ]);

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data.length);
        }

        if (logsRes.status === "fulfilled") {
          setLogs(logsRes.value.data.result);
        }
      } catch (error) {
        console.error("error", error);
      }
    };

    allData();
  }, []);

  const totalCalls = logs.filter((item) => item.call_status !== null).length;

  const convertedCalls = logs.filter(
    (item) => item.call_log_status === "Converted",
  ).length;

  const convertedPercentage =
    totalCalls > 0 ? ((convertedCalls / totalCalls) * 100).toFixed(1) : 0;

  const callerId = logs?.id;

  const dailyCalls = logs.filter(
    (item) =>
      item.created_at &&
      new Date(item.created_at).toDateString() === new Date().toDateString(),
  ).length;

  useEffect(() => {
    const callerToken = localStorage.getItem("callerToken");

    if (callerToken) {
      navigate("/caller/leads", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100 text-start">
        <div className="col-lg-6 col-sm-12 d-lg-flex flex-column justify-content-center convert-metric text-white px-2 px-lg-4 pt-5 pt-lg-0">
          <div className="position-absolute top-0 start-0 p-2 ps-lg-4 d-flex align-items-center">
            <div className="headphones-font me-2">
              <FontAwesomeIcon icon={faHeadphones} />
            </div>

            <div className="d-flex flex-column">
              <span className="fw-bold text-white signal-crm">SIGNAL CRM</span>
              <small className="text-white-50 tracking-call ">
                CALL TRACKING PLATFORM
              </small>
            </div>
          </div>

          <h6 className="text-uppercase operation-dashboard mt-3">
            Operations Dashboard
          </h6>

          <h1 className="fw-bold track-calls">
            Track every call. Convert every lead.
          </h1>
          <p className="mb-4 telecalls-admin">
            A purpose-built CRM for telecallers and admin managers. Smart
            filters, masked contacts, and real-time conversion metrics.
          </p>

          <div
            className="d-flex gap-5 border rounded p-3"
            style={{ maxWidth: "390px" }}
          >
            <div>
              <small>Calls / Day</small>
              <h4 className="fw-bold mt-2">{dailyCalls}</h4>
            </div>

            <div>
              <small>Conversion</small>
              <h4 className="fw-bold mt-2">{convertedPercentage}%</h4>
            </div>

            <div>
              <small>Agents</small>
              <h4 className="fw-bold mt-2">{caller ? caller : 0}</h4>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-sm-12 d-flex align-items-center justify-content-center bg-light mt-lg-4 mt-0">
          <div className="w-100 px-0" style={{ maxWidth: "450px" }}>
            <h3 className="fw-bold mb-2">Caller Sign in to your account</h3>
            <p className="text-muted mb-4">
              Enter your credentials to continue.
            </p>

            <form onSubmit={handleCallerLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>

                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@company.com"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    autoComplete="email"
                    style={{ height: "42px" }}
                    required
                  />
                </div>
              </div>

              <div className="position-relative mb-4">
                <label className="form-label">Password</label>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="********"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ height: "42px" }}
                  required
                />

                <span
                  className="eye-login"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>

              <button type="submit" className="btn sign-in-btn w-100 py-2 mb-2">
                Log In
              </button>

              <Link to="/" className="text-success">
                Back
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallerLogin;
