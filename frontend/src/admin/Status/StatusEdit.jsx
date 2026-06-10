import { useEffect, useState } from "react";
import "../../App.css";
import { authHeader } from "../../utils/authHeader";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";

function ServicesEdit() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState({
    service_name: "",
    service_code: "",
    status: "",
    notes: "",
  });

  const { service_name, service_code, status, notes } = service;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/serviceupdate/${id}`, service, {
        headers: authHeader(),
      });
      toast.success("Service updated successfully");
      setTimeout(() => {
        navigate("/admin/status");
      }, 1000);
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  const onInputChange = (e) => {
    setService({
      ...service,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/someservices/${id}`, {
          headers: authHeader(),
        });
        setService({
          service_name: res.data?.result?.[0]?.service_name || "",
          service_code: res.data?.result?.[0]?.service_code || "",
          status: res.data?.result?.[0]?.status || "",
          notes: res.data?.result?.[0]?.notes || "",
        });
      } catch (error) {
        console.error("error", error);
      }
    };

    if (id) {
      fetchServices();
    }
  }, [id]);

  return (
    <main className="content-wrapper">
      <div className="container-fluid border-bottom bg-light py-2">
        <div className="row align-items-center">
          <div className="col-10 col-md-11">
            <div className="row align-items-center">
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
        <div className="col-12">
          <div className="card shadow border-0">
            <div className="card-header profile-header">
              Edit Service: {service.service_name}
            </div>

            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="service_name">
                      Service Name
                      <span className="text-danger fw-bolder">*</span>
                    </label>

                    <input
                      type="text"
                      id="service_name"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter service name"
                      name="service_name"
                      value={service_name}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="service_code">
                      Service Code
                      <span className="text-danger fw-bolder">*</span>
                    </label>

                    <input
                      type="text"
                      id="service_code"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter service code"
                      name="service_code"
                      value={service_code}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="status">
                      Status
                      <span className="text-danger fw-bolder">*</span>
                    </label>

                    <select
                      id="status"
                      className="form-select sector-wise mb-1"
                      name="status"
                      value={status}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="notes">
                      Description (optional)
                    </label>

                    <textarea
                      id="notes"
                      className="form-control py-2 sector-wise"
                      placeholder="Description..."
                      name="notes"
                      value={notes}
                      onChange={onInputChange}
                      style={{ height: "60px" }}
                    ></textarea>
                  </div>
                </div>

                <div className="col-md-6 d-flex flex-column">
                  <div>
                    <button
                      type="submit"
                      className="btn btn-success mb-2 submit-btn"
                    >
                      Update
                    </button>
                  </div>

                  <Link className="text-success" to="/admin/status">
                    Back
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={1500} />
    </main>
  );
}

export default ServicesEdit;
