import { useState } from "react";
import "../../App.css";
import { authHeader } from "../../utils/authHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faBell,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function CallersCreate() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [fileErrors, setFileErrors] = useState({});

  const [call, setCall] = useState({
    fullname: "",
    phone: "",
    alternate_phone: "",
    email: "",
    password: "",
    status: "",
    notes: "",
    aadhaar_number: "",
    pan_number: "",
    passport_number: "",
    high_school_certificate: "",
    intermediate_certificate: "",
    graduation_certificate: "",
    postgraduate_certificate: "",
    resume: "",
    bank_passbook: "",
    aadhaar_card: "",
    pan_card: "",
    passport: "",
    passport_size_photo: "",
  });

  const {
    fullname,
    phone,
    alternate_phone,
    email,
    password,
    status,
    notes,
    aadhaar_number,
    pan_number,
    passport_number,
  } = call;

  const [errors, setErrors] = useState({});

  const FILE_LIMITS = {
    high_school_certificate: 2 * 1024 * 1024,
    intermediate_certificate: 2 * 1024 * 1024,
    graduation_certificate: 2 * 1024 * 1024,
    postgraduate_certificate: 2 * 1024 * 1024,
    bank_passbook: 2 * 1024 * 1024,
    aadhaar_card: 2 * 1024 * 1024,
    pan_card: 2 * 1024 * 1024,
    passport: 2 * 1024 * 1024,
    passport_size_photo: 2 * 1024 * 1024,
    resume: 5 * 1024 * 1024,
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    if (!files.length) return;

    const file = files[0];
    const maxSize = FILE_LIMITS[name] || 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setFileErrors((prev) => ({
        ...prev,
        [name]: `Maximum file size is ${maxSize / (1024 * 1024)} MB.`,
      }));

      e.target.value = "";
      return;
    }

    setFileErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setCall((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone No is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!status) {
      newErrors.status = "Status is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    const formData = new FormData();

    Object.keys(call).forEach((key) => {
      formData.append(key, call[key]);
    });

    try {
      await axios.post(`${API_URL}/callerspost`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Caller created successfully");

      setCall({
        fullname: "",
        phone: "",
        alternate_phone: "",
        email: "",
        password: "",
        status: "",
        notes: "",
        aadhaar_number: "",
        pan_number: "",
        passport_number: "",
        high_school_certificate: null,
        intermediate_certificate: null,
        graduation_certificate: null,
        postgraduate_certificate: null,
        resume: null,
        bank_passbook: null,
        aadhaar_card: null,
        pan_card: null,
        passport: null,
        passport_size_photo: null,
      });

      setFileErrors({});
      setErrors({});

      setTimeout(() => {
        navigate("/admin/callers");
      }, 1000);
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to add caller");
    }
  };

  const onInputChange = (e) => {
    setCall({
      ...call,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <title>Create Caller | Signal CRM</title>
      <meta
        name="description"
        content="Add new telecallers, create caller accounts, assign roles, configure access permissions, and manage calling team operations."
      />

      <main className="content-wrapper">
        <div className="container-fluid border-bottom bg-light py-2">
          <div className="row align-items-center">
            <div className="col-10 col-md-11">
              <div className="row align-items-center">
                <div className="col-9 col-md-8 col-lg-4">
                  <input
                    type="search"
                    className="form-control sector-wise"
                    placeholder="Search by caller name"
                    aria-label="Search by caller name"
                    style={{ height: "37px" }}
                  />
                </div>
              </div>
            </div>

            <div className="col-2 col-md-1 d-flex justify-content-end align-items-center">
              <button className="btn border-0 position-relative">
                <FontAwesomeIcon icon={faBell} />
                <span className="notification-corner bg-danger">0</span>
              </button>

              <span className="text-nowrap ms-2 date-days">
                {new Date()
                  .toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })
                  .replace(",", "")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2 p-lg-3">
          <div className="col-12">
            <div className="card shadow border-0">
              <div className="card-header profile-header">
                Create New Caller
              </div>

              <div className="card-body">
                <form action={handleFormSubmit}>
                  <div className="row">
                    <div className="stepper d-flex justify-content-evenly py-1 rounded mb-3">
                      <button
                        type="button"
                        className={`btn step-btn ${activeTab === "basic" ? "active" : ""}`}
                        onClick={() => setActiveTab("basic")}
                      >
                        Basic Info
                      </button>

                      <button
                        type="button"
                        className={`btn step-btn ${activeTab === "identity" ? "active" : ""}`}
                        onClick={() => setActiveTab("identity")}
                      >
                        Identity
                      </button>

                      <button
                        type="button"
                        className={`btn step-btn ${activeTab === "documents" ? "active" : ""}`}
                        onClick={() => setActiveTab("documents")}
                      >
                        Documents
                      </button>
                    </div>

                    {activeTab === "basic" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label className="form-label" htmlFor="fullname">
                            Name <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="text"
                            id="fullname"
                            className="form-control sector-wise mb-1"
                            placeholder="Enter Full Name"
                            name="fullname"
                            value={fullname}
                            onChange={onInputChange}
                            required
                          />

                          {errors.fullname && (
                            <small className="text-danger mt-1">
                              {errors.fullname}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label" htmlFor="phone">
                            Phone No{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="tel"
                            id="phone"
                            className="form-control sector-wise mb-1"
                            placeholder="Enter Phone No"
                            name="phone"
                            value={phone}
                            onChange={onInputChange}
                            required
                          />

                          {errors.phone && (
                            <small className="text-danger mt-1">
                              {errors.phone}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            htmlFor="alternate_phone"
                          >
                            Alternate Phone (Parent/Friend)
                          </label>
                          <input
                            type="tel"
                            id="alternate_phone"
                            className="form-control sector-wise mb-1"
                            placeholder="Alternate Contact"
                            name="alternate_phone"
                            value={alternate_phone}
                            onChange={onInputChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label" htmlFor="email">
                            Email <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="email"
                            id="email"
                            className="form-control sector-wise mb-1"
                            placeholder="Enter Email"
                            name="email"
                            value={email}
                            onChange={onInputChange}
                            required
                          />

                          {errors.email && (
                            <small className="text-danger mt-1">
                              {errors.email}
                            </small>
                          )}
                        </div>

                        <div
                          className="col-md-6 mb-3"
                          style={{ position: "relative" }}
                        >
                          <label className="form-label" htmlFor="password">
                            Password{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="form-control sector-wise pe-5"
                            placeholder="Enter Password"
                            name="password"
                            value={password}
                            onChange={onInputChange}
                            autoComplete="new-password"
                            required
                          />

                          {errors.password && (
                            <small className="text-danger mt-1">
                              {errors.password}
                            </small>
                          )}

                          <span
                            className="eye-login1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <FontAwesomeIcon
                              icon={showPassword ? faEyeSlash : faEye}
                              className="me-1"
                            />
                          </span>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label" htmlFor="status">
                            Status{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <select
                            id="status"
                            className="form-select sector-wise mb-1"
                            name="status"
                            value={status}
                            onChange={onInputChange}
                            required
                          >
                            <option value="" disabled hidden>
                              Select Status
                            </option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>

                          {errors.status && (
                            <small className="text-danger mt-1">
                              {errors.status}
                            </small>
                          )}
                        </div>

                        <div className="col-12 mb-3">
                          <label className="form-label" htmlFor="notes">
                            Notes (optional)
                          </label>

                          <textarea
                            id="notes"
                            className="form-control py-2 sector-wise"
                            placeholder="Add a short note..."
                            name="notes"
                            value={notes}
                            onChange={onInputChange}
                            style={{ height: "60px" }}
                          ></textarea>
                        </div>
                      </>
                    )}

                    {activeTab === "identity" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label"
                            htmlFor="aadhaar_number"
                          >
                            Aadhaar Number{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="text"
                            id="aadhaar_number"
                            className="form-control sector-wise mb-1"
                            placeholder="XXXX XXXX XXXX"
                            name="aadhaar_number"
                            value={aadhaar_number}
                            onChange={onInputChange}
                            maxLength={12}
                            required
                          />
                          {errors.aadhaar_number && (
                            <small className="text-danger">
                              {errors.aadhaar_number}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label" htmlFor="pan_number">
                            PAN Card Number{" "}
                            <span className="text-danger fw-bold">*</span>
                          </label>

                          <input
                            type="text"
                            id="pan_number"
                            className="form-control sector-wise mb-1 text-uppercase"
                            placeholder="ABCDE1234F"
                            name="pan_number"
                            value={pan_number}
                            onChange={onInputChange}
                            maxLength={10}
                            required
                          />

                          {errors.pan_number && (
                            <small className="text-danger">
                              {errors.pan_number}
                            </small>
                          )}
                        </div>

                        <div className="col-12 mb-3">
                          <label
                            className="form-label"
                            htmlFor="passport_number"
                          >
                            Passport Number
                          </label>
                          <input
                            type="text"
                            id="passport_number"
                            className="form-control sector-wise mb-1 text-uppercase"
                            placeholder="E.G. A1234567"
                            name="passport_number"
                            value={passport_number}
                            onChange={onInputChange}
                            maxLength={8}
                          />

                          {errors.passport_number && (
                            <small className="text-danger">
                              {errors.passport_number}
                            </small>
                          )}
                        </div>
                      </>
                    )}

                    {activeTab === "documents" && (
                      <>
                        <h6 className="fw-bold mb-3">Educational Documents</h6>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            High School Certificate{" "}
                            <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              accept=".pdf,.jpg,.jpeg,.png"
                              name="high_school_certificate"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.high_school_certificate && (
                            <small className="text-danger">
                              {fileErrors.high_school_certificate}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Intermediate Certificate{" "}
                            <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="intermediate_certificate"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.intermediate_certificate && (
                            <small className="text-danger">
                              {fileErrors.intermediate_certificate}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Graduation Certificate{" "}
                            <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="graduation_certificate"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.graduation_certificate && (
                            <small className="text-danger">
                              {fileErrors.graduation_certificate}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Postgraduate Certificate
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="postgraduate_certificate"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.postgraduate_certificate && (
                            <small className="text-danger">
                              {fileErrors.postgraduate_certificate}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="form-label">
                            CV / Resume <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="resume"
                              accept=".pdf,.doc,.docx"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.resume && (
                            <small className="text-danger">
                              {fileErrors.resume}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>5 MB</strong>. Allowed
                            formats: PDF, DOC, DOCX.
                          </small>
                        </div>

                        <div className="col-md-6 mb-4">
                          <label className="form-label">
                            Bank Passbook <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="bank_passbook"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.bank_passbook && (
                            <small className="text-danger">
                              {fileErrors.bank_passbook}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <h6 className="fw-bold mb-3">Identity Proofs</h6>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Aadhaar Card <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="aadhaar_card"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.aadhaar_card && (
                            <small className="text-danger">
                              {fileErrors.aadhaar_card}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            PAN Card <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="pan_card"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.pan_card && (
                            <small className="text-danger">
                              {fileErrors.pan_card}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Passport</label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="passport"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.passport && (
                            <small className="text-danger">
                              {fileErrors.passport}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Passport Size Photo{" "}
                            <span className="text-danger">*</span>
                          </label>

                          <div className="position-relative">
                            <input
                              type="file"
                              className="form-control sector-wise dotted-border pe-5"
                              name="passport_size_photo"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={onFileChange}
                              required
                            />
                            <FontAwesomeIcon
                              icon={faArrowUpFromBracket}
                              className="upload-icon"
                            />
                          </div>
                          {fileErrors.passport_size_photo && (
                            <small className="text-danger">
                              {fileErrors.passport_size_photo}
                            </small>
                          )}
                          <small className="text-muted d-block mt-1">
                            Maximum file size: <strong>2 MB</strong>. Allowed
                            formats: PDF, JPG, JPEG, PNG.
                          </small>
                        </div>
                      </>
                    )}
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

                    <Link className="text-success" to="/admin/callers">
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
    </>
  );
}

export default CallersCreate;
