import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
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
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=0D1117&color=fff`;

  return (
    <div className="animate-fade-in container-full" style={profileWrapper}>
      <header style={headerStyle}>
        <h1 className="glow-text" style={titleStyle}>User Profile</h1>
        <p style={subtitleStyle}>Manage your account settings and application preferences.</p>
      </header>

      <div className="glass-card" style={dossierCard}>
        <div style={profileHero}>
           <div style={avatarWrapper}>
             <img 
               src={!imgError && user.photoURL ? user.photoURL : fallbackAvatar} 
               alt="profile" 
               style={avatarImg} 
               onError={() => setImgError(true)}
             />
             <div style={statusDot}></div>
           </div>
           <div style={heroMeta}>
             <h2 style={userName}>{user.displayName || "Scholar"}</h2>
             <p style={userEmail}>{user.email}</p>
             <span style={roleBadge}>Verified User</span>
           </div>
        </div>

        <div className="profile-stats-grid" style={dossierGrid}>
          <div style={statBox}>
            <span style={statLabel}>Status</span>
            <span style={statValue}>ACTIVE</span>
          </div>
          <div style={statBox}>
            <span style={statLabel}>Auth System</span>
            <span style={statValue}>Standard</span>
          </div>
        </div>

        <div style={actionZone}>
          {isInstallable && (
            <button onClick={handleInstall} style={installBtn}>
              📲 Install Desktop App
            </button>
          )}
          <button onClick={handleLogout} style={logoutBtn}>
            Sign Out
          </button>
        </div>
      </div>

      <footer style={profileFooter}>
        <p style={footerText}>PrepHub v1.0 • Secure Connection</p>
      </footer>
    </div>
  );
}

// Styles
const profileWrapper = {
  maxWidth: "600px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const headerStyle = { textAlign: "center" };
const titleStyle = { fontSize: "32px", marginBottom: "8px" };
const subtitleStyle = { color: "hsl(var(--text-dim))", fontSize: "14px" };

const dossierCard = {
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  border: "1px solid hsla(var(--border-glass))",
};

const profileHero = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  paddingBottom: "32px",
  borderBottom: "1px solid hsla(var(--border-glass))",
};

const avatarWrapper = {
  position: "relative",
  width: "96px",
  height: "96px",
};

const avatarImg = {
  width: "100%",
  height: "100%",
  borderRadius: "24px",
  objectFit: "cover",
  border: "2px solid hsl(var(--primary))",
  boxShadow: "0 0 20px -5px hsla(var(--primary-glow))",
};

const statusDot = {
  position: "absolute",
  bottom: "-4px",
  right: "-4px",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  background: "hsl(var(--success))",
  border: "3px solid hsl(var(--bg-page))",
  boxShadow: "0 0 10px hsla(var(--success) / 0.5)",
};

const heroMeta = { display: "flex", flexDirection: "column", gap: "4px" };
const userName = { fontSize: "24px", fontWeight: "800" };
const userEmail = { fontSize: "14px", color: "hsl(var(--text-dim))" };
const roleBadge = {
  marginTop: "8px",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  padding: "4px 10px",
  background: "hsla(var(--primary) / 0.1)",
  color: "hsl(var(--primary))",
  borderRadius: "100px",
  border: "1px solid hsla(var(--primary) / 0.2)",
  width: "fit-content",
};

const dossierGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const statBox = {
  padding: "16px",
  borderRadius: "16px",
  background: "hsla(var(--text-main) / 0.03)",
  border: "1px solid hsla(var(--border-glass))",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const statLabel = {
  fontSize: "10px",
  fontWeight: "800",
  color: "hsl(var(--text-muted))",
  textTransform: "uppercase",
};

const statValue = {
  fontSize: "14px",
  fontWeight: "700",
  color: "white",
};

const actionZone = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const installBtn = {
  padding: "16px",
  borderRadius: "16px",
  background: "hsl(var(--primary))",
  color: "white",
  fontWeight: "800",
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  transition: "var(--transition-spring)",
  boxShadow: "0 8px 16px -4px hsla(var(--primary-glow))",
};

const logoutBtn = {
  padding: "16px",
  borderRadius: "16px",
  background: "hsla(var(--danger) / 0.1)",
  color: "hsl(var(--danger))",
  fontWeight: "800",
  fontSize: "14px",
  border: "1px solid hsla(var(--danger) / 0.2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  transition: "var(--transition-smooth)",
};

const profileFooter = { textAlign: "center", marginTop: "12px" };
const footerText = { fontSize: "11px", color: "hsl(var(--text-muted))", letterSpacing: "0.05em" };
