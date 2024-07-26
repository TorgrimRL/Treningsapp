import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../utils/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    const handleClickOutSide = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutSide);
    document.addEventListener("touchstart", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
      document.removeEventListener("touchstart", handleClickOutSide);
    };
  }, [menuRef]);

  useEffect(() => {
    console.log("Isloggedin status:", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,

        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="container mx-auto flex justify-between items-center px-4 py-3 text-white bg-darkGray">
        <div className="text-white bg-darkGray text-xl font-bold">My App</div>
        <div className="md:hidden relative">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none "
            style={{
              position: "fixed",
              top: "8px",
              right: "16px",
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
              <a href="/currentworkout" className="text-white">
                Current workout
              </a>
              <a href="/mesocycles/new" className="text-white">
                Plan a new mesocycle
              </a>
              <form method="post" action="/logout">
                <button
                  type="submit"
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                >
                  Logout
                </button>
              </form>
            </>
          )}
        </div>
        {isOpen && (
          <div
            className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg z-10 md:hidden"
            ref={menuRef}
          >
            <ul className="py-1">
              <li>
                <a
                  href="/"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
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
                      href="/currentworkout"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Current workout
                    </a>
                    <a
                      href="/mesocycles"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Mesocycles
                    </a>
                  </li>
                  <li>
                    <a
                      href="/mesocycles-new"
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Plan a new mesocycle
                    </a>
                  </li>
                  <li>
                    <form method="post" action="/logout">
                      <button
                        type="submit"
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Logout
                      </button>
                    </form>
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
