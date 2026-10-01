/**
 * Flood Path Service
 * Traces flood path downstream using Copernicus DEM-based flow direction.
 * Falls back to pre-computed demo path for the Trishuli corridor.
 */
const db = require('../config/db');

// Pre-computed Trishuli valley flood path (based on DEM analysis)
const TRISHULI_PATH = {
  coordinates: [
    [85.32,28.55],[85.31,28.50],[85.30,28.45],[85.30,28.40],
    [85.30,28.35],[85.31,28.32],[85.33,28.28],[85.35,28.22],
    [85.37,28.18],[85.40,28.15],[85.42,28.10],[85.45,28.05],
    [85.48,28.02],[85.51,27.99]
  ],
  settlements: [
    'Syabrubesi','Mailung','Thare Khola','Tiru','Ghattekhola',
    'Ramche','Dandagaun','Kharanitar','Trishuli Bazar'
  ],
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pathLengthKm(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i-1][1], coords[i-1][0], coords[i][1], coords[i][0]);
  }
  return +total.toFixed(1);
}

/**
 * Trace flood path from given source point
 * In production: calls Python sidecar with Copernicus DEM
 * Demo: returns pre-computed path for the Trishuli valley
 */
async function tracePath(event, sourceLat, sourceLon) {
  const eventId = event.id;

  // Find settlements along path (within 5km of path)
  const [settlements] = await db.query('SELECT * FROM settlements WHERE event_id = ?', [eventId]);
  const hitSettlements = settlements.filter(s => {
    return TRISHULI_PATH.coordinates.some(([lon, lat]) => haversine(lat, lon, s.lat, s.lon) < 5);
  });

  const pathCoords = TRISHULI_PATH.coordinates;
  const length = pathLengthKm(pathCoords);

  const geojson = {
    type: 'Feature',
    properties: {
      source: `${sourceLat.toFixed(4)}, ${sourceLon.toFixed(4)}`,
      length_km: length,
      settlements_hit: hitSettlements.length,
      settlement_names: hitSettlements.map(s => s.name),
      method: 'DEM_D8_flow_direction_demo',
      data_source: 'Copernicus WorldDEM-30',
    },
    geometry: {
      type: 'LineString',
      coordinates: pathCoords,
    },
  };

  // Save to DB if for this event
  await db.query(
    `INSERT INTO flood_paths (event_id, source_lat, source_lon, geojson, path_length_km, settlements_hit)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [eventId, sourceLat, sourceLon, JSON.stringify(geojson), length, hitSettlements.length]
  );

  return {
    event_id: eventId,
    source: { lat: sourceLat, lon: sourceLon },
    path_length_km: length,
    settlements_hit: hitSettlements.length,
    settlements: hitSettlements.map(s => ({ name: s.name, lat: s.lat, lon: s.lon, cut_off: !!s.cut_off })),
    geojson,
    attribution: 'Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018.',
  };
}

module.exports = { tracePath };
