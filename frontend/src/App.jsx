import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
