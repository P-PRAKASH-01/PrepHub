import { useState } from "react";
import { getData, saveData } from "../utils/storage";

export default function SkillTracker() {
  const [skills, setSkills] = useState(() => {
    const storedSkills = getData("skillTracker") || [];
    return storedSkills.map(skill =>
      typeof skill === 'string'
        ? { name: skill, learned: false }
        : skill
    );
  });
  const [newSkill, setNewSkill] = useState("");
  const [filter, setFilter] = useState("all");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skillExists = skills.some(skill => skill.name.toLowerCase() === newSkill.toLowerCase());
    if (skillExists) return;

    const updatedSkills = [...skills, { name: newSkill.trim(), learned: false }];
    setSkills(updatedSkills);
    saveData("skillTracker", updatedSkills);
    setNewSkill("");
  };

  const toggleSkill = (skillName) => {
    const updatedSkills = skills.map(skill =>
      skill.name === skillName ? { ...skill, learned: !skill.learned } : skill
    );
    setSkills(updatedSkills);
    saveData("skillTracker", updatedSkills);
  };

  const deleteSkill = (skillName) => {
    const updatedSkills = skills.filter(skill => skill.name !== skillName);
    setSkills(updatedSkills);
    saveData("skillTracker", updatedSkills);
  };

  const filteredSkills = skills.filter(skill => {
    if (filter === "learned") return skill.learned;
    if (filter === "unlearned") return !skill.learned;
    return true;
  });

  const learnedCount = skills.filter(skill => skill.learned).length;
  const progressPercentage = skills.length > 0 ? Math.round((learnedCount / skills.length) * 100) : 0;

  return (
    <div className="animate-fade-in container-full" style={trackerLayout}>
      <header style={headerStyle}>
        <h1 className="glow-text" style={titleStyle}>Mastery Tracker</h1>
        <p style={subtitleStyle}>Command your technical arsenal. Mark skills as mastered as you level up.</p>
      </header>

      {/* Hero Progress */}
      <section className="glass-card" style={progressCard}>
        <div style={progressHeader}>
          <div style={progressLabel}>
            <span style={progressTitle}>Overall competence</span>
            <span style={progressSub}>{learnedCount} of {skills.length} skills mastered</span>
          </div>
          <span style={progressVal}>{progressPercentage}%</span>
        </div>
        <div style={progressWrapper}>
          <div style={progressBar(progressPercentage)}></div>
        </div>
      </section>

      {/* Control Bar */}
      <section style={controlBar}>
        <div className="glass-card" style={inputGroup}>
          <input
            type="text"
            placeholder="Add new skill (e.g. System Design, Go)..."
            style={inputStyle}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          />
          <button onClick={addSkill} style={addBtn}>Deploy Skill</button>
        </div>

        <div style={filterGroup}>
          {["all", "learned", "unlearned"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={filterBtn(filter === f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <div style={skillsGrid}>
        {filteredSkills.length === 0 ? (
          <div style={emptyState}>No skills found in this sector.</div>
        ) : (
          filteredSkills.map((skill) => (
            <div key={skill.name} className="glass-card" style={skillCard(skill.learned)}>
              <div style={skillInfo}>
                <h4 style={skillName}>{skill.name}</h4>
                <div style={statusTag(skill.learned)}>
                  {skill.learned ? "Mastered" : "In Progress"}
                </div>
              </div>
              <div style={skillActions}>
                <button 
                  onClick={() => toggleSkill(skill.name)} 
                  style={skill.learned ? unlearnBtn : learnBtn}
                >
                  {skill.learned ? "Reset" : "Master"}
                </button>
                <button onClick={() => deleteSkill(skill.name)} style={delBtn}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Styles
const trackerLayout = {
  maxWidth: "1000px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "40px",
};

const headerStyle = {
  textAlign: "center",
};

const titleStyle = {
  fontSize: "36px",
  marginBottom: "12px",
};

const subtitleStyle = {
  color: "hsl(var(--text-dim))",
  fontSize: "16px",
};

const progressCard = {
  padding: "32px",
  border: "1px solid hsla(var(--primary) / 0.15)",
};

const progressHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "20px",
};

const progressLabel = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const progressTitle = {
  fontSize: "14px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "hsl(var(--text-muted))",
};

const progressSub = {
  color: "hsl(var(--text-dim))",
  fontSize: "14px",
};

const progressVal = {
  fontSize: "32px",
  fontWeight: "800",
  color: "hsl(var(--accent))",
  lineHeight: 1,
};

const progressWrapper = {
  width: "100%",
  height: "12px",
  background: "hsla(var(--text-main) / 0.05)",
  borderRadius: "10px",
  overflow: "hidden",
};

const progressBar = (val) => ({
  width: `${val}%`,
  height: "100%",
  background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
  borderRadius: "10px",
  boxShadow: "0 0 15px hsla(var(--primary-glow))",
  transition: "var(--transition-spring)",
});

const controlBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "24px",
  flexWrap: "wrap",
};

const inputGroup = {
  flex: 1,
  minWidth: "300px",
  display: "flex",
  padding: "8px 8px 8px 20px",
  borderRadius: "100px",
  border: "1px solid hsla(var(--border-glass))",
};

const inputStyle = {
  flex: 1,
  background: "none",
  border: "none",
  color: "white",
  fontSize: "15px",
  outline: "none",
};

const addBtn = {
  background: "hsl(var(--primary))",
  color: "white",
  border: "none",
  padding: "10px 24px",
  borderRadius: "100px",
  fontWeight: "700",
  fontSize: "14px",
  cursor: "pointer",
  transition: "var(--transition-spring)",
};

const filterGroup = {
  display: "flex",
  gap: "8px",
};

const filterBtn = (active) => ({
  padding: "10px 18px",
  borderRadius: "100px",
  border: "1px solid hsla(var(--border-glass))",
  background: active ? "hsl(var(--primary))" : "hsla(var(--bg-glass))",
  color: active ? "white" : "hsl(var(--text-dim))",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "var(--transition-smooth)",
});

const skillsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
};

const skillCard = (learned) => ({
  padding: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: `1px solid ${learned ? 'hsla(var(--success) / 0.3)' : 'hsla(var(--border-glass))'}`,
  transition: "var(--transition-spring)",
  boxShadow: learned ? "0 0 20px -10px hsla(var(--success) / 0.3)" : "none",
});

const skillInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const skillName = {
  fontSize: "18px",
  fontWeight: "700",
};

const statusTag = (learned) => ({
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
  color: learned ? "hsl(var(--success))" : "hsl(var(--warning))",
});

const skillActions = {
  display: "flex",
  gap: "8px",
};

const learnBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "hsla(var(--success) / 0.1)",
  color: "hsl(var(--success))",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const unlearnBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "hsla(var(--text-muted) / 0.1)",
  color: "hsl(var(--text-dim))",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const delBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  opacity: 0.5,
};

const emptyState = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "60px",
  color: "hsl(var(--text-muted))",
};