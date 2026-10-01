-- Seed data for Nepal Trishuli Flood August 2026
-- © OpenStreetMap contributors | Contains modified Copernicus Sentinel data 2026.
USE flood_response;

-- Admin user
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@floodresponse.np', '$2b$10$hashedpassword', 'admin'),
('analyst1', 'analyst@ndrrma.gov.np', '$2b$10$hashedpassword2', 'analyst');

-- Main Trishuli Flood Event
INSERT INTO flood_events (
  id, name, description, event_date,
  bbox_min_lon, bbox_min_lat, bbox_max_lon, bbox_max_lat,
  status
) VALUES (
  1,
  'Trishuli-Bhote Koshi Flood 2026',
  'Partial glacier collapse on 26 August 2026 triggered avalanche and debris flood down Bhote Koshi-Trishuli river corridor. NDRRMA reported 1,342 deaths and 4,893 missing as of 6 September 2026.',
  '2026-08-26',
  85.05, 27.85, 85.90, 28.55,
  'complete'
);

-- Analysis results
INSERT INTO analysis_results (event_id, result_type, flooded_area_km2, debris_area_km2, confidence_pct, method, geojson) VALUES
(1, 'combined', 312.4, 78.6, 87.3, 'SAR_log_ratio_demo',
'{"type":"FeatureCollection","features":[
  {"type":"Feature","properties":{"type":"flood","severity":"high"},"geometry":{"type":"Polygon","coordinates":[[[85.32,28.21],[85.38,28.21],[85.38,28.26],[85.32,28.26],[85.32,28.21]]]}},
  {"type":"Feature","properties":{"type":"flood","severity":"high"},"geometry":{"type":"Polygon","coordinates":[[[85.28,28.15],[85.36,28.15],[85.36,28.20],[85.28,28.20],[85.28,28.15]]]}},
  {"type":"Feature","properties":{"type":"flood","severity":"moderate"},"geometry":{"type":"Polygon","coordinates":[[[85.40,28.12],[85.48,28.12],[85.48,28.18],[85.40,28.18],[85.40,28.12]]]}},
  {"type":"Feature","properties":{"type":"debris","severity":"high"},"geometry":{"type":"Polygon","coordinates":[[[85.22,28.28],[85.30,28.28],[85.30,28.35],[85.22,28.35],[85.22,28.28]]]}},
  {"type":"Feature","properties":{"type":"flood","severity":"moderate"},"geometry":{"type":"Polygon","coordinates":[[[85.50,28.08],[85.58,28.08],[85.58,28.14],[85.50,28.14],[85.50,28.08]]]}},
  {"type":"Feature","properties":{"type":"debris","severity":"moderate"},"geometry":{"type":"Polygon","coordinates":[[[85.15,28.32],[85.22,28.32],[85.22,28.38],[85.15,28.38],[85.15,28.32]]]}}
]}');

-- Settlements
INSERT INTO settlements (event_id, name, name_ne, settlement_type, population, lat, lon, cut_off, nearest_town_km, nearest_hospital_km, hospital_reachable) VALUES
(1, 'Betrawati', 'बेत्रावती', 'town', 12500, 28.05, 85.42, FALSE, 0, 2.1, TRUE),
(1, 'Dhunche', 'धुन्चे', 'district_hq', 3200, 28.40, 85.30, FALSE, 45, 45.0, TRUE),
(1, 'Syabrubesi', 'स्याब्रुबेसी', 'village', 890, 28.35, 85.38, TRUE, 48, 52.0, FALSE),
(1, 'Tiru', 'तिरु', 'village', 420, 28.28, 85.33, TRUE, 38, 42.0, FALSE),
(1, 'Ghattekhola', 'घट्टेखोला', 'village', 310, 28.22, 85.36, TRUE, 30, 35.0, FALSE),
(1, 'Ramche', 'रामचे', 'village', 680, 28.18, 85.40, TRUE, 22, 28.0, FALSE),
(1, 'Mailung', 'मैलुङ', 'village', 295, 28.32, 85.25, TRUE, 41, 46.0, FALSE),
(1, 'Thare Khola', 'थारे खोला', 'village', 185, 28.26, 85.28, TRUE, 35, 40.0, FALSE),
(1, 'Dandagaun', 'डाँडागाउँ', 'village', 540, 28.15, 85.45, TRUE, 18, 24.0, FALSE),
(1, 'Kharanitar', 'खरानीटार', 'town', 8700, 28.08, 85.48, FALSE, 8, 8.0, TRUE),
(1, 'Trishuli Bazar', 'त्रिशूली बजार', 'town', 15600, 27.99, 85.51, FALSE, 0, 1.5, TRUE),
(1, 'Kakani', 'काकानी', 'village', 2100, 27.95, 85.30, FALSE, 15, 18.0, TRUE),
(1, 'Salme', 'साल्मे', 'village', 760, 28.12, 85.28, FALSE, 20, 25.0, TRUE);

