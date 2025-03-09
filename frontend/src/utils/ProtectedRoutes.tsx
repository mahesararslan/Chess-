import axios from "axios";
import { useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";

const ProtectedRoutes = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    
    useEffect(() => {
        async function fetchTokenValidation(token : string | null) {
            if(!token) {
                navigate("/signin")
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_NODE_BACKEND_URL}/get-user`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if(!response.data.name) {
                    navigate("/signin")
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                navigate("/signin")
            }
        }
        fetchTokenValidation(token);
        
    })

    if(!token) {
        return <Navigate to="/signin" />
    }

    return <Outlet />
}

export default ProtectedRoutes