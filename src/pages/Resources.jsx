import { useState } from "react";
import { getData } from "../utils/storage";
import { getResourcesForSkill } from "../utils/resources";

export default function Resources() {
  const [skills] = useState(() => {
    const storedSkills = getData("skillTracker") || [];
    return storedSkills.map(skill =>
      typeof skill === 'string'
        ? { name: skill, learned: false }
        : skill
    );
  });
  const [filter, setFilter] = useState("missing");

  const getFilteredSkills = () => {
    switch (filter) {
      case "missing": return skills.filter(skill => !skill.learned);
      case "learned": return skills.filter(skill => skill.learned);
      default: return skills;
    }
  };

  const filteredSkills = getFilteredSkills();
  const skillsWithResources = filteredSkills.filter(skill => getResourcesForSkill(skill.name).length > 0);

  return (
    <div className="animate-fade-in container-full" style={resourcesLayout}>
      <header style={headerStyle}>
        <h1 className="glow-text" style={titleStyle}>Learning Resources</h1>
        <p style={subtitleStyle}>Curated materials to help you master missing skills and reach your career goals.</p>
      </header>

      {/* Filter Bar */}
      <section style={controlBar}>
         <div style={filterGroup}>
           {["missing", "all", "learned"].map(f => (
             <button 
               key={f} 
               onClick={() => setFilter(f)} 
               style={filterBtn(filter === f)}
             >
               {f === "missing" ? "Missing Skills" : f.charAt(0).toUpperCase() + f.slice(1)}
             </button>
           ))}
         </div>
      </section>

      {/* Content Area */}
      <div style={contentArea}>
        {skillsWithResources.length === 0 ? (
          <div className="glass-card" style={emptyState}>
             <div style={emptyIcon}>📚</div>
             <h3 style={emptyTitle}>No resources found</h3>
             <p style={emptyText}>Try adding more skills in the analyzer or check back later.</p>
          </div>
        ) : (
          skillsWithResources.map(skill => (
            <div key={skill.name} className="glass-card" style={skillSection}>
              <div style={sectionHeader}>
                <h3 style={sectionTitle}>{skill.name}</h3>
                <div style={sectionLine}></div>
              </div>
              <div style={resourceGrid}>
                {getResourcesForSkill(skill.name).map((res, i) => (
                  <a href={res.url} target="_blank" rel="noreferrer" key={i} className="glass-card" style={resourceCard}>
                    <div style={resTop}>
                      <span style={typeBadge(res.type)}>{res.type}</span>
                      <span style={provider}>{res.provider}</span>
                    </div>
                    <h4 style={resTitle}>{res.title}</h4>
                    <div style={resLink}>Access Resource →</div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footnote */}
      <section style={infoGrid}>
        <div className="glass-card" style={infoBlock}>
          <span style={infoIcon}>🎯</span>
          <h5 style={infoTitle}>Curated Quality</h5>
          <p style={infoText}>Every module is vetted for technical accuracy and depth.</p>
        </div>
        <div className="glass-card" style={infoBlock}>
          <span style={infoIcon}>⚡</span>
          <h5 style={infoTitle}>Accelerated Path</h5>
          <p style={infoText}>Focused strictly on high-impact industry requirements.</p>
        </div>
        <div className="glass-card" style={infoBlock}>
          <span style={infoIcon}>🌐</span>
          <h5 style={infoTitle}>Free & Open</h5>
          <p style={infoText}>Using the best available open knowledge repositories.</p>
        </div>
      </section>
    </div>
  );
}

// Styles
const resourcesLayout = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const headerStyle = { textAlign: "center", marginBottom: "12px" };
const titleStyle = { fontSize: "36px" };
const subtitleStyle = { color: "hsl(var(--text-dim))", fontSize: "16px" };

const controlBar = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "12px",
};

const filterGroup = {
  display: "flex",
  gap: "8px",
  padding: "4px",
  background: "hsla(var(--bg-glass))",
  borderRadius: "100px",
  border: "1px solid hsla(var(--border-glass))",
};

const filterBtn = (active) => ({
  padding: "8px 20px",
  borderRadius: "100px",
  border: "none",
  background: active ? "hsl(var(--primary))" : "transparent",
  color: active ? "white" : "hsl(var(--text-dim))",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "var(--transition-smooth)",
});

const contentArea = {
  display: "flex",
  flexDirection: "column",
  gap: "48px",
};

const emptyState = {
  padding: "80px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
};

const emptyIcon = { fontSize: "48px" };
const emptyTitle = { fontSize: "20px", fontWeight: "800" };
const emptyText = { color: "hsl(var(--text-dim))", maxWidth: "400px" };

const skillSection = {
  padding: "32px",
  background: "hsla(var(--bg-card) / 0.5)",
  border: "1px solid hsla(var(--border-glass))",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  marginBottom: "32px",
};

const sectionTitle = {
  fontSize: "24px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const sectionLine = {
  height: "1px",
  flex: 1,
  background: "linear-gradient(90deg, hsla(var(--primary) / 0.3), transparent)",
};

const resourceGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px",
};

const resourceCard = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  textDecoration: "none",
  color: "inherit",
  transition: "var(--transition-spring)",
  ":hover": { transform: "translateY(-4px)" },
};

const resTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const typeBadge = (type) => {
  const color = type === 'Video' ? 'var(--danger)' : type === 'Course' ? 'var(--accent)' : 'var(--success)';
  return {
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    padding: "4px 8px",
    borderRadius: "6px",
    background: `hsla(${color} / 0.1)`,
    color: `hsl(${color})`,
    border: `1px solid hsla(${color} / 0.2)`,
  };
};

const provider = { fontSize: "11px", color: "hsl(var(--text-muted))", fontWeight: "700" };
const resTitle = { fontSize: "16px", fontWeight: "700", lineHeight: "1.4" };
const resLink = { marginTop: "auto", fontSize: "12px", fontWeight: "700", color: "hsl(var(--primary))" };

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginTop: "40px",
};

const infoBlock = {
  padding: "24px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

const infoIcon = { fontSize: "24px", marginBottom: "8px" };
const infoTitle = { fontSize: "14px", fontWeight: "800", textTransform: "uppercase" };
const infoText = { fontSize: "13px", color: "hsl(var(--text-dim))" };