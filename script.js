// ===================================
// Student Skill Preparation Portal
// Main Application Logic
// ===================================

// ===================================
// Data Structure & State Management
// ===================================

let appState = {
  companies: [],
  currentView: 'dashboard',
  currentCompany: null,
  userSkills: [] // Skills the student already has
};

// ===================================
// LocalStorage Management (Enhanced)
// ===================================

const STORAGE_KEY = 'prepHubState';
const STORAGE_VERSION = '1.0';

// Auto-save debounce timer
let autoSaveTimer = null;

function saveToLocalStorage() {
  try {
    const dataToSave = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data: appState
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('[Storage] Data saved successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save data:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      alert('Storage limit reached. Please export and clear old data.');
    }
    return false;
  }
}

// Auto-save with debounce to prevent excessive writes
function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveToLocalStorage();
  }, 500); // Save 500ms after last change
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Validate data structure
      if (parsed.data && validateAppState(parsed.data)) {
        appState = parsed.data;
        console.log('[Storage] Data loaded successfully from version:', parsed.version);

        // Migrate if needed
        if (parsed.version !== STORAGE_VERSION) {
          console.log('[Storage] Migrating data from', parsed.version, 'to', STORAGE_VERSION);
          migrateData(parsed.version);
          saveToLocalStorage();
        }
      } else {
        console.warn('[Storage] Invalid data structure, using defaults');
        initializeDefaultState();
      }
    } else {
      console.log('[Storage] No saved data found, initializing defaults');
      initializeDefaultState();
    }
  } catch (error) {
    console.error('[Storage] Failed to load data:', error);
    initializeDefaultState();
  }
}

function validateAppState(state) {
  return (
    state &&
    typeof state === 'object' &&
    Array.isArray(state.companies) &&
    Array.isArray(state.userSkills) &&
    typeof state.currentView === 'string'
  );
}

function initializeDefaultState() {
  appState.companies = [];
  appState.userSkills = [];
  appState.currentView = 'dashboard';
  appState.currentCompany = null;
  saveToLocalStorage();
}

function migrateData(fromVersion) {
  // Future version migration logic
  console.log('[Storage] Migration from', fromVersion, 'complete');
}

