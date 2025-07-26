import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.js";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* add more routes as you build them */}
      </Routes>
    </Router>
  );
}
