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

            axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setUser(response.data);
                console.log("User", user);
            }).catch((error) => {
                console.error("Error fetching user:", error);
            });
    }, []); 

    if(!user) return <div>Loading...</div>

    return <div className="h-screen bg-stone-700">
        {/* @ts-ignore */}
        <UserAccountInfo name={user.name} username={user.username} totalGames={user.total_games} wins={user.wins} draws={user.draws} losses={user.losses} />
    </div>
}

export default Profile