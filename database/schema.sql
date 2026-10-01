-- Nepal Flood Disaster Response System
-- MySQL 8 Schema
-- Contains modified Copernicus Sentinel data 2026.

CREATE DATABASE IF NOT EXISTS flood_response CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flood_response;

-- ─────────────────────────────────────────
-- Users (dashboard auth)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(80)  NOT NULL UNIQUE,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','analyst','viewer') DEFAULT 'analyst',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- Flood Events
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flood_events (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  event_date      DATE NOT NULL,
  bbox_min_lon    DOUBLE NOT NULL,
  bbox_min_lat    DOUBLE NOT NULL,
  bbox_max_lon    DOUBLE NOT NULL,
  bbox_max_lat    DOUBLE NOT NULL,
  status          ENUM('pending','processing','complete','error') DEFAULT 'pending',
  s1_before_url   TEXT,
  s1_after_url    TEXT,
  s2_before_url   TEXT,
  s2_after_url    TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- Analysis Results (flood/debris GeoJSON)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_results (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT NOT NULL,
  result_type     ENUM('flood','debris','combined') DEFAULT 'combined',
  geojson         LONGTEXT,        -- GeoJSON FeatureCollection
  flooded_area_km2 DOUBLE,
  debris_area_km2 DOUBLE,
  confidence_pct  DOUBLE,          -- model confidence 0-100
  method          VARCHAR(100),    -- e.g. 'SAR_log_ratio','demo'
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES flood_events(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- Infrastructure Damage
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS infrastructure_damage (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT NOT NULL,
  osm_id          BIGINT,
  feature_type    ENUM('building','road','bridge','other'),
  name            VARCHAR(255),
  geojson         TEXT,            -- individual feature GeoJSON
  damaged         BOOLEAN DEFAULT FALSE,
  damage_severity ENUM('none','minor','moderate','severe','destroyed') DEFAULT 'none',
  road_length_m   DOUBLE,          -- null for buildings
  lat             DOUBLE,
  lon             DOUBLE,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES flood_events(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- Settlements
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settlements (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  event_id            INT NOT NULL,
  name                VARCHAR(255),
  name_ne             VARCHAR(255),   -- Nepali name
  osm_id              BIGINT,
  settlement_type     ENUM('village','town','city','hospital','district_hq'),
  population          INT,
  lat                 DOUBLE,
  lon                 DOUBLE,
  cut_off             BOOLEAN DEFAULT FALSE,
  nearest_town_km     DOUBLE,
  nearest_hospital_km DOUBLE,
  hospital_reachable  BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (event_id) REFERENCES flood_events(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- Flood Paths (DEM-traced)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flood_paths (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT NOT NULL,
  source_lat      DOUBLE NOT NULL,
  source_lon      DOUBLE NOT NULL,
  geojson         LONGTEXT,        -- LineString GeoJSON
  path_length_km  DOUBLE,
  settlements_hit INT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES flood_events(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- Situation Reports
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS situation_reports (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT NOT NULL,
  report_en       LONGTEXT,        -- English report
  report_ne       LONGTEXT,        -- Nepali report
  generated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  model_used      VARCHAR(100),
  FOREIGN KEY (event_id) REFERENCES flood_events(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- Copilot Conversations
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS copilot_chats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  event_id    INT,
  question    TEXT NOT NULL,
  answer      TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES flood_events(id) ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX idx_damage_event ON infrastructure_damage(event_id, feature_type);
CREATE INDEX idx_settlement_event ON settlements(event_id, cut_off);
