// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Optional: Check if the user is valid when loading a critical resource, like the profile
  }, [user]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    setUser(response.data.user);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  };

  const signup = async (email, password, username) => {
    const response = await api.post("/auth/signup", {
      email,
      password,
      username,
    });
    setUser(response.data.user);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  };

  const logout = async () => {
    await api.get("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
  };

  const verifyUser = async () => {
    try {
      const response = await api.get("/auth/user");
      setUser(response.data.user);
    } catch (err) {
      console.error("Verification error:", err); // Log the error
      logout(); // If verification fails, log out
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, verifyUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
