import { useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "@remix-run/react";

const ProtectedRoute = ({ children, loadingFallback = <div>Loading...</div> }) => {
  const { isLoggedIn, authCheckInProgress } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authCheckInProgress && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, authCheckInProgress, navigate]);

  if (authCheckInProgress) {
    return loadingFallback
  }

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
