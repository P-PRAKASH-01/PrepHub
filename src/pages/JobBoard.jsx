import { useState } from "react";
import { searchJobs } from "../utils/jobApi";
import { saveData, getData } from "../utils/storage";

export default function JobBoard() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!role.trim() && !location.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const results = await searchJobs({ role, location });
      setJobs(results);
    } catch {
      setError("Grid link failed. System re-routing...");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (job) => {
    const saved = getData("savedJobs") || [];
    const alreadySaved = saved.find((j) => j.id === job.id);
    if (alreadySaved) return;

    const updatedSaved = [
      ...saved,
      {
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        description: job.description,
        url: job.redirect_url,
      },
    ];
    saveData("savedJobs", updatedSaved);
  };

  return (
    <div className="animate-fade-in container-full" style={boardLayout}>
      <header style={headerStyle}>
        <h1 className="glow-text" style={titleStyle}>Job Board</h1>
        <p style={subtitleStyle}>Explore global opportunities and accelerate your career path.</p>
      </header>

      {/* Search Bar */}
      <section className="glass-card" style={searchNexus}>
        <div className="search-nexus-responsive">
          <div style={inputItem}>
             <label style={labelStyle}>Target Role</label>
             <input
               style={inputStyle}
               placeholder="e.g. Software Engineer"
               value={role}
               onChange={(e) => setRole(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSearch()}
             />
          </div>
          <div className="divider" style={divider}></div>
          <div style={inputItem}>
             <label style={labelStyle}>Location</label>
             <input
               style={inputStyle}
               placeholder="e.g. Remote / New York"
               value={location}
               onChange={(e) => setLocation(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSearch()}
             />
          </div>
          <button onClick={handleSearch} style={searchBtn}>
            {loading ? "Searching..." : "Find Jobs"}
          </button>
        </div>
      </section>

      {/* Results Engine */}
      <div style={resultsGrid}>
        {error && <div style={errorMsg}>{error}</div>}
        
        {!searched && !loading && (
          <div style={emptyNexus}>Enter search parameters to initiate data retrieval.</div>
        )}

        {searched && !loading && jobs.length === 0 && !error && (
          <div style={emptyNexus}>No matches found in the current sector. Try broadening scope.</div>
        )}

        {jobs.map((job) => (
          <div key={job.id} className="glass-card animate-fade-in" style={jobCard}>
            <div style={cardHeader}>
               <div style={companyInfo}>
                  <h3 style={jobTitle}>{job.title}</h3>
                  <p style={companyName}>{job.company.display_name}</p>
               </div>
               <span style={locBadge}>{job.location.display_name}</span>
            </div>

            <p style={jobDesc}>{job.description.slice(0, 180)}...</p>

            <div style={tagCloud}>
              {["Full-time", "Remote Ready", "Level: Entry"].map(tag => (
                <span key={tag} style={tagStyle}>{tag}</span>
              ))}
            </div>

            <div style={cardActions}>
              <button onClick={() => handleSaveJob(job)} style={trackerBtn}>
                Add to Tracker
              </button>
              <a href={job.redirect_url} target="_blank" rel="noreferrer" style={applyBtn}>
                Initiate Application
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles
const boardLayout = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const headerStyle = { textAlign: "center", marginBottom: "8px" };
const titleStyle = { fontSize: "36px" };
const subtitleStyle = { color: "hsl(var(--text-dim))", fontSize: "16px" };

const searchNexus = {
  padding: "8px",
  borderRadius: "100px",
  border: "1px solid hsla(var(--border-glass))",
};

const inputItem = { flex: 1, display: "flex", flexDirection: "column", gap: "2px" };

const labelStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "hsl(var(--primary))",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "14px",
  outline: "none",
  padding: "4px 0",
};

const divider = { width: "1px", height: "30px", background: "hsla(var(--border-glass))", margin: "0 20px" };

const searchBtn = {
  padding: "16px 32px",
  borderRadius: "100px",
  background: "hsl(var(--primary))",
  color: "white",
  fontWeight: "800",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  transition: "var(--transition-spring)",
};

const resultsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  marginBottom: "60px",
};

const jobCard = {
  padding: "32px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  border: "1px solid hsla(var(--border-glass))",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const companyInfo = { display: "flex", flexDirection: "column", gap: "4px" };
const jobTitle = { fontSize: "22px", fontWeight: "800" };
const companyName = { color: "hsl(var(--accent))", fontWeight: "700", fontSize: "14px" };

const locBadge = {
  fontSize: "11px",
  background: "hsla(var(--text-main) / 0.05)",
  color: "hsl(var(--text-muted))",
  padding: "6px 14px",
  borderRadius: "100px",
  border: "1px solid hsla(var(--border-glass))",
};

const jobDesc = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "hsl(var(--text-dim))",
};

const tagCloud = { display: "flex", gap: "8px" };
const tagStyle = {
  fontSize: "11px",
  color: "hsl(var(--text-muted))",
  background: "hsla(var(--bg-glass))",
  padding: "4px 10px",
  borderRadius: "4px",
  border: "1px solid hsla(var(--border-glass))",
};

const cardActions = { display: "flex", gap: "12px", marginTop: "8px" };

const trackerBtn = {
  padding: "12px 24px",
  borderRadius: "100px",
  background: "hsla(var(--text-main) / 0.05)",
  color: "white",
  border: "1px solid hsla(var(--border-glass))",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer",
};

const applyBtn = {
  padding: "12px 24px",
  borderRadius: "100px",
  background: "hsl(var(--primary))",
  color: "white",
  fontWeight: "800",
  border: "none",
  textDecoration: "none",
  fontSize: "13px",
  textAlign: "center",
};

const errorMsg = { color: "hsl(var(--danger))", textAlign: "center", padding: "20px" };
const emptyNexus = { color: "hsl(var(--text-muted))", textAlign: "center", padding: "80px" };
