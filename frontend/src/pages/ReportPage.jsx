import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReportPage() {
  const [lang, setLang] = useState('en');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const eventId = 1;

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const r = await axios.get(`/api/reports/${eventId}`);
      setReport(r.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    setGenerating(true);
    try {
      const r = await axios.post(`/api/reports/generate/${eventId}`);
      setReport(r.data);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const reportText = lang === 'en' ? report?.report_en : report?.report_ne;

  return (
    <div className="fullpage" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <div className="page-title">📄 Situation Report</div>
          <div className="page-subtitle">Bilingual EN/NE · All figures from satellite analysis</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}>
            {lang === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={generateReport} disabled={generating} id="generate-report-btn">
            {generating ? <><div className="spinner" /> Generating…</> : '✨ Regenerate'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Print PDF</button>
        </div>
      </div>

      <div className="report-container" style={{ flex: 1 }}>
        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <div style={{ color: 'var(--text-muted)' }}>Loading report…</div>
          </div>
        )}

        {!loading && !report && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>No situation report yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generate a bilingual report from satellite analysis data</div>
            </div>
            <button className="btn btn-primary" onClick={generateReport} disabled={generating}>
              {generating ? <><div className="spinner" /> Generating…</> : '✨ Generate Situation Report'}
            </button>
          </div>
        )}

        {!loading && report && (
          <div className="report-body">
            {/* Metadata row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span className="badge badge-info">📡 Sentinel-1 SAR</span>
              <span className="badge badge-info">🗺️ OSM Pre-event</span>
              <span className="badge badge-warning">⚠️ Prototype system</span>
              <span className="badge badge-safe">✅ AI-grounded data</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                Model: {report.model_used} · {new Date(report.generated_at).toLocaleString()}
              </span>
            </div>

            <pre className="report-text">{reportText || 'No content.'}</pre>

            <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Required Attributions:</strong><br />
                Contains modified Copernicus Sentinel data 2026.<br />
                Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.<br />
                © OpenStreetMap contributors.<br />
                Training data: Bountos et al., 2024 (Kuro Siwo, NeurIPS 2024). MIT License.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
