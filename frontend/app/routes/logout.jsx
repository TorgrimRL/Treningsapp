import { useEffect } from "react";
import { useAuth } from "../utils/AuthContext";

export default function LogoutRoute() {
  const { setAuthStatus } = useAuth();
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch(`${baseUrl}/logout`, {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          setAuthStatus(false); // Oppdater auth status
        } else {
          console.error("Logout failed:", response.status);
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    logout();
  }, [setAuthStatus]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Logout Successful</h1>
      <p>You have been successfully logged out.</p>
    </div>
  );
}
