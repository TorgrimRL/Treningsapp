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
import { WaitModalProvider } from "./components/WaitModalContext";
import GlobalWaitModal from "./components/GlobalWaitModal";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SetOptimizer</title>
        <link rel="icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-darkestGray text-white">
        <WaitModalProvider>
          <AuthProvider>
            <div id="root" className="flex min-h-screen flex-col pt-12">
              <Navbar />
              <main className="min-w-0 flex-1">
                <Outlet />
              </main>
              <footer
                data-testid="site-footer"
                className="border-t border-gray-800 text-gray-400"
              >
                <div className="mx-auto w-full max-w-7xl px-4 py-6 text-center">
                  <p>&copy; 2026 SETOPTIMIZER.COM</p>
                </div>
              </footer>
            </div>
            <GlobalWaitModal />
          </AuthProvider>
        </WaitModalProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
