import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import axios from "axios";
import { authHeader } from "../utils/authHeader";
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
    price: "",
    status: "",
    notes: "",
  });
  const { service_name, service_code, price, status, notes } = service;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/serviceupdate/${id}`, service, {
        headers: authHeader(),
      });
      toast.success("Service updated successfully");
      setTimeout(() => {
        navigate("/admin/services");
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
          price: res.data?.result?.[0]?.price || "",
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
        <div className="row g-2 mt-3 d-flex justify-content-center">
          <div className="col-lg-6 col-12">
            <div className="card p-0 d-flex justify-content-center align-items-center">
              <h5 className="mt-3 mb-0">
                Edit Service: {service.service_name}
              </h5>

              <hr className="border border-dark w-100 mt-3" />

              <form onSubmit={handleFormSubmit}>
                <div className="row g-3 px-3 py-2">
                  <div className="col-12">
                    <label className="form-label">
                      Service Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter service name"
                      name="service_name"
                      value={service_name}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Service Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter status code"
                      name="service_code"
                      value={service_code}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Price <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control custom-text mb-1"
                      placeholder="Price"
                      name="price"
                      value={price}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select custom-text mb-1"
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

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control py-2"
                      placeholder="Description..."
                      name="notes"
                      value={notes}
                      onChange={onInputChange}
                      style={{ height: "90px" }}
                    ></textarea>
                  </div>

                  <div className="col-12 mt-3 mb-4">
                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-2"
                    >
                      Update
                    </button>

                    <Link className="mt-2 text-success" to="/admin/services">
                      Back
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default ServicesEdit;
