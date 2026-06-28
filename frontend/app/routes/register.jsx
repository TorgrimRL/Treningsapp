import { useEffect } from "react";

export default function RegisterPage() {
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    window.location.replace(`${baseUrl}/auth0/register`);
  }, [baseUrl]);

  return null;
}
