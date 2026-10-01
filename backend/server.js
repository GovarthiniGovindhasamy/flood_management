const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const eventsRouter   = require('./routes/events');
const analysisRouter = require('./routes/analysis');
const reportsRouter  = require('./routes/reports');
const copilotRouter  = require('./routes/copilot');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Nepal Flood Response System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    attribution: [
      'Contains modified Copernicus Sentinel data 2026.',
      'Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018.',
      '© OpenStreetMap contributors.',
    ],
  });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/events',   eventsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/reports',  reportsRouter);
app.use('/api/copilot',  copilotRouter);

// ── 404 & Error handlers ──────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌏 Flood Response API running on http://localhost:${PORT}`);
  console.log(`  Attribution: Contains modified Copernicus Sentinel data 2026.`);
});

module.exports = app;
