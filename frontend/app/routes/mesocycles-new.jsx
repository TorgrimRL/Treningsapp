import React, { useEffect, useState } from "react";
import MesocycleForm from "../components/MesocycleForm";
import { getCookie } from "../utils/cookies";
import { useNavigate } from "@remix-run/react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useApiFetch } from "../utils/apiFetch";

export default function NewMesocycle() {
  const [csrfToken, setCSRFToken] = useState("");
  const baseUrl = import.meta.env.VITE_API_URL;
  const { apiFetch } = useApiFetch();
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

      const {
        ok: postOk,
        data: postData,
        hadSleep: postHadSleep,
      } = await apiFetch(`${baseUrl}/mesocycles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(mesocycle),
      });

      if (!postOk) {
        throw new Error(
          "Failed to create mesocycle: " + (postData.message || "Unknown error")
        );
      }
      console.log("Mesocycle created:", postData);

      const {
        ok: getOk,
        data: getData,
        hadSleep: getHadSleep,
      } = await apiFetch(`${baseUrl}/mesocycles/${postData.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!getOk) {
        throw new Error(
          "Failed to fetch the new mesocycle: " +
            (getData.message || "Unknown error")
        );
      }
      console.log("Fetched new mesocycle:", getData);

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