-- Infrastructure damage
INSERT INTO infrastructure_damage (event_id, osm_id, feature_type, name, damaged, damage_severity, road_length_m, lat, lon) VALUES
(1, 1234567, 'bridge', 'Tiru Suspension Bridge', TRUE, 'destroyed', NULL, 28.283, 85.329),
(1, 1234568, 'bridge', 'Ghattekhola Bridge', TRUE, 'destroyed', NULL, 28.225, 85.362),
(1, 1234569, 'bridge', 'Syabrubesi Lower Bridge', TRUE, 'severe', NULL, 28.348, 85.379),
(1, 1234570, 'bridge', 'Ramche Footbridge', TRUE, 'destroyed', NULL, 28.178, 85.403),
(1, 2345001, 'road', 'Trishuli-Syabrubesi Highway (KM 34-67)', TRUE, 'severe', 33000, 28.21, 85.36),
(1, 2345002, 'road', 'Betrawati-Dhunche Road (KM 12-46)', TRUE, 'moderate', 34000, 28.28, 85.33),
(1, 2345003, 'road', 'Local feeder road Mailung', TRUE, 'severe', 8200, 28.32, 85.25),
(1, 2345004, 'road', 'Thare Khola access road', TRUE, 'destroyed', 4100, 28.26, 85.28),
(1, 3456001, 'building', 'Syabrubesi Primary School', TRUE, 'severe', NULL, 28.352, 85.383),
(1, 3456002, 'building', 'Tiru Health Post', TRUE, 'destroyed', NULL, 28.281, 85.330),
(1, 3456003, 'building', 'Ghattekhola Community Center', TRUE, 'moderate', NULL, 28.223, 85.360),
(1, 3456004, 'building', 'Ramche Hydropower Station', TRUE, 'severe', NULL, 28.182, 85.401),
(1, 3456005, 'building', 'Dandagaun Irrigation Office', TRUE, 'moderate', NULL, 28.151, 85.453),
(1, 3456006, 'building', 'Mailung Water Supply Station', TRUE, 'severe', NULL, 28.321, 85.250);

-- Flood path
INSERT INTO flood_paths (event_id, source_lat, source_lon, path_length_km, settlements_hit, geojson) VALUES
(1, 28.55, 85.32, 147.3, 11,
'{"type":"Feature","properties":{"source":"Trishuli Glacier zone","length_km":147.3,"settlements_hit":11},"geometry":{"type":"LineString","coordinates":[[85.32,28.55],[85.31,28.50],[85.30,28.45],[85.30,28.40],[85.30,28.35],[85.31,28.32],[85.33,28.28],[85.35,28.22],[85.37,28.18],[85.40,28.15],[85.42,28.10],[85.45,28.05],[85.48,28.02],[85.51,27.99]]}}');

