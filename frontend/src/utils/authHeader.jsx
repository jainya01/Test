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
    const currentPath = window.location.pathname;

    const isLoginPage =
      currentPath === "/" ||
      currentPath === "/admin/login" ||
      currentPath === "/caller/login";

    if (error.response?.status === 401 && !isLoginPage) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("callerToken");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      window.location.replace("/");
    }

    return Promise.reject(error);
  },
);
