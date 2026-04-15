import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in container-full" style={dashboardLayout}>
      <header style={heroHeader}>
        <div style={heroContent}>
          <h1 className="glow-text" style={heroTitle}>
            Empower Your Future
          </h1>
          <p style={heroSubtitle}>
            Welcome back, {user?.displayName?.split(" ")[0] || "Scholar"}. Your personalized portal for career preparation and internship success.
          </p>
        </div>
      </header>
    </div>
  );
}

// Styles
const dashboardLayout = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  textAlign: "center",
  padding: "40px 20px",
};

const heroHeader = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: "900px",
};

const heroContent = { 
  display: "flex", 
  flexDirection: "column",
  alignItems: "center"
};

const heroTitle = { 
  fontSize: "clamp(3.5rem, 8vw, 6rem)", 
  marginBottom: "24px",
  lineHeight: "1.1",
  fontWeight: "900",
  letterSpacing: "-0.04em",
  background: "linear-gradient(to right, hsl(var(--text-main)), hsl(var(--primary)))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const heroSubtitle = { 
  color: "hsl(var(--text-dim))", 
  fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)", 
  maxWidth: "700px",
  lineHeight: "1.6",
  fontWeight: "400",
};