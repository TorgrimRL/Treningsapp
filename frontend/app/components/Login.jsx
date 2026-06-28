import { useEffect } from "react";

export default function Login() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const loginUrl = `${baseUrl}/auth0/login`;

  useEffect(() => {
    window.location.href = loginUrl;
  }, [loginUrl]);

  return (
    <div className="text-white" style={{ paddingTop: "60px", textAlign: "center" }}>
      <button
        data-testid="auth0-login"
        type="button"
        onClick={() => {
          window.location.href = loginUrl;
        }}
        className="bg-white text-black border-none py-2 px-4 cursor-pointer text-lg"
      >
        Continue with Auth0
      </button>
    </div>
  );
}
