import { useEffect, useRef, useState } from "react";
import { Link } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../utils/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { authCheckInProgress, isLoggedIn } = useAuth();
  const menuRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL;
  const showLoggedInNav = isLoggedIn === true;
  const showLoggedOutNav = !authCheckInProgress && isLoggedIn === false;

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.assign(`${baseUrl}/auth0/logout`);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen((open) => !open);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 30,

        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className=" mx-auto flex justify-between items-center px-4 py-2 text-white bg-black">
        <Link to="/" className="text-red-500 text-2xl font-bold">
          SO
        </Link>
        <div className="md:hidden relative">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
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
          <Link to="/" className="text-white h-full flex items-center ">
            Home
          </Link>
          {showLoggedOutNav && (
            <a
              href={`${baseUrl}/auth0/login`}
              className="text-white h-full flex items-center "
            >
              Login
            </a>
          )}
          {showLoggedOutNav && (
            <a
              href={`${baseUrl}/auth0/register`}
              className="text-white h-full flex items-center "
            >
              Register
            </a>
          )}
          {showLoggedInNav && (
            <>
              <Link
                to="/currentworkout"
                className="text-white h-full flex items-center "
              >
                Current workout
              </Link>
              <Link
                to="/mesocycles-new"
                className="text-white h-full flex items-center"
              >
                Plan a new training block
              </Link>
              <Link
                to="/templates"
                className="text-white h-full flex items-center "
              >
                Templates
              </Link>
              <Link
                to="/mesocycles"
                className="text-white h-full flex items-center "
              >
                History
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-white h-full flex items-center px-4 py-2 hover:bg-darkGray"
              >
                Logout
              </button>
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
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="focus:outline-none block w-full text-left cursor-pointer"
                >
                  Home
                </Link>
              </li>
              {showLoggedOutNav && (
                <li className="block px-4 py-2 hover:bg-darkGray ">
                  <a
                    href={`${baseUrl}/auth0/login`}
                    className="focus:outline-none block w-full text-left cursor-pointer"
                  >
                    Login
                  </a>
                </li>
              )}
              {showLoggedOutNav && (
                <li className="block px-4 py-2 hover:bg-darkGray ">
                  <a
                    href={`${baseUrl}/auth0/register`}
                    className="focus:outline-none block w-full text-left cursor-pointer"
                  >
                    Register
                  </a>
                </li>
              )}
              {showLoggedInNav && (
                <>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <Link
                      to="/currentworkout"
                      onClick={closeMenu}
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      Current workout
                    </Link>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <Link
                      to="/mesocycles-new"
                      onClick={closeMenu}
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      New training block
                    </Link>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <Link
                      to="/templates"
                      onClick={closeMenu}
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      Templates
                    </Link>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <Link
                      to="/mesocycles"
                      onClick={closeMenu}
                      className="focus:outline-none block w-full text-left cursor-pointer"
                    >
                      History
                    </Link>
                  </li>
                  <li className="block px-4 py-2 hover:bg-darkGray ">
                    <button
                      type="button"
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
    </nav>
  );
}
