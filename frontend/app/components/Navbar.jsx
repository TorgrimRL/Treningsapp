import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../utils/AuthContext";
import { Link } from "@remix-run/react";
import Logout from "./Logout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, setAuthStatus, checkAuthStatus } = useAuth();
  const menuRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const [showLogout, setShowLogout] = useState(false);
  const handleLogout = (e) => {
    e.stopPropagation();
    if (!showLogout) {
      setShowLogout(true);
    }
  };
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
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 30,

        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className=" mx-auto flex justify-between items-center px-4 py-2 text-white bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <Link to="/" className="text-red-500 text-2xl font-bold">
          SO
        </Link>
        <div className="md:hidden relative">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none text-xl"
            style={{
              position: "fixed",
              top: "10px",
              right: "15px",
            }}
          >
            <FontAwesomeIcon icon={faBars} size="1x" />
          </button>
        </div>
        <div className="hidden md:flex md:space-x-4 h-full items-center ">
          <a
            href="/"
            className="text-white h-full flex items-center hover:bg-gray-700"
          >
            Home
          </a>
          {!isLoggedIn && (
            <a
              href="/login"
              className="text-white h-full flex items-center hover:bg-gray-700"
            >
              Login
            </a>
          )}
          {!isLoggedIn && (
            <a
              href="/register"
              className="text-white h-full flex items-center hover:bg-gray-700"
            >
              Register
            </a>
          )}
          {isLoggedIn && (
            <>
              <a
                href="/currentworkout"
                className="text-white h-full flex items-center hover:bg-gray-700"
              >
                Current workout
              </a>
              <a
                href="/mesocycles-new"
                className="text-white h-full flex items-center hover:bg-gray-700"
              >
                Plan a new training block
              </a>
              <a
                href="/templates"
                className="text-white h-full flex items-center hover:bg-gray-700"
              >
                Templates
              </a>

              <li className="block px-4 py-2 hover:bg-darkGray">
                <button
                  onClick={handleLogout}
                  className="text-white h-full flex items-center hover:bg-gray-700"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </div>
        {isOpen && (
          <div
            className="fixed right-0 top-12 w-48 bg-white rounded-md shadow-lg z-[1000] md:hidden"
            ref={menuRef}
          >
            <ul className="py-1 bg-hamburgerbackground text-white ">
              <li className="block px-4 py-2 hover:bg-darkGray ">
                <a
                  href="/"
                  className="focus:outline-none block w-full text-left cursor-pointer"
                >
                  Home
                </a>
              </li>
              {!isLoggedIn && (
                <li className="block px-4 py-2 hover:bg-darkGray ">
                  <a
                    href="/login"
                    className="focus:outline-none block w-full text-left cursor-pointer"
                  >
                    Login
                  </a>
                </li>
              )}
              {!isLoggedIn && (
                <li className="block px-4 py-2 hover:bg-darkGray ">
                  <a
                    href="/register"
                    className="focus:outline-none block w-full text-left cursor-pointer"
                  >
                    Register
                  </a>
                </li>
              )}
              {isLoggedIn && (
                <>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <a
                      href="/currentworkout"
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      Current workout
                    </a>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <a
                      href="/mesocycles-new"
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      New training block
                    </a>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <a
                      href="/templates"
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      Templates
                    </a>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <a
                      href="/mesocycles"
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      History
                    </a>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <button
                      onClick={handleLogout}
                      className="text-white h-full flex items-center hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
      {showLogout && <Logout />}
    </nav>
  );
}
