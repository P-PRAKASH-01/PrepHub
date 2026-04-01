# 🎯 PrepHub — Career Preparation Operating System

> *From Job Description → Skill Gap → Progress Tracking → ATS Resume*

PrepHub is a free, **offline-first** career preparation platform built for students. It helps you track companies, identify skill gaps, monitor your learning progress, and build ATS-optimized resumes — all without requiring an account or internet connection.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏢 **Company Tracker** | Add and manage companies with role, location, type, deadline, and notes |
| 🔍 **JD Analyzer** | Paste any job description to extract required skills and see your match score (AI-powered with fallback) |
| 🎯 **Skill Gap Analysis** | See which skills you have vs. which you still need to learn |
| 📈 **Progress Tracking** | Visual readiness bar per company, sorted by lowest progress first |
| 💼 **Live Job Search** | Browse real jobs via the Adzuna API proxy |
| 📄 **Resume Builder** | Build a clean ATS-friendly resume with live preview and PDF export |
| 📲 **PWA Support** | Install as an app on mobile/desktop; works fully offline |
| 💾 **Data Export/Import** | Export your data as JSON and import it on any device |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- An [Adzuna API account](https://developer.adzuna.com/) for the Live Job Search feature (free)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/prephub.git
cd prephub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your API keys

Create a `.env` file in the root directory:

```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
HF_TOKEN=your_hugging_face_token_here
PORT=3001
```

> **Note:** The JD Analyzer works with AI-powered skill extraction (requires Hugging Face token) or falls back to rule-based extraction. Only the Live Job Search requires Adzuna credentials.

### 4. Start the server

```bash
npm start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📖 How It Works

### Workflow

```
Add Company → Paste JD → Analyze Skills → Track Progress → Build Resume
```

1. **Add Company** — Track a company you're targeting (role, location, deadline)
2. **Browse Jobs** — Search live job listings via the Adzuna API
3. **JD Analyzer** — Paste the job description to extract required skills with AI-powered analysis (High/Med/Low priority tags)
4. **Skill Gap View** — See all skills you're missing across every tracked company
5. **Progress View** — Monitor per-company learning readiness (%)
6. **Resume Builder** — Fill in your profile and download a clean PDF resume

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express (API proxy) |
| AI/ML | [Hugging Face](https://huggingface.co/) JobBERT for skill extraction |
| Data Storage | Browser LocalStorage (offline) |
| Job Search API | [Adzuna](https://api.adzuna.com/) |
| Offline Support | Service Worker + PWA manifest |
| PDF Export | Browser's native `window.print()` |

---

## 📂 Project Structure

```
prephub/
├── index.html          # Main SPA shell with all views
├── script.js           # All application logic (~2100 lines)
├── styles.css          # Full styling with CSS variables
├── server.js           # Express server + Adzuna proxy
├── service-worker.js   # PWA offline caching
├── manifest.json       # PWA app manifest
├── .env                # API keys (not committed)
├── icons/              # App icons (192px, 512px)
└── api/                # Optional serverless API routes
```

---

## 🔐 Privacy & Data

- **No login required** — zero accounts, zero sign-ups
- **All data is yours** — stored locally in your browser's LocalStorage
- **Export anytime** — download a full `.json` backup from Settings
- **API keys stay private** — Adzuna and Hugging Face keys are stored server-side, never exposed to the browser

---

## ⚙️ Settings & Data Management

Access the ⚙️ **Settings** panel (top-right) to:
- Export data as a JSON backup
- Import previously exported data
- Clear all local data
- Install the app as a PWA

---

## 🗺️ Roadmap

- [x] AI-powered JD parsing (with Hugging Face JobBERT)
- [ ] Resume ↔ JD keyword match score
- [ ] Interview question generator per role
- [ ] Smart career roadmap suggestions

---

## 👨‍💻 Author

**Prakash P** — *Building tools that make student preparation structured, measurable, and strategic.*

---

## ⭐ Support

If PrepHub helps you land your dream internship or job, give this repo a ⭐ star and share it with others!
