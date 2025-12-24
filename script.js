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
      
      ${neededSkills.length > 0 ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-danger); margin-bottom: var(--spacing-sm);">⚠️ Skill Gaps Identified</h4>
          <p style="color: var(--color-text-secondary);">You need to learn ${neededSkills.length} skill${neededSkills.length > 1 ? 's' : ''} for this role. Focus your preparation on: ${neededSkills.slice(0, 3).join(', ')}${neededSkills.length > 3 ? ', ...' : ''}.</p>
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-success); margin-bottom: var(--spacing-sm);">✓ You're Ready!</h4>
          <p style="color: var(--color-text-secondary);">You have all the required skills for this role. Review your preparation notes and you're good to apply!</p>
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
          <span>${company.notes ? company.notes.length : 0} characters</span>
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

  // Collect all required skills
  const allRequiredSkills = new Set();
  appState.companies.forEach(company => {
    company.requiredSkills.forEach(skill => allRequiredSkills.add(skill));
  });

  // Categorize skills
  const proficientSkills = Array.from(allRequiredSkills).filter(skill =>
    appState.userSkills.includes(skill)
  );
  const neededSkills = Array.from(allRequiredSkills).filter(skill =>
    !appState.userSkills.includes(skill)
  );

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
    const count = appState.companies.filter(c => c.requiredSkills.includes(skill)).length;
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
    const count = appState.companies.filter(c => c.requiredSkills.includes(skill)).length;
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
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary-light);">${Math.round((proficientSkills.length / (proficientSkills.length + neededSkills.length)) * 100)}%</div>
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

function autoSaveNotes(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (company) {
    const notesTextarea = document.getElementById('companyNotes');
    company.notes = notesTextarea.value;
    saveToLocalStorage();

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
  const isInstallable = deferredPrompt !== null;

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
      
      ${isInstallable ? `
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg);">
          <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-md); color: var(--color-success);">📱 Install as App</h3>
          <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md); font-size: 0.875rem;">
            Install PrepHub on your device for quick access and offline use. Works like a native app!
          </p>
          <button class="btn btn-primary" id="installBtnModal" onclick="handleInstallClick();" style="background: var(--gradient-success);">
            <span>📱</span>
            <span>Install PrepHub</span>
          </button>
        </div>
      ` : ''}
      
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
});

// ===================================
// Service Worker Registration
// ===================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[PWA] New Service Worker found');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available');
              showNotification('App update available! Refresh to get the latest version.', 'info');
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
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
      closeModal();
    }
  });

// ===============================
// Stats Carousel Logic (SAFE)
// ===============================
document.addEventListener('DOMContentLoaded', () => {

  const statsCarousel = document.getElementById('statsCarousel');
  const dashes = document.querySelectorAll('.carousel-dots .dash');

  // Exit safely if dashboard not loaded
  if (!statsCarousel || dashes.length === 0) return;

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

});



  // Initial render
  renderDashboard();

  // Auto-save every 30 seconds as a safety measure
  setInterval(() => {
    saveToLocalStorage();
  }, 30000);
});
