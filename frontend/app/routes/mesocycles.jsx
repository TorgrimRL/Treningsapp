import { json } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";
import MesocycleOverview from "../components/MesocycleOverview";
import ProtectedRoute from "../components/ProtectedRoute";

// Loader function to fetch mesocycle data from the backend
export let loader = async ({ request }) => {
  const baseUrl = import.meta.env.VITE_API_URL; // Bruk `import.meta.env` for miljøvariabler

  const cookieHeader = request.headers.get("Cookie");

  try {
    // Fetch mesocycles fra backend
    const response = await fetch(`${baseUrl}/mesocycles`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch mesocycles: ${errorText}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error fetching mesocycles:", error);
    throw new Response("Failed to fetch data", { status: 500 });
  }
};

export default function Mesocycles() {
  const mesocycles = useLoaderData(); // Bruke loader data i stedet for å fetche i komponenten

  return (
    <ProtectedRoute>
      <div style={{ paddingTop: "30px" }}>
        <MesocycleOverview data={mesocycles} />
      </div>
    </ProtectedRoute>
  );
}
