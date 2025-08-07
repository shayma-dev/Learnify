import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ModalsProvider } from '@mantine/modals';
import Profile from "./pages/Profile";
import ProtectedRoute from "./utils/ProtectedRoute";
import TaskManager from "./pages/TaskManager.jsx";

const App = () => {
  return (
      <ModalsProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<TaskManager />} />
              {/* إذا كنت بحاجة إلى صفحة LandingPage، ألغِ تعليق السطر التالي */}
              {/* <Route path="/Landingpage" element={<LandingPage />} /> */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ModalsProvider>
  );
};

export default App;
