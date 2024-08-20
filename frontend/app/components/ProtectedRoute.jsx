import { useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authCheckInProgress } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authCheckInProgress && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, authCheckInProgress, navigate]);

  if (authCheckInProgress) {
    return <div>Loading...</div>; // Eller en spinner, mens auth sjekkes
  }

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
