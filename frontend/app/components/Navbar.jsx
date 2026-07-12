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
      ref={menuRef}
      data-testid="navbar"
      className="fixed inset-x-0 top-0 z-30 h-12 bg-black shadow-md"
    >
      <div
        data-testid="navbar-content"
        className="relative flex h-12 w-full items-center justify-between px-4 text-white md:px-6"
      >
        <Link
          to="/"
          data-testid="navbar-brand"
          className="shrink-0 text-2xl font-bold text-red-500"
        >
          SO
        </Link>
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            data-testid="navbar-menu-button"
            className="flex h-10 w-10 items-center justify-center text-xl text-white focus:outline-none"
          >
            <FontAwesomeIcon icon={faBars} size="1x" />
          </button>
        </div>
        <div
          data-testid="navbar-desktop-menu"
          className="hidden h-full min-w-0 items-center gap-3 text-sm md:flex lg:gap-5 lg:text-base"
        >
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
                className="flex h-full items-center px-2 py-2 text-white hover:bg-darkGray lg:px-4"
              >
                Logout
              </button>
            </>
          )}
        </div>
        {isOpen && (
          <div className="absolute right-4 top-12 z-[1000] w-48 rounded-md bg-white shadow-lg md:hidden">
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
