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

const vippsDonationUrl =
  "https://qr.vipps.no/box/89367565-e970-4b18-89ab-6a35c66c09b3/pay-in";

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
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <p className="text-sm">
                      Enjoying SetOptimizer? Help support continued development.
                    </p>
                    <a
                      data-testid="vipps-donation-link"
                      href={vippsDonationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center border border-red-600 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                    >
                      Support with Vipps
                    </a>
                  </div>
                  <p className="mt-4 text-xs">&copy; 2026 SETOPTIMIZER.COM</p>
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
