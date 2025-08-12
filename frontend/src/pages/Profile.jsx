import React from "react";
import { useAuth } from "../context/AuthContext";
import ProfileUI from "../components/profile/ProfileUI";
export default function ProfilePage() {
  const { status, user, refresh, logout } = useAuth();
  const loading = status === "unknown";
  const error = status === "unauthenticated" ? "You are not logged in." : null;

  return (
    <ProfileUI
      user={user}
      loading={loading}
      error={error}
      onRefresh={refresh}
      onLogout={logout}
    />
  );
}
