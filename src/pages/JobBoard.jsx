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
      setError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (job) => {
    const saved = getData("savedJobs") || [];
    const alreadySaved = saved.find((j) => j.id === job.id);
    if (alreadySaved) return alert("Job already saved!");
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
    alert(`"${job.title}" saved to Company Tracker!`);
  };

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Job Board</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Search jobs by role and location, then analyze the JD.
      </p>

      {/* Filter Section */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Role  (e.g. Frontend Developer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Location  (e.g. Bangalore)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={inputStyle}
        />
        <button onClick={handleSearch} disabled={loading} style={buttonStyle}>
          {loading ? "Searching..." : "Search Jobs"}
        </button>
      </div>

      {/* Error */}
      {error && <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}

      {/* No results */}
      {searched && !loading && jobs.length === 0 && !error && (
        <p style={{ color: "var(--text-secondary)" }}>
          No jobs found. Try a different role or location.
        </p>
      )}

      {/* Job Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {jobs.map((job) => (
          <div key={job.id} style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px" }}>{job.title}</h3>
                <p style={{ margin: "0", color: "var(--text)", fontWeight: "500" }}>
                  {job.company.display_name}
                </p>
                <p style={{ margin: "4px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                  {job.location.display_name}
                </p>
              </div>
              <a
                href={job.redirect_url}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                View Job
              </a>
            </div>

            <p
              style={{
                margin: "12px 0",
                fontSize: "14px",
                color: "#444",
                lineHeight: "1.6",
              }}
            >
              {job.description.slice(0, 200)}...
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => handleSaveJob(job)} style={secondaryBtn}>
                Add to Tracker
              </button>
              <a
                href={job.redirect_url}
                target="_blank"
                rel="noreferrer"
                style={applyBtn}
              >
                Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 14px",
  fontSize: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  flex: 1,
  minWidth: "200px",
  outline: "none",
};

const buttonStyle = {
  padding: "10px 24px",
  fontSize: "15px",
  backgroundColor: "#4F46E5",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "8px 16px",
  fontSize: "13px",
  backgroundColor: "var(--bg-tinted)",
  color: "var(--text)",
  border: "1px solid #ddd",
  borderRadius: "6px",
  cursor: "pointer",
};

const cardStyle = {
  padding: "20px",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const linkStyle = {
  padding: "8px 16px",
  backgroundColor: "var(--primary-light)",
  color: "var(--primary)",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: "500",
  whiteSpace: "nowrap",
};

const applyBtn = {
  padding: "8px 16px",
  fontSize: "13px",
  backgroundColor: "#4F46E5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  textDecoration: "none",
  fontWeight: "500",
};
