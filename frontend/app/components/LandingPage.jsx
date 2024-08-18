import React from "react";
import { Link } from "@remix-run/react";

function LandingPage() {
  return (
    <div className="relative h-screen overflow-hidden flex flex-col justify-center items-center">
      <img
        src="/images/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
      />
      <div className="relative z-10 text-center flex flex-col items-center justify-center">
        <h1 className="text-white text-4xl md:text-6xl">
          Muscle Growth Made Simple
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mt-4">
          No more guesswork. Just Results
        </p>
        <Link
          to="/register"
          className="bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-full hover:bg-red-700 transition duration-300 mt-6"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
