import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };
  const setAuthStatus = (status) => {
    setIsLoggedIn(status);
    if (!status) {
      setCurrentUser(null);
    }
  };

  const fetchCurrentUser = async () => {
    const response = await fetch(`${baseUrl}/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      setCurrentUser(null);
      return null;
    }

    const data = await response.json();
    setCurrentUser(data.user || null);
    return data.user || null;
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/check-auth`, {
        credentials: "include",
      });

      console.log("Cookies available:", document.cookie);

      if (!response.ok) {
        console.error("Server error:", response.status);
        setIsLoggedIn(false);
        setCurrentUser(null);
        return;
      }

      const responseText = await response.text();
      console.log("Response text:", responseText);

      const data = JSON.parse(responseText);
      setIsLoggedIn(data.isLoggedIn);
      if (data.isLoggedIn) {
        await fetchCurrentUser();
      } else {
        setCurrentUser(null);
      }
      console.log("Auth status checked:", data.isLoggedIn);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setAuthCheckInProgress(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

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
