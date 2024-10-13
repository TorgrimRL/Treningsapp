import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL;

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  const setAuthStatus = (status) => setIsLoggedIn(status);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/check-auth`, {
        credentials: "include", // Pass på at cookies inkluderes
      });

      console.log("Cookies available:", document.cookie); // Sjekk hvilke cookies som sendes

      if (!response.ok) {
        console.error("Server error:", response.status);
        setIsLoggedIn(false);
        return;
      }

      const responseText = await response.text();
      console.log("Response text:", responseText);

      const data = JSON.parse(responseText);
      setIsLoggedIn(data.isLoggedIn);
      console.log("Auth status checked:", data.isLoggedIn);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setIsLoggedIn(false);
    } finally {
      setAuthCheckInProgress(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, setAuthStatus, authCheckInProgress }}
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
