import { useEffect, useState } from "react";
import { authHeader } from "../../utils/authHeader";
import "../../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function CustomersCreate() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    service: "",
    notes: "",
  });

  const { name, phone, city, service, notes } = customer;

  const [errors, setErrors] = useState({});
  const [callersList, setCallersList] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const [callerRes, serviceRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allCallers`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/allservicesdata`, {
            headers: authHeader(),
          }),
        ]);

        if (callerRes.status === "fulfilled") {
          setCallersList(callerRes.value.data.data || []);
        }

        if (serviceRes.status === "fulfilled") {
          setServices(serviceRes.value.data.result || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    if (!service.trim()) {
      newErrors.service = "Service is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onInputChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    try {
      await axios.post(`${API_URL}/customerspost`, customer, {
        headers: authHeader(),
      });

      toast.success("Customer created successfully");

      setTimeout(() => {
        navigate("/admin/customers");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add customer");
    }
  };

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

      <div className="p-2 p-lg-3 mt-2">
        <div className="col-12">
          <div className="card shadow border-0">
            <div className="card-header profile-header">
              Create New Customer
            </div>

            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="name">
                      Name <span className="text-danger fw-bolder">*</span>
                    </label>

                    <input
                      type="text"
                      id="name"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter full name"
                      name="name"
                      value={name}
                      onChange={onInputChange}
                      required
                    />

                    {errors.name && (
                      <small className="text-danger mt-1">{errors.name}</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="phone">
                      Phone <span className="text-danger fw-bolder">*</span>
                    </label>

                    <input
                      type="text"
                      id="phone"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter phone no"
                      name="phone"
                      value={phone}
                      onChange={onInputChange}
                      required
                    />

                    {errors.phone && (
                      <small className="text-danger mt-1">{errors.phone}</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="city">
                      City <span className="text-danger fw-bolder">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="form-control sector-wise mb-1"
                      placeholder="Enter City"
                      name="city"
                      value={city}
                      onChange={onInputChange}
                      required
                    />

                    {errors.city && (
                      <small className="text-danger mt-1">{errors.city}</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="service">
                      Service <span className="text-danger fw-bolder">*</span>
                    </label>

                    <select
                      id="service"
                      className="form-select sector-wise mb-1"
                      name="service"
                      value={service}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Select Service</option>
                      {Array.isArray(services) ? (
                        services
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

                    {errors.service && (
                      <small className="text-danger mt-1">
                        {errors.service}
                      </small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="notes">
                      Notes (optional)
                    </label>

                    <textarea
                      id="notes"
                      className="form-control py-2 sector-wise"
                      placeholder="Description..."
                      name="notes"
                      value={notes}
                      onChange={onInputChange}
                      style={{ height: "60px" }}
                    />
                  </div>
                </div>

                <div className="col-md-6 d-flex flex-column">
                  <div>
                    <button
                      type="submit"
                      className="btn btn-success submit-btn mb-2"
                    >
                      Submit
                    </button>
                  </div>

                  <Link className="text-success" to="/admin/customers">
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

export default CustomersCreate;
