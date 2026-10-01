export default function StatsPanel({ stats, loading }) {
  if (loading) return (
    <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ margin: '0 auto 8px' }} />
      <div style={{ fontSize: 12 }}>Loading analysis…</div>
    </div>
  );

  if (!stats) return (
    <div style={{ padding: 16 }}>
      <div className="alert alert-info">
        <span>📡</span>
        <span>Select an event and click <b>Run Analysis</b> to load satellite data.</span>
      </div>
    </div>
  );

  const { flood, damage, settlements, official_figures } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Flood extent */}
      <div className="sidebar-title" style={{ marginTop: 4 }}>🌊 Flood Extent</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Flooded</div>
          <div className="stat-value stat-blue">{flood?.flooded_area_km2?.toFixed(1) || '—'}</div>
          <div className="stat-unit">km²</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Debris</div>
          <div className="stat-value stat-orange">{flood?.debris_area_km2?.toFixed(1) || '—'}</div>
          <div className="stat-unit">km²</div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-label">Total affected area</div>
          <div className="stat-value stat-teal">{flood?.total_affected_km2?.toFixed(1) || '—'}</div>
          <div className="stat-unit">km² · Confidence: {flood?.confidence_pct}%</div>
        </div>
      </div>

      <div className="divider" />

      {/* Infrastructure */}
      <div className="sidebar-title">🏗️ Infrastructure Damage</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Bridges</div>
          <div className="stat-value stat-red">{damage?.bridges_destroyed ?? '—'}</div>
          <div className="stat-unit">destroyed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Road damage</div>
          <div className="stat-value stat-amber">{damage?.roads_damaged_km ?? '—'}</div>
          <div className="stat-unit">km</div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-label">Buildings affected</div>
          <div className="stat-value stat-purple">{damage?.buildings_damaged ?? '—'}</div>
          <div className="stat-unit">structures</div>
        </div>
      </div>

      <div className="divider" />

      {/* Cut-off settlements */}
      <div className="sidebar-title">🏘️ Cut-off Settlements</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Villages</div>
          <div className="stat-value stat-red">{settlements?.cut_off ?? '—'}</div>
          <div className="stat-unit">cut off</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Population</div>
          <div className="stat-value stat-amber">{settlements?.cut_off_population?.toLocaleString() ?? '—'}</div>
          <div className="stat-unit">at risk</div>
        </div>
      </div>

      <div className="divider" />

      {/* Official figures */}
      <div className="sidebar-title">⚠️ Official Figures (NDRRMA)</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Confirmed deaths</div>
          <div className="stat-value stat-red">1,342</div>
          <div className="stat-unit">as of 6 Sep 2026</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Missing</div>
          <div className="stat-value stat-amber">4,893</div>
          <div className="stat-unit">out of contact</div>
        </div>
      </div>

      {/* Attribution */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8 }}>
        Contains modified Copernicus Sentinel data 2026.<br />
        © OpenStreetMap contributors.
      </div>
    </div>
  );
}
