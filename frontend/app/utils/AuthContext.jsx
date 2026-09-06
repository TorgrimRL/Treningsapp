import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { submitCsrfLogout } from "./logout";

const APP_ID = "com.setoptimizer.app";
const AuthContext = createContext();

function normalizeDomain(value) {
  return value?.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function getNativeAuthConfig() {
  const domain = normalizeDomain(import.meta.env.VITE_AUTH0_DOMAIN);
  const clientId = import.meta.env.VITE_AUTH0_IOS_CLIENT_ID?.trim();
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim();

  return {
    audience,
    clientId,
    domain,
    callbackUrl: domain
      ? `${APP_ID}://${domain}/capacitor/${APP_ID}/callback`
      : null,
    enabled: Boolean(domain && clientId && audience),
  };
}

function WebAuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  const logoutLocally = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  const setAuthStatus = useCallback((status) => {
    setIsLoggedIn(status);
    if (!status) {
      setCurrentUser(null);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        logoutLocally();
        return;
      }

      const data = await response.json();
      const user = data.isLoggedIn ? data.user || null : null;
      setIsLoggedIn(Boolean(user));
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      logoutLocally();
    } finally {
      setAuthCheckInProgress(false);
    }
  }, [baseUrl, logoutLocally]);

  const startLogin = useCallback(() => {
    window.location.replace(`${baseUrl}/auth0/login`);
  }, [baseUrl]);

  const startRegistration = useCallback(() => {
    window.location.replace(`${baseUrl}/auth0/register`);
  }, [baseUrl]);

  const performLogout = useCallback(async () => {
    const response = await fetch(`${baseUrl}/csrf-token`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to get a CSRF token");
    }

    const { csrfToken } = await response.json();
    if (!csrfToken) {
      throw new Error("CSRF token response was invalid");
    }

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    submitCsrfLogout({ baseUrl, csrfToken });
  }, [baseUrl]);

  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        onboardingStatus: currentUser?.onboardingStatus || null,
        login: () => setIsLoggedIn(true),
        logout: logoutLocally,
        setAuthStatus,
        checkAuthStatus,
        authCheckInProgress,
        usesBearerAuth: false,
        getAccessToken: null,
        startLogin,
        startRegistration,
        performLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function NativeAuthContextProvider({ children, callbackUrl }) {
  const {
    getAccessTokenSilently,
    handleRedirectCallback,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  const logoutLocally = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  const syncCurrentUser = useCallback(
    async (providedToken) => {
      try {
        const accessToken =
          providedToken || (await getAccessTokenSilently());
        const response = await fetch(`${baseUrl}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          logoutLocally();
          return;
        }

        const data = await response.json();
        const user = data.isLoggedIn ? data.user || null : null;
        setIsLoggedIn(Boolean(user));
        setCurrentUser(user);
      } catch (error) {
        if (error?.error !== "login_required") {
          console.error("Failed to check native auth status:", error);
        }
        logoutLocally();
      } finally {
        setAuthCheckInProgress(false);
      }
    },
    [baseUrl, getAccessTokenSilently, logoutLocally]
  );

  const handleAppUrl = useCallback(
    async ({ url }) => {
      if (url?.split(/[?#]/, 1)[0] !== callbackUrl) {
        return;
      }

      try {
        const callback = new URL(url);
        const isLoginCallback =
          callback.searchParams.has("code") ||
          callback.searchParams.has("error");

        if (isLoginCallback) {
          await handleRedirectCallback(url);
          await syncCurrentUser(await getAccessTokenSilently());
        } else {
          logoutLocally();
          setAuthCheckInProgress(false);
        }
      } catch (error) {
        console.error("Unable to complete Auth0 callback:", error);
        logoutLocally();
        setAuthCheckInProgress(false);
      } finally {
        await Browser.close().catch(() => {});
      }
    },
    [
      callbackUrl,
      getAccessTokenSilently,
      handleRedirectCallback,
      logoutLocally,
      syncCurrentUser,
    ]
  );

  useEffect(() => {
    const listenerPromise = App.addListener("appUrlOpen", handleAppUrl);

    return () => {
      void listenerPromise.then((listener) => listener.remove());
    };
  }, [handleAppUrl]);

  useEffect(() => {
    if (!isLoading) {
      void App.getLaunchUrl().then(async (launchUrl) => {
        if (
          launchUrl?.url?.split(/[?#]/, 1)[0] === callbackUrl
        ) {
          await handleAppUrl(launchUrl);
          return;
        }

        await syncCurrentUser();
      });
    }
  }, [callbackUrl, handleAppUrl, isLoading, syncCurrentUser]);

  const startLogin = useCallback(
    () =>
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
        openUrl: (url) => Browser.open({ url }),
      }),
    [loginWithRedirect]
  );

  const startRegistration = useCallback(
    () =>
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
        authorizationParams: { screen_hint: "signup" },
        openUrl: (url) => Browser.open({ url }),
      }),
    [loginWithRedirect]
  );

  const performLogout = useCallback(async () => {
    logoutLocally();
    await auth0Logout({
      logoutParams: { returnTo: callbackUrl },
      openUrl: (url) => Browser.open({ url }),
    });
  }, [auth0Logout, callbackUrl, logoutLocally]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      currentUser,
      onboardingStatus: currentUser?.onboardingStatus || null,
      login: () => setIsLoggedIn(true),
      logout: logoutLocally,
      setAuthStatus: (status) => {
        setIsLoggedIn(status);
        if (!status) setCurrentUser(null);
      },
      checkAuthStatus: syncCurrentUser,
      authCheckInProgress,
      usesBearerAuth: true,
      getAccessToken: getAccessTokenSilently,
      startLogin,
      startRegistration,
      performLogout,
    }),
    [
      authCheckInProgress,
      currentUser,
      getAccessTokenSilently,
      isLoggedIn,
      logoutLocally,
      performLogout,
      startLogin,
      startRegistration,
      syncCurrentUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function MissingNativeAuthProvider({ children }) {
  const unavailable = useCallback(async () => {
    throw new Error(
      "Native Auth0 requires VITE_AUTH0_DOMAIN, VITE_AUTH0_IOS_CLIENT_ID and VITE_AUTH0_AUDIENCE"
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: false,
        currentUser: null,
        onboardingStatus: null,
        login: unavailable,
        logout: () => {},
        setAuthStatus: () => {},
        checkAuthStatus: unavailable,
        authCheckInProgress: false,
        usesBearerAuth: true,
        getAccessToken: unavailable,
        startLogin: unavailable,
        startRegistration: unavailable,
        performLogout: unavailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function NativeAuthProvider({ children }) {
  const config = getNativeAuthConfig();
  if (!config.enabled) {
    return <MissingNativeAuthProvider>{children}</MissingNativeAuthProvider>;
  }

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        audience: config.audience,
        redirect_uri: config.callbackUrl,
        scope: "openid profile email offline_access",
      }}
      cacheLocation="memory"
      useRefreshTokens
      useRefreshTokensFallback={false}
    >
      <NativeAuthContextProvider callbackUrl={config.callbackUrl}>
        {children}
      </NativeAuthContextProvider>
    </Auth0Provider>
  );
}

export function AuthProvider({ children }) {
  return Capacitor.isNativePlatform() ? (
    <NativeAuthProvider>{children}</NativeAuthProvider>
  ) : (
    <WebAuthProvider>{children}</WebAuthProvider>
  );
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}

export function useAuth() {
  const context = useOptionalAuth();
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
