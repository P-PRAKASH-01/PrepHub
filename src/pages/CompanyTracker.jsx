import { useState, useEffect } from "react";
import { getData, saveData } from "../utils/storage";
import { useNavigate } from "react-router-dom";

export default function CompanyTracker() {
  const [companies, setCompanies] = useState({});
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCompanies = getData("companyTrackers") || {};
    const storedSkills = getData("skillTracker") || [];
    setCompanies(storedCompanies);
    setSkills(storedSkills);
  }, []);

  const addCompany = () => {
    if (!newCompany.trim() || !newRole.trim()) return alert("Please enter both company name and role!");

    const companyKey = `${newCompany.trim()}-${Date.now()}`; // Unique key
    const updatedCompanies = {
      ...companies,
      [companyKey]: {
        name: newCompany.trim(),
        role: newRole.trim(),
        skills: [],
        addedDate: new Date().toISOString()
      }
    };

    setCompanies(updatedCompanies);
    saveData("companyTrackers", updatedCompanies);
    setNewCompany("");
    setNewRole("");
  };

  const addSkillToCompany = (companyKey, skillName) => {
    const updatedCompanies = { ...companies };
    if (!updatedCompanies[companyKey].skills) {
      updatedCompanies[companyKey].skills = [];
    }

    if (!updatedCompanies[companyKey].skills.includes(skillName)) {
      updatedCompanies[companyKey].skills.push(skillName);
      setCompanies(updatedCompanies);
      saveData("companyTrackers", updatedCompanies);
    }
  };

  const removeSkillFromCompany = (companyKey, skillName) => {
    const updatedCompanies = { ...companies };
    updatedCompanies[companyKey].skills = updatedCompanies[companyKey].skills.filter(
      skill => skill !== skillName
    );
    setCompanies(updatedCompanies);
    saveData("companyTrackers", updatedCompanies);
  };

  const deleteCompany = (companyKey) => {
    const updatedCompanies = { ...companies };
    delete updatedCompanies[companyKey];
    setCompanies(updatedCompanies);
    saveData("companyTrackers", updatedCompanies);
    if (selectedCompany === companyKey) setSelectedCompany(null);
  };

  const calculateReadiness = (companySkills) => {
    if (!companySkills || companySkills.length === 0) return 0;

    const learnedSkills = companySkills.filter(skillName => {
      const skill = skills.find(s => s.name === skillName);
      return skill && skill.learned;
    });

    return Math.round((learnedSkills.length / companySkills.length) * 100);
  };

  const getReadinessStatus = (percentage) => {
    if (percentage >= 80) return { status: "Ready to Apply", color: "var(--success)", icon: "🚀" };
    if (percentage >= 60) return { status: "Getting There", color: "var(--warning)", icon: "⚡" };
    if (percentage >= 30) return { status: "Needs Work", color: "var(--danger)", icon: "📚" };
    return { status: "Not Ready", color: "var(--neutral)", icon: "⏳" };
  };

  const CompanyCard = ({ companyKey, company }) => {
    const readiness = calculateReadiness(company.skills);
    const status = getReadinessStatus(readiness);

    return (
      <div style={{
        ...companyCardStyle,
        border: `2px solid ${status.color}30`,
        background: `linear-gradient(135deg, ${status.color}10 0%, ${status.color}05 100%)`
      }}>
        <div style={companyHeaderStyle}>
          <div>
            <h3 style={companyNameStyle}>{company.name}</h3>
            <p style={companyRoleStyle}>{company.role}</p>
          </div>
          <div style={readinessBadgeStyle(status.color)}>
            {status.icon} {status.status}
          </div>
        </div>

        <div style={readinessBarStyle}>
          <div style={readinessFillStyle(readiness, status.color)} />
          <span style={readinessTextStyle}>{readiness}% Ready</span>
        </div>

        <div style={companyStatsStyle}>
          <span style={statStyle}>
            {company.skills?.filter(skill => {
              const skillObj = skills.find(s => s.name === skill);
              return skillObj && skillObj.learned;
            }).length || 0} / {company.skills?.length || 0} skills learned
          </span>
        </div>

        <div style={companyActionsStyle}>
          <button
            onClick={() => setSelectedCompany(selectedCompany === companyKey ? null : companyKey)}
            style={expandButtonStyle}
          >
            {selectedCompany === companyKey ? "Hide Details" : "Manage Skills"}
          </button>
          <button
            onClick={() => deleteCompany(companyKey)}
            style={deleteButtonStyle}
          >
            Delete
          </button>
        </div>

        {selectedCompany === companyKey && (
          <div style={skillManagementStyle}>
            <h4 style={managementTitleStyle}>Required Skills</h4>

            {/* Add skill dropdown */}
            <div style={addSkillFormStyle}>
              <select style={skillSelectStyle}>
                <option value="">Select a skill to add...</option>
                {skills
                  .filter(skill => !company.skills?.includes(skill.name))
                  .map(skill => (
                    <option key={skill.name} value={skill.name}>
                      {skill.name} {skill.learned ? "(Learned)" : "(In Progress)"}
                    </option>
                  ))
                }
              </select>
              <button
                onClick={(e) => {
                  const skillName = e.target.previousSibling.value;
                  if (skillName) addSkillToCompany(companyKey, skillName);
                  e.target.previousSibling.value = "";
                }}
                style={addSkillButtonStyle}
              >
                Add
              </button>
            </div>

            {/* Current skills */}
            <div style={skillTagsStyle}>
              {company.skills?.map(skillName => {
                const skill = skills.find(s => s.name === skillName);
                const isLearned = skill && skill.learned;

                return (
                  <span
                    key={skillName}
                    style={{
                      ...skillTagStyle,
                      backgroundColor: isLearned ? "var(--success-light)" : "var(--danger-light)",
                      color: isLearned ? "var(--success)" : "var(--danger)"
                    }}
                  >
                    {skillName} {isLearned ? "✅" : "⏳"}
                    <button
                      onClick={() => removeSkillFromCompany(companyKey, skillName)}
                      style={removeSkillButtonStyle}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <header style={{...headerStyle, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div>
          <h1 style={titleStyle}>Companies & Roles</h1>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => navigate("/analyzer")}
            style={{
              padding: "12px 24px",
              background: "var(--bg-surface)",
              color: "var(--primary)",
              border: "1.5px solid var(--primary)",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "none",
              cursor: "pointer"
            }}
          >
            <span role="img" aria-label="analyze">🔍</span> JD Analyzer
          </button>
          <button
            onClick={() => navigate("/jobs")}
            style={{
              padding: "12px 24px",
              background: "var(--primary-light)",
              color: "var(--primary)",
              border: "none",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "none",
              cursor: "pointer"
            }}
          >
            <span role="img" aria-label="jobs">💼</span> Browse Jobs
          </button>
        </div>
      </header>

      {/* Add Company Section */}
      <div id="add-company-form" style={addCompanySectionStyle}>
        <h2 style={sectionTitleStyle}>Add Target Company</h2>
        <div style={addCompanyFormStyle}>
          <input
            type="text"
            placeholder="Company name (e.g., Google, Meta, Amazon)"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            style={companyInputStyle}
          />
          <input
            type="text"
            placeholder="Role/Position (e.g., Software Engineer, Product Manager)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            style={roleInputStyle}
          />
          <button onClick={addCompany} style={addCompanyButtonStyle}>
            Add Company
          </button>
        </div>
      </div>

      {/* Companies List */}
      <div style={companiesGridStyle}>
        {Object.keys(companies).length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🏢</div>
            <h3 style={emptyTitleStyle}>No companies tracked yet</h3>
            <p style={emptyTextStyle}>
              Start by adding companies you're interested in working for. Track the skills they require and monitor your readiness to apply.
            </p>
          </div>
        ) : (
          Object.entries(companies).map(([companyKey, company]) => (
            <CompanyCard key={companyKey} companyKey={companyKey} company={company} />
          ))
        )}
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

const addCompanySectionStyle = {
  marginBottom: "40px",
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "16px",
};

const addCompanyFormStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  flexWrap: "wrap",
};

const companyInputStyle = {
  flex: 1,
  minWidth: "200px",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "2px solid #e2e8f0",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const roleInputStyle = {
  flex: 1,
  minWidth: "200px",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "2px solid #e2e8f0",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const addCompanyButtonStyle = {
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

const companiesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
  gap: "24px",
};

const companyCardStyle = {
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  padding: "24px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const companyHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "16px",
};

const companyNameStyle = {
  fontSize: "1.3rem",
  fontWeight: "700",
  color: "var(--text)",
  margin: "0 0 4px 0",
};

const companyRoleStyle = {
  fontSize: "0.9rem",
  color: "var(--text-secondary)",
  margin: 0,
};

const readinessBadgeStyle = (color) => ({
  padding: "6px 12px",
  backgroundColor: `${color}20`,
  color: color,
  borderRadius: "20px",
  fontSize: "0.8rem",
  fontWeight: "600",
  border: `1px solid ${color}40`,
});

const readinessBarStyle = {
  width: "100%",
  height: "12px",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  borderRadius: "6px",
  overflow: "hidden",
  marginBottom: "12px",
  position: "relative",
};

const readinessFillStyle = (percentage, color) => ({
  width: `${percentage}%`,
  height: "100%",
  background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
  borderRadius: "6px",
  transition: "width 0.3s ease",
});

const readinessTextStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "white",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
};

const companyStatsStyle = {
  marginBottom: "16px",
};

const statStyle = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
};

const companyActionsStyle = {
  display: "flex",
  gap: "8px",
};

const expandButtonStyle = {
  flex: 1,
  padding: "8px 16px",
  backgroundColor: "var(--primary-light)",
  border: "1px solid var(--primary-light)",
  borderRadius: "8px",
  color: "var(--primary)",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "500",
  transition: "all 0.2s ease",
};

const deleteButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "var(--danger-light)",
  border: "1px solid var(--danger-light)",
  borderRadius: "8px",
  color: "var(--danger)",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "500",
  transition: "all 0.2s ease",
};

const skillManagementStyle = {
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "1px solid var(--border)",
};

const managementTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "var(--text)",
  marginBottom: "12px",
};

const addSkillFormStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px",
};

const skillSelectStyle = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  fontSize: "0.9rem",
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text)",
};

const addSkillButtonStyle = {
  padding: "8px 16px",
  background: "linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.9rem",
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

const skillTagsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const skillTagStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  borderRadius: "16px",
  fontSize: "0.85rem",
  fontWeight: "500",
  border: "1px solid transparent",
};

const removeSkillButtonStyle = {
  background: "none",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  fontSize: "1.2rem",
  lineHeight: 1,
  padding: 0,
  marginLeft: "4px",
};

const emptyStateStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "80px 20px",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
  backdropFilter: "blur(15px)",
  borderRadius: "20px",
  border: "1px solid rgba(226, 232, 240, 0.5)",
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