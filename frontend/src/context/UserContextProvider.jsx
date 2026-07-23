import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import UserContext from "./UserContext";
import { authHeader } from "../utils/authHeader";

export const UserProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [followupCount, setFollowupCount] = useState(0);
  const [followupCustomers, setFollowupCustomers] = useState([]);

  const fetchFollowups = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/allcustomers`, {
        headers: authHeader(),
      });

      const user = {
        id: Number(localStorage.getItem("id")),
        role: localStorage.getItem("role"),
      };

      let customers = res.data.result || [];

      if (user.role === "caller") {
        customers = customers.filter(
          (item) => Number(item.caller_id) === user.id,
        );
      }

      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const dueCustomers = customers.filter((item) => {
        if (!item.schedule_date || !item.schedule_time) return false;

        const scheduleDate = item.schedule_date.split("T")[0];
        const scheduleTime = item.schedule_time.slice(0, 5);

        return (
          scheduleDate === today &&
          scheduleTime <= currentTime &&
          item.status === "Follow-up Pending"
        );
      });

      setFollowupCustomers(dueCustomers);
      setFollowupCount(dueCustomers.length);
    } catch (error) {
      console.error("Followup fetch error:", error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFollowups();
    const interval = setInterval(fetchFollowups, 1000);
    return () => clearInterval(interval);
  }, [fetchFollowups]);

  return (
    <UserContext.Provider
      value={{
        followupCount,
        followupCustomers,
        refreshFollowups: fetchFollowups,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
