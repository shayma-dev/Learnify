import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import ProtectedRoutes from "./utils/ProtectedRoute";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LandingPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          {/* You can nest more protected routes here */}
        </Route>
      </Routes>
    </>
  );
};

export default App;
