import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChartLine,
  faPhone,
  faPhoneSlash,
  faPhoneVolume,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

function HomePage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [service, setService] = useState([]);
  const [report, setReport] = useState([]);
  const [caller, setCaller] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const [serviceRes, reportRes, callerRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allservices`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allcalllogs`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allcallers`, {
            headers: authHeader(),
          }),
        ]);

        if (serviceRes.status === "fulfilled") {
          setService(serviceRes.value.data.result || []);
        }

        if (reportRes.status === "fulfilled") {
          setReport(reportRes.value.data.result || []);
        }

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  const totalCalls = report.filter((item) => item.call_status !== null).length;

  const answeredCalls = report.filter(
    (item) => item.call_status === "answered",
  ).length;

  const rejectedCalls = report.filter(
    (item) => item.call_status === "rejected",
  ).length;

  const unansweredCalls = report.filter(
    (item) => item.call_status === "unanswered",
  ).length;

  const convertedCalls = report.filter(
    (item) => item.call_log_status === "Converted",
  ).length;

  const convertedPercentage =
    totalCalls > 0 ? ((convertedCalls / totalCalls) * 100).toFixed(1) : 0;

  const now = new Date();
  const currentWeekCalls = report.filter(
    (item) =>
      item.call_status &&
      new Date(item.created_at) >= new Date(now.setDate(now.getDate() - 7)),
  ).length;

  const previousWeekCalls = report.filter((item) => {
    const date = new Date(item.created_at);
    return (
      item.call_status &&
      date >= new Date(new Date().setDate(new Date().getDate() - 14)) &&
      date < new Date(new Date().setDate(new Date().getDate() - 7))
    );
  }).length;

  const growthPercentage = previousWeekCalls
    ? (
        ((currentWeekCalls - previousWeekCalls) / previousWeekCalls) *
        100
      ).toFixed(1)
    : 0;

  const recentActivity = [...report]
    .filter((item) => item.current_status === "Completed")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // chart data

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const chartData = days.map((day, index) => {
    const date = new Date();

    const currentDay = date.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    date.setDate(date.getDate() + mondayOffset + index);

    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const calls = report.filter(
      (item) => item.created_at?.split("T")[0] === formattedDate,
    ).length;

    const conversions = report.filter(
      (item) =>
        item.created_at?.split("T")[0] === formattedDate &&
        item.call_log_status === "Converted",
    ).length;

    return {
      day,
      calls,
      conversions,
    };
  });

  // line data

  const lineData = Array.from({ length: 4 }, (_, index) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const weekRanges = [
      { start: 1, end: 7 },
      { start: 8, end: 14 },
      { start: 15, end: 21 },
      { start: 22, end: lastDayOfMonth },
    ];

    const { start, end } = weekRanges[index];
    const startDate = new Date(year, month, start, 0, 0, 0, 0);
    const endDate = new Date(year, month, end, 23, 59, 59, 999);

    const calls = report.filter((item) => {
      if (!item.created_at) return false;
      const itemDate = new Date(item.created_at);
      return itemDate >= startDate && itemDate <= endDate;
    }).length;

    const conversions = report.filter((item) => {
      if (!item.created_at) return false;
      const itemDate = new Date(item.created_at);
      return (
        itemDate >= startDate &&
        itemDate <= endDate &&
        item.call_log_status === "Converted"
      );
    }).length;

    return {
      week: `W${index + 1}`,
      calls,
      conversions,
    };
  });

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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div>
              <h5 className="fw-bold overview-dashboard">Dashboard</h5>
              <p className="text-muted mb-md-0 overview-lead">
                Overview of call performance and lead conversions
              </p>
            </div>

            <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
              <select className="form-select sector-wise">
                <option value="">All Calls</option>
                <option value="Answered">Answered</option>
                <option value="Rejected">Rejected</option>
                <option value="Unanswered">Unanswered</option>
              </select>

              <select className="form-select sector-wise">
                <option value="">All status</option>
                {Array.isArray(service) ? (
                  service
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

              <select className="form-select sector-wise">
                <option value="">All Caller</option>
                {Array.isArray(caller) ? (
                  caller.map((item) => (
                    <option key={item.id} value={item.fullname}>
                      {item.fullname}
                    </option>
                  ))
                ) : (
                  <option disabled>No caller found</option>
                )}
              </select>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">TOTAL CALLS</p>
                    <h4 className="card-value">{totalCalls}</h4>
                    <small className="card-subtext">
                      +{growthPercentage}% vs last week
                    </small>
                  </div>

                  <div className="icon-wrapper icon-calls">
                    <FontAwesomeIcon icon={faPhone} className="card-icon" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">ANSWERED</p>
                    <h4 className="card-value">{answeredCalls}</h4>
                    <small className="card-subtext">69% answer rate</small>
                  </div>
                  <div className="icon-wrapper icon-success-bg">
                    <FontAwesomeIcon
                      icon={faPhoneVolume}
                      className="card-icon-success"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">REJECTED</p>
                    <h4 className="card-value">{rejectedCalls}</h4>
                  </div>
                  <div className="icon-wrapper icon-danger-bg">
                    <FontAwesomeIcon
                      icon={faPhoneSlash}
                      className="card-icon-danger"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">UNANSWERED</p>
                    <h3 className="card-value">{unansweredCalls}</h3>
                  </div>

                  <div className="icon-wrapper icon-answer-bg">
                    <span className="fa-stack">
                      <FontAwesomeIcon icon={faPhone} className="fa-stack-1x" />
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="fa-stack-1x"
                        style={{
                          fontSize: "0.6em",
                          transform: "translate(6px, -6px)",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg-3 col-xl">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">CONVERSION</p>
                    <h4 className="card-value">{convertedPercentage}%</h4>
                    <small className="card-subtext fw-bold">6 converted</small>
                  </div>
                  <div className="icon-wrapper icon-convert-bg">
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="card-icon-convert"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-2 mt-3">
            <div className="col-12 col-lg-6">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h4 className="daily-performance">Daily Performance</h4>
                      <small className="card-subtext">
                        calls vs conversations week
                      </small>
                    </div>
                  </div>

                  <div style={{ height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} barGap={10} fontSize="12px">
                        <XAxis dataKey="day" />
                        <YAxis />

                        <Tooltip cursor={false} />
                        <Legend />

                        <Bar
                          dataKey="calls"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                        />

                        <Bar
                          dataKey="conversions"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h4 className="daily-performance">Weekly Trend</h4>
                      <small className="card-subtext">
                        4-week call & conversation volume
                      </small>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={lineData} fontSize="12px">
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip cursor={false} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />

                        <Line
                          type="monotone"
                          dataKey="conversions"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <h5 className="fw-bold mb-0 daily-performance">
                      Recent Activity
                    </h5>

                    <div className="mt-1 overview-lead">
                      Latest customer interactions
                    </div>
                  </div>

                  {recentActivity.map((item, index) => {
                    const callerData = caller.find(
                      (c) => c.id === item.caller_id,
                    );

                    return (
                      <div
                        key={index}
                        className="d-flex justify-content-between m-1 border rounded-3 align-items-center py-3 px-2"
                      >
                        <div className="d-flex align-items-center">
                          <div className="avatar me-3">
                            {callerData?.fullname
                              ?.split(" ")
                              .map((word) => word.charAt(0))
                              .join("")
                              .toUpperCase() || "U"}
                          </div>

                          <div>
                            <div className="fw-semibold callers-name">
                              {callerData?.fullname || "Unknown"}
                            </div>

                            <small className="callers-name">
                              {item.service}
                            </small>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <span className="badge bg-success-subtle text-success">
                            {item.call_status || "Answered"}
                          </span>

                          <span className="badge bg-primary-subtle text-primary">
                            {item.call_log_status || "Converted"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-12 col-md-12 col-lg-4">
              <div className="card custom-card shadow-sm h-100 border-0 rounded-3">
                <div className="card-body">
                  <div className="d-flex flex-row gap-2 mb-3 align-items-center">
                    <span className="users-awesome">
                      <FontAwesomeIcon icon={faUsers} />
                    </span>
                    <h4 className="daily-performance mb-0">Top Callers</h4>
                  </div>

                  {Array.isArray(caller) && caller.length > 0 ? (
                    [...caller]
                      .sort((a, b) => {
                        const completedA = report.filter(
                          (data) =>
                            data.caller_id === a.id &&
                            data.current_status === "Completed",
                        ).length;

                        const completedB = report.filter(
                          (data) =>
                            data.caller_id === b.id &&
                            data.current_status === "Completed",
                        ).length;

                        return completedB - completedA;
                      })
                      .map((item) => {
                        const completed = report.filter(
                          (data) =>
                            data.caller_id === item.id &&
                            data.current_status === "Completed",
                        ).length;

                        const total = report.filter(
                          (data) => data.caller_id === item.id,
                        ).length;

                        const percent =
                          total > 0 ? (completed / total) * 100 : 0;

                        return (
                          <div key={item.id} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span className="fw-semibold callers-name">
                                {item.fullname}
                              </span>

                              <small className="fw-bold">
                                {completed}/{total}
                              </small>
                            </div>

                            <div className="progress custom-progress">
                              <div
                                className="progress-bar custom-bar"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-muted">No callers available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
