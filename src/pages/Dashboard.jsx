import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getData } from "../utils/storage";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalSkills: 0,
    learnedSkills: 0,
    companiesTracked: 0,
    readinessPercentage: 0
  });

  useEffect(() => {
    // Calculate stats from stored data
    const skillTracker = getData("skillTracker") || [];
    const companyTrackers = getData("companyTrackers") || {};

    const totalSkills = skillTracker.length;
    const learnedSkills = skillTracker.filter(skill => skill.learned).length;
    const companiesTracked = Object.keys(companyTrackers).length;

    // Calculate overall readiness (average across all companies)
    let totalReadiness = 0;
    let companyCount = 0;

    Object.values(companyTrackers).forEach(companyData => {
      if (Array.isArray(companyData)) {
        // Legacy format
        const requiredSkills = companyData.length;
        const learnedCount = companyData.filter(skill => {
          const trackerSkill = skillTracker.find(s => s.name === skill);
          return trackerSkill && trackerSkill.learned;
        }).length;
        totalReadiness += requiredSkills > 0 ? (learnedCount / requiredSkills) * 100 : 0;
        companyCount++;
      } else {
        // Modern format with categories
        Object.values(companyData).forEach(categorySkills => {
          const requiredSkills = categorySkills.length;
          const learnedCount = categorySkills.filter(skill => {
            const trackerSkill = skillTracker.find(s => s.name === skill);
            return trackerSkill && trackerSkill.learned;
          }).length;
          totalReadiness += requiredSkills > 0 ? (learnedCount / requiredSkills) * 100 : 0;
          companyCount++;
        });
      }
    });

    const readinessPercentage = companyCount > 0 ? Math.round(totalReadiness / companyCount) : 0;

    setStats({
      totalSkills,
      learnedSkills,
      companiesTracked,
      readinessPercentage
    });
  }, []);

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div style={{
      ...statCardStyle,
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
      border: `1px solid ${color}30`
    }}>
      <div style={statIconStyle}>
        {icon}
      </div>
      <div style={statContentStyle}>
        <h3 style={statValueStyle}>{value}</h3>
        <p style={statTitleStyle}>{title}</p>
        {subtitle && <p style={statSubtitleStyle}>{subtitle}</p>}
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, to, color, icon }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        ...quickActionStyle,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ ...quickActionIconStyle, color }}>
          {icon}
        </div>
        <div>
          <h4 style={quickActionTitleStyle}>{title}</h4>
          <p style={quickActionDescStyle}>{description}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={containerStyle}>
      {/* Welcome Banner */}
      <div style={welcomeBannerStyle}>
        <div style={welcomeContentStyle}>
          <h1 style={welcomeTitleStyle}>Welcome back, {user?.displayName?.split(' ')[0] || 'User'}! 👋</h1>
          <p style={welcomeSubtitleStyle}>Ready to level up your career? Let's track your progress and land that dream job.</p>
        </div>
        <div style={profileSectionStyle}>
          <img
            src={user?.photoURL || '/default-avatar.png'}
            alt="profile"
            style={profileImageStyle}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={statsGridStyle}>
        <StatCard
          title="Total Skills"
          value={stats.totalSkills}
          subtitle="In your tracker"
          color="var(--primary)"
          icon="🎯"
        />
        <StatCard
          title="Skills Learned"
          value={stats.learnedSkills}
          subtitle={`${stats.totalSkills > 0 ? Math.round((stats.learnedSkills / stats.totalSkills) * 100) : 0}% complete`}
          color="var(--success)"
          icon="✅"
        />
        <StatCard
          title="Companies Tracked"
          value={stats.companiesTracked}
          subtitle="Target organizations"
          color="var(--warning)"
          icon="🏢"
        />
        <StatCard
          title="Avg Readiness"
          value={`${stats.readinessPercentage}%`}
          subtitle="Across all companies"
          color="var(--danger)"
          icon="📊"
        />
      </div>

      {/* Quick Actions */}
      <div style={actionsSectionStyle}>
        <h2 style={sectionTitleStyle}>Quick Actions</h2>
        <div style={actionsGridStyle}>
          <QuickActionCard
            title="Analyze Job Description"
            description="Extract skills from job postings"
            to="/companies"
            color="var(--primary)"
            icon="🔍"
          />
          <QuickActionCard
            title="Track Skills"
            description="Manage your skill progress"
            to="/skills"
            color="var(--success)"
            icon="📈"
          />
          <QuickActionCard
            title="Company Tracker"
            description="Monitor application readiness"
            to="/companies"
            color="var(--warning)"
            icon="🏢"
          />
          <QuickActionCard
            title="Find Resources"
            description="Learn missing skills"
            to="/resources"
            color="var(--danger)"
            icon="📚"
          />
          <QuickActionCard
            title="Browse Jobs"
            description="Find new opportunities"
            to="/companies"
            color="#06b6d4"
            icon="💼"
          />
        </div>
      </div>
    </div>
  );
}

// Glassmorphic Styles
const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "32px",
  minHeight: "100vh",
};

const welcomeBannerStyle = {
  background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary-surface) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: "32px",
  marginBottom: "32px",
  border: "1px solid var(--primary-light)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
};

const welcomeContentStyle = {
  flex: 1,
  minWidth: "300px",
};

const welcomeTitleStyle = {
  fontSize: "2.5rem",
  fontWeight: "800",
  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "8px",
};

const welcomeSubtitleStyle = {
  color: "var(--text-secondary)",
  fontSize: "1.1rem",
  lineHeight: "1.6",
  margin: 0,
};

const profileSectionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const profileImageStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  border: "3px solid var(--primary-light)",
};

const logoutButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "var(--danger-light)",
  color: "var(--danger)",
  border: "1px solid var(--danger-light)",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "500",
  transition: "all 0.2s ease",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginBottom: "48px",
};

const statCardStyle = {
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
};

const statIconStyle = {
  fontSize: "2.5rem",
  width: "60px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.2)",
  borderRadius: "16px",
};

const statContentStyle = {
  flex: 1,
};

const statValueStyle = {
  fontSize: "2rem",
  fontWeight: "800",
  color: "var(--text)",
  margin: "0 0 4px 0",
};

const statTitleStyle = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "var(--text-secondary)",
  margin: "0 0 4px 0",
};

const statSubtitleStyle = {
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  margin: 0,
};

const actionsSectionStyle = {
  marginTop: "32px",
};

const sectionTitleStyle = {
  fontSize: "1.8rem",
  fontWeight: "700",
  color: "var(--text)",
  marginBottom: "24px",
  textAlign: "center",
};

const actionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
};

const quickActionStyle = {
  backdropFilter: "blur(15px)",
  borderRadius: "16px",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  textDecoration: "none",
  color: "inherit",
  transition: "all 0.3s ease",
};

const quickActionIconStyle = {
  fontSize: "2rem",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.3)",
  borderRadius: "12px",
};

const quickActionTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 4px 0",
};

const quickActionDescStyle = {
  fontSize: "0.9rem",
  color: "#64748b",
  margin: 0,
  lineHeight: "1.4",
};