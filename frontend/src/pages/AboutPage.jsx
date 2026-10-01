export default function AboutPage() {
  return (
    <div className="fullpage" style={{ width: '100%', overflowY: 'auto' }}>
      <div className="page-header">
        <div>
          <div className="page-title">ℹ️ About This System</div>
          <div className="page-subtitle">Nepal Flood Response System v1.0 · Educational prototype</div>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 800 }}>
        {/* Warning */}
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <span>⚠️</span>
          <div>
            <strong>Important Notice:</strong> This is an educational prototype, not an operational disaster management tool. 
            Results should not be used for life-safety decisions without verification by trained professionals.
            This disaster is recent (2026) — treat the subject with respect.
          </div>
        </div>

        {/* What it does */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>🎯 What This System Does</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p>Takes an <strong>area (bounding box)</strong> and a <strong>flood date</strong> to answer three key questions for rescue teams:</p>
            <ol style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Where did the flood hit?</strong> — Sentinel-1 SAR log-ratio change detection maps flooded and debris-covered areas.</li>
              <li><strong>What was damaged?</strong> — OpenStreetMap buildings, roads, and bridges intersected with flood polygons.</li>
              <li><strong>Who is cut off?</strong> — Road network graph analysis identifies settlements with no route to hospitals/towns.</li>
            </ol>
            <p style={{ marginTop: 8 }}><strong>Bonus:</strong> Given any upstream point, traces the flood path downvalley using Copernicus DEM data.</p>
          </div>
        </div>

        {/* AI Component */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-teal)', marginBottom: 12 }}>🤖 AI Component: Situation-Report Copilot</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p>An AI assistant that answers rescuer questions and generates bilingual (English + Nepali) situation reports. Key rule: <strong>every number must come from this system's maps</strong>, never invented by the language model.</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Uses Google Gemini 1.5 Flash (with rule-based fallback when API key absent)</li>
              <li>Pre-assembles verified statistics before any LLM call</li>
              <li>System prompt explicitly forbids hallucinated figures</li>
            </ul>
          </div>
        </div>

        {/* Limitations */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 12 }}>⚠️ System Limitations</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Revisit time:</strong> Sentinel satellites revisit every 6-12 days — cannot warn of a sudden glacier collapse minutes ahead</li>
              <li><strong>Cloud cover:</strong> Sentinel-2 optical is blocked by monsoon clouds; Sentinel-1 SAR is cloud-transparent but lower resolution</li>
              <li><strong>Building damage:</strong> Estimated by polygon intersection, not structural survey — may miss buildings on flood edges</li>
              <li><strong>OSM currency:</strong> Uses snapshot ≤27 Jul 2026; road network may differ from actual pre-event state</li>
              <li><strong>Population data:</strong> From census estimates, not real-time counts; may be significantly over/understated</li>
              <li><strong>DEM resolution:</strong> Copernicus WorldDEM-30 is 30m; small channels may not be resolved</li>
              <li><strong>Demo mode:</strong> Full SAR processing requires Python + GDAL sidecar; demo uses pre-computed Trishuli results</li>
            </ul>
          </div>
        </div>

        {/* Data sources */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 12 }}>📡 Data Sources & Licenses</h3>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2 }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>Sentinel-1 & Sentinel-2</strong> — Copernicus free, full and open data policy. dataspace.copernicus.eu</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>OpenStreetMap</strong> — © OpenStreetMap contributors. ODbL. Pre-event snapshot via ohsome API.</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Copernicus WorldDEM-30</strong> — © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018.</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Kuro Siwo</strong> — Bountos et al., 2024. NeurIPS 2024. MIT License. (Training data reference)</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Copernicus EMS EMSR927</strong> — Used for verification only. Not an input. © European Union, CEMS.</div>
          </div>
        </div>

        {/* Attribution */}
        <div style={{ padding: 16, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Required Attributions (per competition rules):</strong>
          Contains modified Copernicus Sentinel data 2026.<br />
          Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.<br />
          © OpenStreetMap contributors.<br />
          Training data: Bountos et al., NeurIPS 2024 (Kuro Siwo). MIT License.
        </div>
      </div>
    </div>
  );
}
