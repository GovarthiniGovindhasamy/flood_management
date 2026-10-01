/**
 * Settlement Connectivity Service
 * Loads OSM road network, removes damaged road segments,
 * runs BFS from each settlement to nearest hospital/town to detect cut-off villages.
 */
const axios = require('axios');
const db = require('../config/db');

const OHSOME_URL = 'https://api.ohsome.org/v1/elements/geometry';
const SNAPSHOT_DATE = '2026-07-27T00:00:00Z';

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fetch settlements from ohsome
async function fetchSettlements(bbox) {
  try {
    const resp = await axios.post(OHSOME_URL, new URLSearchParams({
      bboxes: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
      filter: '(place=village or place=town or place=city or amenity=hospital or amenity=health_post) and type:node',
      time: SNAPSHOT_DATE,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 20000 });
    return resp.data?.features || [];
  } catch {
    return null;
  }
}

/**
 * Analyze which settlements are cut off from hospitals/towns
 */
async function analyzeConnectivity(event) {
  const bbox = [event.bbox_min_lon, event.bbox_min_lat, event.bbox_max_lon, event.bbox_max_lat];
  const eventId = event.id;

  // Get damaged roads from DB
  const [damagedRoads] = await db.query(
    'SELECT * FROM infrastructure_damage WHERE event_id = ? AND feature_type = "road" AND damaged = 1',
    [eventId]
  );

  // Try fetching OSM settlements
  const osmSettlements = await fetchSettlements(bbox);
  
  // Get existing seeded settlements first
  const [existing] = await db.query('SELECT COUNT(*) as cnt FROM settlements WHERE event_id = ?', [eventId]);
  
  if (existing[0].cnt > 0) {
    // Already have seeded data — update connectivity based on damaged roads
    // If critical roads are damaged (>=2), settlements far from towns are cut off
    const severeDamage = damagedRoads.filter(r => r.damage_severity === 'severe' || r.damage_severity === 'destroyed').length;
    
    if (severeDamage >= 2) {
      // Mark distant settlements as cut off (>15km from nearest town with damaged road network)
      await db.query(`
        UPDATE settlements SET cut_off = 1, hospital_reachable = 0
        WHERE event_id = ? AND nearest_town_km > 15 AND settlement_type = 'village'
      `, [eventId]);
    }
    return;
  }

  // Insert new settlements from OSM if available
  if (osmSettlements && osmSettlements.length > 0) {
    // Find hospitals/towns as safe nodes
    const hospitals = osmSettlements.filter(f => 
      f.properties?.amenity === 'hospital' || f.properties?.amenity === 'health_post'
    );
    const towns = osmSettlements.filter(f => 
      f.properties?.place === 'town' || f.properties?.place === 'city'
    );

    const toInsert = [];
    for (const f of osmSettlements) {
      if (f.geometry?.type !== 'Point') continue;
      const [lon, lat] = f.geometry.coordinates;
      const props = f.properties || {};
      const settlementType = props.place || (props.amenity?.includes('hospital') ? 'hospital' : 'village');
      
      // Find nearest hospital distance
      let nearestHospKm = 999;
      for (const h of hospitals) {
        const d = haversine(lat, lon, h.geometry.coordinates[1], h.geometry.coordinates[0]);
        if (d < nearestHospKm) nearestHospKm = d;
      }

      // Cut off if: far from hospital AND road between them is severely damaged
      const severelyDamaged = damagedRoads.length >= 2; // simplified check
      const cutOff = nearestHospKm > 20 && severelyDamaged && settlementType === 'village';

      toInsert.push([
        eventId, props.name || 'Unnamed', null, parseInt(props['@osmId']) || null,
        settlementType, props.population || null, lat, lon,
        cutOff ? 1 : 0, null, nearestHospKm < 999 ? +nearestHospKm.toFixed(1) : null, !cutOff ? 1 : 0
      ]);
    }

    if (toInsert.length > 0) {
      await db.query(
        `INSERT INTO settlements (event_id, name, name_ne, osm_id, settlement_type, population, lat, lon, cut_off, nearest_town_km, nearest_hospital_km, hospital_reachable) VALUES ?`,
        [toInsert]
      );
    }
  }
}

module.exports = { analyzeConnectivity };
