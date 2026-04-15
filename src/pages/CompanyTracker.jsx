import { useState } from "react";
import { getData, saveData } from "../utils/storage";
import { useNavigate } from "react-router-dom";

export default function CompanyTracker() {
  const [companies, setCompanies] = useState(() => getData("companyTrackers") || {});
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [skills] = useState(() => getData("skillTracker") || []);
  const navigate = useNavigate();

  const addCompany = () => {
    if (!newCompany.trim() || !newRole.trim()) return;

    const companyKey = `${newCompany.trim()}-${Date.now()}`;
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
    if (!updatedCompanies[companyKey].skills) updatedCompanies[companyKey].skills = [];

    if (!updatedCompanies[companyKey].skills.includes(skillName)) {
      updatedCompanies[companyKey].skills.push(skillName);
      setCompanies(updatedCompanies);
      saveData("companyTrackers", updatedCompanies);

      // Sync to global skill tracker
      const globalSkills = getData("skillTracker") || [];
      if (!globalSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) {
        const updatedGlobal = [...globalSkills, { name: skillName, learned: false }];
        saveData("skillTracker", updatedGlobal);
      }
    }
  };

  const removeSkillFromCompany = (companyKey, skillName) => {
    const updatedCompanies = { ...companies };
    updatedCompanies[companyKey].skills = updatedCompanies[companyKey].skills.filter(s => s !== skillName);
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
    const learnedSkills = companySkills.filter(name => {
      const s = skills.find(obj => obj.name === name);
      return s && s.learned;
    });
    return Math.round((learnedSkills.length / companySkills.length) * 100);
  };

  const getStatusInfo = (ready) => {
    if (ready >= 80) return { label: "Deployment Ready", color: "hsl(var(--success))" };
    if (ready >= 50) return { label: "Developing", color: "hsl(var(--warning))" };
    return { label: "High Gap", color: "hsl(var(--danger))" };
  };

  return (
    <div className="animate-fade-in" style={trackerLayout}>
      <header style={headerStyle}>
        <div style={headerText}>
          <h1 className="glow-text" style={titleStyle}>Target Enterprise Tracker</h1>
          <p style={subtitleStyle}>Strategize your application roadmap and monitor placement readiness.</p>
        </div>
        <div style={headerActions}>
           <button style={actionBtn} onClick={() => navigate("/analyzer")}>
             Analyze JD 🔍
           </button>
           <button style={actionBtn} onClick={() => navigate("/jobs")}>
             Explore Jobs 🎯
           </button>
        </div>
      </header>

      {/* Control Zone */}
      <section className="glass-card" style={controlZone}>
         <div style={inputRow}>
            <div style={inputGroup}>
               <label style={labelStyle}>Company Name</label>
               <input 
                 style={inputStyle} 
                 placeholder="e.g. Google" 
                 value={newCompany}
                 onChange={(e) => setNewCompany(e.target.value)}
               />
            </div>
            <div style={inputGroup}>
               <label style={labelStyle}>Target Role</label>
               <input 
                 style={inputStyle} 
                 placeholder="e.g. SWE Intern" 
                 value={newRole}
                 onChange={(e) => setNewRole(e.target.value)}
               />
            </div>
            <button style={deployBtn} onClick={addCompany}>Initiate Tracker</button>
         </div>
      </section>

      {/* Grid */}
      <div style={companiesGrid}>
        {Object.keys(companies).length === 0 ? (
          <div style={emptyState}>No enterprise targets locked. Use the JD Analyzer to start.</div>
        ) : (
          Object.entries(companies).map(([key, company]) => {
            const readiness = calculateReadiness(company.skills);
            const status = getStatusInfo(readiness);
            const isExpanded = selectedCompany === key;

            return (
              <div key={key} className="glass-card animate-fade-in" style={companyCard(isExpanded)}>
                <div style={cardMain}>
                  <div style={companyMeta}>
                    <h3 style={companyNameStyle}>{company.name || key}</h3>
                    <p style={companyRole}>{company.role || "Specialist Role"}</p>
                  </div>
                  <div style={readinessCircle(readiness, status.color)}>
                    {readiness}%
                  </div>
                </div>

                <div style={statusRow}>
                  <span style={statusBadge(status.color)}>{status.label}</span>
                  <span style={skillCount}>{company.skills?.length || 0} skills mapped</span>
                </div>

                <div style={cardActions}>
                   <button style={isExpanded ? hideBtn : manageBtn} onClick={() => setSelectedCompany(isExpanded ? null : key)}>
                     {isExpanded ? "Collapse" : "Manage Skill Map"}
                   </button>
                   <button style={delBtn} onClick={() => deleteCompany(key)}>🗑️</button>
                </div>

                {isExpanded && (
                  <div className="animate-fade-in" style={expandedZone}>
                    <div style={addSkillRow}>
                       <select 
                         style={skillSelect}
                         onChange={(e) => {
                           if (e.target.value) {
                             addSkillToCompany(key, e.target.value);
                             e.target.value = "";
                           }
                         }}
                       >
                         <option value="">Add Skill Path...</option>
                         {skills.filter(s => !company.skills?.includes(s.name)).map(s => (
                           <option key={s.name} value={s.name}>{s.name}</option>
                         ))}
                       </select>
                    </div>
                    <div style={skillTagCloud}>
                      {company.skills?.map(sName => {
                        const isLearned = skills.find(s => s.name === sName)?.learned;
                        return (
                          <div key={sName} style={skillTag(isLearned)}>
                            {sName}
                            <span style={remBtn} onClick={() => removeSkillFromCompany(key, sName)}>×</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Styles
const trackerLayout = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "24px",
};

const headerText = { display: "flex", flexDirection: "column", gap: "8px" };
const titleStyle = { fontSize: "36px" };
const subtitleStyle = { color: "hsl(var(--text-dim))", fontSize: "16px" };

const actionBtn = {
  padding: "12px 24px",
  borderRadius: "100px",
  background: "hsla(var(--primary) / 0.1)",
  color: "white",
  border: "1px solid hsla(var(--primary) / 0.3)",
  fontWeight: "700",
  cursor: "pointer",
};

const controlZone = {
  padding: "24px",
  border: "1px solid hsla(var(--border-glass))",
};

const inputRow = {
  display: "flex",
  gap: "20px",
  alignItems: "flex-end",
  flexWrap: "wrap",
};

const inputGroup = {
  flex: 1,
  minWidth: "200px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  color: "hsl(var(--text-muted))",
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  background: "hsla(var(--bg-page) / 0.5)",
  border: "1px solid hsla(var(--border-glass))",
  color: "white",
  outline: "none",
};

const deployBtn = {
  padding: "12px 32px",
  borderRadius: "12px",
  background: "hsl(var(--primary))",
  color: "white",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 8px 16px -4px hsla(var(--primary-glow))",
};

const companiesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: "24px",
};

const companyCard = (expanded) => ({
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  border: "1px solid hsla(var(--border-glass))",
  gridRow: expanded ? "span 2" : "auto",
});

const cardMain = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const companyNameStyle = { fontSize: "20px", fontWeight: "800" };
const companyRole = { color: "hsl(var(--text-dim))", fontSize: "14px" };

const readinessCircle = (val, color) => ({
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  border: `3px solid ${color}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "800",
  color: "white",
  boxShadow: `0 0 15px -2px ${color}`,
});

const statusRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statusBadge = (color) => ({
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
  padding: "4px 10px",
  borderRadius: "100px",
  background: `${color}15`,
  color: color,
  border: `1px solid ${color}30`,
});

const skillCount = { fontSize: "12px", color: "hsl(var(--text-muted))" };

const cardActions = { display: "flex", gap: "10px" };

const manageBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "100px",
  background: "hsla(var(--text-main) / 0.05)",
  color: "white",
  border: "1px solid hsla(var(--border-glass))",
  fontWeight: "700",
  fontSize: "12px",
  cursor: "pointer",
};

const hideBtn = {
  ...manageBtn,
  background: "hsl(var(--primary))",
  border: "none",
};

const delBtn = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "hsla(var(--danger) / 0.1)",
  border: "none",
  cursor: "pointer",
};

const expandedZone = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  paddingTop: "20px",
  borderTop: "1px solid hsla(var(--border-glass))",
};

const skillSelect = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  background: "hsla(var(--bg-page) / 0.8)",
  color: "white",
  border: "1px solid hsla(var(--border-glass))",
};

const skillTagCloud = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const skillTag = (learned) => ({
  fontSize: "12px",
  padding: "4px 10px",
  borderRadius: "100px",
  background: learned ? "hsla(var(--success) / 0.15)" : "hsla(var(--text-main) / 0.05)",
  color: learned ? "hsl(var(--success))" : "hsl(var(--text-dim))",
  border: `1px solid ${learned ? 'hsla(var(--success) / 0.3)' : 'hsla(var(--border-glass))'}`,
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

const remBtn = { cursor: "pointer", fontSize: "16px", fontWeight: "300" };

const headerActions = {
  display: "flex",
  gap: "12px",
};

const companyMeta = {
  display: "flex",
  gap: "16px",
  fontSize: "14px",
  color: "hsl(var(--text-dim))",
  marginTop: "8px",
};

const addSkillRow = {
  display: "flex",
  gap: "12px",
  marginTop: "20px",
  padding: "16px",
  background: "hsla(var(--text-main) / 0.03)",
  borderRadius: "12px",
};


const emptyState = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "60px",
  color: "hsl(var(--text-muted))",
};