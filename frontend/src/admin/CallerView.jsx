import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";

function CallerView() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const [caller, setCaller] = useState([]);

  useEffect(() => {
    const someCallerData = async () => {
      try {
        const [callerRes] = await Promise.allSettled([
          axios.get(`${API_URL}/somecallers/${id}`, {
            headers: authHeader(),
          }),
        ]);

        if (callerRes.status === "fulfilled") {
          setCaller(callerRes.value.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    someCallerData();
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
                    <h4 className="card-value">0</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Weekly Calls</p>
                    <h4 className="card-value">0</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Monthly Calls</p>
                    <h4 className="card-value">0</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-6 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Average Calls</p>
                    <h3 className="card-value">0</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-6 col-lg col-xl">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Converted Leads</p>
                    <h4 className="card-value">0%</h4>
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
                    <h4 className="card-value">0</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Followups</p>
                    <h4 className="card-value">0</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Avg Call Duration</p>
                    <h4 className="card-value">0</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-sm-6 col-md-4 col-lg">
              <div className="card custom-card shadow-sm border-0 h-100 rounded-3">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <p className="card-title-text">Last Active</p>
                    <h3 className="card-value">0</h3>
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
