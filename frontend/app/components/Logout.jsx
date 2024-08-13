import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "../utils/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
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
          // Fjern token fra lokal lagring
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          // Fjern cookies (hvis tokenen er lagret i cookies)
          document.cookie =
            "token=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=None";

          // Oppdater autentiseringsstatus
          setAuthStatus(false);
          navigate("/login");
        }
      } catch (error) {
        console.error("Logout error:", error);
        navigate("/login");
      }
    };

    logout();
  }, [navigate, setAuthStatus]);
  return null;
}
