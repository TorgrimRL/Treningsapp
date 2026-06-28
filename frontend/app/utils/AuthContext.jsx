import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);
  const setAuthStatus = useCallback((status) => {
    setIsLoggedIn(status);
    if (!status) {
      setCurrentUser(null);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/me`, {
        credentials: "include",
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        console.error("Failed to fetch current user:", response.status);
        logout();
        return;
      }

      const data = await response.json();
      const user = data.isLoggedIn ? data.user || null : null;
      setIsLoggedIn(Boolean(user));
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      logout();
    } finally {
      setAuthCheckInProgress(false);
    }
  }, [baseUrl, logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        login,
        logout,
        setAuthStatus,
        checkAuthStatus,
        authCheckInProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
