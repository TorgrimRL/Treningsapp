import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "@remix-run/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, setAuthStatus, checkAuthStatus } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;
  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        document.cookie =
          "token=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=None";
        setAuthStatus(false);
        await checkAuthStatus();
        // navigate("/login");
      } else {
        console.error("Logout failed:", response.status);
      }
    } catch (error) {
      console.error("Logout error:", error);
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 5,

        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className=" mx-auto flex justify-between items-center px-4 py-3 text-white bg-darkGray"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white bg-darkGray text-xl font-bold">My App</div>
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
            ☰
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
              <form
                method="post"
                action="/logout"
                className="h-full flex items-center"
              >
                <button
                  onClick={handleLogout}
                  className="text-white h-full flex items-center hover:bg-gray-700"
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
                    <form method="post" action="/logout">
                      <button
                        onClick={handleLogout}
                        className="text-white h-full flex items-center hover:bg-gray-700"
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
