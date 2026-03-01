-- =============================================================
--  Skill-Link CDO — Local MySQL Schema
-- =============================================================
USE skilllink_db;

-- PROFILES (all users: admin, worker, resident)
CREATE TABLE IF NOT EXISTS profiles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  full_name     VARCHAR(255) NOT NULL,
  role          ENUM('admin','worker','resident') NOT NULL DEFAULT 'resident',
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WORKERS (linked to profiles)
CREATE TABLE IF NOT EXISTS workers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  profile_id       INT NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  hourly_rate      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  rating           DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  skills           JSON,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS service_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  customer_name   VARCHAR(255) NOT NULL,
  service_type    VARCHAR(100) NOT NULL,
  status          ENUM('pending','matched','in_progress','completed','cancelled')
                  NOT NULL DEFAULT 'pending',
  assigned_worker VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
--  SEED DATA — Sample records for dev/testing
-- =============================================================
INSERT INTO profiles (email, full_name, role, is_verified) VALUES
  ('admin@skilllink.com',    'Barangay Admin',  'admin',    TRUE),
  ('worker@skilllink.com',   'Juan Dela Cruz',  'worker',   TRUE),
  ('worker2@skilllink.com',  'Pedro Reyes',     'worker',   TRUE),
  ('worker3@skilllink.com',  'Carlo Mendez',    'worker',   FALSE),
  ('resident@skilllink.com', 'Maria Santos',    'resident', TRUE),
  ('resident2@skilllink.com','Ana Lim',         'resident', TRUE);

INSERT INTO workers (profile_id, experience_years, hourly_rate, rating, skills) VALUES
  (2, 5,  250.00, 4.8, '["Plumbing","Pipe Fitting","Water Heater"]'),
  (3, 3,  200.00, 4.5, '["Electrical","Wiring","Circuit Breaker"]'),
  (4, 1,  150.00, 0.0, '["Carpentry","Painting"]');

INSERT INTO service_requests (customer_name, service_type, status, assigned_worker) VALUES
  ('Maria Santos',   'Plumbing',    'pending',   NULL),
  ('Ana Lim',        'Electrical',  'matched',   'Juan Dela Cruz'),
  ('Jose Reyes',     'Carpentry',   'completed', 'Pedro Reyes'),
  ('Linda Cruz',     'Cleaning',    'pending',   NULL),
  ('Ramon Torres',   'Electrical',  'cancelled', NULL),
  ('Cita Flores',    'Plumbing',    'completed', 'Juan Dela Cruz');