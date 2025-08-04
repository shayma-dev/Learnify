// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom'; // Import Navigate

const LandingPage = () => {
    const { login, signup, user } = useAuth(); // Destructure user from context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [redirect, setRedirect] = useState(false); // State for redirection

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await signup(email, password, username);
            // Optionally, redirect to profile after successful signup
            setRedirect(true);
        } catch (error) {
            setErrorMessage(error.response.data.error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            setRedirect(true); // Redirect to profile upon successful login
        } catch (error) {
            setErrorMessage(error.response.data.error);
        }
    };

    // If redirect is true, navigate to the Profile page
    if (redirect || user) {
        return <Navigate to="/profile" />;
    }

    return (
        <div>
            <h1>Welcome to Learnify</h1>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Sign Up</button>
            </form>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LandingPage;