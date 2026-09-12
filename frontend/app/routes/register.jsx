import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../utils/AuthContext";

export default function RegisterPage() {
  const { authCheckInProgress, isLoggedIn, isLoggingOut, startRegistration } =
    useAuth();
  const navigate = useNavigate();
  const hasStarted = useRef(false);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    if (authCheckInProgress || isLoggingOut) return;
    if (isLoggedIn) {
      navigate("/", { replace: true });
    } else if (!hasStarted.current) {
      hasStarted.current = true;
      void Promise.resolve(startRegistration()).catch((error) => {
        console.error("Unable to start registration:", error);
        setStartError("Could not open the sign up page. Please try again.");
      });
    }
  }, [
    authCheckInProgress,
    isLoggedIn,
    isLoggingOut,
    navigate,
    startRegistration,
  ]);

  const retry = () => {
    hasStarted.current = true;
    setStartError(null);
    void Promise.resolve(startRegistration()).catch((error) => {
      console.error("Unable to start registration:", error);
      setStartError("Could not open the sign up page. Please try again.");
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      {startError ? (
        <>
          <p data-testid="register-redirect-error" role="alert">
            {startError}
          </p>
          <button
            type="button"
            onClick={retry}
            data-testid="register-retry-button"
            className="min-h-11 rounded-full bg-red-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Try again
          </button>
          <Link to="/" className="text-red-400 underline">
            Back to home
          </Link>
        </>
      ) : (
        <p data-testid="register-redirect-status">
          Redirecting to sign up&hellip;
        </p>
      )}
    </div>
  );
}
