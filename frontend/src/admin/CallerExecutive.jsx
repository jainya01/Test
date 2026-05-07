import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendar,
  faDownload,
  faEllipsis,
  faFile,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function CallerExecutive() {
  const users = [
    {
      id: 1,
      name: "Aisha Khan",
      initials: "AK",
      email: "aisha@mail.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Bilal Ahmed",
      initials: "BA",
      email: "bilal@mail.com",
      role: "Caller",
      status: "Active",
    },
    {
      id: 3,
      name: "Sana Yosuf",
      initials: "SY",
      email: "sana@mail.com",
      role: "Caller",
      status: "Active",
    },
    {
      id: 4,
      name: "Omar Farooq",
      initials: "OF",
      email: "omar@mail.com",
      role: "Caller",
      status: "Inactive",
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
        <div className="d-flex flex-row flex-wrap justify-content-between align-items-md-center mb-4">
          <div>
            <h5 className="fw-bold overview-dashboard">User Management</h5>
            <p className="text-muted mb-md-0 fw-bold overview-lead">
              Manage admins and telecallers
            </p>
          </div>

          <div>
            <Link className="btn user-added-btn">+ Add User</Link>
          </div>
        </div>

        <div className="row g-2 mt-3">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-3 h-100">
              <div className="card-body p-0">
                <div className="table-wrapper">
                  <div className="table-responsive custom-scrollbar custom-scrollbar1">
                    <table className="table table-striped mb-0">
                      <thead className="table-secondary header-table text-nowrap">
                        <tr>
                          <th className="ps-2 py-2">S/N</th>
                          <th>NAME</th>
                          <th>EMAIL</th>
                          <th>ROLE</th>
                          <th>STATUS</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(users) && users.length > 0 ? (
                          users.map((data, idx) => (
                            <tr key={idx}>
                              <td>{data.id}</td>

                              <td>
                                <span className="d-flex flex-row align-items-center fw-bold">
                                  <div className="avatar me-2 border">
                                    {data.name
                                      .split(" ")
                                      .map((word) => word[0])
                                      .join("")
                                      .toUpperCase()}
                                  </div>

                                  {data.name}
                                </span>
                              </td>

                              <td className="convert-call">{data.email}</td>

                              <td>
                                <span
                                  className={
                                    data.role === "Admin"
                                      ? "admin-box"
                                      : "caller-box"
                                  }
                                >
                                  {data.role}
                                </span>
                              </td>

                              <td
                                className={
                                  data.status === "Active"
                                    ? "convert-no"
                                    : "convert-call"
                                }
                              >
                                <div className="d-flex align-items-center">
                                  <div
                                    className={`me-1 ${
                                      data.status === "Active"
                                        ? "custom-success"
                                        : "custom-active"
                                    }`}
                                  ></div>

                                  {data.status}
                                </div>
                              </td>

                              <td className="convert-rate">
                                <FontAwesomeIcon icon={faEllipsis} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-3">
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

export default CallerExecutive;
