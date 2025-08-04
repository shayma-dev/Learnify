// src/pages/ProfilePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();

    // Redirect to landing page if user is not logged in
    if (!user) {
        return <Navigate to="/" />;
    }

    return (
        <div>
            <h1>Profile</h1>
            <div>
                <h2>Welcome, {user.username}</h2>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
};

export default Profile;