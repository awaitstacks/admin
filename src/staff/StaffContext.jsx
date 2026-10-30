import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { STAFF_TOKEN_KEY } from "./staffMode";

// eslint-disable-next-line react-refresh/only-export-components
export const StaffContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// Staff login aana info — name, role, tabs. stoken localStorage la.
const StaffContextProvider = ({ children }) => {
  const [stoken, setStoken] = useState(() => localStorage.getItem(STAFF_TOKEN_KEY) || "");
  const [staff, setStaff] = useState(null); // /api/staff/me data (role.tabs kooda)
  const [loadingMe, setLoadingMe] = useState(false);

  const tabs = staff?.role?.tabs || [];

  // GET /api/staff/me — profile + role tabs (interceptor stoken podum)
  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem(STAFF_TOKEN_KEY)) return null;
    setLoadingMe(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/staff/me`);
      if (data.success) {
        setStaff(data.data);
        return data.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoadingMe(false);
    }
  }, []);

  useEffect(() => {
    if (stoken) refreshMe();
  }, [stoken, refreshMe]);

  // POST /api/staff/login
  const login = async (username, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/staff/login`, { username, password });
      if (!data.success) return { success: false, message: data.message };
      localStorage.setItem(STAFF_TOKEN_KEY, data.token);
      setStoken(data.token);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed. Please try again." };
    }
  };

  // POST /api/staff/forgot-password
  const forgotPassword = async (username) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/staff/forgot-password`, { username });
      return { success: !!data.success, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Could not send request." };
    }
  };

  const logout = () => {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    setStoken("");
    setStaff(null);
  };

  return (
    <StaffContext.Provider value={{ backendUrl, stoken, staff, tabs, loadingMe, refreshMe, login, logout, forgotPassword }}>
      {children}
    </StaffContext.Provider>
  );
};

export default StaffContextProvider;
