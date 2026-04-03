# PrepHub - Job Preparation Platform

A comprehensive job preparation platform designed to help candidates track job opportunities, analyze job descriptions, manage skills, and organize their job search journey.

## Features

- **Dashboard** - Overview of your job search progress and key metrics
- **Job Board** - Browse and track job listings
- **Company Tracker** - Monitor companies you're interested in
- **JD Analyzer** - Analyze job descriptions to identify key requirements
- **Skill Tracker** - Track and develop the skills needed for target roles
- **Resources** - Curated resources for interview prep and learning
- **Profile** - Manage your profile and job search preferences

## User Flow

```
Entry Point
    ↓
Login Page (Authentication)
    ↓
Dashboard (Main Hub)
    ├→ Job Board (Browse & Track Jobs)
    ├→ Company Tracker (Track Companies)
    ├→ JD Analyzer (Analyze Job Descriptions)
    ├→ Skill Tracker (Manage Skills)
    ├→ Resources (Learning Materials)
    └→ Profile (Settings & Preferences)
```

**Authentication Flow:**
1. User lands on the app
2. If not authenticated, redirected to Login Page
3. After successful login, user is taken to Dashboard
4. User can navigate between different tools and features
5. ProtectedRoute component ensures only authenticated users access protected pages

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Firebase (Authentication & Database)
- **Styling:** CSS
- **Build Tool:** Vite
- **Code Quality:** ESLint

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prephub
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable React components
├── context/         # React context for state management
├── pages/           # Page components
├── utils/           # Utility functions and API integrations
├── assets/          # Images and static files
├── App.jsx          # Main App component
├── main.jsx         # Application entry point
├── firebase.js      # Firebase configuration
└── index.css        # Global styles
```

## ESLint Configuration

The project uses ESLint for code quality. Run linting with:
```bash
npm run lint
```

## Color Palette

The application uses a carefully designed color scheme:

**Primary Colors:**
- **Indigo (#4F46E5)** - Logo, primary brand color
- **Blue (#2563EB)** - Navigation links, interactive elements
- **Violet (#7C3AED)** - Gradients and accents

**Status Colors:**
- **Green (#10B981)** - Success, ready status
- **Amber (#F59E0B)** - Warning, in-progress status
- **Red (#EF4444)** - Error, needs work status
- **Gray (#6B7280)** - Neutral, not started status

**Neutral Colors:**
- **White (#FFFFFF)** - Primary backgrounds
- **Dark Navy (#0F172A)** - Dark backgrounds
- **Slate (#1E293B)** - Secondary dark backgrounds
- **Dark Gray (#555555)** - Text content

**Supporting Colors:**
- **Light Indigo (#E0E7FF)** - Light backgrounds
- **Light Blue (#F0F9FF, #DBEAFE)** - Borders and accents
- **Light Red (#FEE2E2)** - Error backgrounds

## Contributing

Contributions are welcome! Please create a feature branch and submit a pull request.

## License

This project is licensed under the MIT License.
