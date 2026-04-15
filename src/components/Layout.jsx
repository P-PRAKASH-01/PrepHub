import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={layoutWrapper}>
      {/* Background Decorations */}
      <div style={glowSphere1}></div>
      <div style={glowSphere2}></div>
      
      <Navbar />
      <main style={mainContainer}>
        {children}
      </main>
    </div>
  );
}

const layoutWrapper = {
  position: "relative",
  minHeight: "100vh",
  width: "100%",
  overflow: "hidden",
};

const mainContainer = {
  maxWidth: "var(--container-max)",
  margin: "0 auto",
  padding: "120px 24px 40px",
  position: "relative",
  zIndex: 1,
};

const glowSphere1 = {
  position: "fixed",
  top: "-10%",
  right: "-5%",
  width: "40vw",
  height: "40vw",
  background: "hsla(var(--primary) / 0.15)",
  filter: "blur(120px)",
  borderRadius: "50%",
  zIndex: 0,
  pointerEvents: "none",
};

const glowSphere2 = {
  position: "fixed",
  bottom: "5%",
  left: "-5%",
  width: "30vw",
  height: "30vw",
  background: "hsla(var(--accent) / 0.1)",
  filter: "blur(100px)",
  borderRadius: "50%",
  zIndex: 0,
  pointerEvents: "none",
};