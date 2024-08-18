import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Bakgrunnsbilde seksjon */}
      <div
        className="relative h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg')",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-center">
          <h1 className="text-white text-4xl md:text-6xl">
            Simplifying Muscle Growth
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-4">
            Eliminate the Guesswork. Achieve Results.
          </p>
          <Link
            to="/register"
            className="bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-full hover:bg-red-700 transition duration-300 mt-6"
          >
            Register here
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center p-10 text-center">
        <img
          src="/images/targetweightandreps.png"
          alt="Target Reps and Weight"
          className="shadow-lg max-w-full h-auto"
        />
        <p className="text-white text-lg md:text-xl mt-4">
          Get your target reps and weight based on last week's performance.
        </p>
      </div>
      <div className="relative">
        <img
          src="/images/dumbbells.jpg"
          alt="Dumbbells"
          className="shadow-lg max-w-full h-auto"
          style={{ filter: "grayscale(100%)" }}
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-center">
          <h2 className="text-white text-3xl md:text-4xl">
            Progress Even When The Weights are Taken
          </h2>
        </div>
      </div>
      <div className="flex flex-col items-center relative p-10  text-center">
        <img
          src="/images/lastweeksreps.png"
          alt="last weeks reps and weight"
          className="shadow-lg max-w-full h-auto"
        />
        <p className="text-gray-300 text-lg mt-4">
          No need to wait. Continue your progress with available weights
        </p>
        <div className="max-w-xs mt-2">
          <img
            src="/images/targetreps.png"
            alt="different weights"
            className="shadow-lg max-w-full h-auto"
          />
          <p className="text-gray-300 text-lg mt-4">
            Our app calculates the ideal weight and reps for you.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center p-10 bg-darkestGray text-center">
        <h2 className="text-3xl font-bold text-white mb-8">How it works</h2>
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              1
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-bold text-white">
                Create Your Routine
              </h3>
              <p className="text-gray-300">
                Choose from templates OR build your own custom training block.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              2
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-bold text-white">
                Begin Your Training
              </h3>
              <p className="text-gray-300">
                Get target reps and weights based on previous performance.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              3
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-bold text-white">
                Evolve and Improve
              </h3>
              <p className="text-gray-300">
                Fully customizable workouts so you can change things on the fly
                if needed in the gym.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="relative h-screen "
        style={{
          backgroundImage: "url('/images/pexels-scottwebb-28076(1).jpg')",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-center">
          {" "}
          <h1 className="text-white text-4xl md:text-6xl">
            Simplifying Muscle Growth
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-4">
            Eliminate the Guesswork. Achieve Results.
          </p>
          <Link
            to="/register"
            className="bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-full hover:bg-red-700 transition duration-300 mt-6"
          >
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
export default LandingPage;
