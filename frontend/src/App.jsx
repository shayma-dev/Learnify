import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import TasksPage from "./pages/TasksPage";
import NotFound from "./pages/NotFound";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import NoteKeeperPage from "./pages/NoteKeeperPage";  
import HabitsPage from "./pages/HabitsPage";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Authenticated area */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/study" element={<StudyPlannerPage />} />
              <Route path="/notekeeper" element={<NoteKeeperPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              {/* other authed routes */}
            </Route>

            {/* Catch-all 404 (keep last) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
