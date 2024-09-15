import { json } from "@remix-run/node"; // Import json for å returnere loader-data
import { useLoaderData } from "@remix-run/react";
import CurrentWorkout from "../components/CurrentWorkout";
import ProtectedRoute from "../components/ProtectedRoute";

// Loader function to fetch current workout data from the backend
export let loader = async ({ request }) => {
  const baseUrl = import.meta.env.VITE_API_URL; // Bruk `import.meta.env` for miljøvariabler

  const cookieHeader = request.headers.get("Cookie");
  console.log("🚀 Starting loader...");
  console.log("Base URL:", baseUrl);
  console.log("Cookie header from request:", cookieHeader); // Log the received cookies from the request

  try {
    // Fetch current workout fra backend
    const response = await fetch(`${baseUrl}/current-workout`, {
      method: "GET",
      credentials: "include",
      headers: {
        cookie: cookieHeader,
      },
    });

    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from backend:", errorText); // Log the error text from the backend
      throw new Error(`Failed to fetch current workout: ${errorText}`);
    }

    console.log("Fetching data from response...");
    const data = await response.json();
    console.log("Data fetched successfully:", data); // Log the fetched data

    return json(data);
  } catch (error) {
    console.error("Error during fetch:", error); // Log any caught errors
    throw new Response("Failed to fetch data", { status: 500 });
  }
};

export default function CurrentWorkoutRoute() {
  const currentMesocycle = useLoaderData();

  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <CurrentWorkout data={currentMesocycle} />
      </div>
    </ProtectedRoute>
  );
}
