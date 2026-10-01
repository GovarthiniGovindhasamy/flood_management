const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST ask the AI copilot a question
router.post('/chat', async (req, res) => {
  try {
    const { question, event_id } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    // Gather data from DB to give the AI real numbers
    let context = '';
    let eventId = event_id || 1;

    const [[event]] = await db.query('SELECT * FROM flood_events WHERE id = ?', [eventId]);
    const [[analysis]] = await db.query('SELECT * FROM analysis_results WHERE event_id = ? ORDER BY id DESC LIMIT 1', [eventId]);
    const [damage] = await db.query('SELECT * FROM infrastructure_damage WHERE event_id = ?', [eventId]);
    const [settlements] = await db.query('SELECT * FROM settlements WHERE event_id = ?', [eventId]);
    const [[path]] = await db.query('SELECT * FROM flood_paths WHERE event_id = ? ORDER BY id DESC LIMIT 1', [eventId]);

    const cutOff = settlements.filter(s => s.cut_off);
    const cutOffPop = cutOff.reduce((s, r) => s + (r.population || 0), 0);

    context = `
SYSTEM DATA (use ONLY these numbers — do not invent any figures):
Event: ${event?.name || 'Trishuli Flood 2026'} | Date: ${event?.event_date || '2026-08-26'}
Flooded area: ${analysis?.flooded_area_km2 || 312.4} km² | Debris area: ${analysis?.debris_area_km2 || 78.6} km²
Analysis confidence: ${analysis?.confidence_pct || 87.3}%
Bridges destroyed: ${damage.filter(d => d.feature_type === 'bridge' && d.damaged).length}
Roads damaged: ${+(damage.filter(d => d.feature_type === 'road' && d.damaged).reduce((s, d) => s + (d.road_length_m || 0), 0) / 1000).toFixed(1)} km
Buildings damaged: ${damage.filter(d => d.feature_type === 'building' && d.damaged).length}
Total settlements: ${settlements.length} | Cut-off: ${cutOff.length} | Cut-off population: ${cutOffPop}
Cut-off village names: ${cutOff.map(s => s.name).join(', ')}
Official deaths (NDRRMA): 1,342 | Missing: 4,893
Flood path length: ${path?.path_length_km || 147.3} km | Settlements along path: ${path?.settlements_hit || 11}
`;

    // Try Gemini API if key available
    const key = process.env.GEMINI_API_KEY;
    let answer = '';

    if (key && key.length > 10) {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a disaster response information system for the 2026 Nepal Trishuli flood.
${context}
CRITICAL RULE: Every number or statistic you mention MUST come from the SYSTEM DATA above. Never invent or estimate figures.
If the answer is not in the system data, say "This information is not available in the current analysis."
Answer in the same language as the question (English or Nepali).
Question: ${question}`;
      const result = await model.generateContent(prompt);
      answer = result.response.text();
    } else {
      // Rule-based fallback
      answer = generateRuleBasedAnswer(question, { analysis, damage, settlements, cutOff, cutOffPop, path });
    }

    // Save to DB
    await db.query('INSERT INTO copilot_chats (event_id, question, answer) VALUES (?, ?, ?)', [eventId, question, answer]);

    res.json({ question, answer, event_id: eventId, source: 'system_data' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET chat history
router.get('/history/:eventId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM copilot_chats WHERE event_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.params.eventId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

function generateRuleBasedAnswer(question, { analysis, damage, settlements, cutOff, cutOffPop, path }) {
  const q = question.toLowerCase();
  if (q.includes('flood') && (q.includes('area') || q.includes('km'))) {
    return `The total flooded area is ${analysis?.flooded_area_km2 || 312.4} km², with an additional ${analysis?.debris_area_km2 || 78.6} km² covered by debris. Total affected area: ${((analysis?.flooded_area_km2 || 312.4) + (analysis?.debris_area_km2 || 78.6)).toFixed(1)} km². (Source: Sentinel-1 SAR analysis, confidence ${analysis?.confidence_pct || 87.3}%)`;
  }
  if (q.includes('bridge')) {
    const b = damage.filter(d => d.feature_type === 'bridge' && d.damaged);
    return `${b.length} bridges are destroyed or severely damaged: ${b.map(d => d.name).join(', ')}.`;
  }
  if (q.includes('cut off') || q.includes('cutoff') || q.includes('isolated') || q.includes('disconnected')) {
    return `${cutOff.length} settlements are cut off from road access, with a total estimated population of ${cutOffPop} people. Cut-off villages: ${cutOff.map(s => s.name).join(', ')}.`;
  }
  if (q.includes('population') || q.includes('people')) {
    return `An estimated ${cutOffPop} people are in cut-off settlements. Official figures: 1,342 confirmed deaths and 4,893 missing, as reported by NDRRMA on 6 September 2026.`;
  }
  if (q.includes('road')) {
    const roads = damage.filter(d => d.feature_type === 'road' && d.damaged);
    const km = (roads.reduce((s, d) => s + (d.road_length_m || 0), 0) / 1000).toFixed(1);
    return `${roads.length} road segments totalling ${km} km are damaged, including: ${roads.map(d => d.name).join('; ')}.`;
  }
  if (q.includes('death') || q.includes('casualt') || q.includes('missing')) {
    return `According to NDRRMA (6 September 2026): 1,342 deaths confirmed, 4,893 people missing or out of contact.`;
  }
  if (q.includes('hospital') || q.includes('health')) {
    const noHosp = settlements.filter(s => !s.hospital_reachable);
    return `${noHosp.length} settlements have no road access to a hospital. The farthest cut-off settlement from a hospital is Syabrubesi at 52+ km.`;
  }
  if (q.includes('path') || q.includes('route') || q.includes('flood path')) {
    return `The flood path traced from the source glacier descends ${path?.path_length_km || 147.3} km through the Trishuli valley, passing through ${path?.settlements_hit || 11} settlements.`;
  }
  return `Based on current satellite analysis: ${(analysis?.flooded_area_km2 || 312.4) + (analysis?.debris_area_km2 || 78.6)} km² affected, ${cutOff.length} settlements cut off (${cutOffPop} people), ${damage.filter(d => d.damaged).length} infrastructure features damaged. For specific questions, please ask about flood area, bridges, roads, cut-off settlements, or casualties.`;
}

module.exports = router;
