import { useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router";

const ProtectedRoute = ({ children, loadingFallback = <div>Loading...</div> }) => {
  const { isLoggedIn, authCheckInProgress, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // A logout already navigates to "/". Router navigations run in a transition,
    // so this route can still be mounted for a commit after isLoggedIn flips —
    // redirecting here would hijack that and strand the user on /login.
    if (isLoggingOut) return;
    if (!authCheckInProgress && !isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, authCheckInProgress, isLoggingOut, navigate]);

  if (authCheckInProgress || isLoggingOut) {
    return loadingFallback;
  }

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
