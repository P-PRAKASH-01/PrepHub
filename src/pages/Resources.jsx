import { useState, useEffect } from "react";
import { getData } from "../utils/storage";
import { getResourcesForSkill } from "../utils/resources";

export default function Resources() {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState("missing"); // missing, all, learned

  useEffect(() => {
    const storedSkills = getData("skillTracker") || [];
    const normalizedSkills = storedSkills.map(skill =>
      typeof skill === 'string'
        ? { name: skill, learned: false }
        : skill
    );
    setSkills(normalizedSkills);
  }, []);

  const getFilteredSkills = () => {
    switch (filter) {
      case "missing":
        return skills.filter(skill => !skill.learned);
      case "learned":
        return skills.filter(skill => skill.learned);
      case "all":
      default:
        return skills;
    }
  };

  const filteredSkills = getFilteredSkills();
  const skillsWithResources = filteredSkills.filter(skill =>
    getResourcesForSkill(skill.name).length > 0
  );

  const ResourceCard = ({ resource, skillName }) => (
    <div style={resourceCardStyle}>
      <div style={resourceHeaderStyle}>
        <div style={resourceTypeBadgeStyle(resource.type)}>
          {resource.type}
        </div>
        <span style={resourceProviderStyle}>{resource.provider}</span>
      </div>

      <h4 style={resourceTitleStyle}>{resource.title}</h4>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        style={resourceLinkStyle}
      >
        View Resource →
      </a>
    </div>
  );

  const SkillSection = ({ skill }) => {
    const resources = getResourcesForSkill(skill.name);

    if (resources.length === 0) return null;

    return (
      <div style={skillSectionStyle}>
        <div style={skillHeaderStyle}>
          <h3 style={skillNameStyle}>{skill.name}</h3>
          <span style={{
            ...skillStatusStyle,
            color: skill.learned ? "var(--success)" : "var(--danger)"
          }}>
            {skill.learned ? "✅ Learned" : "⏳ In Progress"}
          </span>
        </div>

        <div style={resourcesGridStyle}>
          {resources.map((resource, index) => (
            <ResourceCard
              key={index}
              resource={resource}
              skillName={skill.name}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Learning Resources</h1>
        <p style={subtitleStyle}>
          Curated learning materials for your skills. Focus on resources for skills you haven't learned yet.
        </p>
      </header>

      {/* Filter Section */}
      <div style={filterSectionStyle}>
        <h2 style={sectionTitleStyle}>Filter Resources</h2>
        <div style={filterButtonsStyle}>
          <button
            onClick={() => setFilter("missing")}
            style={filter === "missing" ? activeFilterStyle : filterButtonStyle}
          >
            Missing Skills ({skills.filter(s => !s.learned && getResourcesForSkill(s.name).length > 0).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            style={filter === "all" ? activeFilterStyle : filterButtonStyle}
          >
            All Skills ({skills.filter(s => getResourcesForSkill(s.name).length > 0).length})
          </button>
          <button
            onClick={() => setFilter("learned")}
            style={filter === "learned" ? activeFilterStyle : filterButtonStyle}
          >
            Learned Skills ({skills.filter(s => s.learned && getResourcesForSkill(s.name).length > 0).length})
          </button>
        </div>
      </div>

      {/* Resources Content */}
      {skillsWithResources.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>📚</div>
          <h3 style={emptyTitleStyle}>
            {skills.length === 0
              ? "No skills in your tracker yet"
              : filter === "missing"
                ? "All your skills are learned! 🎉"
                : "No resources available for your skills"
            }
          </h3>
          <p style={emptyTextStyle}>
            {skills.length === 0
              ? "Add some skills to your tracker first, then come back here for learning resources."
              : filter === "missing"
                ? "Great job! All your tracked skills are marked as learned. Consider adding more skills to continue growing."
                : "We don't have curated resources for your skills yet. Check back later or visit our analyzer to add more skills."
            }
          </p>
        </div>
      ) : (
        <div style={resourcesContainerStyle}>
          {skillsWithResources.map(skill => (
            <SkillSection key={skill.name} skill={skill} />
          ))}
        </div>
      )}

      {/* Info Section */}
      <div style={infoSectionStyle}>
        <h2 style={infoTitleStyle}>About These Resources</h2>
        <div style={infoGridStyle}>
          <div style={infoCardStyle}>
            <div style={infoIconStyle}>🎯</div>
            <h4 style={infoCardTitleStyle}>Curated Selection</h4>
            <p style={infoCardTextStyle}>
              Each resource is hand-picked for quality and relevance to help you learn effectively.
            </p>
          </div>

          <div style={infoCardStyle}>
            <div style={infoIconStyle}>📊</div>
            <h4 style={infoCardTitleStyle}>Multiple Formats</h4>
            <p style={infoCardTextStyle}>
              Mix of video tutorials, documentation, courses, and interactive learning materials.
            </p>
          </div>

          <div style={infoCardStyle}>
            <div style={infoIconStyle}>🚀</div>
            <h4 style={infoCardTitleStyle}>Skill-Focused</h4>
            <p style={infoCardTextStyle}>
              Resources are organized by skill, making it easy to find exactly what you need to learn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  maxWidth: "1200px",
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
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "12px",
};

const subtitleStyle = {
  color: "#64748b",
  fontSize: "1.1rem",
  maxWidth: "700px",
  margin: "0 auto",
};

const filterSectionStyle = {
  marginBottom: "40px",
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "16px",
};

const filterButtonsStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const filterButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontWeight: "500",
};

const activeFilterStyle = {
  ...filterButtonStyle,
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  color: "white",
  borderColor: "#4f46e5",
};

const resourcesContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
  marginBottom: "60px",
};

const skillSectionStyle = {
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
  backdropFilter: "blur(15px)",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid rgba(226, 232, 240, 0.5)",
};

const skillHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
};

const skillNameStyle = {
  fontSize: "1.4rem",
  fontWeight: "700",
  color: "#1e293b",
  margin: 0,
};

const skillStatusStyle = {
  fontSize: "0.9rem",
  fontWeight: "600",
};

const resourcesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "16px",
};

const resourceCardStyle = {
  background: "rgba(255, 255, 255, 0.6)",
  borderRadius: "12px",
  padding: "16px",
  border: "1px solid rgba(226, 232, 240, 0.3)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const resourceHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const resourceTypeBadgeStyle = (type) => {
  const colors = {
    Course: "var(--primary)",
    Video: "var(--danger)",
    Docs: "var(--success)"
  };

  return {
    padding: "4px 8px",
    backgroundColor: `${colors[type] || "#6b7280"}20`,
    color: colors[type] || "#6b7280",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
  };
};

const resourceProviderStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
  fontWeight: "500",
};

const resourceTitleStyle = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 12px 0",
  lineHeight: "1.4",
};