-- Situation report
INSERT INTO situation_reports (event_id, report_en, report_ne, model_used) VALUES
(1,
'SITUATION REPORT — Trishuli-Bhote Koshi Flood | Date: 06 September 2026 | Prepared by: Flood Response System v1.0

EXECUTIVE SUMMARY
A catastrophic glacial lake outburst flood (GLOF) struck the Bhote Koshi-Trishuli river corridor on 26 August 2026 following the partial collapse of a high-altitude glacier. Satellite analysis of Sentinel-1 SAR data confirms significant inundation and debris deposition across the corridor.

FLOOD EXTENT
Total flooded/debris area: 391.0 km² (flood: 312.4 km², debris: 78.6 km²).
The flood path traced from the source glacier descends 147.3 km through the valley, affecting 11 settlements along its course.

INFRASTRUCTURE DAMAGE
- Bridges destroyed or severely damaged: 4 (Tiru Suspension Bridge, Ghattekhola Bridge, Syabrubesi Lower Bridge, Ramche Footbridge)
- Roads damaged: 4 segments totalling ~79.3 km
- Critical buildings affected: 6 (including 1 health post, 1 school, 1 hydropower station)

POPULATION AT RISK
Settlements confirmed cut off from road access: 8
Estimated population cut off: 3,625 persons across 8 villages
- Syabrubesi (890), Tiru (420), Ghattekhola (310), Ramche (680), Mailung (295), Thare Khola (185), Dandagaun (540), plus others
The nearest accessible hospital is now 52+ km from Syabrubesi, reachable only by air or foot trail.

OFFICIAL FIGURES (NDRRMA, 6 Sep 2026): 1,342 confirmed deaths, 4,893 missing.

SATELLITE DATA
Source: Sentinel-1 SAR (pre-event: ~14 Aug 2026; post-event: ~30 Aug 2026). Analysis confidence: 87.3%.
Data: Contains modified Copernicus Sentinel data 2026.

LIMITATIONS
Sentinel-1 revisit time is 6-12 days; damage in the first 48 hours may not be captured. Cloud cover may affect Sentinel-2 optical scenes. Road network analysis uses OSM snapshot (≤27 Jul 2026) and may not reflect pre-event road conditions accurately. Building damage estimates are based on polygon intersection, not structural survey.

RECOMMENDED ACTIONS
1. Priority air evacuation from Syabrubesi, Tiru, and Dandagaun (highest population concentration among cut-off villages)
2. Establish emergency supply chain via helicopter to 8 cut-off settlements
3. Deploy field teams to assess structural integrity of Ramche Hydropower Station (further flood risk)
4. Re-survey bridge sites for emergency pontoon crossing feasibility

Attributions: Contains modified Copernicus Sentinel data 2026. Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018. © OpenStreetMap contributors. Training data: Bountos et al., 2024 (Kuro Siwo).',

'स्थिति रिपोर्ट — त्रिशूली-भोटे कोशी बाढी | मिति: ०६ सेप्टेम्बर २०२६ | तयार: Flood Response System v1.0

कार्यकारी सारांश
२६ अगस्त २०२६ मा उच्च-उचाइको हिमनदी आंशिक रूपमा भाँचिएपछि भोटे कोशी-त्रिशूली नदी क्षेत्रमा विनाशकारी हिमताल विस्फोट बाढी (GLOF) आयो। Sentinel-1 SAR उपग्रह विश्लेषणले यस क्षेत्रमा व्यापक जलमग्नता र मलबे जम्माको पुष्टि गर्दछ।

बाढी क्षेत्र
कुल जलमग्न/मलबे क्षेत्र: ३९१.० वर्ग किमी (बाढी: ३१२.४ वर्ग किमी, मलबे: ७८.६ वर्ग किमी)।
बाढीको मार्ग स्रोत हिमनदीबाट तल १४७.३ किमी सम्म, यसको मार्गमा ११ बस्तीहरू प्रभावित।

पूर्वाधार क्षति
- पुलहरू नष्ट वा गम्भीर क्षति: ४ (तिरु झोलुङ्गे पुल, घट्टेखोला पुल, स्याब्रुबेसी तल्लो पुल, रामचे पाइलावाले पुल)
- सडक क्षति: ४ खण्ड, जम्मा ~७९.३ किमी
- महत्वपूर्ण भवनहरू प्रभावित: ६ (१ स्वास्थ्य चौकी, १ विद्यालय, १ जलविद्युत केन्द्र सहित)

जोखिममा जनसंख्या
सडक पहुँचबाट विच्छेद भएका बस्तीहरू: ८
अनुमानित विच्छेद जनसंख्या: ३,६२५ व्यक्ति
निकटतम पहुँचयोग्य अस्पताल स्याब्रुबेसीबाट अब ५२+ किमी टाढा छ।

आधिकारिक तथ्याङ्क (NDRRMA, ६ सेप्टेम्बर २०२६): १,३४२ मृत्यु पुष्टि, ४,८९३ हराइरहेका।

डेटा स्रोत: Sentinel-1 SAR। विश्लेषण विश्वसनीयता: ८७.३%।
Contains modified Copernicus Sentinel data 2026. © OpenStreetMap contributors.',

'gemini-1.5-flash-demo');
