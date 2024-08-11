import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  const setAuthStatus = (status) => setIsLoggedIn(status);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const baseUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${baseUrl}/check-auth`, {
          credentials: "include",
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
        console.log("Auth status checked:", data.isLoggedIn);
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsLoggedIn(false);
      } finally {
        setIsAuthChecked(true);
        console.log("isAuthChecked set to true");
      }
    };
    checkAuthStatus();
  }, []);
  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, setAuthStatus, isAuthChecked }}
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