const resourceLinkStyle = {
  display: "inline-block",
  color: "#4f46e5",
  textDecoration: "none",
  fontSize: "0.9rem",
  fontWeight: "500",
  transition: "color 0.2s ease",
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "80px 20px",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
  backdropFilter: "blur(15px)",
  borderRadius: "20px",
  border: "1px solid rgba(226, 232, 240, 0.5)",
  marginBottom: "60px",
};

const emptyIconStyle = {
  fontSize: "4rem",
  marginBottom: "16px",
};

const emptyTitleStyle = {
  fontSize: "1.3rem",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "8px",
};

const emptyTextStyle = {
  color: "#6b7280",
  fontSize: "1rem",
  maxWidth: "500px",
  margin: "0 auto",
  lineHeight: "1.5",
};

const infoSectionStyle = {
  marginTop: "40px",
};

const infoTitleStyle = {
  fontSize: "1.8rem",
  fontWeight: "700",
  color: "#1e293b",
  textAlign: "center",
  marginBottom: "32px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
};

const infoCardStyle = {
  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)",
  backdropFilter: "blur(15px)",
  borderRadius: "16px",
  padding: "24px",
  textAlign: "center",
  border: "1px solid rgba(79, 70, 229, 0.1)",
};

const infoIconStyle = {
  fontSize: "2.5rem",
  marginBottom: "16px",
};

const infoCardTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#1e293b",
  marginBottom: "8px",
};

const infoCardTextStyle = {
  color: "#64748b",
  fontSize: "0.9rem",
  lineHeight: "1.5",
  margin: 0,
};