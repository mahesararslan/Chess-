import { useEffect, useState } from "react"
import UserAccountInfo from "../components/UserAccountInfo"
import axios from "axios";

const Profile = () => {
    const [user, setUser] = useState(null);
    
    useEffect(() => { 
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token found, redirecting to login");
        }

            const response = axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setUser(response.data);
            }).catch((error) => {
                console.error("Error fetching user:", error);
            });
    }, []); 

    return <div className="h-screen bg-stone-700">
        {/* @ts-ignore */}
        <UserAccountInfo name={user.name} username={user.email} totalGames={user.total_games} wins={user.wins} draws={user.draws} losses={user.losses} />
    </div>
}

export default Profile