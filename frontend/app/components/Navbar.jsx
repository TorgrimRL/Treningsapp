import React, { useState } from "react";
import { Form } from "@remix-run/react";

export default function Navbar({ isLoggedIn }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

  return (
    <nav className="bg-gray-800 p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">My App</div>
        <div className="md:hidden relative">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            ☰
          </button>
        </div>
       <div className="hidden md:flex md:space-x-4">
        <a href="/" className="text-white">Home</a>
        {!isLoggedIn && <a href="/login" className="text-white">Login</a>}
        {!isLoggedIn && <a href="/register" className="text-white">Register</a>}
        {isLoggedIn && (
            <>
                <Form method="post" action="/logout">
                    <button type="submit" className="text-white">Logout</button>
                </Form>
            </>
        )}
       </div>
       {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-10 md:hidden">
            <ul className="py-1">
                <li><a href="/" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Home</a></li>
                {!isLoggedIn && <li><a href="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Login</a></li>}
                {!isLoggedIn && <li><a href="/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Register</a></li>}
                {isLoggedIn && (
                    <>
                        <li>
                            <Form method="post" action="/logout">
                                <button type="submit" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">Logout</button>
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