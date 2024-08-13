import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { setAuthStatus, isLoggedIn, isAuthChecked } = useAuth();
  const baseUrl = import.meta.env.VITE_API_URL;
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Login successful");
        setAuthStatus(true);
      } else {
        console.log("Login failed:", data.message);
        setMessage(`Login Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during login", error);
      setMessage("An error occurred during login");
    }
  };

  useEffect(() => {
    if (isAuthChecked && isLoggedIn) {
      window.location.href = "/templates";
    } else if (isAuthChecked && !isLoggedIn) {
      window.location.href = "/login"; // Omdiriger til login-side etter utlogging hvis nødvendig
    }
  }, [isLoggedIn, isAuthChecked]);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "25px",
        marginTop: "15px",
      }}
    >
      <label className="text-white">
        Username:
        <input
          type="text"
          name="Username"
          placeholder="Enter your username here"
          className="bg-inputBGGray"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            display: "block",
            margin: "10px 0",
            padding: "8px",
            width: "100%",
          }}
        />
      </label>
      <label className="text-white">
        Password:
        <input
          type="password"
          name="Password"
          value={password}
          placeholder="Enter your password here"
          className="bg-inputBGGray"
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: "block",
            margin: "10px 0",
            padding: "8px",
            width: "100%",
          }}
        />
      </label>
      <button
        type="submit"
        className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
      >
        Login
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
