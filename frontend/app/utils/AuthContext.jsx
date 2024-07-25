import React, { createContext, useState, useContext, useEffect } from "react";
import { getCookie } from "./cookies";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedInn] = useState(false);

  const login = () => setIsLoggedInn(true);
  const logout = () => setIsLoggedInn(false);
  const setAuthStatus = (status) => setIsLoggedInn(status);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/check-auth", {
          credentials: "include",
        });
        const data = await response.json();
        setIsLoggedInn(data.isLoggedIn);
        console.log("Auth status checked:", data.isLoggedIn);
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsLoggedInn(false);
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, setAuthStatus }}>
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
