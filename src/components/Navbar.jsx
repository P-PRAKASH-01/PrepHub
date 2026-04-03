import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav style={{ ...navStyle, padding: isMobile ? "14px 16px" : "14px 32px" }}>
      <span style={{ fontWeight: "600", fontSize: "18px", color: "var(--primary)" }}>
        PrepHub
      </span>

      {/* Desktop Navigation */}
      {!isMobile && (
        <div style={desktopNavStyle}>
          <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/skills" style={linkStyle}>Skills</Link>
          <Link to="/companies" style={linkStyle}>Companies</Link>
          <Link to="/resources" style={linkStyle}>Resources</Link>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && isMobile && (
        <div style={mobileMenuOverlay}>
          <div style={mobileMenuContent}>
            <Link to="/dashboard" style={mobileLinkStyle} onClick={toggleMenu}>Dashboard</Link>
            <Link to="/skills" style={mobileLinkStyle} onClick={toggleMenu}>Skills</Link>
            <Link to="/companies" style={mobileLinkStyle} onClick={toggleMenu}>Companies</Link>
            <Link to="/resources" style={mobileLinkStyle} onClick={toggleMenu}>Resources</Link>
          </div>
        </div>
      )}

      {/* Profile and Hamburger (Mobile) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src={user?.photoURL}
          alt="profile"
          width={40}
          style={{ borderRadius: "50%", cursor: "pointer" }}
          onClick={() => navigate("/profile")}
        />
        {isMobile && (
          <button onClick={toggleMenu} style={hamburgerBtn}>
            <span style={hamburgerLine}></span>
            <span style={hamburgerLine}></span>
            <span style={hamburgerLine}></span>
          </button>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 32px",
  borderBottom: "1px solid var(--border)",
  background: "linear-gradient(90deg, var(--primary-light) 0%, var(--bg-tinted) 100%)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const linkStyle = {
  textDecoration: "none",
  color: "var(--primary)",
  fontSize: "15px",
  fontWeight: "600",
  padding: "6px 12px",
  borderRadius: "6px",
  transition: "background 0.2s, color 0.2s",
};

const desktopNavStyle = {
  display: "flex",
  gap: "20px",
  alignItems: "center",
};

const mobileMenuStyle = {
  display: "flex",
  alignItems: "center",
};

const hamburgerBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "8px",
};

const hamburgerLine = {
  width: "20px",
  height: "2px",
  backgroundColor: "var(--text-secondary)",
  transition: "all 0.3s ease",
};

const mobileMenuOverlay = {
  position: "fixed",
  top: "60px",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 99,
};

const mobileMenuContent = {
  backgroundColor: "var(--bg-surface)",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const mobileLinkStyle = {
  textDecoration: "none",
  color: "var(--text-secondary)",
  fontSize: "16px",
  fontWeight: "500",
  padding: "10px 0",
  borderBottom: "1px solid var(--border)",
};

const logoutBtn = {
  padding: "6px 14px",
  fontSize: "13px",
  backgroundColor: "var(--danger-light)",
  color: "var(--danger)",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};