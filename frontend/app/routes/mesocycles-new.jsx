import React, { useEffect, useState } from "react";
import MesocycleForm from "../components/MesocycleForm";
import { getCookie } from "../utils/cookies";

export default function NewMesocycle() {
  const [csrfToken, setCSRFToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await fetch("http://localhost:3000/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCSRFToken(data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  const handleFormSubmit = async (mesocycle) => {
    try {
      const token = getCookie("token");
      console.log("Retrieved token:", token);
      const response = await fetch("http://localhost:3000/mesocycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(mesocycle),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Mesocycle created:", result);
    } catch (error) {
      console.error("There was a problem with the fetch operation", error);
    }
  };

  const handleSubmit = (mesocycleData) => {
    handleFormSubmit(mesocycleData);
  };
  return (
    <div>
      <h1>Create a new mesocycle</h1>
      <MesocycleForm onSubmit={handleSubmit} />
      <div id="root">{/* <TestModal /> */}</div>
    </div>
  );
}
