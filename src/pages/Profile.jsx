import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Hide the install button after installation
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;

    // Reset the deferred prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

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
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {isInstallable && (
          <button onClick={handleInstall} style={{ padding: "10px 28px", fontSize: 15, background: "var(--primary)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
            Install App
          </button>
        )}
        <button onClick={handleLogout} style={{ padding: "10px 28px", fontSize: 15, background: "var(--danger-light)", color: "var(--danger)", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;
