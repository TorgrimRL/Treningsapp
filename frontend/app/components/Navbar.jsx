import React, { useState } from "react";
import { Form } from "@remix-run/react";

export default function Navbar({ isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: "#fff",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-black text-xl font-bold">My App</div>
        <div className="md:hidden relative">
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
            }}
          >
            ☰
          </button>
        </div>
        <div className="hidden md:flex md:space-x-4">
          <a href="/" className="text-white">
            Home
          </a>
          {!isLoggedIn && (
            <a href="/login" className="text-white">
              Login
            </a>
          )}
          {!isLoggedIn && (
            <a href="/register" className="text-white">
              Register
            </a>
          )}
          {isLoggedIn && (
            <>
              <a href="/mesocycles/new" className="text-white">
                Plan a new mesocycle
              </a>
              <Form method="post" action="/logout">
                <button type="submit" className="text-white">
                  Logout
                </button>
              </Form>
            </>
          )}
        </div>
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10 md:hidden">
            <ul className="py-1">
              <li>
                <a
                  href="/"
                  className="block px-2 py-2 text-gray-800 hover:bg-gray-200"
                >
                  Home
                </a>
              </li>
              {!isLoggedIn && (
                <li>
                  <a
                    href="/login"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    Login
                  </a>
                </li>
              )}
              {!isLoggedIn && (
                <li>
                  <a
                    href="/register"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    Register
                  </a>
                </li>
              )}
              {isLoggedIn && (
                <>
                  <li>
                    <a
                      href="/mesocycles/new"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Plan a new mesocycle
                    </a>
                  </li>
                  <li>
                    <Form method="post" action="/logout">
                      <button
                        type="submit"
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Logout
                      </button>
                    </Form>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
