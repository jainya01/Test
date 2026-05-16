import { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import { authHeader } from "../utils/authHeader";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";

function CallerView() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const [caller, setCaller] = useState([]);
  const [customer, setCustomer] = useState([]);

  useEffect(() => {
    const someCallerData = async () => {
      try {
        const [callerRes, customerRes] = await Promise.allSettled([
          axios.get(`${API_URL}/somecallers/${id}`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allcalllogs`, {
            headers: authHeader(),
          }),
        ]);

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data);
        }

        if (customerRes.status === "fulfilled") {
          setCustomer(customerRes.value.data.result);
          console.log(customerRes.value.data.result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    someCallerData();
  }, []);

  const dailyCalls = customer.filter(
    (item) =>
      item.call_log_caller_id === Number(id) &&
      new Date(item.created_at).toDateString() === new Date().toDateString(),
  ).length;

  const weeklyCalls = customer.filter((item) => {
    const callDate = new Date(item.created_at);
    const today = new Date();

    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay());

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    return (
      item.call_log_caller_id === Number(id) &&
      item.call_log_id &&
      callDate >= firstDay &&
      callDate <= lastDay
    );
  }).length;

  const monthlyCalls = customer.filter((item) => {
    const callDate = new Date(item.created_at);
    const today = new Date();

    return (
      item.call_log_caller_id === Number(id) &&
      item.call_log_id &&
      callDate.getMonth() === today.getMonth() &&
      callDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const averageCalls = (
    customer.filter(
      (item) => item.call_log_caller_id === Number(id) && item.call_log_id,
    ).length / 30
  ).toFixed(2);

  const convertedLeads = customer.filter(
    (item) =>
      item.call_log_caller_id === Number(id) &&
      item.call_log_status === "Converted",
  ).length;

  const pendingLeads = customer.filter(
    (item) => item.caller_id === Number(id) && item.customer_status === null,
  ).length;

  const followups = customer.filter(
    (item) =>
      item.call_log_caller_id === Number(id) &&
      item.call_log_status === "Follow_up",
  ).length;

  const avgCallDuration = (
    customer
      .filter(
        (item) =>
          item.call_log_caller_id === Number(id) && item.call_duration !== null,
      )
      .reduce((total, item) => total + item.call_duration, 0) /
      customer.filter(
        (item) =>
          item.call_log_caller_id === Number(id) && item.call_duration !== null,
      ).length || 0
  ).toFixed(2);

  const lastActive = customer
    .filter((item) => item.call_log_caller_id === Number(id) && item.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  const formattedLastActive = lastActive
    ? new Date(lastActive.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "No activity";

  return (
    <>
      <div className="content-wrapper">
        <div className="container-fluid border-bottom bg-light pb-2 pt-md-2 pb-lg-1">
          <div className="row align-items-center">
            <div className="col-10 col-md-11">
              <div className="row align-items-center">
                <div className="col-9 col-md-8 col-lg-6">
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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
            <div>
              <h5 className="fw-bold overview-dashboard">
                Caller view: {caller.fullname}, {caller.email}
              </h5>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Daily Calls</p>
                    <h4 className="card-value">{dailyCalls}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Weekly Calls</p>
                    <h4 className="card-value">{weeklyCalls}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Monthly Calls</p>
                    <h4 className="card-value">{monthlyCalls}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-6 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Average Calls</p>
                    <h3 className="card-value">{averageCalls}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-6 col-lg col-xl">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Converted Leads</p>
                    <h4 className="card-value">{convertedLeads}%</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Pending Leads</p>
                    <h4 className="card-value">{pendingLeads}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Followups</p>
                    <h4 className="card-value">{followups}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Avg Call Duration</p>
                    <h4 className="card-value">{avgCallDuration}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Last Active</p>
                    <span className="card-value">{formattedLastActive}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CallerView;
