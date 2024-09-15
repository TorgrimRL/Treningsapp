import { json } from "@remix-run/node"; // Import json for å returnere loader-data
import { useLoaderData } from "@remix-run/react";
import CurrentWorkout from "../components/CurrentWorkout";
import ProtectedRoute from "../components/ProtectedRoute";

// Loader function to fetch current workout data from the backend
export let loader = async ({ request }) => {
  const baseUrl = import.meta.env.VITE_API_URL; // Bruk `import.meta.env` for miljøvariabler

  const cookieHeader = request.headers.get("Cookie");

  try {
    // Fetch current workout fra backend
    const response = await fetch(`${baseUrl}/current-workout`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch current workout: ${errorText}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error fetching current workout:", error);
    throw new Response("Failed to fetch data", { status: 500 });
  }
};

export default function CurrentWorkoutRoute() {
  const currentMesocycle = useLoaderData(); // Bruk loader data i stedet for å fetche i komponenten

  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <CurrentWorkout data={currentMesocycle} />
      </div>
    </ProtectedRoute>
  );
}
