import { useEffect, useMemo, useState } from "react";
import "../App.css";
import { authHeader } from "../utils/authHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckCircle,
  faPhone,
  faPhoneSlash,
  faPhoneVolume,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function Leads() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caller, setCaller] = useState([]);
  const [services, setServices] = useState([]);
  const [showPassword] = useState(false);

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

        const [statusRes, serviceRes, customerRes, callerRes] =
          await Promise.allSettled([
            axios.get(`${API_URL}/allstatusdata`, {
              headers: authHeader(),
            }),

            axios.get(`${API_URL}/allservicesdata`, {
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
          setStatuses(statusRes.value.data.result || "");
        }

        if (serviceRes.status === "fulfilled") {
          setServices(serviceRes.value.data.result || "");
        }

        if (customerRes.status === "fulfilled") {
          let data = customerRes.value.data.result;
          if (user?.role === "caller") {
            data = data.filter((item) => item.caller_id === user.id);
          }

          setCustomers(data);
        }

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data || "");
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, [API_URL]);

  const pendingCustomers = useMemo(() => {
    return Array.isArray(customers)
      ? customers.filter((item) => item.status === null)
      : [];
  }, [customers]);

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
  }, [pendingCustomers, selectedUser?.phone]);

  const filteredCallers = useMemo(() => {
    return customers.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [customers, search]);

  useEffect(() => {
    if (selectedUser && search) {
      const exists = filteredCallers.find((u) => u.id === selectedUser.id);

      if (!exists) {
        setSelectedUser(filteredCallers[0] || null);
      }
    }
  }, [filteredCallers, selectedUser, search]);

  const [leads, setLeads] = useState({
    customer_id: "",
    caller_id: "",
    call_status: "",
    call_duration: "",
    customer_type: "",
    status: "",
    service: "",
    sub_category: "Standard",
    package_name: "Premium",
    notes: "",
  });

  const {
    call_status,
    customer_type,
    status,
    service,
    sub_category,
    package_name,
    notes,
  } = leads;

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
          customer_type: "",
          status: "",
          service: "",
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

  const getCallerName = () => {
    const callerId = Number(localStorage.getItem("id"));
    const matchedCaller = caller.find((item) => Number(item.id) === callerId);
    return matchedCaller?.fullname || "Caller";
  };

  return (
    <>
      <title>Caller Dashboard | Signal CRM</title>
      <meta
        name="description"
        content="Manage your daily calling tasks in Signal CRM caller dashboard. View queued leads, update status, track calls, notes, services, and performance."
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
                    placeholder="Search by customer name"
                    aria-label="Search by customer name"
                    style={{ height: "37px" }}
                    value={search}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearch(v);
                      !v &&
                        setSelectedUser(
                          pendingCustomers[0] || customers[0] || null,
                        );
                    }}
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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div>
              <h5 className="fw-bold overview-dashboard">My Leads</h5>
              <p className="text-muted mb-md-0 overview-lead fw-bold">
                Welcome {getCallerName()} --{" "}
                {customers.filter((item) => item.status === null).length}{" "}
                pending leads today
              </p>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-12 col-lg-4">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-4">
                <div className="card-body p-0">
                  <div className="px-3 py-3">
                    <h4 className="daily-performance fw-semibold mb-0">
                      Queue
                    </h4>
                  </div>

                  <div className="queue-scroll pointer-cursor">
                    {Array.isArray(filteredCallers) &&
                    filteredCallers.filter((item) => item.status === null)
                      .length > 0 ? (
                      filteredCallers
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

                              <p className="queue-service mb-0">
                                {item.service}
                              </p>
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
                          No! leads available.
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
                  <div className="card card-safe border-0 shadow-sm rounded-4 mb-3">
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
                                call_status === "answered"
                                  ? "active-status"
                                  : ""
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
                                call_status === "rejected"
                                  ? "active-status"
                                  : ""
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
                            Customer Type{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            aria-label="Customer Type"
                            id="customer_type"
                            className="form-select custom-input"
                            name="customer_type"
                            value={customer_type}
                            onChange={onInputChange}
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="B2B">B2B</option>
                            <option value="B2C">B2C</option>
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 col-md-6 mb-3">
                          <label className="form-label custom-label">
                            Service Status{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            aria-label="Service Status"
                            id="status"
                            className="form-select custom-input"
                            name="status"
                            value={status}
                            onChange={onInputChange}
                            required
                          >
                            <option value="">All Status</option>
                            {Array.isArray(statuses) ? (
                              statuses
                                .filter((item) => item.status === "Active")
                                .map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.status_name}
                                  >
                                    {item.status_name}
                                  </option>
                                ))
                            ) : (
                              <option disabled>No services found</option>
                            )}
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 col-md-6 mb-3">
                          <label className="form-label custom-label">
                            Services{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            aria-label="Service Type"
                            id="service"
                            className="form-select custom-input"
                            name="service"
                            value={service}
                            onChange={onInputChange}
                            required
                          >
                            <option value="">All Services</option>
                            {Array.isArray(services) ? (
                              services
                                .filter((item) => item.status === "Active")
                                .map((item) => (
                                  <option
                                    key={item.id}
                                    value={item.service_name}
                                  >
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
                            Sub-category{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            aria-label="Sub Category"
                            id="sub_category"
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
                            Package{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            aria-label="Package Name"
                            id="package_name"
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

                        <div className="col-6 mb-3">
                          <label className="form-label custom-label">
                            Call notes (optional)
                          </label>

                          <textarea
                            className="form-control py-2 custom-input"
                            rows="4"
                            placeholder="Add notes from this call..."
                            style={{ height: "64px" }}
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

        <ToastContainer position="top-right" autoClose={1500} />
      </main>
    </>
  );
}

export default Leads;
