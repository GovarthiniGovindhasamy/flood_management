const express = require('express');
const router = express.Router();
const db = require('../config/db');
const floodDetectionService = require('../services/floodDetectionService');
const osmService = require('../services/osmService');
const settlementService = require('../services/settlementService');
const floodPathService = require('../services/floodPathService');

// POST run full analysis pipeline for an event
router.post('/run/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const [events] = await db.query('SELECT * FROM flood_events WHERE id = ?', [eventId]);
    if (!events.length) return res.status(404).json({ error: 'Event not found' });
    const event = events[0];

    await db.query('UPDATE flood_events SET status = ? WHERE id = ?', ['processing', eventId]);

    // Run flood detection
    const floodResult = await floodDetectionService.runDetection(event);
    await db.query(
      `INSERT INTO analysis_results (event_id, result_type, geojson, flooded_area_km2, debris_area_km2, confidence_pct, method)
       VALUES (?, 'combined', ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE geojson=VALUES(geojson), flooded_area_km2=VALUES(flooded_area_km2), updated_at=NOW()`,
      [eventId, JSON.stringify(floodResult.geojson), floodResult.flooded_area_km2, floodResult.debris_area_km2, floodResult.confidence_pct, floodResult.method]
    );

    // Run OSM damage analysis
    await osmService.analyzeDamage(event, floodResult.geojson);

    // Run settlement cut-off analysis
    await settlementService.analyzeConnectivity(event);

    // Mark complete
    await db.query('UPDATE flood_events SET status = ? WHERE id = ?', ['complete', eventId]);

    res.json({ success: true, eventId, message: 'Analysis complete' });
  } catch (e) {
    console.error(e);
    await db.query('UPDATE flood_events SET status = ? WHERE id = ?', ['error', eventId]);
    res.status(500).json({ error: e.message });
  }
});

// GET flood/debris GeoJSON
router.get('/:eventId/flood', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM analysis_results WHERE event_id = ? ORDER BY id DESC LIMIT 1',
      [req.params.eventId]
    );
    if (!rows.length) return res.status(404).json({ error: 'No analysis results found. Run /api/analysis/run/:eventId first.' });
    const r = rows[0];
    res.json({
      event_id: r.event_id,
      flooded_area_km2: r.flooded_area_km2,
      debris_area_km2: r.debris_area_km2,
      confidence_pct: r.confidence_pct,
      method: r.method,
      geojson: typeof r.geojson === 'string' ? JSON.parse(r.geojson) : r.geojson,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET damage overlay GeoJSON
router.get('/:eventId/damage', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM infrastructure_damage WHERE event_id = ?',
      [req.params.eventId]
    );
    const features = rows.map(r => ({
      type: 'Feature',
      properties: {
        id: r.id, osm_id: r.osm_id, feature_type: r.feature_type,
        name: r.name, damaged: !!r.damaged, damage_severity: r.damage_severity,
        road_length_m: r.road_length_m,
      },
      geometry: { type: 'Point', coordinates: [r.lon, r.lat] },
    }));
    const summary = {
      total: rows.length,
      damaged: rows.filter(r => r.damaged).length,
      bridges_destroyed: rows.filter(r => r.feature_type === 'bridge' && r.damaged).length,
      roads_damaged_km: rows
        .filter(r => r.feature_type === 'road' && r.damaged)
        .reduce((s, r) => s + (r.road_length_m || 0), 0) / 1000,
      buildings_damaged: rows.filter(r => r.feature_type === 'building' && r.damaged).length,
    };
    res.json({ event_id: req.params.eventId, summary, geojson: { type: 'FeatureCollection', features } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET cut-off settlements GeoJSON
router.get('/:eventId/cutoff', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settlements WHERE event_id = ?', [req.params.eventId]);
    const features = rows.map(r => ({
      type: 'Feature',
      properties: {
        id: r.id, name: r.name, name_ne: r.name_ne, settlement_type: r.settlement_type,
        population: r.population, cut_off: !!r.cut_off,
        nearest_hospital_km: r.nearest_hospital_km, hospital_reachable: !!r.hospital_reachable,
      },
      geometry: { type: 'Point', coordinates: [r.lon, r.lat] },
    }));
    const cutOff = rows.filter(r => r.cut_off);
    const summary = {
      total_settlements: rows.length,
      cut_off_count: cutOff.length,
      cut_off_population: cutOff.reduce((s, r) => s + (r.population || 0), 0),
    };
    res.json({ event_id: req.params.eventId, summary, geojson: { type: 'FeatureCollection', features } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET flood path GeoJSON (optionally ?lat=&lon= to trace new path)
router.get('/:eventId/floodpath', async (req, res) => {
  try {
    let rows;
    if (req.query.lat && req.query.lon) {
      // Trace new path
      const event = (await db.query('SELECT * FROM flood_events WHERE id = ?', [req.params.eventId]))[0][0];
      const result = await floodPathService.tracePath(event, parseFloat(req.query.lat), parseFloat(req.query.lon));
      return res.json(result);
    }
    [rows] = await db.query('SELECT * FROM flood_paths WHERE event_id = ? ORDER BY id DESC LIMIT 1', [req.params.eventId]);
    if (!rows.length) return res.status(404).json({ error: 'No flood path found' });
    const r = rows[0];
    res.json({
      event_id: r.event_id,
      source: { lat: r.source_lat, lon: r.source_lon },
      path_length_km: r.path_length_km,
      settlements_hit: r.settlements_hit,
      geojson: typeof r.geojson === 'string' ? JSON.parse(r.geojson) : r.geojson,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET summary statistics for an event
router.get('/:eventId/stats', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const [[event]] = await db.query('SELECT * FROM flood_events WHERE id = ?', [eventId]);
    const [[analysis]] = await db.query('SELECT * FROM analysis_results WHERE event_id = ? ORDER BY id DESC LIMIT 1', [eventId]);
    const [damage] = await db.query('SELECT feature_type, damaged, road_length_m FROM infrastructure_damage WHERE event_id = ?', [eventId]);
    const [settlements] = await db.query('SELECT cut_off, population FROM settlements WHERE event_id = ?', [eventId]);
    const [[path]] = await db.query('SELECT path_length_km, settlements_hit FROM flood_paths WHERE event_id = ? ORDER BY id DESC LIMIT 1', [eventId]);

    const cutOff = settlements.filter(s => s.cut_off);
    res.json({
      event: event || {},
      flood: analysis ? {
        flooded_area_km2: analysis.flooded_area_km2,
        debris_area_km2: analysis.debris_area_km2,
        total_affected_km2: (analysis.flooded_area_km2 || 0) + (analysis.debris_area_km2 || 0),
        confidence_pct: analysis.confidence_pct,
        method: analysis.method,
      } : null,
      damage: {
        bridges_destroyed: damage.filter(d => d.feature_type === 'bridge' && d.damaged).length,
        roads_damaged_km: +(damage.filter(d => d.feature_type === 'road' && d.damaged).reduce((s, d) => s + (d.road_length_m || 0), 0) / 1000).toFixed(1),
        buildings_damaged: damage.filter(d => d.feature_type === 'building' && d.damaged).length,
        total_damaged: damage.filter(d => d.damaged).length,
      },
      settlements: {
        total: settlements.length,
        cut_off: cutOff.length,
        cut_off_population: cutOff.reduce((s, r) => s + (r.population || 0), 0),
      },
      flood_path: path || null,
      official_figures: { deaths: 1342, missing: 4893, source: 'NDRRMA situation report, 6 Sep 2026' },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
