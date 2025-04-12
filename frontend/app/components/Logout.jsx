import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "../utils/AuthContext";
import { useApiFetch } from "../utils/apiFetch";

export default function Logout() {
  const navigate = useNavigate();
  const { setAuthStatus, checkAuthStatus } = useAuth();
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
  useEffect(() => {
    const logout = async () => {
      try {
        console.log("Starting logout process...");
        const response = await fetch(`${baseUrl}/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          console.log("Logout successful.");
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          document.cookie =
            "token=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=None";
          setAuthStatus(false);
          await checkAuthStatus();
          navigate("/login");
        } else {
          console.error("Logout failed:", response.status);
        }
      } catch (error) {
        console.error("Logout error:", error);
        navigate("/login");
      }
    };

    logout();
  }, [navigate, setAuthStatus, checkAuthStatus]);

  return null;
}
