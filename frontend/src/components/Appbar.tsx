import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Avatar } from "./Avatar";

export const Appbar = () => {
    const [name, setName] = useState<string>("");

    // Get User Data from Backend
    const getUser = async (token: string) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data.name
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    // Fetch user data on mount
    useEffect(() => { 
        const token = localStorage.getItem("token");
        if (token) {
            getUser(token)
                .then((name) => {
                    if (name) {
                        console.log("Setting name:", name);
                        setName(name); // Set user's name
                    }
                });
        }
    }, []); // Only runs once on mount

    const haneleLogout = () => {
        localStorage.removeItem("token");
        setName(""); // Clear user's name
    };

    return (
        <div>
            <div className="bg-stone-700 h-16 flex justify-between items-center w-screen">
                <div className="ml-8">
                    <img src="/chess-logo.png" width={150} alt="Logo" />
                </div>
                
                {Boolean(name) ? ( 
                    // Render Avatar if the name exists
                    <div className="mr-8 flex gap-2">
                        <button onClick={haneleLogout} className="text-white font-bold py-2 px-3 bg-stone-700 rounded-lg hover:bg-stone-800">
                            Logout
                        </button>
                        <Avatar name={name} size="big" />
                    </div>
                ) : (
                    // Render Login and Signup buttons if the user is not logged in
                    <div className="mr-8 flex gap-2">
                        <Link to="/signup">
                            <button className="text-white font-bold py-2 px-3 bg-lime-700 rounded-md hover:bg-lime-500">
                                Signup
                            </button>
                        </Link>
                        <Link to="/signin">
                            <button className="text-white font-bold py-2 px-3 bg-stone-700 rounded-lg hover:bg-stone-800">
                                Login
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};