import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function floodStyle(feature) {
  const type = feature.properties?.type;
  const severity = feature.properties?.severity;
  const opacity = severity === 'high' ? 0.65 : severity === 'moderate' ? 0.45 : 0.30;
  return {
    fillColor: type === 'flood' ? '#38bdf8' : '#f97316',
    fillOpacity: opacity,
    color: type === 'flood' ? '#0ea5e9' : '#ea580c',
    weight: 1.5,
    opacity: 0.8,
  };
}

function damageIcon(type, severity) {
  const colors = {
    bridge: '#ef4444',
    road:   '#f59e0b',
    building: '#a78bfa',
    other: '#94a3b8',
  };
  const color = colors[type] || '#94a3b8';
  const size = severity === 'destroyed' ? 18 : severity === 'severe' ? 15 : 12;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}88;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}

function settlementIcon(cutOff) {
  const color = cutOff ? '#ef4444' : '#22c55e';
  const pulse = cutOff ? `animation:pulse 1.5s ease-in-out infinite;` : '';
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 10px ${color};${pulse}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, zoom || 10, { duration: 1.5 }); }, [center, zoom]);
  return null;
}

export default function MapDashboard({ floodData, damageData, cutoffData, pathData, layers, onMapClick }) {
  const bounds = [[27.85, 85.05], [28.55, 85.90]];
  const center = [28.2, 85.45];

  const floodFeatures = floodData?.geojson;
  const damageFeatures = damageData?.geojson;
  const cutoffFeatures = cutoffData?.geojson;
  const pathGeojson = pathData?.geojson;

  return (
    <div className="map-container">
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.3);opacity:0.7;}}`}</style>
      <MapContainer
        center={center}
        zoom={10}
        maxBounds={[[26, 83], [30, 88]]}
        minZoom={7}
        style={{ height: '100%', width: '100%' }}
        onClick={onMapClick}
      >
        {/* Base map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={18}
        />
        {/* Labels overlay */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          opacity={0.6}
        />

        {/* Flood/debris polygons */}
        {layers.flood && floodFeatures && (
          <GeoJSON
            key={JSON.stringify(floodFeatures).slice(0, 50)}
            data={floodFeatures}
            style={floodStyle}
            onEachFeature={(feature, layer) => {
              const p = feature.properties;
              layer.bindPopup(`
                <div style="font-family:Inter,sans-serif;font-size:13px;min-width:160px;">
                  <b style="text-transform:capitalize;">${p.type || 'Flood'}</b><br/>
                  <span style="color:#94a3b8">Severity:</span> <b>${p.severity || 'unknown'}</b><br/>
                  <span style="color:#94a3b8">Source:</span> Sentinel-1 SAR
                </div>
              `);
            }}
          />
        )}

        {/* Infrastructure damage markers */}
        {layers.damage && damageFeatures?.features?.map((f, i) => (
          <Marker
            key={`dmg-${i}`}
            position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
            icon={damageIcon(f.properties.feature_type, f.properties.damage_severity)}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, minWidth: 180 }}>
                <b>{f.properties.name}</b><br />
                <span style={{ color: '#94a3b8' }}>Type:</span> {f.properties.feature_type}<br />
                <span style={{ color: '#94a3b8' }}>Damage:</span> <span style={{ color: '#ef4444', textTransform: 'capitalize' }}>{f.properties.damage_severity}</span><br />
                {f.properties.road_length_m && <><span style={{ color: '#94a3b8' }}>Length:</span> {(f.properties.road_length_m / 1000).toFixed(1)} km<br /></>}
                <span style={{ color: '#94a3b8' }}>Source:</span> OpenStreetMap
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Settlement markers */}
        {layers.settlements && cutoffFeatures?.features?.map((f, i) => (
          <Marker
            key={`set-${i}`}
            position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
            icon={settlementIcon(f.properties.cut_off)}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, minWidth: 190 }}>
                <b>{f.properties.name}</b>{f.properties.name_ne ? ` (${f.properties.name_ne})` : ''}<br />
                <span style={{ color: f.properties.cut_off ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                  {f.properties.cut_off ? '⛔ CUT OFF' : '✅ Connected'}
                </span><br />
                {f.properties.population && <><span style={{ color: '#94a3b8' }}>Population:</span> {f.properties.population}<br /></>}
                <span style={{ color: '#94a3b8' }}>Nearest hospital:</span> {f.properties.nearest_hospital_km} km<br />
                <span style={{ color: '#94a3b8' }}>Hospital road:</span> {f.properties.hospital_reachable ? '✅ Accessible' : '❌ Blocked'}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Flood path polyline */}
        {layers.floodpath && pathGeojson?.geometry?.coordinates && (
          <Polyline
            positions={pathGeojson.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
            color="#2dd4bf"
            weight={4}
            opacity={0.85}
            dashArray="10, 6"
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="map-overlay top-right">
        <div className="map-legend">
          <div className="legend-title">Map Legend</div>
          {layers.flood && <>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: 'rgba(56,189,248,0.6)' }} />
              Flood water
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: 'rgba(249,115,22,0.6)' }} />
              Debris/mud
            </div>
          </>}
          {layers.damage && <>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#ef4444', borderRadius: '50%' }} />
              Bridge damaged
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#f59e0b', borderRadius: '50%' }} />
              Road damaged
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#a78bfa', borderRadius: '50%' }} />
              Building damaged
            </div>
          </>}
          {layers.settlements && <>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#ef4444', borderRadius: '50%' }} />
              Cut-off settlement
            </div>
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#22c55e', borderRadius: '50%' }} />
              Connected settlement
            </div>
          </>}
          {layers.floodpath && (
            <div className="legend-item">
              <div className="legend-swatch" style={{ background: '#2dd4bf' }} />
              Flood path (DEM)
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 9, color: '#475569', lineHeight: 1.5 }}>
            Sentinel-1 SAR · OSM<br/>
            Copernicus WorldDEM-30
          </div>
        </div>
      </div>
    </div>
  );
}
