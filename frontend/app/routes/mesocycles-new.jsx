import React, { useEffect, useState } from "react";
import MesocycleForm from "../components/MesocycleForm";
import { getCookie } from "../utils/cookies";
import { useNavigate } from "@remix-run/react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function NewMesocycle() {
  const [csrfToken, setCSRFToken] = useState("");
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await fetch(`${baseUrl}/csrf-token`, {
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
      console.log("Mesocycle object in handleFormSubmit:", mesocycle);
      const response = await fetch(`${baseUrl}/mesocycles`, {
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
      // Fetch den nylig opprettede mesocyclen
      const fetchResponse = await fetch(`${baseUrl}/mesocycles/${result.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch the new mesocycle");
      }

      const mesocycleData = await fetchResponse.json();
      console.log("Fetched new mesocycle:", mesocycleData);

      navigate("/currentworkout");
    } catch (error) {
      console.error("There was a problem with the fetch operation", error);
    }
  };

  const handleSubmit = (mesocycleData) => {
    handleFormSubmit(mesocycleData);
  };
  return (
    <ProtectedRoute>
      <div className=" text-white bg-darkGray">
        <div style={{ paddingTop: "30px" }}></div>

        <MesocycleForm onSubmit={handleSubmit} />
        <div id="root">{/* <TestModal /> */}</div>
      </div>
    </ProtectedRoute>
  );
}
