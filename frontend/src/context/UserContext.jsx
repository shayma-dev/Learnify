import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../api/authService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const fetchUserProfile = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData.user); // Use userData.user to access the user details
            localStorage.setItem('user', JSON.stringify(userData.user)); // Save user to localStorage
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };

    useEffect(() => {
        fetchUserProfile(); // Fetch user on app initialization
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Clear user on logout
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    return useContext(UserContext);
};