// Export data as JSON file
function exportData() {
  try {
    const dataToExport = {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      appName: 'PrepHub',
      data: appState
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `prephub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
    return true;
  } catch (error) {
    console.error('[Export] Failed to export data:', error);
    showNotification('Failed to export data', 'error');
    return false;
  }
}

// Import data from JSON file
function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate imported data
        if (!imported.data || !validateAppState(imported.data)) {
          throw new Error('Invalid data format');
        }

        // Confirm before importing
        const confirmMsg = `Import data from ${new Date(imported.exportDate).toLocaleDateString()}?\n\nThis will replace your current data:\n- ${imported.data.companies.length} companies\n- ${imported.data.userSkills.length} skills\n\nCurrent data will be lost unless you export it first.`;

        if (confirm(confirmMsg)) {
          appState = imported.data;
          saveToLocalStorage();
          showNotification('Data imported successfully!', 'success');

          // Refresh current view
          switchView(appState.currentView || 'dashboard');
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('[Import] Failed to import data:', error);
        showNotification('Failed to import data. Invalid file format.', 'error');
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

// Clear all data
function clearAllData() {
  const confirm1 = confirm('⚠️ WARNING: This will delete ALL your data!\n\nAre you sure you want to continue?');
  if (!confirm1) return false;

  const confirm2 = confirm('This action cannot be undone!\n\nClick OK to permanently delete all data.');
  if (!confirm2) return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    initializeDefaultState();
    showNotification('All data cleared', 'success');
    switchView('dashboard');
    return true;
  } catch (error) {
    console.error('[Storage] Failed to clear data:', error);
    showNotification('Failed to clear data', 'error');
    return false;
  }
}

// Get storage usage info
function getStorageInfo() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const bytes = new Blob([data || '']).size;
    const kb = (bytes / 1024).toFixed(2);
    const mb = (bytes / 1024 / 1024).toFixed(2);

    return {
      bytes,
      kb,
      mb,
      companiesCount: appState.companies.length,
      skillsCount: appState.userSkills.length
    };
  } catch (error) {
    console.error('[Storage] Failed to get storage info:', error);
    return null;
  }
}

// Notification helper
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-primary-light)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    font-weight: 600;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}


// ===================================
// View Management
// ===================================

function switchView(viewName) {
  // Show hero only on dashboard, hide on all other views
  const hero = document.getElementById('hero');
  if (hero) hero.style.display = viewName === 'dashboard' ? 'block' : 'none';

  // Hide all views
  document.querySelectorAll('.view-container').forEach(view => {
    view.classList.add('hidden');
  });

  // Update navigation active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    }
  });

  // Show selected view
  appState.currentView = viewName;

  switch (viewName) {
    case 'dashboard':
      document.getElementById('dashboardView').classList.remove('hidden');
      renderDashboard();
      // Re-show hero on dashboard
      const heroEl = document.getElementById('hero');
      if (heroEl) heroEl.style.display = 'block';
      break;
    case 'companies':
      document.getElementById('companiesView').classList.remove('hidden');
      renderCompanies();
      break;
    case 'skills':
      document.getElementById('skillsView').classList.remove('hidden');
      renderSkillGapAnalysis();
      break;
    case 'progress':
      document.getElementById('progressView').classList.remove('hidden');
      renderProgress();
      break;
    case 'jobs':
      document.getElementById('jobsView').classList.remove('hidden');
      initJobsView();
      break;
    case 'jdanalyzer':
      document.getElementById('jdanalyzerView').classList.remove('hidden');
      break;
    case 'resume':
      document.getElementById('resumeView').classList.remove('hidden');
      updatePreview();
      break;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Dashboard Rendering
// ===================================

function renderDashboard() {
  // Update stats
  const totalCompanies = appState.companies.length;
  const favoriteCount = appState.companies.filter(c => c.isFavorite).length;

  // Calculate unique skills needed
  const allRequiredSkills = new Set();
  appState.companies.forEach(company => {
    company.requiredSkills.forEach(skill => allRequiredSkills.add(skill));
  });

  const skillsNeeded = Array.from(allRequiredSkills).filter(
    skill => !appState.userSkills.includes(skill)
  ).length;

  // Calculate overall progress
  const totalSkillsNeeded = allRequiredSkills.size;
  const skillsAcquired = Array.from(allRequiredSkills).filter(
    skill => appState.userSkills.includes(skill)
  ).length;
  const overallProgress = totalSkillsNeeded > 0
    ? Math.round((skillsAcquired / totalSkillsNeeded) * 100)
    : 0;

  document.getElementById('totalCompanies').textContent = totalCompanies > 0 ? totalCompanies : '';
  document.getElementById('favoriteCount').textContent = totalCompanies > 0 ? favoriteCount : '';
  document.getElementById('skillsNeeded').textContent = totalCompanies > 0 ? skillsNeeded : '';
  document.getElementById('overallProgress').textContent = totalCompanies > 0 ? overallProgress + '%' : '';

  // Render favorite companies
  const favorites = appState.companies.filter(c => c.isFavorite);
  const favoritesSection = document.getElementById('favoritesSection');
  const favoritesGrid = document.getElementById('favoritesGrid');

  if (favorites.length > 0) {
    favoritesSection.classList.remove('hidden');
    favoritesGrid.innerHTML = favorites.map(company => createCompanyCard(company)).join('');
  } else {
    favoritesSection.classList.add('hidden');
  }
}

// ===================================
// Companies View
// ===================================

function renderCompanies() {
  const grid = document.getElementById('companiesGrid');
  const empty = document.getElementById('emptyCompanies');

  if (appState.companies.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
  } else {
    grid.classList.remove('hidden');
    empty.classList.add('hidden');
    grid.innerHTML = appState.companies.map(company => createCompanyCard(company)).join('');
  }
}

function createCompanyCard(company) {
  const skillsPreview = company.requiredSkills.slice(0, 3);
  const moreSkills = company.requiredSkills.length - 3;

  return `
    <div class="company-card fade-in" onclick="viewCompanyDetail(${company.id})">
      <div class="company-header">
        <div class="company-info">
          <h3>${company.name}</h3>
          <div class="company-role">${company.role}</div>
        </div>
        <button class="favorite-btn ${company.isFavorite ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFavorite(${company.id})">
          ${company.isFavorite ? '⭐' : '☆'}
        </button>
      </div>
      
      <div class="company-tags">
        ${skillsPreview.map(skill => `<span class="tag">${skill}</span>`).join('')}
        ${moreSkills > 0 ? `<span class="tag">+${moreSkills} more</span>` : ''}
      </div>
      
      <div class="company-meta">
        <div class="meta-item">
          <span>📍</span>
          <span>${company.location}</span>
        </div>
        <div class="meta-item">
          <span>📝</span>
          <span>${company.type}</span>
        </div>
        ${company.notes ? '<div class="meta-item"><span>📄</span><span>Has notes</span></div>' : ''}
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top: var(--spacing-sm);">
        <button class="btn btn-outline" 
          style="font-size:0.8rem; padding:0.4rem 0.8rem; border-color: var(--color-danger); color: var(--color-danger);"
          onclick="event.stopPropagation(); deleteCompany(${company.id})">
          🗑️ Remove
        </button>
      </div>
    </div>
  `;
}

// ===================================
// Company Detail View
// ===================================

function viewCompanyDetail(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (!company) return;

  appState.currentCompany = company;

  // Categorize skills
  const proficientSkills = company.requiredSkills.filter(skill =>
    appState.userSkills.includes(skill)
  );
  const neededSkills = company.requiredSkills.filter(skill =>
    !appState.userSkills.includes(skill)
  );

  const detailHTML = `
    <div class="company-detail fade-in">
      <div class="detail-header">
        <div class="detail-title">
          <h2>${company.name}</h2>
          <div class="detail-subtitle">${company.role}</div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-secondary" onclick="switchView('companies')">
            <span>←</span>
            <span>Back</span>
          </button>
          <button class="btn ${company.isFavorite ? 'btn-primary' : 'btn-outline'}" 
                  onclick="toggleFavorite(${company.id}); viewCompanyDetail(${company.id})">
            <span>${company.isFavorite ? '⭐' : '☆'}</span>
            <span>${company.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>
      
      <div class="skills-section">
        <h3>Required Skills (${company.requiredSkills.length})</h3>
        <div class="skills-grid">
          ${proficientSkills.map(skill =>
    `<div class="skill-chip proficient" title="You have this skill">✓ ${skill}</div>`
  ).join('')}
          ${neededSkills.map(skill =>
    `<div class="skill-chip needed" title="Skill gap - need to learn">! ${skill}</div>`
  ).join('')}
        </div>
      </div>
      
      ${company.requiredSkills.length === 0 ? `
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-primary-light); margin-bottom: var(--spacing-sm);">💡 No Required Skills Added Yet</h4>
          <p style="color: var(--color-text-secondary);">
            To see your skill match for this role:<br>
            1. Click <strong>Apply</strong> to open the job posting<br>
            2. Copy the full job description<br>
            3. Paste it into <strong>🔍 JD Analyzer</strong> to extract required skills and your match score
          </p>
        </div>
      ` : neededSkills.length > 0 ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-danger); margin-bottom: var(--spacing-sm);">⚠️ Skill Gaps Identified</h4>
          <p style="color: var(--color-text-secondary);">You need to learn ${neededSkills.length} skill${neededSkills.length > 1 ? 's' : ''} for this role. Focus your preparation on: ${neededSkills.slice(0, 3).join(', ')}${neededSkills.length > 3 ? ', ...' : ''}.</p>
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-success); margin-bottom: var(--spacing-sm);">🎉 Strong Match!</h4>
          <p style="color: var(--color-text-secondary);">You have all the required skills for this role. Review your notes and apply with confidence!</p>
        </div>
      `}
      
      <div class="notes-section">
        <h3>📝 Your Preparation Notes</h3>
        <textarea 
          class="notes-textarea" 
          id="companyNotes"
          placeholder="Add your notes here... (e.g., preparation strategy, resources to study, important deadlines, interview tips)"
          oninput="autoSaveNotes(${company.id})"
        >${company.notes || ''}</textarea>
        <div class="notes-meta">
          <span id="notesSaveStatus">All changes saved</span>
          <span id="notesCharCount">${company.notes ? company.notes.length : 0} characters</span>
        </div>
      </div>
      
      <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--color-bg-tertiary); border-radius: var(--radius-lg);">
        <h4 style="margin-bottom: var(--spacing-sm);">📋 Company Details</h4>
        <div style="display: grid; gap: var(--spacing-sm); color: var(--color-text-secondary);">
          <div><strong>Location:</strong> ${company.location}</div>
          <div><strong>Type:</strong> ${company.type}</div>
          <div><strong>Added:</strong> ${new Date(company.addedDate).toLocaleDateString()}</div>
          ${company.deadline ? `<div><strong>Deadline:</strong> ${new Date(company.deadline).toLocaleDateString()}</div>` : ''}
        </div>
      </div>
      ${company.description ? `
      <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--color-bg-tertiary); border-radius: var(--radius-lg);">
        <h4 style="margin-bottom: var(--spacing-sm);">📄 Job Description</h4>
        <p style="color: var(--color-text-secondary); line-height: 1.8; white-space: pre-wrap; font-size: 0.9rem;">${company.description}</p>
      </div>` : ''}
      
      <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-lg);">
        <h4 style="margin-bottom: var(--spacing-sm); color: var(--color-primary-light);">💡 Next Steps</h4>
        <ol style="color: var(--color-text-secondary); padding-left: var(--spacing-lg); line-height: 1.8;">
          <li>Review all required skills and identify your gaps</li>
          <li>Create a preparation plan in your notes</li>
          <li>Practice and learn the missing skills</li>
          <li>Track your progress in the Progress section</li>
          <li>When ready, apply on the company's website (external)</li>
        </ol>
      </div>
    </div>
  `;

  const detailView = document.getElementById('companyDetailView');
  detailView.innerHTML = detailHTML;
  detailView.classList.remove('hidden');

  // Hide other views
  document.querySelectorAll('.view-container:not(#companyDetailView)').forEach(view => {
    view.classList.add('hidden');
  });
}

// ===================================
// Skill Gap Analysis
// ===================================

function renderSkillGapAnalysis() {
  const container = document.getElementById('gapAnalysisContainer');
  const empty = document.getElementById('emptySkills');

  if (appState.companies.length === 0) {
    container.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  empty.classList.add('hidden');

  // Collect all required skills (case-insensitive dedup)
  const allRequiredSkills = new Set();
  appState.companies.forEach(company => {
    company.requiredSkills.forEach(skill => allRequiredSkills.add(skill));
  });

  // Case-insensitive comparison
  const userSkillsLower = appState.userSkills.map(s => s.toLowerCase());

  const proficientSkills = Array.from(allRequiredSkills).filter(skill =>
    userSkillsLower.includes(skill.toLowerCase())
  );
  const neededSkills = Array.from(allRequiredSkills).filter(skill =>
    !userSkillsLower.includes(skill.toLowerCase())
  );

  // If no required skills found across all companies, show helpful message
  if (allRequiredSkills.size === 0) {
    container.innerHTML = `
      <div style="background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--spacing-xl); text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
        <h3 style="margin-bottom: var(--spacing-sm);">No Required Skills Found</h3>
        <p style="color: var(--color-text-secondary);">Your tracked companies don't have required skills listed yet. Add companies manually or use the Jobs tab to track roles with auto-detected skills.</p>
        <button class="btn btn-primary" style="margin-top: var(--spacing-lg);" onclick="showAddCompanyModal()">
          <span>➕</span><span>Add Company</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="gap-analysis">
      ${neededSkills.length > 0 ? `
        <div class="gap-category missing fade-in">
          <h3>
            <span>⚠️</span>
            <span>Skills to Learn (${neededSkills.length})</span>
          </h3>
          <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">
            These skills are required by companies you're tracking but you haven't learned yet. Focus your preparation here!
          </p>
          <div class="gap-skills">
            ${neededSkills.map(skill => {
    const count = appState.companies.filter(c => c.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())).length;
    return `<div class="skill-chip needed">${skill} <span style="opacity: 0.6;">(${count} ${count > 1 ? 'companies' : 'company'})</span></div>`;
  }).join('')}
          </div>
        </div>
      ` : ''}
      
      ${proficientSkills.length > 0 ? `
        <div class="gap-category proficient fade-in">
          <h3>
            <span>✓</span>
            <span>Skills You Have (${proficientSkills.length})</span>
          </h3>
          <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">
            Great! You already possess these skills required by the companies you're tracking.
          </p>
          <div class="gap-skills">
            ${proficientSkills.map(skill => {
    const count = appState.companies.filter(c => c.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())).length;
    return `<div class="skill-chip proficient">${skill} <span style="opacity: 0.6;">(${count} ${count > 1 ? 'companies' : 'company'})</span></div>`;
  }).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-top: var(--spacing-lg);">
        <h3 style="margin-bottom: var(--spacing-md);">📊 Your Skill Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg);">
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-success);">${proficientSkills.length}</div>
            <div style="color: var(--color-text-secondary); font-size: 0.875rem;">Skills Acquired</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-danger);">${neededSkills.length}</div>
            <div style="color: var(--color-text-secondary); font-size: 0.875rem;">Skills to Learn</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary-light);">${(() => { const total = proficientSkills.length + neededSkills.length; return total > 0 ? Math.round((proficientSkills.length / total) * 100) : 0; })()}%</div>
            <div style="color: var(--color-text-secondary); font-size: 0.875rem;">Skill Readiness</div>
          </div>
        </div>
      </div>
      
      <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-top: var(--spacing-lg);">
        <h4 style="margin-bottom: var(--spacing-md); color: var(--color-primary-light);">🎯 Manage Your Skills</h4>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
          Keep your skill list updated to get accurate gap analysis.
        </p>
        <button class="btn btn-primary" onclick="showManageSkillsModal()">
          <span>✏️</span>
          <span>Update Your Skills</span>
        </button>
      </div>
    </div>
  `;
}

// ===================================
// Progress Tracking
// ===================================

function renderProgress() {
  const container = document.getElementById('progressContainer');
  const empty = document.getElementById('emptyProgress');

  if (appState.companies.length === 0) {
    container.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  empty.classList.add('hidden');

  const progressItems = appState.companies.map(company => {
    const totalSkills = company.requiredSkills.length;
    const acquiredSkills = company.requiredSkills.filter(skill =>
      appState.userSkills.includes(skill)
    ).length;
    const percentage = Math.round((acquiredSkills / totalSkills) * 100);

    return {
      company,
      totalSkills,
      acquiredSkills,
      percentage
    };
  });

  // Sort by percentage (lowest first - needs most work)
  progressItems.sort((a, b) => a.percentage - b.percentage);

  container.innerHTML = progressItems.map(item => `
    <div class="progress-item fade-in" onclick="viewCompanyDetail(${item.company.id})" style="cursor: pointer;">
      <div class="progress-header">
        <div class="progress-title">
          ${item.company.isFavorite ? '⭐ ' : ''}${item.company.name} - ${item.company.role}
        </div>
        <div class="progress-percentage">${item.percentage}%</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${item.percentage}%"></div>
      </div>
      <div style="margin-top: var(--spacing-sm); color: var(--color-text-secondary); font-size: 0.875rem;">
        ${item.acquiredSkills} of ${item.totalSkills} skills acquired
        ${item.percentage < 100 ? ` • ${item.totalSkills - item.acquiredSkills} skills remaining` : ' • Ready to apply!'}
      </div>
    </div>
  `).join('');
}

// ===================================
// Company Management Functions
// ===================================

function toggleFavorite(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (company) {
    company.isFavorite = !company.isFavorite;
    saveToLocalStorage();

    // Re-render current view
    if (appState.currentView === 'companies') {
      renderCompanies();
    } else if (appState.currentView === 'dashboard') {
      renderDashboard();
    }
  }
}

function deleteCompany(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (!company) return;
  if (!confirm(`Remove "${company.name}" from your tracker?`)) return;

  appState.companies = appState.companies.filter(c => c.id !== companyId);
  saveToLocalStorage();
  showNotification(`"${company.name}" removed from tracker`, 'success');

  // Re-render current view
  if (appState.currentView === 'companies') renderCompanies();
  else if (appState.currentView === 'dashboard') renderDashboard();
}

function autoSaveNotes(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (company) {
    const notesTextarea = document.getElementById('companyNotes');
    company.notes = notesTextarea.value;
    saveToLocalStorage();

    // Update character count immediately
    const charCountDisplay = document.getElementById('notesCharCount');
    if (charCountDisplay) {
      charCountDisplay.textContent = `${company.notes.length} characters`;
    }

    // Show save status
    const status = document.getElementById('notesSaveStatus');
    status.textContent = 'Saving...';
    setTimeout(() => {
      status.textContent = 'All changes saved';
    }, 500);
  }
}

// ===================================
// Modal Functions
// ===================================

function showAddCompanyModal() {
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <h2 style="font-size: 1.75rem; margin-bottom: var(--spacing-sm);">Add New Company</h2>
      <p style="color: var(--color-text-secondary);">Track a new company and role you're interested in.</p>
    </div>
    
    <form id="addCompanyForm" onsubmit="handleAddCompany(event)">
      <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Company Name *</label>
          <input type="text" name="companyName" required 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                 placeholder="e.g., Apple">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Role/Position *</label>
          <input type="text" name="role" required 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                 placeholder="e.g., Backend Developer Intern">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Required Skills (comma-separated) *</label>
          <input type="text" name="skills" required 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                 placeholder="e.g., Python, Django, PostgreSQL, Docker">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
          <div>
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Location</label>
            <input type="text" name="location" 
                   style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                   placeholder="e.g., Remote">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Type</label>
            <select name="type" 
                    style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);">
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Application Deadline (Optional)</label>
          <input type="date" name="deadline" 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);">
        </div>
        
        <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-md);">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Company</button>
        </div>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
}

function showManageSkillsModal() {
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <h2 style="font-size: 1.75rem; margin-bottom: var(--spacing-sm);">Manage Your Skills</h2>
      <p style="color: var(--color-text-secondary);">Update the skills you currently possess for accurate gap analysis.</p>
    </div>
    
    <form id="manageSkillsForm" onsubmit="handleUpdateSkills(event)">
      <div>
        <label style="display: block; margin-bottom: var(--spacing-sm); font-weight: 600;">Your Current Skills (comma-separated)</label>
        <textarea name="skills" required 
                  style="width: 100%; min-height: 150px; padding: var(--spacing-md); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family); resize: vertical;"
                  placeholder="e.g., JavaScript, Python, React, Git">${appState.userSkills.join(', ')}</textarea>
        <div style="margin-top: var(--spacing-xs); color: var(--color-text-tertiary); font-size: 0.875rem;">
          Separate each skill with a comma
        </div>
      </div>
      
      <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-xl);">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Update Skills</button>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function handleAddCompany(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const newCompany = {
    id: Date.now(),
    name: formData.get('companyName'),
    role: formData.get('role'),
    requiredSkills: formData.get('skills').split(',').map(s => s.trim()).filter(s => s),
    location: formData.get('location') || 'Not specified',
    type: formData.get('type'),
    isFavorite: false,
    notes: '',
    addedDate: new Date().toISOString(),
    deadline: formData.get('deadline') || null
  };

  appState.companies.push(newCompany);
  saveToLocalStorage();
  closeModal();

  // Navigate to companies view and render
  switchView('companies');
}

function handleUpdateSkills(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  appState.userSkills = formData.get('skills')
    .split(',')
    .map(s => s.trim())
    .filter(s => s);

  saveToLocalStorage();
  closeModal();

  // Re-render current view
  if (appState.currentView === 'skills') {
    renderSkillGapAnalysis();
  } else if (appState.currentView === 'dashboard') {
    renderDashboard();
  }
}

// ===================================
// Settings Modal
// ===================================

function showSettingsModal() {
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const storageInfo = getStorageInfo();

  content.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <h2 style="font-size: 1.75rem; margin-bottom: var(--spacing-sm);">⚙️ Settings</h2>
      <p style="color: var(--color-text-secondary);">Manage your data and app preferences</p>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      ${storageInfo ? `
        <div style="background: var(--color-bg-tertiary); border-radius: var(--radius-lg); padding: var(--spacing-lg);">
          <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md);">📊 Storage Information</h3>
          <div style="display: grid; gap: var(--spacing-sm); color: var(--color-text-secondary);">
            <div><strong>Companies Tracked:</strong> ${storageInfo.companiesCount}</div>
            <div><strong>Skills Defined:</strong> ${storageInfo.skillsCount}</div>
            <div><strong>Storage Used:</strong> ${storageInfo.kb} KB</div>
            <div><strong>App Version:</strong> ${STORAGE_VERSION}</div>
          </div>
        </div>
      ` : ''}
      
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg);">
        <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md); color: var(--color-success);">📱 Install as App</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md); font-size: 0.875rem;">
          Install PrepHub on your device for quick access and offline use. Works like a native app!
        </p>
        <button class="btn btn-primary" id="installBtnModal" onclick="handleInstallClick();" style="background: var(--gradient-success);" ${deferredPrompt ? '' : 'disabled'}>
          <span>📱</span>
          <span>Install PrepHub</span>
        </button>
        ${!deferredPrompt ? `
          <div style="color: var(--color-text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">Install not available yet — the browser will prompt when installability criteria are met.</div>
        ` : ''}
      </div>
      
      <div style="background: var(--color-bg-tertiary); border-radius: var(--radius-lg); padding: var(--spacing-lg);">
        <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md);">💾 Data Management</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md); font-size: 0.875rem;">
          Export your data for backup or import previously exported data.
        </p>
        <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="exportData(); closeModal();">
            <span>📤</span>
            <span>Export Data</span>
          </button>
          <button class="btn btn-secondary" onclick="document.getElementById('importFileInput').click();">
            <span>📥</span>
            <span>Import Data</span>
          </button>
          <input type="file" id="importFileInput" accept=".json" style="display: none;" 
                 onchange="handleImportFile(this.files[0])">
        </div>
      </div>
      
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg);">
        <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md); color: var(--color-danger);">⚠️ Danger Zone</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md); font-size: 0.875rem;">
          Permanently delete all your data. This action cannot be undone.
        </p>
        <button class="btn btn-outline" style="border-color: var(--color-danger); color: var(--color-danger);" 
                onclick="clearAllData(); closeModal();">
          <span>🗑️</span>
          <span>Clear All Data</span>
        </button>
      </div>
      
      <div style="display: flex; justify-content: flex-end; margin-top: var(--spacing-md);">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function handleImportFile(file) {
  if (file) {
    importData(file)
      .then(() => {
        closeModal();
      })
      .catch((error) => {
        console.error('Import error:', error);
      });
  }
}

// ===================================
// PWA Installation
// ===================================

let deferredPrompt = null;

// Capture the install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  // Install button is now in settings modal, no need to show navbar button
  // Enable install button in settings modal if it's present
  try {
    const installBtn = document.getElementById('installBtnModal');
    if (installBtn) {
      installBtn.disabled = false;
      installBtn.removeAttribute('disabled');
    }
  } catch (err) {
    // ignore if DOM not ready
  }
});

// Handle install button click
function handleInstallClick() {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    showNotification('App is already installed or not installable', 'info');
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for user choice
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      showNotification('App installed successfully!', 'success');
      closeModal(); // Close settings modal after install
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
}

// Detect if app is already installed
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App was installed');
  showNotification('PrepHub installed! You can now use it offline.', 'success');
  deferredPrompt = null;
  // Disable install button if present
  try {
    const installBtn = document.getElementById('installBtnModal');
    if (installBtn) {
      installBtn.disabled = true;
      installBtn.setAttribute('disabled', '');
    }
  } catch (err) {
    // ignore
  }
});

// ===================================
// Service Worker Registration
// ===================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js', { scope: './' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA] New Service Worker found');

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] New version available');

              // Activate new service worker immediately
              newWorker.postMessage({ type: 'SKIP_WAITING' });

              // Reload to apply update
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// ===================================
// Online/Offline Detection
// ===================================

window.addEventListener('online', () => {
  console.log('[Network] Online');
  showNotification('Back online!', 'success');
});

window.addEventListener('offline', () => {
  console.log('[Network] Offline');
  showNotification('You are offline. Data will be saved locally.', 'info');
});

// ===================================
// Hamburger Menu Toggle (Mobile/Tablet)
// ===================================

function toggleHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
}

function closeHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.classList.remove('active');
  navLinks.classList.remove('active');
}

// ===================================
// Event Listeners
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  // Load data from localStorage
  loadFromLocalStorage();

  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', toggleHamburgerMenu);
  }

  // Close menu when a nav link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeHamburgerMenu(); // Close mobile menu
      const view = link.dataset.view;
      if (view) {
        switchView(view);
      }
    });
  });

  // Get started button
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      switchView('companies');
    });
  }

  // Add company buttons
  const addCompanyBtn = document.getElementById('addCompanyBtn');
  const addCompanyCard = document.getElementById('addCompanyCard');

  if (addCompanyBtn) {
    addCompanyBtn.addEventListener('click', showAddCompanyModal);
  }
  if (addCompanyCard) {
    addCompanyCard.addEventListener('click', showAddCompanyModal);
  }

  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', showSettingsModal);
  }

  // Close modal on overlay click
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') {
        closeModal();
      }
    });
  }

  // ===============================
  // Stats Carousel Logic (FIXED)
  // ===============================
  const statsCarousel = document.getElementById('statsCarousel');
  const dashes = document.querySelectorAll('.carousel-dots .dash');

  // Exit safely if dashboard not loaded
  if (statsCarousel && dashes.length > 0) {

    function goToSlide(index) {
      const width = statsCarousel.clientWidth;
      statsCarousel.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });

      dashes.forEach(d => d.classList.remove('active'));
      dashes[index].classList.add('active');
    }

    dashes.forEach((dash, index) => {
      dash.addEventListener('click', () => goToSlide(index));
    });
  }



  // Initial render
  renderDashboard();

  // Auto-save every 30 seconds as a safety measure
  setInterval(() => {
    saveToLocalStorage();
  }, 30000);
});

// ----------------------------------
// Service Worker auto-update handler
// ----------------------------------
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}
// ===================================
// Jobs Feature — Secure Proxy Version
// Keys live in .env on the server only.
// Frontend calls /api/jobs — never Adzuna directly.
// ===================================

// Proxy endpoint — served by server.js
const JOBS_API = '/api/jobs';

let jobsState = {
  currentPage: 1,
  totalResults: 0,
  resultsPerPage: 12,
  lastKeyword: '',
  lastLocation: '',
  lastCountry: 'in'
};

// ---- View Init ----

function initJobsView() {
  // Check if proxy server is reachable
  checkProxyHealth();
  renderJobsQuickTags();
}

async function checkProxyHealth() {
  const statusEl = document.getElementById('adzunaKeyStatus');
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (statusEl) {
      if (data.keysConfigured) {
        statusEl.innerHTML = `<span style="color:var(--color-success)">✅ Server connected — Adzuna API ready</span>`;
      } else {
        statusEl.innerHTML = `<span style="color:var(--color-warning)">⚠️ Server running but API keys not set — edit your <code>.env</code> file and restart the server</span>`;
      }
    }
  } catch {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:var(--color-danger)">⚠️ Server not running — start it with <code>node server.js</code> then refresh</span>`;
    }
  }
}

