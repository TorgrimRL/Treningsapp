import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedInn] = useState(false);

  const login = () => setIsLoggedInn(true);
  const logout = () => setIsLoggedInn(false);
  const setAuthStatus = (status) => setIsLoggedInn(status);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await fetch("http://localhost:3000/check-auth", {
        credentials: "include",
      });
      const data = await response.json();
      setIsLoggedInn(data.isLoggedIn);
    };
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, setAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
