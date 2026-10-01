import { useState, useEffect } from 'react';
import axios from 'axios';
import MapDashboard from '../components/MapDashboard.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import SettlementsList from '../components/SettlementsList.jsx';

const DEFAULT_EVENT_ID = 1;

export default function DashboardPage() {
  const [tab, setTab] = useState('stats');
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState(null);
  const [floodData, setFloodData] = useState(null);
  const [damageData, setDamageData] = useState(null);
  const [cutoffData, setCutoffData] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(DEFAULT_EVENT_ID);
  const [layers, setLayers] = useState({ flood: true, damage: true, settlements: true, floodpath: true });
  const [tracing, setTracing] = useState(false);
  const [pathInfo, setPathInfo] = useState(null);

  useEffect(() => {
    axios.get('/api/events').then(r => setEvents(r.data)).catch(() => {});
    loadAnalysis(DEFAULT_EVENT_ID);
  }, []);

  async function loadAnalysis(eventId) {
    try {
      const [s, f, d, c, p] = await Promise.all([
        axios.get(`/api/analysis/${eventId}/stats`),
        axios.get(`/api/analysis/${eventId}/flood`),
        axios.get(`/api/analysis/${eventId}/damage`),
        axios.get(`/api/analysis/${eventId}/cutoff`),
        axios.get(`/api/analysis/${eventId}/floodpath`),
      ]);
      setStats(s.data);
      setFloodData(f.data);
      setDamageData(d.data);
      setCutoffData(c.data);
      setPathData(p.data);
    } catch (e) {
      console.warn('Analysis data not available:', e.message);
    }
  }

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      await axios.post(`/api/analysis/run/${selectedEventId}`);
      await loadAnalysis(selectedEventId);
    } catch (e) {
      alert('Analysis error: ' + (e.response?.data?.error || e.message));
    } finally {
      setAnalyzing(false);
    }
  }

  async function traceFloodPath() {
    setTracing(true);
    try {
      const res = await axios.get(`/api/analysis/${selectedEventId}/floodpath?lat=28.55&lon=85.32`);
      setPathData(res.data);
      setPathInfo(res.data);
    } catch (e) {
      alert('Path trace error: ' + (e.response?.data?.error || e.message));
    } finally {
      setTracing(false);
    }
  }

  function toggleLayer(key) {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const layerItems = [
    { key: 'flood', label: 'Flood & Debris', color: '#38bdf8' },
    { key: 'damage', label: 'Infrastructure Damage', color: '#ef4444' },
    { key: 'settlements', label: 'Settlements', color: '#22c55e' },
    { key: 'floodpath', label: 'Flood Path (DEM)', color: '#2dd4bf' },
  ];

  return (
    <div className="main-content" style={{ width: '100%', height: '100%' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          {/* Event selector */}
          <div className="form-group">
            <label className="form-label">Active Event</label>
            <select
              className="form-select"
              value={selectedEventId}
              onChange={e => { setSelectedEventId(+e.target.value); loadAnalysis(+e.target.value); }}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
              {events.length === 0 && <option value={1}>Trishuli-Bhote Koshi Flood 2026</option>}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={runAnalysis}
              disabled={analyzing}
              id="run-analysis-btn"
            >
              {analyzing ? <><div className="spinner" /> Running…</> : '▶ Run Analysis'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={traceFloodPath}
              disabled={tracing}
              title="Trace flood path from glacier source"
            >
              {tracing ? <div className="spinner" /> : '〜 Trace'}
            </button>
          </div>
          {analyzing && <div className="progress-bar"><div className="progress-fill" style={{ width: '70%' }} /></div>}
        </div>

        {/* Layer toggles */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-glass)' }}>
          <div className="sidebar-title" style={{ marginBottom: 8 }}>Map Layers</div>
          <div className="layer-toggle-group">
            {layerItems.map(item => (
              <div key={item.key} className={`layer-toggle ${layers[item.key] ? 'active' : ''}`} onClick={() => toggleLayer(item.key)}>
                <div className="layer-toggle-left">
                  <div className="layer-dot" style={{ background: item.color }} />
                  <span className="layer-name">{item.label}</span>
                </div>
                <div className={`toggle-switch ${layers[item.key] ? 'on' : ''}`}>
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {[['stats','📊 Stats'],['settlements','🏘️ Villages']].map(([t,l]) => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>

        <div className="sidebar-content">
          {tab === 'stats' && <StatsPanel stats={stats} loading={false} />}
          {tab === 'settlements' && <SettlementsList cutoffData={cutoffData} />}

          {pathInfo && tab === 'stats' && (
            <div className="path-info" style={{ marginTop: 8 }}>
              <strong>Flood Path Traced</strong><br />
              Length: <strong>{pathInfo.path_length_km} km</strong><br />
              Settlements hit: <strong>{pathInfo.settlements_hit}</strong><br />
              {pathInfo.settlements?.map(s => (
                <span key={s.name} style={{ display: 'inline-block', marginRight: 4, marginTop: 2 }}>
                  <span className={`badge ${s.cut_off ? 'badge-danger' : 'badge-safe'}`}>{s.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="attribution-footer">
          Contains modified Copernicus Sentinel data 2026.<br />
          © OpenStreetMap contributors · Kuro Siwo (Bountos et al., 2024)
        </div>
      </div>

      {/* Map */}
      <MapDashboard
        floodData={floodData}
        damageData={damageData}
        cutoffData={cutoffData}
        pathData={pathData}
        layers={layers}
      />
    </div>
  );
}
