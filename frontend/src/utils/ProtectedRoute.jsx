// src/utils/ProtectedRoute.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ensure the path is correct

const ProtectedRoute = () => {
    const { user } = useAuth(); // Check if user is authenticated
    return user ? <Outlet /> : <Navigate to="/" />; // Redirect to login if not authenticated
};

export default ProtectedRoute;