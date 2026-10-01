const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all events
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM flood_events ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM flood_events WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create new event
router.post('/', async (req, res) => {
  try {
    const { name, description, event_date, bbox } = req.body;
    if (!name || !event_date || !bbox || bbox.length !== 4) {
      return res.status(400).json({ error: 'name, event_date, and bbox[min_lon,min_lat,max_lon,max_lat] are required' });
    }
    const [result] = await db.query(
      `INSERT INTO flood_events (name, description, event_date, bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name, description || '', event_date, bbox[0], bbox[1], bbox[2], bbox[3]]
    );
    const [newEvent] = await db.query('SELECT * FROM flood_events WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH update event status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE flood_events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM flood_events WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
