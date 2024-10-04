import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Avatar } from "./Avatar";

export const Appbar = () => {
    const [name, setName] = useState<string>("");

    
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

    
    useEffect(() => { 
        const token = localStorage.getItem("token");
        if (token) {
            getUser(token)
                .then((name) => {
                    if (name) {
                        console.log("Setting name:", name);
                        setName(name); 
                    }
                });
        }
    }, []); 

    const haneleLogout = () => {
        localStorage.removeItem("token");
        setName(""); 
    };

    return (
        <div>
            <div className="bg-stone-700 h-16 flex justify-between items-center w-screen">
                <div className="ml-2 md:ml-8">
                    <Link to={"/"}><img src="/chess-logo.png" width={150} alt="Logo" /></Link>
                </div>
                
                {Boolean(name) ? ( 
                    <div className="mr-2 md:mr-8 flex gap-1 md:gap-2">
                        <button onClick={haneleLogout} className="text-white font-bold py-2 px-3 bg-stone-700 rounded-lg hover:bg-stone-800">
                            Logout
                        </button>
                        <Avatar name={name} size="small" />
                    </div>
                ) : (
                    <div className="mr-2 md:mr-8 flex gap-1 md:gap-2">
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