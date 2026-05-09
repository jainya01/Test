import UserContext from "./UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { authHeader } from "../utils/authHeader";

function UserContextProvider({ children }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);

  const [admin, setAdmin] = useState({
    name: "",
    role: "",
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        const response = await axios.get(`${API_URL}/alladmindata`, {
          headers: authHeader(),
        });

        setAdmin(response.data);
      } catch (error) {
        console.error("Error fetching admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [API_URL]);

  return (
    <UserContext.Provider value={{ admin, setAdmin, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
