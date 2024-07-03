import React, { useState } from "react";
import { Form } from "@remix-run/react";

export default function Navbar({ isLoggedIn }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">My App</div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            ☰
          </button>
        </div>
        <div className={`md:flex ${isOpen ? 'block' : 'hidden'} md:w-auto flex-col md:flex-row md:ml-auto mt-4 md:mt-0`}>
          <ul className="md:flex md:space-x-4 mt-4 md:mt-0 md:flex-row flex-col items-center w-full md:w-auto">
            <li className="text-white md:mr-auto"><a href="/" className="block">Home</a></li>
            {!isLoggedIn && <li className="text-white"><a href="/login" className="block">Login</a></li>}
            {!isLoggedIn && <li className="text-white"><a href="/register" className="block">Register</a></li>}
            {isLoggedIn && (
              <>
                <li className="text-white">
                  <Form method="post" action="/logout">
                    <button type="submit" className="block">Logout</button>
                  </Form>
                </li>
                <li className="text-white"><a href="/app" className="block">Dashboard</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}