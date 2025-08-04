import React from "react";
import { useUser } from "../context/UserContext"; // Adjust path as necessary

const Profile = () => {
    const { user } = useUser(); // Get the user from context

    return (
        <div>
            <h2>Profile Page</h2>
            {user ? (
                <div>
                    <h3>Welcome, {user.username}</h3>
                    <p>Email: {user.email}</p>
                    {/* Add other details you want to show */}
                </div>
            ) : (
                <p>No user data available.</p>
            )}
        </div>
    );
};

export default Profile;