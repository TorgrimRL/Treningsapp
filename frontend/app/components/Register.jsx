import { useEffect } from "react";

export default function Register() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const registerUrl = `${baseUrl}/auth0/register`;

  useEffect(() => {
    window.location.href = registerUrl;
  }, [registerUrl]);

  return (
    <div className="text-white" style={{ paddingTop: "60px", textAlign: "center" }}>
      <button
        data-testid="auth0-register"
        type="button"
        onClick={() => {
          window.location.href = registerUrl;
        }}
        className="bg-white text-black border-none py-2 px-4 cursor-pointer text-lg"
      >
        Sign up with Auth0
      </button>
    </div>
  );
}
