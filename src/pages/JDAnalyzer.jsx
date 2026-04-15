import { useState } from "react";
import { saveData, getData } from "../utils/storage";
import { extractSkills } from "../utils/aiApi";

export default function JDAnalyzer() {
  const [jdText, setJdText] = useState(getData("lastJD") || "");
  const [skills, setSkills] = useState(getData("extractedSkills") || {});
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const extracted = await extractSkills(jdText);
      setSkills(extracted);
      saveData("extractedSkills", extracted);
      saveData("lastJD", jdText);
    } catch (err) {
      setError(err.message || "Failed to analyze JD. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToTracker = () => {
    const allSkills = Array.isArray(skills) 
      ? skills 
      : Object.values(skills).flat();
      
    const existing = getData("skillTracker") || [];
    const newSkills = [...new Set([...existing, ...allSkills.map(s => typeof s === 'string' ? { name: s, learned: false } : s)])];
    saveData("skillTracker", newSkills);
    alert("All skills added to your general tracker!");
  };

  const handleAddToCompanyTracker = () => {
    if (!companyName.trim()) return alert("Please enter a company name!");
    
    const trackers = getData("companyTrackers") || {};
    
    // Ensure we don't overwrite metadata if company already exists
    const existingCompany = trackers[companyName] || {
      name: companyName,
      role: "AI Analyzed Position",
      skills: [],
      addedDate: new Date().toISOString()
    };
    
    // Extract and flatten skills from the AI response
    const newSkillsFromJD = Array.isArray(skills) 
      ? skills 
      : Object.values(skills).flat();
    
    // Merge Skills and deduplicate
    existingCompany.skills = [...new Set([...(existingCompany.skills || []), ...newSkillsFromJD])];
    
    trackers[companyName] = existingCompany;
    saveData("companyTrackers", trackers);

    // Sync to global skill tracker
    const globalSkills = getData("skillTracker") || [];
    const updatedGlobal = [...globalSkills];
    newSkillsFromJD.forEach(sName => {
      const name = typeof sName === 'string' ? sName : sName.name;
      if (!updatedGlobal.find(g => g.name.toLowerCase() === name.toLowerCase())) {
        updatedGlobal.push({ name, learned: false });
      }
    });
    saveData("skillTracker", updatedGlobal);

    alert(`Skills added to ${companyName} tracker!`);
  };

  const hasSkills = Array.isArray(skills) ? skills.length > 0 : Object.keys(skills).length > 0;

  return (
    <div className="animate-fade-in container-full" style={analyzerLayout}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 className="glow-text" style={titleStyle}>Analyzer</h1>
        <p style={subtitleStyle}>Extract required skills from any job description.</p>
      </header>

      {/* Input Zone */}
      <section className="glass-card" style={loading ? {...inputZone, animation: 'pulse-glow 2s infinite'} : inputZone}>
        <div style={inputHeader}>
          <label style={labelStyle}>Job Description Content</label>
          {loading && <div style={loaderTag}>AI Processing...</div>}
        </div>
        <textarea
          style={textareaStyle}
          placeholder="Paste requirements, description, or role overview here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          disabled={loading}
        />
        <button 
          style={loading ? {...actionBtn, opacity: 0.5, cursor: 'not-allowed'} : actionBtn} 
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Description"}
        </button>
        {error && <p style={errorStyle}>{error}</p>}
      </section>

      {/* Results Board */}
      {hasSkills && !loading && (
        <section className="animate-fade-in" style={resultsBoard}>
          <div style={resultsHeader}>
            <h2 style={resultsTitle}>Extracted Skills</h2>
            <div style={headerActions}>
               <button style={secBtn} onClick={handleAddAllToTracker}>
                 Quick Add to Tracker
               </button>
            </div>
          </div>
          
          <div style={categoriesGrid}>
            {!Array.isArray(skills) && Object.entries(skills).map(([category, list]) => (
              <div key={category} className="glass-card" style={categoryCard}>
                <h3 style={categoryTitle}>{category}</h3>
                <div style={skillList}>
                  {list.map((skill, index) => (
                    <span key={index} style={skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Integration Footer */}
          <div className="glass-card" style={integrationFooter}>
             <input 
                type="text" 
                placeholder="Company Name (e.g. Google, Meta)" 
                style={footerInput}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <button style={priBtn} onClick={handleAddToCompanyTracker}>
                Add to Company Tracker
              </button>
          </div>
        </section>
      )}
    </div>
  );
}

// Styles
const analyzerLayout = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "12px",
};

const titleStyle = {
  fontSize: "36px",
  marginBottom: "12px",
};

const subtitleStyle = {
  color: "hsl(var(--text-dim))",
  fontSize: "16px",
};

const inputZone = {
  padding: "32px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  border: "1px solid hsla(var(--border-glass))",
};

const inputHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "hsl(var(--text-muted))",
};

const loaderTag = {
  fontSize: "12px",
  fontWeight: "800",
  padding: "4px 12px",
  background: "hsla(var(--accent) / 0.1)",
  color: "hsl(var(--accent))",
  borderRadius: "100px",
  border: "1px solid hsla(var(--accent) / 0.3)",
};

const textareaStyle = {
  width: "100%",
  minHeight: "280px",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid hsla(var(--border-glass))",
  background: "hsla(var(--bg-page) / 0.5)",
  color: "white",
  fontSize: "15px",
  lineHeight: "1.6",
  outline: "none",
  resize: "vertical",
  transition: "var(--transition-smooth)",
  fontFamily: "inherit",
};

const actionBtn = {
  padding: "18px",
  borderRadius: "14px",
  border: "none",
  background: "hsl(var(--primary))",
  color: "white",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 10px 20px -5px hsla(var(--primary-glow))",
  transition: "var(--transition-spring)",
};

const resultsBoard = {
  marginTop: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const resultsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 8px",
};

const resultsTitle = {
  fontSize: "24px",
  fontWeight: "800",
};

const headerActions = {
  display: "flex",
  gap: "12px",
};


const categoriesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
  gap: "24px",
};

const categoryCard = {
  padding: "24px",
  border: "1px solid hsla(var(--border-glass))",
};

const categoryTitle = {
  fontSize: "14px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "hsl(var(--accent))",
  marginBottom: "20px",
};

const skillList = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const skillTag = {
  padding: "8px 16px",
  background: "hsla(var(--text-main) / 0.05)",
  color: "hsl(var(--text-dim))",
  borderRadius: "100px",
  fontSize: "13px",
  fontWeight: "600",
  border: "1px solid hsla(var(--border-glass))",
  transition: "var(--transition-smooth)",
};

const integrationFooter = {
  display: "flex",
  gap: "16px",
  padding: "24px",
  alignItems: "center",
  flexWrap: "wrap",
};

const footerInput = {
  flex: 1,
  minWidth: "250px",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid hsla(var(--border-glass))",
  background: "hsla(var(--bg-page) / 0.5)",
  color: "white",
  outline: "none",
};

const priBtn = {
  padding: "14px 24px",
  borderRadius: "12px",
  border: "none",
  background: "hsl(var(--primary))",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const secBtn = {
  padding: "10px 20px",
  borderRadius: "100px",
  border: "1px solid hsla(var(--primary) / 0.5)",
  background: "hsla(var(--primary) / 0.1)",
  color: "white",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const errorStyle = {
  color: "hsl(var(--danger))",
  textAlign: "center",
  fontSize: "14px",
};
