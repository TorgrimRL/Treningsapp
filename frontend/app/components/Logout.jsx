import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "../utils/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { setAuthStatus, checkAuthStatus } = useAuth();
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const logout = async () => {
      try {
        console.log("Starting logout process..."); // Logging for debugging
        const response = await fetch(`${baseUrl}/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          console.log("Logout successful."); // Logging for debugging
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          document.cookie =
            "token=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=None";
          setAuthStatus(false);
          await checkAuthStatus();
          navigate("/login"); // Naviger til login-siden etter logout
        } else {
          console.error("Logout failed:", response.status); // Logging for debugging
        }
      } catch (error) {
        console.error("Logout error:", error);
        navigate("/login"); // Naviger til login-siden ved feil
      }
    };

    logout();
  }, [navigate, setAuthStatus, checkAuthStatus]);

  return null;
}
