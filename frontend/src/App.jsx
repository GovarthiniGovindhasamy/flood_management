import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import CopilotPage from './pages/CopilotPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

function TopNav() {
  return (
    <nav className="topnav">
      <div className="topnav-brand">
        <div className="brand-icon">🛰️</div>
        <div className="brand-text">
          <span className="brand-title">Nepal Flood Response</span>
          <span className="brand-sub">Satellite Intelligence System</span>
        </div>
      </div>
      <div className="topnav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          🗺️ Dashboard
        </NavLink>
        <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📡 Events
        </NavLink>
        <NavLink to="/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📄 Report
        </NavLink>
        <NavLink to="/copilot" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🤖 Copilot
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          ℹ️ About
        </NavLink>
      </div>
      <div className="topnav-status">
        <div className="status-dot" />
        <span>EMSR927 · Trishuli 2026</span>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <TopNav />
        <div className="main-content">
          <Routes>
            <Route path="/"        element={<DashboardPage />} />
            <Route path="/events"  element={<EventsPage />} />
            <Route path="/report"  element={<ReportPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/about"   element={<AboutPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
