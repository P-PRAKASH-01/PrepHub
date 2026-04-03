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
    if (!jdText.trim()) return alert("Please paste a Job Description first!");
    
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
    // Flatten skills from all categories for the general tracker
    const allSkills = Array.isArray(skills) 
      ? skills 
      : Object.values(skills).flat();
      
    const existing = getData("skillTracker") || [];
    const newSkills = [...new Set([...existing, ...allSkills])];
    saveData("skillTracker", newSkills);
    alert("All skills added to your general tracker!");
  };

  const handleAddToCompanyTracker = () => {
    if (!companyName.trim()) return alert("Please enter a company name!");
    
    const trackers = getData("companyTrackers") || {};
    const existingData = trackers[companyName] || {};
    
    let updatedData;
    if (Array.isArray(skills)) {
      // Legacy support: if skills is an array, merge into a "General" category
      const existingSkills = Array.isArray(existingData) ? existingData : (existingData["General"] || []);
      updatedData = [...new Set([...existingSkills, ...skills])];
    } else {
      // Modern Categorized format
      updatedData = { ...existingData };
      Object.entries(skills).forEach(([category, list]) => {
        updatedData[category] = [...new Set([...(updatedData[category] || []), ...list])];
      });
    }
    
    trackers[companyName] = updatedData;
    saveData("companyTrackers", trackers);
    alert(`Skills added to ${companyName} tracker!`);
  };

  // Helper to check if skills is empty (works for both [] and {})
  const hasSkills = Array.isArray(skills) ? skills.length > 0 : Object.keys(skills).length > 0;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>JD Analyzer</h1>
        <p style={subtitleStyle}>Extract and categorize required skills automatically using AI.</p>
      </header>

      <section style={inputSectionStyle}>
        <label style={labelStyle}>Paste Job Description</label>
        <textarea
          style={textareaStyle}
          placeholder="Paste the full job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        <button 
          style={loading ? {...buttonStyle, opacity: 0.7, cursor: 'not-allowed'} : buttonStyle} 
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing & Categorizing..." : "Analyze Job Description"}
        </button>
        {error && <p style={errorStyle}>{error}</p>}
      </section>

      {hasSkills && (
        <section style={resultsSectionStyle}>
          <h2 style={sectionTitleStyle}>Extracted & Categorized Skills</h2>
          
          {Array.isArray(skills) ? (
            // Legacy rendering for old data
            <div style={tagContainerStyle}>
              {skills.map((skill, index) => (
                <span key={index} style={tagStyle}>{skill}</span>
              ))}
            </div>
          ) : (
            // Modern grouped rendering
            Object.entries(skills).map(([category, list]) => (
              <div key={category} style={{ marginBottom: "30px" }}>
                <h3 style={categoryHeaderStyle}>{category}</h3>
                <div style={tagContainerStyle}>
                  {list.map((skill, index) => (
                    <span key={index} style={tagStyle}>{skill}</span>
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={actionsContainerStyle}>
            <div style={actionGroupStyle}>
              <button style={secondaryButtonStyle} onClick={handleAddAllToTracker}>
                Add All to My Tracker
              </button>
            </div>
            
            <div style={{...actionGroupStyle, borderTop: '1px solid var(--border)', paddingTop: '20px'}}>
              <input 
                type="text" 
                placeholder="Enter Company Name" 
                style={inputStyle}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <button style={primaryButtonStyle} onClick={handleAddToCompanyTracker}>
                Add to Company Tracker
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// PREMIUM STYLES (Vanilla CSS)
const containerStyle = {
  maxWidth: "900px",
  margin: "40px auto",
  padding: "40px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  borderRadius: "24px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
  border: "1px solid rgba(79, 70, 229, 0.1)",
  fontFamily: "'Inter', sans-serif",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px",
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

const inputSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginBottom: "40px",
};

const labelStyle = {
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "#1e293b",
};

const textareaStyle = {
  width: "100%",
  minHeight: "250px",
  padding: "20px",
  borderRadius: "16px",
  border: "2px solid #e2e8f0",
  fontSize: "1rem",
  lineHeight: "1.6",
  transition: "all 0.2s ease",
  outline: "none",
  resize: "vertical",
  backgroundColor: "var(--bg-page)",
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: "16px 32px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#4f46e5",
  color: "white",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
};

const resultsSectionStyle = {
  marginTop: "40px",
  paddingTop: "40px",
  borderTop: "1px solid #f1f5f9",
};

const sectionTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "24px",
};

const categoryHeaderStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#4f46e5",
  marginBottom: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tagContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "40px",
};

const tagStyle = {
  padding: "8px 16px",
  backgroundColor: "var(--primary-light)",
  color: "var(--primary)",
  borderRadius: "100px",
  fontSize: "0.9rem",
  fontWeight: "600",
  border: "1px solid #dee1ff",
  animation: "fadeIn 0.5s ease backwards",
};

const actionsContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  background: "#fdfdff",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid #f1f5f9",
};

const actionGroupStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  flexWrap: "wrap",
};

const inputStyle = {
  flex: 1,
  minWidth: "200px",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "0.95rem",
  outline: "none",
};

const primaryButtonStyle = {
  padding: "12px 24px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#4f46e5",
  color: "white",
  fontSize: "0.95rem",
  fontWeight: "600",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 24px",
  borderRadius: "10px",
  border: "1px solid #4f46e5",
  backgroundColor: "transparent",
  color: "#4f46e5",
  fontSize: "0.95rem",
  fontWeight: "600",
  cursor: "pointer",
};

const errorStyle = {
  color: "#ef4444",
  fontSize: "0.9rem",
  marginTop: "8px",
  fontWeight: "500",
};
