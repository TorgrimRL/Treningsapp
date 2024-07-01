import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import Navbar from "./components/Navbar";
import "./tailwind.css";

export const loader = async ({ request }) => {
  const isLoggedIn = Boolean(request.headers.get("Cookie")?.includes("token"));
  return json({ isLoggedIn });
};

export default function Root() {
  const { isLoggedIn } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar isLoggedIn={isLoggedIn} />
        <main>
          <Outlet />
        </main>
        <footer>
          <p>&copy; 2024 My App</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
