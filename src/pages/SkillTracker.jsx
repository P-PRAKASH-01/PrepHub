import { useState, useEffect } from "react";
import { getData, saveData } from "../utils/storage";

export default function SkillTracker() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [filter, setFilter] = useState("all"); // all, learned, unlearned

  useEffect(() => {
    const storedSkills = getData("skillTracker") || [];
    // Ensure each skill has a learned property
    const normalizedSkills = storedSkills.map(skill =>
      typeof skill === 'string'
        ? { name: skill, learned: false }
        : skill
    );
    setSkills(normalizedSkills);
  }, []);

  const addSkill = () => {
    if (!newSkill.trim()) return;

    const skillExists = skills.some(skill => skill.name.toLowerCase() === newSkill.toLowerCase());
    if (skillExists) {
      alert("Skill already exists!");
      return;
    }

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

  const SkillCard = ({ skill }) => (
    <div style={{
      ...skillCardStyle,
      background: skill.learned
        ? "linear-gradient(135deg, var(--success-light) 0%, rgba(16, 185, 129, 0.05) 100%)"
        : "linear-gradient(135deg, var(--danger-light) 0%, rgba(239, 68, 68, 0.05) 100%)",
      border: skill.learned
        ? "1px solid var(--success-light)"
        : "1px solid var(--danger-light)"
    }}>
      <div style={skillContentStyle}>
        <span style={skillNameStyle}>{skill.name}</span>
        <span style={{
          ...skillStatusStyle,
          color: skill.learned ? "var(--success)" : "var(--danger)"
        }}>
          {skill.learned ? "✅ Learned" : "⏳ In Progress"}
        </span>
      </div>
      <div style={skillActionsStyle}>
        <button
          onClick={() => toggleSkill(skill.name)}
          style={{
            ...actionButtonStyle,
            backgroundColor: skill.learned ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
            color: skill.learned ? "#ef4444" : "#10b981"
          }}
        >
          {skill.learned ? "Mark Unlearned" : "Mark Learned"}
        </button>
        <button
          onClick={() => deleteSkill(skill.name)}
          style={deleteButtonStyle}
        >
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Skill Tracker</h1>
        <p style={subtitleStyle}>Track your technical skills and mark them as learned when you're confident.</p>
      </header>

      {/* Progress Overview */}
      <div style={progressSectionStyle}>
        <div style={progressCardStyle}>
          <div style={progressHeaderStyle}>
            <h3 style={progressTitleStyle}>Overall Progress</h3>
            <span style={progressPercentageStyle}>{progressPercentage}%</span>
          </div>
          <div style={progressBarStyle}>
            <div
              style={{
                ...progressFillStyle,
                width: `${progressPercentage}%`
              }}
            />
          </div>
          <p style={progressTextStyle}>
            {learnedCount} of {skills.length} skills learned
          </p>
        </div>
      </div>

      {/* Add Skill Section */}
      <div style={addSkillSectionStyle}>
        <h2 style={sectionTitleStyle}>Add New Skill</h2>
        <div style={addSkillFormStyle}>
          <input
            type="text"
            placeholder="Enter skill name (e.g., React, Python, AWS)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            style={skillInputStyle}
          />
          <button onClick={addSkill} style={addButtonStyle}>
            Add Skill
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div style={filterSectionStyle}>
        <h2 style={sectionTitleStyle}>Your Skills</h2>
        <div style={filterButtonsStyle}>
          <button
            onClick={() => setFilter("all")}
            style={filter === "all" ? activeFilterStyle : filterButtonStyle}
          >
            All ({skills.length})
          </button>
          <button
            onClick={() => setFilter("learned")}
            style={filter === "learned" ? activeFilterStyle : filterButtonStyle}
          >
            Learned ({learnedCount})
          </button>
          <button
            onClick={() => setFilter("unlearned")}
            style={filter === "unlearned" ? activeFilterStyle : filterButtonStyle}
          >
            In Progress ({skills.length - learnedCount})
          </button>
        </div>
      </div>

      {/* Skills List */}
      <div style={skillsGridStyle}>
        {filteredSkills.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🎯</div>
            <h3 style={emptyTitleStyle}>
              {filter === "all" ? "No skills added yet" :
               filter === "learned" ? "No learned skills yet" :
               "No skills in progress"}
            </h3>
            <p style={emptyTextStyle}>
              {filter === "all" ? "Start by adding your first skill above!" :
               filter === "learned" ? "Mark some skills as learned to see them here." :
               "Skills you haven't learned yet will appear here."}
            </p>
          </div>
        ) : (
          filteredSkills.map((skill, index) => (
            <SkillCard key={skill.name} skill={skill} />
          ))
        )}
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "32px",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "40px",
};

