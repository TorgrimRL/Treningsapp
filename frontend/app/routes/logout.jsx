import { redirect } from "@remix-run/node";
import Logout from "../components/Logout";

export const action = async () => {
  return redirect("/login", {
    headers: {
      "Set-Cookie": "token=; Path=/; Max-Age=0; HttpOnly",
    },
  });
};

export default function LogoutRoute() {
  return <Logout />;
}
