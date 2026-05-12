import axios from "axios";

const getToken = () => {
  return (
    localStorage.getItem("adminToken") || localStorage.getItem("callerToken")
  );
};

export const authHeader = () => {
  const token = getToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

axios.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("callerToken");
      localStorage.removeItem("role");

      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);
