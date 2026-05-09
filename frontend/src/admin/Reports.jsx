import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendar,
  faDownload,
  faFile,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  PieChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  Cell,
} from "recharts";

function Reports() {
  const chartData = [
    {
      agent: "Bilal",
      calls: 80,
      conversions: 12,
      followups: 8,
    },
    {
      agent: "Sana",
      calls: 103,
      conversions: 17,
      followups: 11,
    },
    {
      agent: "Omar",
      calls: 126,
      conversions: 22,
      followups: 14,
    },
    {
      agent: "Zara",
      calls: 149,
      conversions: 27,
      followups: 17,
    },
  ];

  const outcomeData = [
    { name: "Answered", value: 30, color: "#10b981" },
    { name: "Rejected", value: 30, color: "#ff3b30" },
    { name: "Unanswered", value: 30, color: "#f4a300" },
  ];

  const agent = [
    {
      id: 1,
      agent: "Bilal",
      totalCalls: 80,
      conversions: 12,
      followUps: 8,
      conversionRate: "15%",
    },
    {
      id: 2,
      agent: "Sana",
      totalCalls: 103,
      conversions: 17,
      followUps: 11,
      conversionRate: "17%",
    },
    {
      id: 3,
      agent: "Omar",
      totalCalls: 126,
      conversions: 22,
      followUps: 14,
      conversionRate: "17%",
    },
    {
      id: 4,
      agent: "Zara",
      totalCalls: 149,
      conversions: 27,
      followUps: 17,
      conversionRate: "18%",
    },
  ];

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
            <h5 className="fw-bold overview-dashboard">Reports & Analytics</h5>
            <p className="text-muted mb-md-0 overview-lead">
              Performance insight across your team
            </p>
          </div>

          <div className="d-flex flex-nowrap gap-2">
            <div className="d-flex flex-row align-items-center border rounded-3 bg-white w-100 download-csv text-nowrap">
              <FontAwesomeIcon icon={faCalendar} className="me-1" />
              <span>Last 7 days</span>
            </div>

            <div className="d-flex flex-row align-items-center border rounded-3 bg-white w-100 download-csv">
              <FontAwesomeIcon icon={faDownload} className="me-1" />
              <span>CSV</span>
            </div>

            <div className="d-flex flex-row align-items-center border rounded-3 bg-white w-100 download-csv text-nowrap">
              <FontAwesomeIcon icon={faFile} className="me-1" />
              <span>PDF</span>
            </div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-12 col-lg-8">
            <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <h4 className="daily-performance fw-semibold mb-0">
                    Calls per Agent
                  </h4>
                </div>

                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 0,
                        left: 20,
                        bottom: 30,
                      }}
                      barGap={8}
                      barCategoryGap="35%"
                    >
                      <CartesianGrid
                        strokeDasharray="0"
                        horizontal={false}
                        stroke="#f1f5f9"
                      />

                      <XAxis type="number" tick={{ fontSize: 12 }} />

                      <YAxis
                        type="category"
                        dataKey="agent"
                        tick={{ fontSize: 12 }}
                        width={50}
                      />

                      <Tooltip cursor={false} />

                      <Legend
                        iconType="square"
                        wrapperStyle={{
                          fontSize: "12px",
                          paddingTop: "10px",
                        }}
                      />

                      <Bar
                        dataKey="calls"
                        fill="#3366ff"
                        radius={[0, 8, 8, 0]}
                        barSize={12}
                      />

                      <Bar
                        dataKey="conversions"
                        fill="#00a86b"
                        radius={[0, 8, 8, 0]}
                        barSize={12}
                      />

                      <Bar
                        dataKey="followups"
                        fill="#f4a300"
                        radius={[0, 8, 8, 0]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
              <div className="card-body d-flex flex-column p-3">
                <div className="mb-1">
                  <h4 className="daily-performance fw-semibold mb-0">
                    Call Outcome
                  </h4>
                </div>

                <div
                  className="call-outcome-style"
                  style={{
                    width: "100%",
                    height: "200px",
                    marginBottom: "40px",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        stroke="none"
                        activeShape={false}
                        isAnimationActive={true}
                        tabIndex={-1}
                        style={{ outline: "none" }}
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-0 pt-0">
                  {outcomeData.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="outcome-data"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <span className="outcome-data1">{item.name}</span>
                      </div>

                      <span className="outcome-data2">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-2 mt-3">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-3 h-100">
              <div className="card-body p-0">
                <div className="mb-3 mt-3 ms-2">
                  <h5 className="fw-bold mb-0 daily-performance">
                    Agent Performance Breakdown
                  </h5>
                </div>

                <div className="table-wrapper">
                  <div className="table-responsive custom-scrollbar">
                    <table className="table table-striped mb-0">
                      <thead className="table-secondary header-table text-nowrap">
                        <tr>
                          <th className="ps-2">S/N</th>
                          <th>AGENT</th>
                          <th>TOTAL CALLS</th>
                          <th>CONVERSIONS</th>
                          <th>FOLLOW-UPS</th>
                          <th>CONV. RATE</th>
                        </tr>
                      </thead>
                      <tbody className="body-table">
                        {Array.isArray(agent) && agent.length > 0 ? (
                          agent.map((data, idx) => (
                            <tr key={idx}>
                              <td className="ps-2">{data.id}</td>

                              <td className="convert-rate">{data.agent}</td>

                              <td className="convert-call">
                                {data.totalCalls}
                              </td>

                              <td className="convert-no">{data.conversions}</td>

                              <td className="convert-call">{data.followUps}</td>

                              <td className="convert-rate">
                                {data.conversionRate}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-3">
                              no data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
