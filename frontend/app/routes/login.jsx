import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../utils/AuthContext";

export default function LoginPage() {
  const { authCheckInProgress, isLoggedIn, startLogin } = useAuth();
  const navigate = useNavigate();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (authCheckInProgress) return;
    if (isLoggedIn) {
      navigate("/", { replace: true });
    } else if (!hasStarted.current) {
      hasStarted.current = true;
      void Promise.resolve(startLogin()).catch((error) => {
        console.error("Unable to start login:", error);
      });
    }
  }, [authCheckInProgress, isLoggedIn, navigate, startLogin]);

  return null;
}
