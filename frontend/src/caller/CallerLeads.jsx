import { useState } from "react";
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

function CallerLeads() {
  const data = [
    {
      id: 1,
      name: "Mohammad Ali",
      phone: 9111111110,
      service: "Hajj",
      status: "Follow-up",
    },
    {
      id: 2,
      name: "Fatima Sheikh",
      phone: 9111111112,
      service: "Umrah",
      status: "Follow-up",
    },
    {
      id: 3,
      name: "Ahmed Raza",
      phone: 9111111113,
      service: "Umrah",
      status: "New",
    },
    {
      id: 4,
      name: "Nadia Hassan",
      phone: 9111111114,
      service: "Misc",
      status: "Interested",
    },
    {
      id: 5,
      name: "Nadia Hassan",
      phone: 9111111115,
      service: "Hajj",
      status: "Follow-up",
    },
    {
      id: 6,
      name: "Yousuf Malik",
      phone: 9111111116,
      service: "Hajj",
      status: "Not Interested",
    },
    {
      id: 7,
      name: "Hina Aslam",
      phone: 9111111118,
      service: "Umrah",
      status: "Converted",
    },

    {
      id: 7,
      name: "Imran Qureshi",
      phone: 9800000042,
      service: "Packages",
      status: "Follow-up",
    },
    {
      id: 8,
      name: "Sadia Noor",
      phone: 9800000099,
      service: "Misc",
      status: "New",
    },
    {
      id: 9,
      name: "Hina Aslam",
      phone: 9111111118,
      service: "Umrah",
      status: "Converted",
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

      <div className="p-2 p-lg-3 mt-2">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">My Leads</h5>
            <p className="text-muted mb-md-0 overview-lead fw-bold">
              Welcome Bilal -- 10 assigned leads today
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

                <div className="queue-scroll">
                  {Array.isArray(data) && data.length > 0 ? (
                    data.map((item, index) => (
                      <div
                        className={`queue-item ${
                          index === 0 ? "active-queue-item" : ""
                        }`}
                        key={index}
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
                                "Not Interested": "non-interested-cust cus-res",
                                Interested: "interested-cust cus-res",
                                New: "new-customer cus-res",
                                Converted: "convert-status cus-res",
                              }[item.status] || ""
                            }
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">no data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="details-wrapper">
              <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body">
                  <div className="details-top d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div className="user-info-sec d-flex align-items-center gap-3">
                      <div className="user-avatar">MA</div>

                      <div>
                        <h4 className="user-name mb-1">Mohammed Ali</h4>
                        <p className="user-phone mb-0">98XXXXXX80</p>
                      </div>
                    </div>

                    <button className="call-now-btn">
                      <FontAwesomeIcon icon={faPhone} className="me-2" />
                      Call now
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-6 col-sm-6 col-md-4">
                      <button className="status-box answered-btn w-100">
                        <FontAwesomeIcon icon={faPhoneVolume} /> Answered
                      </button>
                    </div>

                    <div className="col-6 col-sm-6 col-md-4">
                      <button className="status-box rejected-btn w-100">
                        <FontAwesomeIcon icon={faPhoneSlash} /> Rejected
                      </button>
                    </div>

                    <div className="col-6 col-sm-6 col-md-4">
                      <button className="status-box unanswered-btn w-100">
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
                        Unanswered
                      </button>
                    </div>
                  </div>
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
                      <select className="form-select custom-input">
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Converted">Converted</option>
                        <option value="Follow-up">Follow-up</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6 col-md-6 mb-3">
                      <label className="form-label custom-label">
                        Service Head
                      </label>
                      <select className="form-select custom-input">
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
                      <select className="form-select custom-input">
                        <option value="Standard">Standard</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6 col-md-6 mb-3">
                      <label className="form-label custom-label">Package</label>
                      <select className="form-select custom-input">
                        <option value="Premium">Premium</option>
                        <option value="Doctor-Engineer">Doctor-Engineer</option>
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
                      ></textarea>
                    </div>

                    <div className="col-12 mb-4">
                      <button className="btn save-update-btn">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallerLeads;
