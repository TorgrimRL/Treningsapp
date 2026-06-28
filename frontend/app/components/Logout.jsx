import { useEffect } from "react";

export default function Logout() {
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.assign(`${baseUrl}/auth0/logout`);
  }, [baseUrl]);

  return null;
}
