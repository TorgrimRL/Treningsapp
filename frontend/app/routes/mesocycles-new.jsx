import { useEffect, useState } from "react";
import MesocycleForm from "../components/MesocycleForm";
import { getCookie } from "../utils/cookies";
import { useNavigate } from "@remix-run/react";
import ProtectedRoute from "../components/ProtectedRoute";
import PageContainer from "../components/PageContainer";
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
  }, [baseUrl]);

  const handleFormSubmit = async (mesocycle) => {
    try {
      const token = getCookie("token");

      const { ok: postOk, data: postData } = await apiFetch(
        `${baseUrl}/mesocycles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(mesocycle),
        }
      );

      if (!postOk) {
        console.error(
          "Failed to create mesocycle: " + (postData.message || "Unknown error")
        );
        return;
      }

      const mesocycleId = postData.mesocycleId || postData.id;
      if (!mesocycleId) {
        console.error("Failed to read created mesocycle id from response");
        return;
      }

      const { ok: getOk, data: getData } = await apiFetch(
        `${baseUrl}/mesocycles/${mesocycleId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!getOk) {
        console.error(
          "Failed to fetch the new mesocycle: " +
            (getData.message || "Unknown error")
        );
        return;
      }
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
      <div className="min-h-full bg-darkGray text-white">
        <PageContainer size="wide" className="lg:px-6">
          <MesocycleForm onSubmit={handleSubmit} />
        </PageContainer>
      </div>
    </ProtectedRoute>
  );
}
