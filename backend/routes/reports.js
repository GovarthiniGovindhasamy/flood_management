const express = require('express');
const router = express.Router();
const db = require('../config/db');
const reportService = require('../services/reportService');

// POST generate situation report
router.post('/generate/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const report = await reportService.generate(eventId);
    res.json(report);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET stored report
router.get('/:eventId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM situation_reports WHERE event_id = ? ORDER BY generated_at DESC LIMIT 1',
      [req.params.eventId]
    );
    if (!rows.length) return res.status(404).json({ error: 'No report found. POST to /api/reports/generate/:eventId first.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
