import React, { useEffect, useState } from "react";

const MesocycleOverview = () => {
  const [mesocycles, setMesocycles] = useState([]);

  useEffect(() => {
    const fetchMesocycles = async () => {
      try {
        const response = await fetch("http://localhost:3000/mesocycles", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setMesocycles(data);
      } catch (error) {
        console.error("Error fetching mesocycles:", error);
      }
    };
    fetchMesocycles();
  }, []);

  return (
    <div>
      <h2>Mesocycles Overview</h2>
      <ul>
        {mesocycles.map((mesocycle) => (
          <li key={mesocycle.id}>
            {mesocycle.name} - {mesocycle.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MesocycleOverview;
