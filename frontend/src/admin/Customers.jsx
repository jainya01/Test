import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faCalendar,
  faDownload,
  faEye,
  faEyeSlash,
  faFile,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useState } from "react";

function Customers() {
  const data = [
    {
      id: 1,
      name: "Mohammad Ali",
      phone: 9111111110,
      service: "Hajj",
      status: "Follow-up",
      caller: "Bilal Ahmed",
    },
    {
      id: 2,
      name: "Fatima Sheikh",
      phone: 9111111112,
      service: "Umrah",
      status: "Follow-up",
      caller: "Sana Yosuf",
    },
    {
      id: 3,
      name: "Ahmed Raza",
      phone: 9111111113,
      service: "Umrah",
      status: "New",
      caller: "Bilal Ahmed",
    },
    {
      id: 4,
      name: "Nadia Hassan",
      phone: 9111111114,
      service: "Misc",
      status: "Interested",
      caller: "Omar Farooq",
    },
    {
      id: 5,
      name: "Nadia Hassan",
      phone: 9111111115,
      service: "Hajj",
      status: "Follow-up",
      caller: "Bilal Ahmed",
    },
    {
      id: 6,
      name: "Yousuf Malik",
      phone: 9111111116,
      service: "Hajj",
      status: "Not Interested",
      caller: "Bilal Ahmed",
    },
    {
      id: 7,
      name: "Hina Aslam",
      phone: 9111111118,
      service: "Umrah",
      status: "Converted",
      caller: "Sana Yosuf",
    },

    {
      id: 7,
      name: "Imran Qureshi",
      phone: 9800000042,
      service: "Packages",
      status: "Follow-up",
      caller: "Omar Farooq",
    },
    {
      id: 8,
      name: "Sadia Noor",
      phone: 9800000099,
      service: "Misc",
      status: "New",
      caller: "Zara Iqbal",
    },
    {
      id: 9,
      name: "Hina Aslam",
      phone: 9111111118,
      service: "Umrah",
      status: "Converted",
      caller: "Sana Yosuf",
    },
  ];

  const [showPassword, setShowPassword] = useState(false);

  const maskPhoneNumber = (phone) => {
    if (!phone) return "";
    const phoneStr = phone.toString();
    return `${phoneStr.slice(0, 2)}xxxxxx${phoneStr.slice(-2)}`;
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

      <div className="p-2 p-lg-3">
        <div className="d-flex flex-wrap flex-row justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">Customers</h5>
            <p className="text-muted mb-md-0 overview-lead">30 of 30 leads</p>
          </div>

          <div>
            <Link className="btn user-added-btn">+ Add Customer</Link>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-3 h-100">
              <div className="card-body p-0">
                <div className="mb-2 mt-3 ms-2 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0 daily-performance">
                      Customers
                    </h5>
                  </div>

                  <div className="d-flex justify-content-end me-2 gap-1">
                    <div>
                      <select className="form-select sector-wise">
                        <option value="">All Services</option>
                        <option value="Hajj">Hajj</option>
                        <option value="Umrah">Umrah</option>
                        <option value="Packages">Packages</option>
                        <option value="Misc">Misc</option>
                      </select>
                    </div>
                    <div>
                      <select className="form-select sector-wise">
                        <option value="">All Statuses</option>
                        <option value="Converted">Converted</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="New">New</option>
                      </select>
                    </div>

                    <div className="d-flex align-items-center flex-row text-nowrap border rounded px-2">
                      <div
                        className="pointer-cursor sector-wise d-flex align-items-center fw-bold"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                          className="me-1"
                        />
                        {showPassword ? "Hide numbers" : "Reveal numbers"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-wrapper">
                  <div className="table-responsive custom-scrollbar">
                    <table className="table table-striped mb-0">
                      <thead className="table-secondary header-table text-nowrap">
                        <tr>
                          <th className="ps-2">S/N</th>
                          <th>NAME</th>
                          <th>PHONE</th>
                          <th>SERVICE</th>
                          <th>STATUS</th>
                          <th>CALLER</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody className="body-table">
                        {Array.isArray(data) && data.length > 0 ? (
                          data.map((item, index) => (
                            <tr key={index}>
                              <td>{item.id}</td>

                              <td>
                                <span className="d-flex flex-row align-items-center fw-bold">
                                  <div className="avatar me-2 border">
                                    {item.name
                                      .split(" ")
                                      .map((word) => word[0])
                                      .join("")
                                      .toUpperCase()}
                                  </div>

                                  {item.name}
                                </span>
                              </td>

                              <td>
                                {showPassword
                                  ? item.phone
                                  : maskPhoneNumber(item.phone)}
                              </td>

                              <td>{item.service}</td>

                              <td>
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
                                  {item.status}
                                </span>
                              </td>

                              <td>{item.caller}</td>

                              <td className="view-right">
                                <span className="d-flex flex-row align-items-center">
                                  View
                                  <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="ms-1"
                                  />
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-3">
                              No Data Found
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

export default Customers;
