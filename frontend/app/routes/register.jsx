import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../utils/AuthContext";

export default function RegisterPage() {
  const { authCheckInProgress, isLoggedIn, startRegistration } = useAuth();
  const navigate = useNavigate();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (authCheckInProgress) return;
    if (isLoggedIn) {
      navigate("/", { replace: true });
    } else if (!hasStarted.current) {
      hasStarted.current = true;
      void Promise.resolve(startRegistration()).catch((error) => {
        console.error("Unable to start registration:", error);
      });
    }
  }, [authCheckInProgress, isLoggedIn, navigate, startRegistration]);

  return null;
}
