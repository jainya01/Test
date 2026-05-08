import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faList,
  faTrash,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { authHeader } from "../utils/authHeader";

function Settings() {
  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("adminToken");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { name, email, password } = formData;

  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleAdminEmailSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await axios.post(`${API_URL}/adminpost`, formData, {
        headers: authHeader(),
      });

      const newAdmin = {
        id: res.data.insertedId,
        name: formData.name,
        email: formData.email,
      };

      setAdminEmail((prev) => [newAdmin, ...prev]);

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setErrors({});
      toast.success("Admin added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add admin");
    }
  };

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [adminEmail, setAdminEmail] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const allData = async () => {
      try {
        const response = await axios.get(`${API_URL}/alladmindata`, {
          headers: authHeader(),
        });

        setAdminEmail(response.data.result);
      } catch (error) {
        console.error("error", error);

        if (error.response?.status === 401) {
          toast.error("Unauthorized access. Please login again.");
        }
      }
    };

    allData();
  }, []);

  const deleteData = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admin?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/admindelete/${id}`, {
        headers: authHeader(),
      });
      setAdminEmail((prev) => prev.filter((item) => item.id !== id));
      toast.success("Admin deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    }
  };

  const [selectedAdmin, setSelectedAdmin] = useState("");

  const [updateForm, setUpdateForm] = useState({
    email: "",
    password: "",
  });

  const handleSelectAdmin = (e) => {
    const id = e.target.value;
    setSelectedAdmin(id);

    const admin = adminEmail.find((item) => item.id == id);

    if (admin) {
      setUpdateForm({
        email: admin.email,
        password: "",
      });
    } else {
      setUpdateForm({
        email: "",
        password: "",
      });
    }
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/adminupdate/${selectedAdmin}`, updateForm, {
        headers: authHeader(),
      });

      toast.success("Admin credentials updated successfully");
      setUpdateForm({
        email: "",
        password: "",
      });

      setSelectedAdmin("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({
      ...updateForm,
      [e.target.name]: e.target.value,
    });
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

      <div className="row mt-3 gx-2 ms-2 me-2 gy-2">
        <div className="col-lg-6 col-md-6 col-sm-6 col-12 d-flex flex-column">
          <div className="card rounded-2 h-100">
            <div className="px-2 py-2 mt-2">Add New Admin</div>
            <div className="card-body p-2">
              <form onSubmit={handleAdminEmailSubmit}>
                <div className="mb-2">
                  <label
                    htmlFor="name-input"
                    className="form-label small fw-medium mb-1"
                  >
                    Admin Name
                  </label>

                  <input
                    type="text"
                    className="form-control custom-text"
                    placeholder="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    required
                  />
                  {errors.name && (
                    <span className="text-danger error-font">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="mb-0">
                  <label
                    htmlFor="email-input"
                    className="form-label small fw-medium mb-1"
                  >
                    Admin email
                  </label>

                  <input
                    className="form-control custom-text"
                    type="email"
                    placeholder="admin@company.com"
                    name="email"
                    value={formData.email}
                    onChange={onInputChange}
                    required
                  />
                  {errors.email && (
                    <span className="text-danger error-font">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-medium mt-2 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control custom-text"
                    placeholder="Create Password"
                    name="password"
                    value={formData.password}
                    onChange={onInputChange}
                    required
                  />
                  {errors.password && (
                    <span className="text-danger error-font">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-sm border text-dark">
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-sm btn-outline-success px-2"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12 d-flex flex-column">
          <div className="card rounded-2 h-100">
            <div className="px-2 py-2 mt-2">Change Password</div>
            <div className="card-body p-2">
              <form onSubmit={handleAdminUpdate}>
                <div className="mb-2">
                  <select
                    className="form-select custom-text"
                    value={selectedAdmin}
                    onChange={handleSelectAdmin}
                  >
                    <option value="">Choose a Admin</option>
                    {Array.isArray(adminEmail) && adminEmail.length > 0 ? (
                      adminEmail.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.email}
                        </option>
                      ))
                    ) : (
                      <option disabled>No email admins found</option>
                    )}
                  </select>
                </div>

                <div className="mb-2">
                  <input
                    type="email"
                    className="form-control custom-text"
                    placeholder="New Email"
                    name="email"
                    value={updateForm.email}
                    onChange={handleUpdateChange}
                    required
                  />
                </div>

                <div className="mb-2" style={{ position: "relative" }}>
                  <input
                    className="form-control custom-text"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    name="password"
                    value={updateForm.password}
                    onChange={handleUpdateChange}
                    required
                  />

                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="eye-hover"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#111",
                    }}
                  />
                </div>

                <div className="d-flex gap-2 mt-3 justify-content-start">
                  <button
                    type="submit"
                    className="btn btn-sm btn-outline-success px-2"
                  >
                    Update
                  </button>

                  <button type="button" className="btn btn-sm border text-dark">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row ms-1 me-1 gy-2 mt-2">
        <div className="col-12 col-lg-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 fw-semibold">Admin Accounts</h6>
          </div>

          {Array.isArray(adminEmail) && adminEmail.length > 0 ? (
            adminEmail.map((data, index) => (
              <div key={index} className="card mb-2 border-0 shadow-sm">
                <div className="card-body py-3 px-3 d-flex justify-content-between align-items-center">
                  <div className="text-truncate me-3">
                    <span className="fw-medium accounts-email">
                      {data.email}
                    </span>
                  </div>

                  <span
                    className="delete-trash"
                    title="Admin Delete"
                    onClick={() => deleteData(data.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-light border text-center small mb-0">
              No admin found
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default Settings;
