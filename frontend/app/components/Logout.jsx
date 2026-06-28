import { useEffect } from "react";
import { useAuth } from "../utils/AuthContext";

export default function Logout() {
  const { setAuthStatus } = useAuth();
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setAuthStatus(false);
    window.location.href = `${baseUrl}/auth0/logout`;
  }, [baseUrl, setAuthStatus]);

  return null;
}
