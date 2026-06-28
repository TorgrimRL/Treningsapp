import { useEffect } from "react";

export default function LoginPage() {
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    window.location.replace(`${baseUrl}/auth0/login`);
  }, [baseUrl]);

  return null;
}
