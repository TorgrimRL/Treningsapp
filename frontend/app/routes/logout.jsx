import { redirect } from "@remix-run/react";

export const action = async ({ request }) => {

    try {
        
    } catch (error) {
        console.error('Logout error:', error);
        return redirect("/login");
    }
};
