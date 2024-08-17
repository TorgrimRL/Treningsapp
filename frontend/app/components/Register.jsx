import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      console.log("Response:", response);
      console.log(import.meta.env.VITE_API_URL);

      if (!response.ok) {
        const text = await response.text();
        console.log("Response text: ", text);
        try {
          const data = JSON.parse(text);
          setMessage(`Registration failed: ${data.message}`);
        } catch (error) {
          setMessage(`Registration failed: ${text}`);
        }
        return;
      }
      const data = await response.json();
      setMessage("Registration successfull, you can now login.");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration", error);
      setMessage("An error occured during registration");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        marginTop: "15px",
      }}
      className="
      text-white"
    >
      <label className="text-white">
        Username:
        <input
          type="text"
          name="username"
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
      <label className="text-white">
        Password:
        <input
          type="password"
          name="password"
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
      <label className="text-white">
        ConfirmPassword:
        <input
          type="password"
          name="confirmpassword"
          className="bg-inputBGGray"
          placeholder="Enter your password here"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        Register
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
