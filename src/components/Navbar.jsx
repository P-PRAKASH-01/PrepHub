import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Skills", path: "/skills" },
    { name: "Companies", path: "/companies" },
    { name: "Resources", path: "/resources" },
  ];

  const isActive = (path) => location.pathname === path;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=0D1117&color=fff`;

  return (
    <div style={navWrapper(scrolled)}>
      <nav className="glass-card" style={navItems}>
        <div style={logoContainer} onClick={() => navigate("/dashboard")}>
          <div style={logoIcon}>P</div>
          <span style={logoText}>PrepHub</span>
        </div>

        {/* Desktop Links */}
        <div style={desktopLinks} className="desktop-only">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={linkStyle(isActive(link.path))}
            >
              {link.name}
              {isActive(link.path) && <div style={activeUnderline}></div>}
            </Link>
          ))}
        </div>

        {/* Profile & Actions */}
        <div style={actionSection}>
          <div 
            style={profileWrapper} 
            onClick={() => navigate("/profile")}
          >
            <img
              src={!imgError && user?.photoURL ? user.photoURL : fallbackAvatar}
              alt="profile"
              style={profileImage}
              onError={() => setImgError(true)}
            />
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={hamburgerBtn} className="mobile-only">
            <div style={hamburgerLine(isMenuOpen)}></div>
            <div style={hamburgerLine(isMenuOpen)}></div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div style={mobileMenu(isMenuOpen)}>
        <div style={mobileMenuContent}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              style={mobileLinkStyle(isActive(link.path))}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Styles
const navWrapper = (scrolled) => ({
  position: "fixed",
  top: scrolled ? "12px" : "24px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "calc(100% - 48px)",
  maxWidth: "var(--container-max)",
  zIndex: 1000,
  transition: "var(--transition-spring)",
});

const navItems = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  borderRadius: "100px", // Pill shape
  border: "1px solid hsla(var(--border-glass))",
};

const logoContainer = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
};

const logoIcon = {
  width: "32px",
  height: "32px",
  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: "800",
  fontSize: "18px",
};

const logoText = {
  fontSize: "20px",
  fontWeight: "800",
  color: "hsl(var(--text-main))",
  letterSpacing: "-0.03em",
};

const desktopLinks = {
  display: "flex",
  gap: "4px",
  alignItems: "center",
};

const linkStyle = (active) => ({
  textDecoration: "none",
  color: active ? "hsl(var(--text-main))" : "hsl(var(--text-dim))",
  fontSize: "14px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "50px",
  transition: "var(--transition-smooth)",
  position: "relative",
  background: active ? "hsla(var(--primary) / 0.1)" : "transparent",
});

const activeUnderline = {
  position: "absolute",
  bottom: "4px",
  left: "50%",
  transform: "translateX(-50%)",
  height: "2px",
  background: "hsl(var(--accent))",
  borderRadius: "2px",
  boxShadow: "0 0 12px hsla(var(--accent-glow))",
  animation: "navUnderline 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
};

const actionSection = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const profileWrapper = {
  cursor: "pointer",
  transition: "var(--transition-spring)",
};

const profileImage = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: "2px solid hsla(var(--border-glass))",
  objectFit: "cover",
  background: "hsla(var(--text-main) / 0.1)",
};

const hamburgerBtn = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "8px",
};

const hamburgerLine = () => ({
  width: "24px",
  height: "2px",
  background: "hsl(var(--text-main))",
  transition: "var(--transition-spring)",
});

const mobileMenu = (isOpen) => ({
  position: "fixed",
  top: "84px",
  left: "24px",
  right: "24px",
  background: "hsl(var(--bg-glass))",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid hsla(var(--border-glass))",
  transform: isOpen ? "translateY(0)" : "translateY(-20px)",
  opacity: isOpen ? 1 : 0,
  pointerEvents: isOpen ? "all" : "none",
  transition: "var(--transition-spring)",
  zIndex: 999,
});

const mobileMenuContent = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const mobileLinkStyle = (active) => ({
  textDecoration: "none",
  color: active ? "hsl(var(--text-main))" : "hsl(var(--text-dim))",
  fontSize: "18px",
  fontWeight: "700",
  padding: "16px",
  borderRadius: "16px",
  background: active ? "hsla(var(--primary) / 0.1)" : "transparent",
});

