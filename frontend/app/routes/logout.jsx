import { redirect } from "@remix-run/node";

export const action = async ({ request }) => {

    try {
        const response = await fetch('http://localhost:3000/logout',{
            method:'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to logout');
        }
        
        return redirect("/login",{
            headers: {
                "Set-Cookie": "token=; httpOnly; Path=/; Max-Age=0",
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
        return redirect("/login");
    }
};
