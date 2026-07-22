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

function CallerLeads() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [caller, setCaller] = useState([]);
  const [services, setServices] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [india, setIndia] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
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

        const [statusRes, serviceRes, customerRes, callerRes, indiaRes] =
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

            axios.get(`${API_URL}/allindiadata`, {
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

        if (indiaRes.status === "fulfilled") {
          setIndia(indiaRes.value.data.result || "");
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
    return customers.filter(
      (item) =>
        item.status === null &&
        item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [customers, search]);

  useEffect(() => {
    if (!search || !selectedUser) return;
    const exists = filteredCallers.some((u) => u.id === selectedUser.id);
    if (!exists && filteredCallers.length > 0) {
      setSelectedUser(filteredCallers[0]);
    }
  }, [filteredCallers, search, selectedUser]);

  const [leads, setLeads] = useState({
    customer_id: "",
    caller_id: "",
    name: "",
    call_status: "",
    call_duration: "",
    customer_type: "",
    customer_status: "",
    call_result: "",
    status: "",
    service: "",
    sub_category: "",
    district: "",
    state: "",
    schedule_date: "",
    schedule_time: "",
    priority: "",
    reminder: "",
    reschedule_note: "",
    notes: "",
  });

  const { call_status, status, sub_category, notes } = leads;

  useEffect(() => {
    if (selectedUser) {
      setLeads((prev) => ({
        ...prev,
        customer_id: selectedUser.id,
        caller_id: selectedUser.caller_id,
      }));
    }
  }, [selectedUser]);

  const handelFormSubmit = async () => {
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
          ? {
              ...item,
              name: payload.name,
              status: payload.status,
              service: payload.service,
            }
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
          customer_status: "",
          call_result: "",
          status: "",
          service: "",
          sub_category: "",
          district: "",
          state: "",
          schedule_date: "",
          schedule_time: "",
          priority: "",
          reminder: "",
          reschedule_note: "",
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

    setLeads((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "customer_type" && value === "Others") {
        updated.customer_status = "Others";
        updated.status = "Others";
        updated.service = "Others";
        updated.sub_category = "";
        setSubCategoryOptions([]);
      }

      if (name === "customer_type" && value !== "Others") {
        updated.customer_status = "";
        updated.status = "";
        updated.service = "";
        updated.sub_category = "";
        setSubCategoryOptions([]);
      }

      if (name === "service") {
        updated.sub_category = "";
      }
      return updated;
    });

    if (name === "service") {
      const selectedService = services.find(
        (item) => item.service_name === value,
      );

      if (selectedService?.sub_category) {
        setSubCategoryOptions(
          selectedService.sub_category.split(",").map((item) => item.trim()),
        );
      } else {
        setSubCategoryOptions([]);
      }
    }
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

  useEffect(() => {
    if (selectedUser) {
      setLeads((prev) => ({
        ...prev,
        customer_id: selectedUser.id,
        caller_id: selectedUser.caller_id,
        name: selectedUser.name || "",
        district: selectedUser.district || "",
        state: selectedUser.state || "",
      }));

      setSelectedDistrict(selectedUser.district || "");
      setStateName(selectedUser.state || "");
    }
  }, [selectedUser]);

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
                    value={search}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setSearch(v);
                      if (!v) {
                        setSelectedUser(pendingCustomers[0] || null);
                      }
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
              <form action={handelFormSubmit}>
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
                      <h4 className="update-title">
                        Calling Executive — Form Details
                      </h4>

                      <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 mb-3">
                          <label className="form-label custom-label">
                            Name
                            <span className="text-danger fw-bold ms-2">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            className="form-control custom-input"
                            placeholder="Customer name"
                            value={leads.name}
                            onChange={onInputChange}
                            required
                          />
                        </div>

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
                            value={leads.customer_type}
                            onChange={onInputChange}
                            required
                          >
                            <option value="" hidden>
                              Select Type
                            </option>
                            <option value="B2B">B2B</option>
                            <option value="B2C">B2C</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 col-md-6 mb-3">
                          <label className="form-label custom-label">
                            Customer Status{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            aria-label="Customer Status"
                            id="customer_status"
                            className="form-select custom-input"
                            name="customer_status"
                            value={leads.customer_status}
                            onChange={onInputChange}
                            required
                          >
                            <option value="" hidden>
                              Select Type
                            </option>
                            <option value="New">New</option>
                            <option value="Existing">Existing</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 col-md-6 mb-3">
                          <label className="form-label custom-label">
                            Call Result (this call){" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            aria-label="call Result"
                            id="call_result"
                            className="form-select custom-input"
                            name="call_result"
                            value={leads.call_result}
                            onChange={onInputChange}
                            required
                          >
                            <option value="" hidden>
                              Select call result
                            </option>
                            <option value="Connected">✅ Connected</option>
                            <option value="Busy">📞 Busy</option>
                            <option value="Rejected">❌ Rejected</option>
                            <option value="Unanswered">🚫 Unanswered</option>
                            <option value="Call Back Requested">
                              📲 Call Back Requested
                            </option>
                            <option value="Switched Off">
                              📴 Switched Off
                            </option>
                            <option value="Out of Coverage">
                              📡 Out of Coverage
                            </option>
                            <option value="Wrong Number">
                              🚫 Wrong Number
                            </option>
                            <option value="DND/Not Interested">
                              🚫 DND / Not Interested
                            </option>
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 col-md-6 mb-3">
                          <label className="form-label custom-label">
                            Lead Status (pipeline stage){" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            aria-label="Calling Status"
                            id="status"
                            className="form-select custom-input"
                            name="status"
                            value={leads.status}
                            onChange={onInputChange}
                            required
                          >
                            <option value="" hidden>
                              All Status
                            </option>
                            {Array.isArray(statuses) ? (
                              <>
                                {statuses
                                  .filter((item) => item.status === "Active")
                                  .map((item) => (
                                    <option
                                      key={item.id}
                                      value={item.status_name}
                                    >
                                      {item.status_name}
                                    </option>
                                  ))}
                                <option value="Others">Others</option>
                              </>
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
                            value={leads.service}
                            onChange={onInputChange}
                            required
                          >
                            <option value="" hidden>
                              All Services
                            </option>

                            {Array.isArray(services) ? (
                              <>
                                {services
                                  .filter((item) => item.status === "Active")
                                  .map((item) => (
                                    <option
                                      key={item.id}
                                      value={item.service_name}
                                    >
                                      {item.service_name}
                                    </option>
                                  ))}

                                <option value="Others">Others</option>
                              </>
                            ) : (
                              <option disabled>No services found</option>
                            )}
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 col-md-6 mb-3">
                          <label className="form-label custom-label">
                            Sub Category{" "}
                          </label>
                          <select
                            aria-label="Sub Category"
                            id="sub_category"
                            className="form-select custom-input"
                            name="sub_category"
                            value={sub_category}
                            onChange={onInputChange}
                          >
                            <option value="">Select Sub Category</option>
                            {subCategoryOptions.length > 0 ? (
                              subCategoryOptions.map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))
                            ) : (
                              <option disabled>
                                No sub category available
                              </option>
                            )}
                          </select>
                        </div>

                        <div className="col-12 col-sm-6 mb-3 position-relative">
                          <label className="form-label custom-label">
                            District{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="search"
                            className="form-control custom-input"
                            placeholder="Search district"
                            value={selectedDistrict}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedDistrict(value);
                              if (value.trim().toLowerCase() === "others") {
                                setStateName("Others");
                                setLeads((prev) => ({
                                  ...prev,
                                  district: "Others",
                                  state: "Others",
                                }));

                                setFilteredDistricts([]);
                                setShowDropdown(false);
                                return;
                              }

                              if (!value.trim()) {
                                setStateName("");

                                setLeads((prev) => ({
                                  ...prev,
                                  district: "",
                                  state: "",
                                }));

                                setFilteredDistricts([]);
                                setShowDropdown(false);
                                return;
                              }

                              const filtered = india.filter((item) =>
                                item.district_name
                                  ?.toLowerCase()
                                  .includes(value.toLowerCase()),
                              );

                              setFilteredDistricts(filtered);
                              setShowDropdown(filtered.length > 0);

                              const district = india.find(
                                (item) =>
                                  item.district_name?.toLowerCase() ===
                                  value.toLowerCase(),
                              );

                              if (district) {
                                setStateName(district.state_name);

                                setLeads((prev) => ({
                                  ...prev,
                                  district: district.district_name,
                                  state: district.state_name,
                                }));
                              } else {
                                setStateName("");

                                setLeads((prev) => ({
                                  ...prev,
                                  district: "",
                                  state: "",
                                }));
                              }
                            }}
                          />

                          {showDropdown && filteredDistricts.length > 0 && (
                            <div className="position-absolute bg-white border filtered-districts rounded shadow-sm">
                              {filteredDistricts.map((item) => (
                                <div
                                  key={item.district_id}
                                  className="p-2 border-bottom"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setSelectedDistrict(item.district_name);
                                    setStateName(item.state_name);
                                    setShowDropdown(false);

                                    setLeads((prev) => ({
                                      ...prev,
                                      district: item.district_name,
                                      state: item.state_name,
                                    }));
                                  }}
                                >
                                  {item.district_name}
                                </div>
                              ))}

                              <div
                                className="p-2 border-bottom"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedDistrict("Others");
                                  setStateName("Others");
                                  setShowDropdown(false);

                                  setLeads((prev) => ({
                                    ...prev,
                                    district: "Others",
                                    state: "Others",
                                  }));
                                }}
                              >
                                Others
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="col-12 col-sm-6 mb-3">
                          <label className="form-label custom-label">
                            State <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="text"
                            placeholder="State name"
                            className="form-control custom-input"
                            value={stateName}
                            readOnly
                            disabled
                          />
                        </div>

                        {status === "Follow-up Pending" && (
                          <>
                            <div className="col-12 col-md-6 mb-2">
                              <div className="follow-up-card">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0 fw-semibold">
                                    Schedule Follow-up
                                  </h6>

                                  <small className="text-muted">
                                    Triggered by Lead Status
                                  </small>
                                </div>

                                <div className="row">
                                  <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label custom-label">
                                      Next Follow-up Date{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="date"
                                      className="form-control custom-input"
                                      name="schedule_date"
                                      value={leads.schedule_date}
                                      onChange={onInputChange}
                                    />
                                  </div>

                                  <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label custom-label">
                                      Next Follow-up Time{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="time"
                                      className="form-control custom-input"
                                      name="schedule_time"
                                      value={leads.schedule_time}
                                      onChange={onInputChange}
                                    />
                                  </div>

                                  <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label custom-label">
                                      Priority{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <select
                                      className="form-select custom-input"
                                      name="priority"
                                      value={leads.priority}
                                      onChange={onInputChange}
                                    >
                                      <option value="" hidden>
                                        Select Priority
                                      </option>
                                      <option value="Low">Low</option>
                                      <option value="Medium">Medium</option>
                                      <option value="High">High</option>
                                    </select>
                                  </div>

                                  <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label custom-label">
                                      Reminder
                                    </label>
                                    <select
                                      className="form-select custom-input"
                                      name="reminder"
                                      value={leads.reminder}
                                      onChange={onInputChange}
                                    >
                                      <option selected>None</option>
                                      <option>15 min before</option>
                                      <option>1 hour before</option>
                                      <option>1 day before</option>
                                    </select>
                                  </div>

                                  <div className="col-12">
                                    <label className="form-label custom-label">
                                      Follow-up Reason / Notes
                                    </label>
                                    <textarea
                                      rows="3"
                                      className="form-control custom-input"
                                      placeholder="Why is a follow-up needed?"
                                      name="reschedule_note"
                                      value={leads.reschedule_note}
                                      onChange={onInputChange}
                                      style={{ height: "60px" }}
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="col-12 mb-3">
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

export default CallerLeads;
