import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', event_date: '2026-08-26', bbox: '' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const r = await axios.get('/api/events');
      setEvents(r.data);
    } catch { setEvents([]); }
    setLoading(false);
  }

  async function createEvent(e) {
    e.preventDefault();
    if (!form.name || !form.event_date) return;
    const bboxArr = form.bbox
      ? form.bbox.split(',').map(Number)
      : [85.05, 27.85, 85.90, 28.55];

    setCreating(true);
    try {
      await axios.post('/api/events', {
        name: form.name,
        description: form.description,
        event_date: form.event_date,
        bbox: bboxArr,
      });
      setShowForm(false);
      setForm({ name: '', description: '', event_date: '2026-08-26', bbox: '' });
      fetchEvents();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  }

  const statusColors = { pending: 'warning', processing: 'info', complete: 'safe', error: 'danger' };

  return (
    <div className="fullpage" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <div className="page-title">📡 Flood Events</div>
          <div className="page-subtitle">Manage satellite analysis events by AOI and date</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)} id="new-event-btn">
          {showForm ? '✕ Cancel' : '+ New Event'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Create form */}
        {showForm && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 20, maxWidth: 600 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--accent-blue)' }}>
              Create New Event
            </h3>
            <form className="event-form" onSubmit={createEvent}>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="form-input" placeholder="e.g. Koshi River Flood 2026" required
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input className="form-input" type="date" required
                  value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Bounding Box (min_lon, min_lat, max_lon, max_lat)</label>
                <input className="form-input" placeholder="85.05, 27.85, 85.90, 28.55"
                  value={form.bbox} onChange={e => setForm(p => ({ ...p, bbox: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Brief event description"
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? <><div className="spinner" /> Creating…</> : '📡 Create Event'}
              </button>
            </form>
          </div>
        )}

        {/* Event list */}
        {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 8px' }} />Loading events…
        </div>}

        {!loading && events.length === 0 && (
          <div className="alert alert-info">No events found. Create one above or start the backend with seeded data.</div>
        )}

        {events.map(ev => (
          <div key={ev.id} className="glass-card" style={{ padding: 20, marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{ev.name}</span>
                <span className={`badge badge-${statusColors[ev.status] || 'info'}`}>{ev.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                📅 {ev.event_date} &nbsp;|&nbsp;
                📍 [{ev.bbox_min_lon}, {ev.bbox_min_lat}, {ev.bbox_max_lon}, {ev.bbox_max_lat}]<br />
                {ev.description && <span>{ev.description}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <a href="/" className="btn btn-ghost btn-sm">🗺️ Map</a>
            </div>
          </div>
        ))}

        {/* Data rules reminder */}
        <div className="alert alert-warning" style={{ marginTop: 16 }}>
          <span>⚠️</span>
          <div>
            <strong>Data rules:</strong> Allowed inputs: Sentinel-1, Sentinel-2, Copernicus DEM, OSM (snapshot ≤2026-07-27). 
            <br />Copernicus EMS/EMSR927 maps may only be used for verification — never as inputs.
          </div>
        </div>
      </div>
    </div>
  );
}
