import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "../utils/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { setAuthStatus } = useAuth();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch("http://localhost:3000/logout", {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          console.log("Logout successful");
          setAuthStatus(false);
          console.log("Navigating to /login");
          navigate("/login");
        } else {
          console.log("Logout failed");
          throw new Error("Failed to logout");
        }
      } catch (error) {
        console.error("Logout error:", error);
        console.log("Navigating to /login due to error");
        navigate("/login");
      }
    };

    logout();
  }, [navigate, setAuthStatus]);

  return null;
}
