import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import Navbar from "./components/Navbar";
import "./tailwind.css";
import { AuthProvider } from "./utils/AuthContext";
import {
  CurrentWorkoutQueryLifecycle,
  QueryProvider,
} from "./utils/QueryProvider";
import OnboardingGate from "./features/onboarding/OnboardingGate";

const vippsDonationUrl =
  "https://qr.vipps.no/box/89367565-e970-4b18-89ab-6a35c66c09b3/pay-in";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>SetOptimizer</title>
        <link rel="icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-darkestGray text-white">
        <QueryProvider>
            <AuthProvider>
              <OnboardingGate>
                <CurrentWorkoutQueryLifecycle />
                <div
                    id="root"
                    className="flex min-h-screen flex-col pt-[calc(3rem+env(safe-area-inset-top))] antialiased"
                >
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
                    <p className="mt-4 text-xs">
                      <Link to="/privacy" className="underline hover:text-white">
                        Privacy Policy
                      </Link>
                    </p>
                    <p className="mt-2 text-xs">&copy; 2026 SETOPTIMIZER.COM</p>
                  </div>
                </footer>
                </div>
              </OnboardingGate>
            </AuthProvider>
          </QueryProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred.";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>SetOptimizer</title>
        <Links />
      </head>
      <body className="min-h-screen bg-darkestGray text-white">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-sm text-sm text-gray-400">{message}</p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="inline-flex min-h-11 items-center justify-center border border-red-600 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-600 hover:text-white"
          >
            Go back home
          </button>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
