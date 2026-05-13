import { useEffect, useState } from "react";
import { authHeader } from "../utils/authHeader";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function CustomersEdit() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const { id } = useParams();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    service: "",
    notes: "",
  });

  const { name, phone, city, service, notes } = customer;

  const [errors, setErrors] = useState({});
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    const allData = async () => {
      try {
        const [serviceRes, someRes] = await Promise.allSettled([
          axios.get(`${API_URL}/allservices`, {
            headers: authHeader(),
          }),

          axios.get(`${API_URL}/somecustomers/${id}`, {
            headers: authHeader(),
          }),
        ]);

        if (serviceRes.status === "fulfilled") {
          setServicesList(serviceRes.value.data.result || []);
        }

        if (someRes.status === "fulfilled") {
          const data = someRes.value.data.result[0];
          setCustomer({
            name: data.name || "",
            phone: data.phone || "",
            city: data.city || "",
            service: data.service || "",
            notes: data.notes || "",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    allData();
  }, []);

  const onInputChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    try {
      await axios.put(`${API_URL}/customersupdate/${id}`, customer, {
        headers: authHeader(),
      });

      toast.success("Customer update successfully");

      setTimeout(() => {
        navigate("/admin/customers");
      }, 1000);
    } catch (error) {
      toast.error("Failed to update customer");
    }
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
        <div className="row g-2 mt-3 d-flex justify-content-center">
          <div className="col-lg-6 col-12 col-md-12">
            <div className="card p-0 d-flex justify-content-center align-items-center">
              <h5 className="mt-3 mb-0">Edit Customer: {customer.name}</h5>

              <hr className="border border-dark w-100 mt-3" />

              <form onSubmit={handleFormSubmit}>
                <div className="row g-3 px-3 py-2">
                  <div className="col-12">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter full name"
                      name="name"
                      value={name}
                      onChange={onInputChange}
                      required
                    />

                    {errors.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Phone <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control custom-text mb-1"
                      placeholder="Enter phone no"
                      name="phone"
                      value={phone}
                      onChange={onInputChange}
                      required
                    />

                    {errors.phone && (
                      <small className="text-danger">{errors.phone}</small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      City <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control custom-text"
                      placeholder="Enter City"
                      name="city"
                      value={city}
                      onChange={onInputChange}
                      required
                    />

                    {errors.city && (
                      <small className="text-danger">{errors.city}</small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Service <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select custom-text"
                      name="service"
                      value={service}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Select Service</option>
                      <option value="Hajj">Hajj</option>
                      <option value="Umrah">Umrah</option>
                      <option value="Packages">Packages</option>
                      <option value="Misc">Misc</option>
                    </select>

                    {errors.service && (
                      <small className="text-danger">{errors.service}</small>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes</label>

                    <textarea
                      className="form-control py-2"
                      placeholder="Description..."
                      name="notes"
                      value={notes}
                      onChange={onInputChange}
                      style={{ height: "90px" }}
                    />
                  </div>

                  <div className="col-12 mt-3 mb-4">
                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-2"
                    >
                      Update
                    </button>

                    <Link className="mt-2 text-success" to="/admin/customers">
                      Back
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={1500} />
    </div>
  );
}

export default CustomersEdit;
