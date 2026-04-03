import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const {
    user,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

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
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          padding: "40px 36px",
          minWidth: 360,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          border: "1px solid var(--border)",
        }}
      >
        <h1 style={{ color: "var(--text)", fontWeight: 800, fontSize: 34, marginBottom: 10 }}>
          {isRegisterMode ? "Register" : "Login"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 24 }}>
          {isRegisterMode
            ? "Create your PrepHub account"
            : "Welcome back, please sign in"}
        </p>

        {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}
        {status && <p style={{ color: "var(--success)", marginBottom: 12 }}>{status}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: 14,
              borderRadius: 10,
              border: "1px solid var(--border)",
              fontSize: 16,
              backgroundColor: "var(--bg-surface)",
              color: "var(--text)",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: 16,
              borderRadius: 10,
              border: "1px solid var(--border)",
              fontSize: 16,
              backgroundColor: "var(--bg-surface)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 17,
              fontWeight: 700,
              background: "linear-gradient(90deg, var(--primary) 0%, var(--primary-mid) 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: busy ? "not-allowed" : "pointer",
              marginBottom: 14,
            }}
          >
            {busy
              ? "Working..."
              : isRegisterMode
              ? "Create account"
              : "Log in"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <button
            onClick={handleReset}
            type="button"
            style={{
              border: "none",
              background: "none",
              color: "var(--primary)",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
            }}
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
            style={{
              border: "none",
              background: "none",
              color: "var(--primary)",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
            }}
          >
            {isRegisterMode ? "Already have an account? Login" : "Create an account"}
          </button>
        </div>

        <div style={{ marginTop: 6, marginBottom: 4, color: "var(--text-muted)" }}>
          or
        </div>

        <button
          onClick={loginWithGoogle}
          type="button"
          style={{
            width: "100%",
            padding: "12px 0",
            fontSize: 16,
            fontWeight: 700,
            background: "var(--bg-surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