function renderJobsQuickTags() {
  const container = document.getElementById('jobsQuickTags');
  if (!container) return;
  const skills = appState.userSkills.slice(0, 8);
  if (skills.length === 0) {
    container.innerHTML = '<span style="color:var(--color-text-tertiary);font-size:0.8rem;">Add your skills in Skill Gap to get quick search tags</span>';
    return;
  }
  container.innerHTML = skills.map(skill =>
    `<span class="quick-tag" onclick="quickSearchSkill('${skill}')">${skill}</span>`
  ).join('');
}

function quickSearchSkill(skill) {
  document.getElementById('jobKeyword').value = skill;
  searchJobs();
}

// Enter key support for job search inputs
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const active = document.activeElement;
      if (active && (active.id === 'jobKeyword' || active.id === 'jobLocation')) {
        searchJobs();
      }
      if (active && active.id === 'jdaText') {
        // Ctrl+Enter to analyze JD
        if (e.ctrlKey || e.metaKey) analyzeJD();
      }
    }
  });
});

// ---- Search ----

async function searchJobs(page = 1) {
  const keyword = document.getElementById('jobKeyword').value.trim() || 'software developer intern';
  const location = document.getElementById('jobLocation').value.trim();
  const country = document.getElementById('jobCountry').value;

  jobsState.currentPage = page;
  jobsState.lastKeyword = keyword;
  jobsState.lastLocation = location;
  jobsState.lastCountry = country;

  // UI: show loading
  document.getElementById('jobsLoading').classList.remove('hidden');
  document.getElementById('jobsGrid').innerHTML = '';
  document.getElementById('jobsEmpty').classList.add('hidden');
  document.getElementById('jobsError').classList.add('hidden');
  document.getElementById('jobsPagination').classList.add('hidden');

  try {
    // Call OUR proxy — not Adzuna directly. Keys stay on the server.
    const params = new URLSearchParams({ keyword, location, country, page });
    const response = await fetch(`${JOBS_API}?${params.toString()}`);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error ${response.status}`);
    }

    const data = await response.json();
    jobsState.totalResults = data.count || 0;
    renderJobResults(data.results || []);
  } catch (error) {
    console.error('[Jobs] Error fetching jobs:', error);
    document.getElementById('jobsLoading').classList.add('hidden');
    const errEl = document.getElementById('jobsError');
    errEl.classList.remove('hidden');
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Load failed')) {
      errEl.innerHTML = `
        <p style="font-weight:600;margin-bottom:0.5rem;">⚠️ Cannot reach the PrepHub server</p>
        <p style="font-size:0.875rem;">Make sure the server is running:<br><code style="background:rgba(255,255,255,0.1);padding:0.2rem 0.5rem;border-radius:4px;">node server.js</code><br><br>Then refresh this page.</p>
      `;
    } else {
      errEl.innerHTML = `<p style="font-weight:600;">⚠️ ${error.message}</p><p style="font-size:0.875rem;margin-top:0.5rem;">Check that your <code>.env</code> keys are correct and the server is running.</p>`;
    }
  }
}

function renderJobResults(jobs) {
  document.getElementById('jobsLoading').classList.add('hidden');

  if (!jobs || jobs.length === 0) {
    document.getElementById('jobsEmpty').classList.remove('hidden');
    return;
  }

  const grid = document.getElementById('jobsGrid');
  grid.innerHTML = jobs.map(job => createJobCard(job)).join('');

  // Pagination
  const totalPages = Math.ceil(jobsState.totalResults / jobsState.resultsPerPage);
  const pagination = document.getElementById('jobsPagination');
  if (totalPages > 1) {
    pagination.classList.remove('hidden');
    document.getElementById('jobsPageInfo').textContent =
      `Page ${jobsState.currentPage} of ${totalPages} (${jobsState.totalResults.toLocaleString()} results)`;
    document.getElementById('jobsPrevBtn').disabled = jobsState.currentPage <= 1;
    document.getElementById('jobsNextBtn').disabled = jobsState.currentPage >= totalPages;
  }
}

// Cache full job data by index so we can safely pass to tracker
const _jobCache = {};

function createJobCard(job) {
  const title = job.title || 'Untitled Role';
  const company = job.company?.display_name || 'Company Not Listed';
  const location = job.location?.display_name || 'Location Not Specified';
  const description = job.description || '';
  const category = job.category?.label || '';
  const contractType = job.contract_type || '';
  const contractTime = job.contract_time || '';
  const salaryMin = job.salary_min;
  const salaryMax = job.salary_max;
  const url = job.redirect_url || '#';
  const created = job.created ? new Date(job.created).toLocaleDateString() : '';

  // Store full job data in cache — safe way to pass complex data to onclick
  const cacheKey = 'job_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  _jobCache[cacheKey] = { company, title, location, description: description.replace(/<[^>]+>/g, '') };

  // Determine badge type
  let badgeClass = 'fulltime';
  let badgeLabel = 'Full-time';
  if (contractTime === 'part_time') { badgeClass = 'parttime'; badgeLabel = 'Part-time'; }
  else if (contractType === 'contract') { badgeClass = 'contract'; badgeLabel = 'Contract'; }
  else if (title.toLowerCase().includes('intern')) { badgeClass = 'intern'; badgeLabel = 'Internship'; }

  // Salary
  let salaryHTML = '';
  if (salaryMin || salaryMax) {
    const fmt = n => n ? '₹' + Math.round(n).toLocaleString('en-IN') : '';
    salaryHTML = `<div class="job-card-salary">💰 ${fmt(salaryMin)}${salaryMin && salaryMax ? ' – ' : ''}${fmt(salaryMax)}</div>`;
  }

  // Skill matching handled by JD Analyzer — not auto-extracted on cards
  let skillMatchHTML = '';

  // Clean description for preview
  const cleanDesc = description.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

  return `
    <div class="job-card fade-in">
      <div class="job-card-header">
        <div>
          <div class="job-card-title">${escapeHtml(title)}</div>
          <div class="job-card-company">🏢 ${escapeHtml(company)}</div>
        </div>
        <span class="job-type-badge ${badgeClass}">${badgeLabel}</span>
      </div>

      <div class="job-card-meta">
        <span class="job-meta-item">📍 ${escapeHtml(location)}</span>
        ${category ? `<span class="job-meta-item">📂 ${escapeHtml(category)}</span>` : ''}
        ${created ? `<span class="job-meta-item">🗓 ${created}</span>` : ''}
      </div>

      ${salaryHTML}

      <div class="job-card-description">${escapeHtml(cleanDesc)}</div>

      ${skillMatchHTML}

      <div class="job-card-actions">
        <button class="btn btn-secondary" onclick="addJobToTrackerFromCache('${cacheKey}')">
          <span>➕</span><span>Track</span>
        </button>
        <a href="${url}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
          <span>🔗</span><span>Apply</span>
        </a>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadJobsPage(direction) {
  const newPage = jobsState.currentPage + direction;
  if (newPage < 1) return;
  searchJobs(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Master skill list for extraction from job descriptions
const KNOWN_SKILLS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB',
  // Frontend
  'React', 'Angular', 'Vue', 'Vue.js', 'Next.js', 'Nuxt.js', 'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'jQuery', 'Redux', 'GraphQL', 'WebGL', 'Three.js',
  // Backend
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Laravel', 'Rails', 'ASP.NET', '.NET', 'Symfony',
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Firebase', 'Supabase', 'DynamoDB', 'Cassandra', 'Elasticsearch',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Linux', 'Nginx', 'Apache',
  // Mobile
  'React Native', 'Flutter', 'Android', 'iOS', 'Xamarin',
  // Data & AI
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'OpenCV', 'NLP', 'LLM', 'Data Science', 'Power BI', 'Tableau',
  // Tools & Others
  'Git', 'GitHub', 'GitLab', 'Jira', 'Figma', 'REST', 'REST API', 'Microservices', 'Agile', 'Scrum', 'OOP', 'DSA', 'Data Structures',
  // Testing
  'Jest', 'Mocha', 'Selenium', 'Cypress', 'JUnit', 'pytest'
];

function extractSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter(skill =>
    lower.includes(skill.toLowerCase())
  );
}

function addJobToTrackerFromCache(cacheKey) {
  const job = _jobCache[cacheKey];
  if (!job) { showNotification('Could not retrieve job data', 'error'); return; }
  addJobToTracker(job.company, job.title, job.location, job.description);
}

function addJobToTracker(company, role, location, description = '') {
  const newCompany = {
    id: Date.now(),
    name: company,
    role: role,
    requiredSkills: [],  // User adds skills manually via Edit or JD Analyzer
    location: location || 'Not specified',
    type: role.toLowerCase().includes('intern') ? 'Internship' : 'Full-time',
    isFavorite: false,
    notes: 'Added from Jobs search. Use JD Analyzer to extract required skills.',
    description: description,
    addedDate: new Date().toISOString(),
    deadline: null
  };
  appState.companies.push(newCompany);
  saveToLocalStorage();
  showNotification(`"${company}" added to tracker! Use JD Analyzer to extract skills. ✅`, 'success');
}



// ===================================
// JD Analyzer
// ===================================

let jdaExtractedSkills = [];

function analyzeJD() {
  const text = document.getElementById('jdaText').value.trim();
  if (!text) {
    showNotification('Please paste a job description first', 'error');
    return;
  }

  // Extract skills from full JD text
  jdaExtractedSkills = extractSkillsFromText(text);

  const resultsEl = document.getElementById('jdaResults');
  const noSkillsEl = document.getElementById('jdaNoSkills');
  const allSkillsSection = document.getElementById('jdaAllSkillsSection');
  const addTrackerEl = document.getElementById('jdaAddTracker');

  resultsEl.classList.remove('hidden');

  if (jdaExtractedSkills.length === 0) {
    noSkillsEl.classList.remove('hidden');
    allSkillsSection.classList.add('hidden');
    addTrackerEl.classList.add('hidden');
    document.getElementById('jdaScoreCircle').className = 'jda-score-circle low';
    document.getElementById('jdaScoreValue').textContent = '0%';
    document.getElementById('jdaScoreBar').style.width = '0%';
    document.getElementById('jdaScoreBar').style.background = 'var(--color-danger)';
    document.getElementById('jdaScoreMsg').textContent = 'No recognizable skills detected in this JD.';
    document.getElementById('jdaHaveSkills').innerHTML = '';
    document.getElementById('jdaNeedSkills').innerHTML = '';
    document.getElementById('jdaHaveCount').textContent = '0';
    document.getElementById('jdaNeedCount').textContent = '0';
    return;
  }

  noSkillsEl.classList.add('hidden');
  allSkillsSection.classList.remove('hidden');
  addTrackerEl.classList.remove('hidden');

  // Compare against user skills (case-insensitive)
  const userSkillsLower = appState.userSkills.map(s => s.toLowerCase());
  const haveSkills = jdaExtractedSkills.filter(s => userSkillsLower.includes(s.toLowerCase()));
  const needSkills = jdaExtractedSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));

  // Score
  const score = Math.round((haveSkills.length / jdaExtractedSkills.length) * 100);

  // Score circle styling
  const circle = document.getElementById('jdaScoreCircle');
  circle.className = 'jda-score-circle ' + (score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low');
  document.getElementById('jdaScoreValue').textContent = score + '%';

  // Score bar
  const bar = document.getElementById('jdaScoreBar');
  bar.style.background = score >= 70
    ? 'var(--color-success)'
    : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  setTimeout(() => { bar.style.width = score + '%'; }, 100);

  // Score message
  const msgs = {
    high: `Great match! You have ${haveSkills.length} of ${jdaExtractedSkills.length} required skills. You're well prepared to apply!`,
    mid: `Decent match. You have ${haveSkills.length} of ${jdaExtractedSkills.length} skills. Focus on learning ${needSkills.slice(0, 3).join(', ')}.`,
    low: `Low match. You have ${haveSkills.length} of ${jdaExtractedSkills.length} skills. Build your foundation before applying.`
  };
  document.getElementById('jdaScoreMsg').textContent = score >= 70 ? msgs.high : score >= 40 ? msgs.mid : msgs.low;
  document.getElementById('jdaScoreTitle').textContent = score >= 70 ? '🎉 Strong Match!' : score >= 40 ? '📈 Growing Match' : '📚 Skills Gap Found';

  // Have skills
  document.getElementById('jdaHaveCount').textContent = haveSkills.length;
  document.getElementById('jdaHaveSkills').innerHTML = haveSkills.length > 0
    ? haveSkills.map(s => `<span class="jda-chip have">✓ ${s}</span>`).join('')
    : '<span style="color:var(--color-text-tertiary);font-size:0.85rem;">None of the required skills match yet</span>';

  // Need skills
  document.getElementById('jdaNeedCount').textContent = needSkills.length;
  document.getElementById('jdaNeedSkills').innerHTML = needSkills.length > 0
    ? needSkills.map(s => `<span class="jda-chip need">✗ ${s}</span>`).join('')
    : '<span style="color:var(--color-success);font-size:0.85rem;">You have all detected skills! 🎉</span>';

  // All skills
  document.getElementById('jdaAllSkills').innerHTML = jdaExtractedSkills
    .map(s => `<span class="jda-chip all">${s}</span>`).join('');

  // Scroll to results
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addJDAToTracker() {
  const company = document.getElementById('jdaCompanyName').value.trim() || 'Unknown Company';
  const role = document.getElementById('jdaRoleName').value.trim() || 'Unknown Role';

  if (jdaExtractedSkills.length === 0) {
    showNotification('No skills detected to add', 'error');
    return;
  }

  const newCompany = {
    id: Date.now(),
    name: company,
    role: role,
    requiredSkills: jdaExtractedSkills,
    location: 'Not specified',
    type: role.toLowerCase().includes('intern') ? 'Internship' : 'Full-time',
    isFavorite: false,
    notes: 'Added from JD Analyzer.',
    description: document.getElementById('jdaText').value.trim(),
    addedDate: new Date().toISOString(),
    deadline: null
  };

  appState.companies.push(newCompany);
  saveToLocalStorage();
  showNotification(`"${company}" added to tracker with ${jdaExtractedSkills.length} skills! ✅`, 'success');
  switchView('companies');
}

function clearJDA() {
  document.getElementById('jdaText').value = '';
  document.getElementById('jdaCompanyName').value = '';
  document.getElementById('jdaRoleName').value = '';
  document.getElementById('jdaResults').classList.add('hidden');
  jdaExtractedSkills = [];
}

// ===================================
// Resume Builder
// ===================================

// State
let resumeData = {
  personal: {},
  education: [],
  experience: [],
  projects: [],
  skills: '',
  certifications: []
};

let eduCount = 0, expCount = 0, projCount = 0, certCount = 0;

// ---- Section Toggle ----
function toggleResumeSection(id) {
  const body = document.getElementById(id);
  const title = body.previousElementSibling;
  body.classList.toggle('collapsed');
  title.classList.toggle('collapsed');
}

// ---- Import Skills from Profile ----
function importSkillsFromProfile() {
  if (appState.userSkills.length === 0) {
    showNotification('No skills in your profile yet. Add them in Skill Gap first.', 'error');
    return;
  }
  document.getElementById('rb_skills').value = appState.userSkills.join(', ');
  updatePreview();
  showNotification(`${appState.userSkills.length} skills imported! ✅`, 'success');
}

// ---- Dynamic Entry Builders ----
function addEducation() {
  const id = ++eduCount;
  const div = document.createElement('div');
  div.className = 'rb-entry fade-in';
  div.id = `edu_${id}`;
  div.innerHTML = `
    <button class="rb-entry-delete" onclick="removeEntry('edu_${id}'); updatePreview()">✕ Remove</button>
    <div class="rb-grid-2" style="gap:var(--spacing-sm)">
      <div><label class="rb-label">Degree / Course *</label><input class="rb-input" id="edu_degree_${id}" placeholder="B.Tech Computer Science" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Institution *</label><input class="rb-input" id="edu_school_${id}" placeholder="Anna University" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Year / Duration</label><input class="rb-input" id="edu_year_${id}" placeholder="2021 – 2025" oninput="updatePreview()" /></div>
      <div><label class="rb-label">CGPA / Grade</label><input class="rb-input" id="edu_grade_${id}" placeholder="8.5 CGPA" oninput="updatePreview()" /></div>
    </div>
  `;
  document.getElementById('educationList').appendChild(div);
}

function addExperience() {
  const id = ++expCount;
  const div = document.createElement('div');
  div.className = 'rb-entry fade-in';
  div.id = `exp_${id}`;
  div.innerHTML = `
    <button class="rb-entry-delete" onclick="removeEntry('exp_${id}'); updatePreview()">✕ Remove</button>
    <div class="rb-grid-2" style="gap:var(--spacing-sm)">
      <div><label class="rb-label">Role / Position *</label><input class="rb-input" id="exp_role_${id}" placeholder="Frontend Developer Intern" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Company *</label><input class="rb-input" id="exp_company_${id}" placeholder="Google" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Duration</label><input class="rb-input" id="exp_duration_${id}" placeholder="Jun 2024 – Aug 2024" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Location</label><input class="rb-input" id="exp_loc_${id}" placeholder="Bangalore / Remote" oninput="updatePreview()" /></div>
    </div>
    <div style="margin-top:var(--spacing-sm)">
      <label class="rb-label">Description / Responsibilities</label>
      <textarea class="rb-textarea" id="exp_desc_${id}" rows="3" placeholder="• Built responsive UI components using React&#10;• Improved page load speed by 40%&#10;• Collaborated with design team on new features" oninput="updatePreview()"></textarea>
    </div>
  `;
  document.getElementById('experienceList').appendChild(div);
}

function addProject() {
  const id = ++projCount;
  const div = document.createElement('div');
  div.className = 'rb-entry fade-in';
  div.id = `proj_${id}`;
  div.innerHTML = `
    <button class="rb-entry-delete" onclick="removeEntry('proj_${id}'); updatePreview()">✕ Remove</button>
    <div class="rb-grid-2" style="gap:var(--spacing-sm)">
      <div><label class="rb-label">Project Name *</label><input class="rb-input" id="proj_name_${id}" placeholder="PrepHub" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Tech Stack</label><input class="rb-input" id="proj_tech_${id}" placeholder="React, Node.js, MongoDB" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Live Link</label><input class="rb-input" id="proj_link_${id}" placeholder="prephub.vercel.app" oninput="updatePreview()" /></div>
      <div><label class="rb-label">GitHub</label><input class="rb-input" id="proj_github_${id}" placeholder="github.com/user/prephub" oninput="updatePreview()" /></div>
    </div>
    <div style="margin-top:var(--spacing-sm)">
      <label class="rb-label">Description</label>
      <textarea class="rb-textarea" id="proj_desc_${id}" rows="2" placeholder="A student career preparation portal with job tracking, skill gap analysis..." oninput="updatePreview()"></textarea>
    </div>
  `;
  document.getElementById('projectsList').appendChild(div);
}

function addCertification() {
  const id = ++certCount;
  const div = document.createElement('div');
  div.className = 'rb-entry fade-in';
  div.id = `cert_${id}`;
  div.innerHTML = `
    <button class="rb-entry-delete" onclick="removeEntry('cert_${id}'); updatePreview()">✕ Remove</button>
    <div class="rb-grid-2" style="gap:var(--spacing-sm)">
      <div><label class="rb-label">Certificate Name *</label><input class="rb-input" id="cert_name_${id}" placeholder="AWS Cloud Practitioner" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Issuing Organization</label><input class="rb-input" id="cert_issuer_${id}" placeholder="Amazon Web Services" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Date</label><input class="rb-input" id="cert_date_${id}" placeholder="Jan 2024" oninput="updatePreview()" /></div>
      <div><label class="rb-label">Credential ID / Link</label><input class="rb-input" id="cert_id_${id}" placeholder="ABC-123456" oninput="updatePreview()" /></div>
    </div>
  `;
  document.getElementById('certsList').appendChild(div);
}

function removeEntry(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ---- Collect Data ----
function collectResumeData() {
  const data = {
    name: document.getElementById('rb_name')?.value || '',
    title: document.getElementById('rb_title')?.value || '',
    email: document.getElementById('rb_email')?.value || '',
    phone: document.getElementById('rb_phone')?.value || '',
    location: document.getElementById('rb_location')?.value || '',
    linkedin: document.getElementById('rb_linkedin')?.value || '',
    github: document.getElementById('rb_github')?.value || '',
    website: document.getElementById('rb_website')?.value || '',
    summary: document.getElementById('rb_summary')?.value || '',
    skills: document.getElementById('rb_skills')?.value || '',
    education: [],
    experience: [],
    projects: [],
    certifications: []
  };

  // Education
  for (let i = 1; i <= eduCount; i++) {
    if (document.getElementById(`edu_${i}`)) {
      data.education.push({
        degree: document.getElementById(`edu_degree_${i}`)?.value || '',
        school: document.getElementById(`edu_school_${i}`)?.value || '',
        year: document.getElementById(`edu_year_${i}`)?.value || '',
        grade: document.getElementById(`edu_grade_${i}`)?.value || ''
      });
    }
  }

  // Experience
  for (let i = 1; i <= expCount; i++) {
    if (document.getElementById(`exp_${i}`)) {
      data.experience.push({
        role: document.getElementById(`exp_role_${i}`)?.value || '',
        company: document.getElementById(`exp_company_${i}`)?.value || '',
        duration: document.getElementById(`exp_duration_${i}`)?.value || '',
        location: document.getElementById(`exp_loc_${i}`)?.value || '',
        description: document.getElementById(`exp_desc_${i}`)?.value || ''
      });
    }
  }

  // Projects
  for (let i = 1; i <= projCount; i++) {
    if (document.getElementById(`proj_${i}`)) {
      data.projects.push({
        name: document.getElementById(`proj_name_${i}`)?.value || '',
        tech: document.getElementById(`proj_tech_${i}`)?.value || '',
        link: document.getElementById(`proj_link_${i}`)?.value || '',
        github: document.getElementById(`proj_github_${i}`)?.value || '',
        description: document.getElementById(`proj_desc_${i}`)?.value || ''
      });
    }
  }

  // Certifications
  for (let i = 1; i <= certCount; i++) {
    if (document.getElementById(`cert_${i}`)) {
      data.certifications.push({
        name: document.getElementById(`cert_name_${i}`)?.value || '',
        issuer: document.getElementById(`cert_issuer_${i}`)?.value || '',
        date: document.getElementById(`cert_date_${i}`)?.value || '',
        credId: document.getElementById(`cert_id_${i}`)?.value || ''
      });
    }
  }

  return data;
}

// ---- Render Preview ----
function updatePreview() {
  const d = collectResumeData();
  const preview = document.getElementById('resumePreview');
  if (!preview) return;

  // Contact line
  const contacts = [
    d.email && `✉ ${d.email}`,
    d.phone && `📞 ${d.phone}`,
    d.location && `📍 ${d.location}`,
    d.linkedin && `🔗 ${d.linkedin}`,
    d.github && `💻 ${d.github}`,
    d.website && `🌐 ${d.website}`
  ].filter(Boolean);

  // Education HTML
  const eduHTML = d.education.filter(e => e.degree || e.school).map(e => `
    <div class="rt-entry">
      <div class="rt-entry-header">
        <div class="rt-entry-title">${e.degree}</div>
        <div class="rt-entry-date">${e.year}</div>
      </div>
      <div class="rt-entry-sub">${e.school}${e.grade ? ` &nbsp;|&nbsp; ${e.grade}` : ''}</div>
    </div>
  `).join('');

  // Experience HTML
  const expHTML = d.experience.filter(e => e.role || e.company).map(e => `
    <div class="rt-entry">
      <div class="rt-entry-header">
        <div class="rt-entry-title">${e.role}</div>
        <div class="rt-entry-date">${e.duration}</div>
      </div>
      <div class="rt-entry-sub">${e.company}${e.location ? ` &nbsp;·&nbsp; ${e.location}` : ''}</div>
      ${e.description ? `<div class="rt-entry-desc">${e.description}</div>` : ''}
    </div>
  `).join('');

  // Projects HTML
  const projHTML = d.projects.filter(p => p.name).map(p => `
    <div class="rt-entry">
      <div class="rt-entry-header">
        <div class="rt-entry-title">${p.name}${p.tech ? ` <span style="font-weight:normal;color:#6b7280;font-size:8.5pt;">| ${p.tech}</span>` : ''}</div>
        <div class="rt-entry-date">${p.link || p.github || ''}</div>
      </div>
      ${p.description ? `<div class="rt-entry-desc">${p.description}</div>` : ''}
    </div>
  `).join('');

  // Skills HTML
  const skillsHTML = d.skills
    ? d.skills.split(',').map(s => s.trim()).filter(Boolean)
      .map(s => `<span class="rt-skill-chip">${s}</span>`).join('')
    : '<span class="rt-empty">Add your skills above</span>';

  // Certifications HTML
  const certsHTML = d.certifications.filter(c => c.name).map(c => `
    <div class="rt-cert">
      <span class="rt-cert-name">${c.name}${c.credId ? ` <span style="color:#9ca3af;font-size:8pt;">(${c.credId})</span>` : ''}</span>
      <span class="rt-cert-issuer">${c.issuer}${c.date ? ` · ${c.date}` : ''}</span>
    </div>
  `).join('');

  preview.innerHTML = `
    <!-- Header -->
    <div class="rt-header">
      <div class="rt-name">${d.name || 'Your Name'}</div>
      ${d.title ? `<div class="rt-role">${d.title}</div>` : ''}
      <div class="rt-contact">
        ${contacts.map(c => `<span class="rt-contact-item">${c}</span>`).join('')}
      </div>
    </div>

    <!-- Summary -->
    ${d.summary ? `
    <div class="rt-section">
      <div class="rt-section-title">Professional Summary</div>
      <div class="rt-summary">${d.summary}</div>
    </div>` : ''}

    <!-- Education -->
    ${eduHTML ? `
    <div class="rt-section">
      <div class="rt-section-title">Education</div>
      ${eduHTML}
    </div>` : ''}

    <!-- Experience -->
    ${expHTML ? `
    <div class="rt-section">
      <div class="rt-section-title">Experience</div>
      ${expHTML}
    </div>` : ''}

    <!-- Projects -->
    ${projHTML ? `
    <div class="rt-section">
      <div class="rt-section-title">Projects</div>
      ${projHTML}
    </div>` : ''}

    <!-- Skills -->
    <div class="rt-section">
      <div class="rt-section-title">Skills</div>
      <div class="rt-skills-wrap">${skillsHTML}</div>
    </div>

    <!-- Certifications -->
    ${certsHTML ? `
    <div class="rt-section">
      <div class="rt-section-title">Certifications</div>
      ${certsHTML}
    </div>` : ''}
  `;
}

// ---- Download PDF ----
function downloadResumePDF() {
  const d = collectResumeData();
  if (!d.name) {
    showNotification('Please enter your name before downloading', 'error');
    return;
  }

  const customName = document.getElementById('rb_pdf_name')?.value.trim();
  const filename = (customName || `${d.name.replace(/\s+/g, '_')}_Resume`) + '.pdf';

  // Open a new clean window with just the resume HTML + styles
  const resumeHTML = document.getElementById('resumePreview').innerHTML;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #ffffff;
      color: #1a1a2e;
      font-family: Georgia, serif;
      font-size: 10.5pt;
      line-height: 1.5;
      padding: 28px 36px;
    }
    .rt-header {
      border-bottom: 2.5px solid #3730a3;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .rt-name {
      font-size: 22pt;
      font-weight: bold;
      color: #1e1b4b;
      letter-spacing: 0.5px;
      margin: 0 0 2px 0;
    }
    .rt-role {
      font-size: 11pt;
      color: #3730a3;
      font-weight: 600;
      margin: 0 0 8px 0;
      font-family: Arial, sans-serif;
    }
    .rt-contact {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 8.5pt;
      color: #4b5563;
      font-family: Arial, sans-serif;
    }
    .rt-contact-item { display: flex; align-items: center; gap: 4px; }
    .rt-section { margin-bottom: 14px; }
    .rt-section-title {
      font-size: 10pt;
      font-weight: bold;
      color: #1e1b4b;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-family: Arial, sans-serif;
      border-bottom: 1px solid #c7d2fe;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }
    .rt-summary { font-size: 9.5pt; color: #374151; line-height: 1.6; }
    .rt-entry { margin-bottom: 10px; }
    .rt-entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    .rt-entry-title { font-weight: bold; font-size: 10pt; color: #1a1a2e; font-family: Arial, sans-serif; }
    .rt-entry-date { font-size: 8.5pt; color: #6b7280; font-family: Arial, sans-serif; white-space: nowrap; flex-shrink: 0; margin-left: 8px; }
    .rt-entry-sub { font-size: 9pt; color: #3730a3; font-style: italic; font-family: Arial, sans-serif; margin-bottom: 3px; }
    .rt-entry-desc { font-size: 9pt; color: #374151; line-height: 1.5; white-space: pre-line; }
    .rt-skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
    .rt-skill-chip {
      background: #eef2ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
      border-radius: 4px;
      padding: 2px 9px;
      font-size: 8.5pt;
      font-family: Arial, sans-serif;
      font-weight: 500;
    }
    .rt-cert { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 4px; font-family: Arial, sans-serif; }
    .rt-cert-name { color: #1a1a2e; font-weight: 600; }
    .rt-cert-issuer { color: #6b7280; font-style: italic; }
    .rt-empty { display: none; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>${resumeHTML}</body>
</html>`);

  printWindow.document.close();
  printWindow.focus();

  // Wait for render then trigger print dialog
  setTimeout(() => {
    printWindow.print();
    // Close window after print dialog
    printWindow.onafterprint = () => printWindow.close();
  }, 500);

  showNotification('In the print dialog → change Destination to "Save as PDF" 📄', 'success');
}
// ---- Reset ----
function resetResume() {
  if (!confirm('Reset all resume data?')) return;
  document.getElementById('rb_name').value = '';
  document.getElementById('rb_title').value = '';
  document.getElementById('rb_email').value = '';
  document.getElementById('rb_phone').value = '';
  document.getElementById('rb_location').value = '';
  document.getElementById('rb_linkedin').value = '';
  document.getElementById('rb_github').value = '';
  document.getElementById('rb_website').value = '';
  document.getElementById('rb_summary').value = '';
  document.getElementById('rb_skills').value = '';
  document.getElementById('educationList').innerHTML = '';
  document.getElementById('experienceList').innerHTML = '';
  document.getElementById('projectsList').innerHTML = '';
  document.getElementById('certsList').innerHTML = '';
  eduCount = 0; expCount = 0; projCount = 0; certCount = 0;
  updatePreview();
  showNotification('Resume cleared', 'success');
}
