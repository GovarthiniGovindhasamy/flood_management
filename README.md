# Nepal Flood Disaster Response System 🛰️

> **Case study: August 2026 Trishuli-Bhote Koshi Flood (EMSR927)**

A satellite-powered disaster response dashboard that helps rescuers answer three urgent questions after a flood: **where did it hit, what was damaged, and who is cut off** — using Sentinel-1 SAR radar, Sentinel-2 optical imagery, OpenStreetMap, and Copernicus DEM data.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Leaflet maps |
| Backend | Node.js / Express |
| Database | MySQL 8 |
| Satellite data | Sentinel-1/2 via Copernicus Data Space API |
| Map data | OpenStreetMap via ohsome API (pre-event snapshot ≤ 2026-07-27) |
| AI Copilot | Google Gemini 1.5 Flash (data-grounded, rule-based fallback) |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MySQL 8 running locally
- (Optional) Python 3.10+ with rasterio/gdal for live SAR processing

### 1. Database
```bash
mysql -u root -p -e "source database/schema.sql"
mysql -u root -p flood_response < database/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set DB_USER, DB_PASS, and optionally COPERNICUS_USER/PASS + GEMINI_API_KEY
npm install
npm start
# → http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Features

### 🌊 Flood Mapping
- Compares pre/post-event Sentinel-1 SAR scenes (same orbit track, ~12 days apart)
- SAR log-ratio change detection identifies water and debris polygons
- Sentinel-1 sees through monsoon cloud cover
- Results shown as colored GeoJSON overlays on the map

### 🏗️ Infrastructure Damage
- Fetches buildings, roads, bridges from ohsome API (OSM snapshot ≤ 2026-07-27)
- Point-in-polygon intersection with flood GeoJSON flags damaged features
- Severity classification: minor / moderate / severe / destroyed

### 🏘️ Cut-off Settlement Analysis
- Loads road network from OSM
- Removes damaged road segments
- BFS/graph analysis identifies which settlements can no longer reach hospitals or towns
- Results shown as red (cut-off) / green (connected) markers on map

### 🗺️ Flood Path Tracing (Bonus)
- Given an upstream source point, traces the flood path downvalley
- Uses Copernicus WorldDEM-30 D8 flow-direction algorithm
- Lists all settlements along the path with cut-off status

### 🤖 AI Situation Copilot
- Answers rescuer questions in English and Nepali
- **Every statistic comes from the system's database — the LLM never invents figures**
- Generates one-page bilingual situation reports
- Rule-based fallback when Gemini API key is not configured

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/events | List all flood events |
| POST | /api/events | Create new event |
| POST | /api/analysis/run/:id | Run full analysis pipeline |
| GET | /api/analysis/:id/flood | Flood/debris GeoJSON |
| GET | /api/analysis/:id/damage | Infrastructure damage GeoJSON |
| GET | /api/analysis/:id/cutoff | Cut-off settlements GeoJSON |
| GET | /api/analysis/:id/floodpath | Flood path trace |
| GET | /api/analysis/:id/stats | Summary statistics |
| POST | /api/reports/generate/:id | Generate bilingual situation report |
| GET | /api/reports/:id | Get stored report |
| POST | /api/copilot/chat | Ask the AI copilot |

---

## Data Rules

Per competition requirements:

- ✅ **Allowed inputs:** Sentinel-1, Sentinel-2, Copernicus DEM, OpenStreetMap (snapshot ≤ 2026-07-27), Kuro Siwo training data
- ❌ **Not allowed as inputs:** Copernicus EMS, UNOSAT, or post-event OSM edits
- ✅ **Allowed for verification:** EMSR927 reference maps (used only to check results)

---

## System Limitations

- **Satellite revisit:** Sentinel satellites revisit every 6-12 days — cannot warn of sudden glacier collapse minutes ahead
- **Cloud cover:** Sentinel-2 blocked by monsoon clouds; system falls back to Sentinel-1 SAR (cloud-transparent)
- **Building damage:** Polygon intersection estimate, not structural survey
- **Road network:** OSM snapshot may not reflect exact pre-event road conditions
- **Population:** Census estimates, not real-time counts
- **DEM resolution:** 30m Copernicus WorldDEM may miss small channels
- **Demo mode:** Full SAR processing requires Python + GDAL; falls back to pre-computed Trishuli data when API unavailable

---

## Required Attributions

```
Contains modified Copernicus Sentinel data 2026.

Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and 
© Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS 
by the European Union and ESA; all rights reserved.

© OpenStreetMap contributors.

Training data: Bountos et al., 2024 (Kuro Siwo, NeurIPS 2024). MIT License.
```

---

## Case Study: EMSR927 Trishuli Flood

| Metric | This System | EMSR927 Reference |
|---|---|---|
| Flooded area | 312.4 km² | ~290-340 km² (per CEMS grading maps) |
| Settlements cut off | 8 | Under assessment |
| Bridges damaged | 4 | Under assessment |
| Source | Sentinel-1 SAR | Copernicus EMS analysis |

*Note: EMSR927 maps used for verification only, not as system input.*

---

*This system is an educational prototype built for the Devpost Hackathon challenge. Not for operational use.*
