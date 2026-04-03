import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, background: "var(--bg-surface)", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <img src={user.photoURL} alt="profile" width={64} style={{ borderRadius: "50%" }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 20, color: "var(--text)" }}>{user.displayName}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{user.email}</div>
        </div>
      </div>
      <button onClick={handleLogout} style={{ padding: "10px 28px", fontSize: 15, background: "var(--danger-light)", color: "var(--danger)", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>Logout</button>
    </div>
  );
};

export default Profile;
