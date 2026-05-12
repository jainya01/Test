import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChartLine,
  faList,
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
import { useEffect, useState } from "react";
import axios from "axios";

function HomePage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const data = [
    {
      initials: "MA",
      name: "Mohammed Ali",
      detail: "Hajj • Bilal Ahmed",
      status1: "Answered",
      status2: "Converted",
      color1: "success",
      color2: "success",
    },
    {
      initials: "FS",
      name: "Fatima Sheikh",
      detail: "Umrah • Sana Yusuf",
      status1: "Unanswered",
      status2: "Follow-up",
      color1: "secondary",
      color2: "warning",
    },
    {
      initials: "AR",
      name: "Ahmed Raza",
      detail: "Packages • Omar Farooq",
      status1: "Rejected",
      status2: "New",
      color1: "danger",
      color2: "light",
    },
    {
      initials: "NH",
      name: "Nadia Hassan",
      detail: "Misc • Zara Iqbal",
      status1: "Answered",
      status2: "Interested",
      color1: "success",
      color2: "info",
    },
  ];

  const chartData = [
    { day: "Mon", calls: 40, conversions: 8 },
    { day: "Tue", calls: 55, conversions: 12 },
    { day: "Wed", calls: 38, conversions: 6 },
    { day: "Thu", calls: 62, conversions: 15 },
    { day: "Fri", calls: 70, conversions: 18 },
    { day: "Sat", calls: 48, conversions: 10 },
    { day: "Sun", calls: 28, conversions: 5 },
  ];

  const lineData = [
    { week: "W1", calls: 250, conversions: 60 },
    { week: "W2", calls: 300, conversions: 80 },
    { week: "W3", calls: 280, conversions: 75 },
    { week: "W4", calls: 350, conversions: 95 },
  ];

  const [service, setService] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const [serviceRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allservices`, {
            headers: authHeader(),
          }),
        ]);

        if (serviceRes.status === "fulfilled") {
          setService(serviceRes.value.data.result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  

  return (
    <>
      <div className="content-wrapper">
        <div className="container-fluid border-bottom bg-light pb-2 pt-md-2 pb-lg-1">
          <div className="row align-items-center">
            <div className="col-10 col-md-11">
              <div className="row align-items-center">
                <div className="col-auto">
                  <button className="btn border-0">
                    <FontAwesomeIcon icon={faList} />
                  </button>
                </div>

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

              <div className="d-none d-lg-flex align-items-center bg-light rounded p-1 pe-0 me-0">
                {/* {admin?.name && (
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-2 bg-success text-white fw-bold custom-short">
                    {admin.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )} */}

                <div className="d-flex flex-column">
                  <span className="fw-semibold text-nowrap custom-shorts">
                    {/* {admin?.name} */}
                  </span>
                  <small className="text-muted custom-shorts1">
                    {/* {admin?.role} */}
                  </small>
                </div>
              </div>
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
                <option>All Calls</option>
                <option value="Answered">Answered</option>
                <option value="Rejected">Rejected</option>
                <option value="Unanswered">Unanswered</option>
              </select>

              <select className="form-select sector-wise">
                <option>All Services</option>
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
                <option>All Agents</option>
                <option value="Bilal Ahmed">Bilal Ahmed</option>
                <option value="Sana Yusuf">Sana Yusuf</option>
                <option value="Omar Farooq">Omar Farooq</option>
                <option value="Zara">Zara</option>
              </select>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">TOTAL CALLS</p>
                    <h4 className="card-value">90</h4>
                    <small className="card-subtext">+12% vs last week</small>
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
                    <h4 className="card-value">30</h4>
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
                    <h4 className="card-value">30</h4>
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
                    <h3 className="card-value">30</h3>
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

            <div className="col-6 col-sm-6 col-md-4 col-lg col-xl">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">CONVERSION</p>
                    <h4 className="card-value">20%</h4>
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

                  {data.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between m-1 border rounded-3 align-items-center py-3 px-2"
                    >
                      <div className="d-flex align-items-center">
                        <div className="avatar me-3">{item.initials}</div>
                        <div>
                          <div className="fw-semibold callers-name">
                            {item.name}
                          </div>
                          <small className="callers-name">{item.detail}</small>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <span
                          className={`badge bg-${item.color1}-subtle text-${item.color1}`}
                        >
                          {item.status1}
                        </span>
                        <span
                          className={`badge bg-${item.color2}-subtle text-${item.color2}`}
                        >
                          {item.status2}
                        </span>
                      </div>
                    </div>
                  ))}
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

                  {[
                    { name: "Bilal", value: 12, total: 80 },
                    { name: "Sana", value: 17, total: 103 },
                    { name: "Omar", value: 22, total: 126 },
                    { name: "Zara", value: 27, total: 149 },
                  ].map((item, index) => {
                    const percent = (item.value / item.total) * 100;

                    return (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-semibold callers-name">
                            {item.name}
                          </span>
                          <small className="fw-bold">
                            {item.value}/{item.total}
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
                  })}
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
