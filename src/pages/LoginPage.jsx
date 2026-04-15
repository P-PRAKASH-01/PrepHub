import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setBusy(true);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password);
        setStatus("Registration successful. Redirecting...");
      } else {
        await loginWithEmail(email, password);
        setStatus("Login successful. Redirecting...");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("Enter your email address to reset password.");
      return;
    }

    setError("");
    setStatus("Sending password reset email...");

    try {
      await resetPassword(email);
      setStatus("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Could not send reset email.");
      setStatus("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        backgroundImage: `
          linear-gradient(hsla(var(--primary) / 0.1) 1px, transparent 1px),
          linear-gradient(90deg, hsla(var(--primary) / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={bgGlow}></div>
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "40px 36px",
          minWidth: 360,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          border: "1px solid var(--border-glass)",
          zIndex: 1,
        }}
      >
        <h1 className="glow-text" style={{ fontWeight: 800, fontSize: 34, marginBottom: 10 }}>
          {isRegisterMode ? "Sign Up" : "Sign In"}
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 16, marginBottom: 24 }}>
          {isRegisterMode
            ? "Start your career acceleration journey."
            : "Continue where you left off."}
        </p>

        {error && <p style={{ color: "var(--danger)", marginBottom: 12, fontSize: "14px" }}>{error}</p>}
        {status && <p style={{ color: "var(--success)", marginBottom: 12, fontSize: "14px" }}>{status}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={inputContainer}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              style={inputStyle}
            />
          </div>
          <div style={inputContainer}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          
          <button
            type="submit"
            disabled={busy}
            style={primaryBtn(busy)}
          >
            {busy
              ? "Connecting..."
              : isRegisterMode
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <button
            onClick={handleReset}
            type="button"
            style={linkBtn}
          >
            Forgot password?
          </button>
          <button
            onClick={() => {
              setIsRegisterMode((prev) => !prev);
              setError("");
              setStatus("");
            }}
            type="button"
            style={linkBtn}
          >
            {isRegisterMode ? "Back to Sign In" : "New Scholar? Join PrepHub"}
          </button>
        </div>

        <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={hr}></div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>OR</span>
          <div style={hr}></div>
        </div>

        <button
          onClick={loginWithGoogle}
          type="button"
          style={googleBtn}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{width: 18}} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

// Internal Styles
const bgGlow = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "600px",
  height: "600px",
  background: "radial-gradient(circle, hsla(var(--primary) / 0.15) 0%, transparent 70%)",
  filter: "blur(60px)",
  zIndex: 0,
  pointerEvents: "none",
};

const inputContainer = {
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};


const labelStyle = {
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  letterSpacing: "0.05em",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid var(--border-glass)",
  fontSize: "15px",
  backgroundColor: "hsla(var(--bg-page) / 0.5)",
  color: "white",
  outline: "none",
  transition: "var(--transition-smooth)",
};

const primaryBtn = (busy) => ({
  width: "100%",
  padding: "16px",
  fontSize: "15px",
  fontWeight: "800",
  background: "hsl(var(--primary))",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: busy ? "not-allowed" : "pointer",
  transition: "var(--transition-spring)",
  boxShadow: busy ? "none" : "0 8px 16px -4px hsla(var(--primary-glow))",
});

const linkBtn = {
  border: "none",
  background: "none",
  color: "var(--primary)",
  fontSize: "13px",
  cursor: "pointer",
  padding: 0,
  fontWeight: "700",
};

const hr = { flex: 1, height: "1px", background: "var(--border-glass)" };

const googleBtn = {
  width: "100%",
  padding: "12px",
  fontSize: "14px",
  fontWeight: "700",
  background: "hsla(var(--text-main) / 0.05)",
  color: "#fff",
  border: "1px solid var(--border-glass)",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  transition: "var(--transition-smooth)",
};
