import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
    const token = localStorage.getItem("token");

    if(!token) {
        return <Navigate to="/signin" />
    }

    return <Outlet />
}

export default ProtectedRoutes