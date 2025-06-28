import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { useApiFetch } from "../utils/apiFetch";
import GlobalWaitModal from "./GlobalWaitModal";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuthStatus } = useAuth();
  const { apiFetch } = useApiFetch();
  const baseUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { ok, data, hadSleep } = await apiFetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (ok) {
        if (hadSleep) {
          setMessage(
            "Database went to sleep! Please wait... try again after timer"
          );
          console.log("hadSleep was true\n");
          return;
        } else if (data.token) {
          setMessage("Login successful");
          setAuthStatus(true);
          window.location.href = "/templates";
        } else {
          setMessage("No token returned from server");
        }
      } else {
        setMessage(`Login Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during login", error);
      setMessage("An error occurred during login, most likely need to wake up database. Please try again in one minute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          padding: "25px",
          marginTop: "15px",
        }}
        className="text-white"
      >
        <label>
          Username:
          <input
            type="text"
            className="bg-inputBGGray"
            placeholder="Enter your username here"
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
        <label>
          Password:
          <input
            type="password"
            className="bg-inputBGGray"
            placeholder="Enter your password here"
            value={password}
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
          disabled={loading}
          className="bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg"
          style={{ padding: "8px 16px" }}
        >
          {loading ? "Loading..." : "Log In"}
        </button>
        {message && <p>{message}</p>}
      </form>

      {/* Bruk GlobalWaitModal, siden det er navnet du importerte */}
      <GlobalWaitModal />
    </>
  );
}
