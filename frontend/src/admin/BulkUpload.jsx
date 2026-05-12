import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleInfo,
  faFileExcel,
  faList,
  faUpload,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { authHeader } from "../utils/authHeader";

function BulkUpload() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [bulk, setBulk] = useState([]);
  const [file, setFile] = useState(null);

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a .xlsx or csv file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("adminToken");

    try {
      await axios.post(`${API_URL}/upload-stock`, formData, {
        headers: authHeader(),
      });

      toast.success("Bulk upload successfully");
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk upload failed");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
        <div>
          <h5 className="fw-bold overview-dashboard">Bulk Upload</h5>
          <p className="text-muted mb-md-0 overview-lead">
            Import Contact from Excel - deplicate auto-skipped
          </p>
        </div>

        <div className="col-12 col-lg-6 col-md-6 d-flex flex-column">
          <form onSubmit={handleBulkSubmit}>
            <div className="card rounded-2 h-100 px-2 py-2">
              <div className="dotted-class">
                <div className="dotted-class p-5 text-center bg-light">
                  <div className="mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center bg-success text-white custom-typo">
                      <FontAwesomeIcon icon={faFileExcel} size="lg" />
                    </div>
                  </div>

                  <h6 className="mb-2 fw-semibold">
                    Drop your Excel file here
                  </h6>

                  <p className="text-muted small mb-2 fw-bold">
                    .xlsx, .csv up to 10MB
                  </p>

                  {file && (
                    <div className="text-success small fw-semibold mb-2">
                      Selected File: {file.name}
                      <FontAwesomeIcon
                        icon={faX}
                        className="text-danger fw-bold pointer-cursor ms-2"
                        onClick={() => setFile(null)}
                      />
                    </div>
                  )}

                  <div className="d-flex flex-column justify-content-center align-items-center">
                    <label className="btn btn-success btn-sm select-file-btn">
                      <FontAwesomeIcon icon={faUpload} /> Select file
                      <input
                        type="file"
                        hidden
                        accept=".xlsx,.csv"
                        onChange={handleFileChange}
                      />
                    </label>

                    <button
                      className="btn btn-success submit-file-btn mt-2"
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="alert alert-light border rounded-3 d-flex text-start gap-2 mt-3">
            <div className="text-success fs-5">
              <FontAwesomeIcon icon={faCircleInfo} />
            </div>

            <div className="ms-0">
              <div className="fw-semibold mb-1">Required columns</div>
              <small className="text-muted fw-medium">
                name, phone, city, source (Hajj / Umrah / Ticket / Medical),
                source. Phone numbers are checked for duplicates across your
                entire database.
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 col-md-6 d-flex flex-column">
          <div className="card rounded-2">
            <div className="px-2 py-2 mt-2">Package Upload</div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose="1500" />
    </div>
  );
}

export default BulkUpload;
