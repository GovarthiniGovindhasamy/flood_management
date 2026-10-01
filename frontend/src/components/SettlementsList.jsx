export default function SettlementsList({ cutoffData }) {
  if (!cutoffData) return (
    <div style={{ padding: 4 }}>
      <div className="alert alert-info">
        <span>🏘️</span>
        <span>Run analysis to see settlement connectivity.</span>
      </div>
    </div>
  );

  const { summary, geojson } = cutoffData;
  const features = geojson?.features || [];
  const cutOff = features.filter(f => f.properties.cut_off);
  const safe = features.filter(f => !f.properties.cut_off);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="badge badge-danger">⛔ {summary?.cut_off_count || 0} cut off</span>
        <span className="badge badge-safe">✅ {(summary?.total_settlements || 0) - (summary?.cut_off_count || 0)} connected</span>
        <span className="badge badge-warning">👥 {summary?.cut_off_population?.toLocaleString() || 0} affected</span>
      </div>

      {cutOff.length > 0 && (
        <>
          <div className="sidebar-title" style={{ marginTop: 4 }}>⛔ Cut-off Villages</div>
          {cutOff.map((f, i) => (
            <div key={i} className="settlement-item cut-off">
              <div className="settlement-status danger" />
              <div style={{ flex: 1 }}>
                <div className="settlement-name">
                  {f.properties.name}
                  {f.properties.name_ne && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>{f.properties.name_ne}</span>}
                </div>
                <div className="settlement-detail">
                  {f.properties.population && <>Pop: {f.properties.population} · </>}
                  Hospital: {f.properties.nearest_hospital_km} km
                  {!f.properties.hospital_reachable && <span style={{ color: 'var(--accent-red)', marginLeft: 4 }}>❌ BLOCKED</span>}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {safe.length > 0 && (
        <>
          <div className="sidebar-title" style={{ marginTop: 4 }}>✅ Connected Settlements</div>
          {safe.map((f, i) => (
            <div key={i} className="settlement-item">
              <div className="settlement-status safe" />
              <div style={{ flex: 1 }}>
                <div className="settlement-name">{f.properties.name}</div>
                <div className="settlement-detail">
                  {f.properties.population && <>Pop: {f.properties.population} · </>}
                  {f.properties.settlement_type}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
