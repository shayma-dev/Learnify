import { Outlet, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "../context/UserContext.jsx";

const ProtectedRoutes = () => {
    const { user } = useUser(); // Check if user is authenticated
    return user ? <Outlet /> : <Navigate to="/login" />; // Redirect to login if not authenticated
}

export default ProtectedRoutes;