const titleStyle = {
  fontSize: "2.5rem",
  fontWeight: "800",
  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "12px",
};

const subtitleStyle = {
  color: "var(--text-secondary)",
  fontSize: "1.1rem",
  maxWidth: "600px",
  margin: "0 auto",
};

const progressSectionStyle = {
  marginBottom: "40px",
};

const progressCardStyle = {
  background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary-surface) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid var(--primary-light)",
};

const progressHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const progressTitleStyle = {
  fontSize: "1.2rem",
  fontWeight: "600",
  color: "var(--text)",
  margin: 0,
};

const progressPercentageStyle = {
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--primary)",
};

const progressBarStyle = {
  width: "100%",
  height: "8px",
  backgroundColor: "var(--primary-light)",
  borderRadius: "4px",
  overflow: "hidden",
  marginBottom: "12px",
};

const progressFillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, var(--primary) 0%, var(--primary-mid) 100%)",
  borderRadius: "4px",
  transition: "width 0.3s ease",
};

const progressTextStyle = {
  fontSize: "0.9rem",
  color: "var(--text-secondary)",
  margin: 0,
  textAlign: "center",
};

const addSkillSectionStyle = {
  marginBottom: "40px",
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "var(--text)",
  marginBottom: "16px",
};

const addSkillFormStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const skillInputStyle = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s ease",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text)",
};

const addButtonStyle = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

const filterSectionStyle = {
  marginBottom: "24px",
};

const filterButtonsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const filterButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "0.9rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
  color: "var(--text)",
};

const activeFilterStyle = {
  ...filterButtonStyle,
  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
  color: "white",
  borderColor: "var(--primary)",
};

const skillsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
  gap: "16px",
};

const skillCardStyle = {
  backdropFilter: "blur(15px)",
  borderRadius: "16px",
  padding: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const skillContentStyle = {
  flex: 1,
};

const skillNameStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "var(--text)",
  display: "block",
  marginBottom: "4px",
};

const skillStatusStyle = {
  fontSize: "0.85rem",
  fontWeight: "500",
};

const skillActionsStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const actionButtonStyle = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.8rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const deleteButtonStyle = {
  padding: "6px 8px",
  backgroundColor: "var(--danger-light)",
  border: "1px solid var(--danger-light)",
  borderRadius: "8px",
  color: "var(--danger)",
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
};

const emptyStateStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "60px 20px",
  background: "linear-gradient(135deg, var(--bg-tinted) 0%, var(--primary-surface) 100%)",
  backdropFilter: "blur(15px)",
  borderRadius: "20px",
  border: "1px solid var(--border)",
};

const emptyIconStyle = {
  fontSize: "4rem",
  marginBottom: "16px",
};

const emptyTitleStyle = {
  fontSize: "1.3rem",
  fontWeight: "600",
  color: "var(--text-secondary)",
  marginBottom: "8px",
};

const emptyTextStyle = {
  color: "var(--text-muted)",
  fontSize: "1rem",
  maxWidth: "400px",
  margin: "0 auto",
};