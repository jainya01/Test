import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckCircle,
  faList,
  faPhone,
  faPhoneSlash,
  faPhoneVolume,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function Leads() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [statuses, setStatuses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caller, setCaller] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const maskPhoneNumber = (phone) => {
    if (!phone) return "";
    const phoneStr = phone.toString();
    return `${phoneStr.slice(0, 2)}xxxxxx${phoneStr.slice(-2)}`;
  };

  useEffect(() => {
    const allData = async () => {
      try {
        const user = {
          id: Number(localStorage.getItem("id")),
          role: localStorage.getItem("role"),
        };

        const [statusRes, customerRes, callerRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allservices`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allcustomers`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allcallers`, {
            headers: authHeader(),
          }),
        ]);

        if (statusRes.status === "fulfilled") {
          setStatuses(statusRes.value.data.result);
        }

        if (customerRes.status === "fulfilled") {
          let data = customerRes.value.data.result;

          if (user?.role === "caller") {
            data = data.filter((item) => item.caller_id === user.id);
          }

          setCustomers(data);
        }

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  const pendingCustomers = Array.isArray(customers)
    ? customers.filter((item) => item.status === null)
    : [];

  const [selectedUser, setSelectedUser] = useState(
    pendingCustomers.length > 0 ? pendingCustomers[0] : null,
  );

  const hasUserData = selectedUser?.name && selectedUser?.phone;

  useEffect(() => {
    if (pendingCustomers.length > 0) {
      const stillExists = pendingCustomers.find(
        (item) => item.phone === selectedUser?.phone,
      );

      if (!stillExists) {
        setSelectedUser(pendingCustomers[0]);
      }
    } else {
      setSelectedUser(null);
    }
  }, [customers]);

  const [leads, setLeads] = useState({
    customer_id: "",
    caller_id: "",
    call_status: "",
    call_duration: "",
    status: "",
    service: "Hajj",
    sub_category: "Standard",
    package_name: "Premium",
    notes: "",
  });

  const { call_status, status, service, sub_category, package_name, notes } =
    leads;

  useEffect(() => {
    if (selectedUser) {
      setLeads((prev) => ({
        ...prev,
        customer_id: selectedUser.id,
        caller_id: selectedUser.caller_id,
      }));
    }
  }, [selectedUser]);

  const handelFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...leads,
      customer_id: selectedUser?.id,
      caller_id: selectedUser?.caller_id,
    };

    try {
      await axios.post(`${API_URL}/caller-lead-post`, payload, {
        headers: authHeader(),
      });

      toast.success("leads posted successfully");

      const updatedCustomers = customers.map((item) =>
        item.id === selectedUser.id
          ? { ...item, status: payload.status }
          : item,
      );

      setCustomers(updatedCustomers);

      setTimeout(() => {
        const nextPendingCustomer = updatedCustomers.find(
          (item) => item.status === null,
        );

        setSelectedUser(nextPendingCustomer || null);

        setLeads({
          customer_id: "",
          caller_id: "",
          call_status: "",
          call_duration: "",
          status: "",
          service: "Hajj",
          sub_category: "Standard",
          package_name: "Premium",
          notes: "",
        });
      }, 0);
    } catch (error) {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message || "leads post failed");
    }
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setLeads((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCallStatus = (statusValue) => {
    setLeads((prev) => ({
      ...prev,
      call_status: statusValue,
    }));
  };

  const pendingLeads = customers.filter((item) => item.status === null).length;

  const getCallerName = () => {
    const callerId = Number(localStorage.getItem("id"));
    const matchedCaller = caller.find((item) => Number(item.id) === callerId);
    return matchedCaller?.fullname || "Caller";
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">My Leads</h5>
            <p className="text-muted mb-md-0 overview-lead fw-bold">
              Welcome {getCallerName()} --{" "}
              {customers.filter((item) => item.status === null).length} pending
              leads today
            </p>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-12 col-lg-4">
            <div className="card custom-card shadow-sm border-0 h-100 rounded-4">
              <div className="card-body p-0">
                <div className="px-3 py-3">
                  <h4 className="daily-performance fw-semibold mb-0">Queue</h4>
                </div>

                <div className="queue-scroll pointer-cursor">
                  {Array.isArray(customers) &&
                  customers.filter((item) => item.status === null).length >
                    0 ? (
                    customers
                      .filter((item) => item.status === null)
                      .map((item, index) => (
                        <div
                          className={`queue-item ${
                            selectedUser?.phone === item.phone
                              ? "active-queue-item"
                              : ""
                          }`}
                          key={item.id || index}
                          onClick={() => setSelectedUser(item)}
                        >
                          <div className="queue-left">
                            <h5 className="queue-name mb-1">{item.name}</h5>

                            <p className="queue-phone mb-1">
                              {showPassword
                                ? item.phone
                                : maskPhoneNumber(item.phone)}
                            </p>

                            <p className="queue-service mb-0">{item.service}</p>
                          </div>

                          <div>
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
                              {item.status || ""}
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-success fw-bold">
                      <h5 className="lead-message pt-0">
                        Congratulations! you have completed all leads.
                      </h5>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <form onSubmit={handelFormSubmit}>
              <div className="details-wrapper">
                <div className="card border-0 shadow-sm rounded-4 mb-3">
                  <div className="card-body">
                    <div className="details-top d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                      <div className="user-info-sec d-flex align-items-center gap-3">
                        <div className="user-avatar">
                          {selectedUser?.name
                            ?.split(" ")
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase() || "N/A"}
                        </div>

                        <div>
                          <h4 className="user-name mb-1">
                            {selectedUser?.name || "No Name"}
                          </h4>
                          <p className="user-phone mb-0">
                            {selectedUser?.phone
                              ? showPassword
                                ? selectedUser.phone
                                : maskPhoneNumber(selectedUser.phone)
                              : "No Phone"}
                          </p>
                        </div>
                      </div>

                      {hasUserData && (
                        <button className="call-now-btn">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Call now
                        </button>
                      )}
                    </div>

                    {hasUserData && (
                      <div className="row g-3">
                        <div className="col-6 col-sm-6 col-md-4">
                          <button
                            type="button"
                            onClick={() => handleCallStatus("answered")}
                            className={`status-box answered-btn w-100 ${
                              call_status === "answered" ? "active-status" : ""
                            }`}
                          >
                            <FontAwesomeIcon icon={faPhoneVolume} /> Answered
                          </button>
                        </div>

                        <div className="col-6 col-sm-6 col-md-4">
                          <button
                            type="button"
                            onClick={() => handleCallStatus("rejected")}
                            className={`status-box rejected-btn w-100 ${
                              call_status === "rejected" ? "active-status" : ""
                            }`}
                          >
                            <FontAwesomeIcon icon={faPhoneSlash} /> Rejected
                          </button>
                        </div>

                        <div className="col-6 col-sm-6 col-md-4">
                          <button
                            type="button"
                            onClick={() => handleCallStatus("unanswered")}
                            className={`status-box unanswered-btn w-100 ${
                              call_status === "unanswered"
                                ? "active-status"
                                : ""
                            }`}
                          >
                            <span className="fa-stack">
                              <FontAwesomeIcon icon={faPhone} />
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="fa-stack-1x"
                                style={{
                                  fontSize: "0.6em",
                                  transform: "translate(6px, -6px)",
                                }}
                              />
                            </span>

                            <span className="ms-0">Unanswered</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body">
                    <h4 className="update-title">Update Service</h4>

                    <div className="row">
                      <div className="col-12 col-sm-6 col-md-6 mb-3">
                        <label className="form-label custom-label">
                          Service Status
                        </label>

                        <select
                          className="form-select custom-input"
                          name="status"
                          value={status}
                          onChange={onInputChange}
                          required
                        >
                          <option>All Services</option>
                          {Array.isArray(statuses) ? (
                            statuses
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

                      <div className="col-12 col-sm-6 col-md-6 mb-3">
                        <label className="form-label custom-label">
                          Service Head
                        </label>
                        <select
                          className="form-select custom-input"
                          name="service"
                          value={service}
                          onChange={onInputChange}
                          required
                        >
                          <option value="Hajj">Hajj</option>
                          <option value="Umrah">Umrah</option>
                          <option value="Packages">Packages</option>
                          <option value="Misc">Misc</option>
                        </select>
                      </div>

                      <div className="col-12 col-sm-6 col-md-6 mb-3">
                        <label className="form-label custom-label">
                          Sub-category
                        </label>
                        <select
                          className="form-select custom-input"
                          name="sub_category"
                          value={sub_category}
                          onChange={onInputChange}
                          required
                        >
                          <option value="Standard">Standard</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>

                      <div className="col-12 col-sm-6 col-md-6 mb-3">
                        <label className="form-label custom-label">
                          Package
                        </label>
                        <select
                          className="form-select custom-input"
                          name="package_name"
                          value={package_name}
                          onChange={onInputChange}
                          required
                        >
                          <option value="Premium">Premium</option>
                          <option value="Doctor-Engineer">
                            Doctor-Engineer
                          </option>
                          <option value="Economy">Economy</option>
                        </select>
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label custom-label">
                          Call notes
                        </label>

                        <textarea
                          className="form-control py-2 custom-input"
                          rows="4"
                          placeholder="Add notes from this call..."
                          style={{ height: "84px" }}
                          name="notes"
                          value={notes}
                          onChange={onInputChange}
                        ></textarea>
                      </div>

                      <div className="col-12 mb-4">
                        <button className="btn save-update-btn" type="submit">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-2"
                          />
                          Save update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default Leads;
