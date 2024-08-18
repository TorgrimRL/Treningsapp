import React, { useState } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Navbar from "./components/Navbar";
import "./tailwind.css";
import { AuthProvider } from "./utils/AuthContext";

export default function Root() {
  const [isWarningVisible, setIsWarningVisible] = useState(true);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-darkestGray text-white">
        <AuthProvider>
          <Navbar />
          <main>
            <Outlet />
          </main>
          <footer className="text-gray-400">
            <p>&copy; 2024 SETOPTIMIZER.COM</p>
          </footer>
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />

        {/* Warning div for large screens */}
        {isWarningVisible && (
          <div className="hidden lg:flex fixed inset-0 bg-black bg-opacity-80 z-50 flex-col justify-center items-center text-center p-6">
            <div className="relative bg-darkestGray text-white p-8 rounded-lg shadow-lg max-w-lg">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setIsWarningVisible(false)}
              >
                &#x2715;
              </button>
              <h2 className="text-3xl font-bold mb-4">
                Optimized for Mobile Use
              </h2>
              <p className="text-lg">
                Please access this application on a mobile device for the best
                experience. To disable this popup, switch to mobile mode: Press
                Ctrl + Shift + M on Windows or Linux, or Cmd + Shift + M on
                macOS.
              </p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
