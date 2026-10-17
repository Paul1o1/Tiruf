-- ==============================================================
-- Tiruf Database Schema — v1.1
-- Run this against your Supabase/PostgreSQL database
-- ==============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'facility')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Worker profiles
CREATE TABLE IF NOT EXISTS worker_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  cadre VARCHAR(50) NOT NULL CHECK (cadre IN ('Nurse', 'Midwife', 'Lab Technician', 'Pharmacist', 'Radiographer', 'Admin')),
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  contact_phone VARCHAR(30),
  photo_url VARCHAR(500),
  shifts_completed INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

-- Facility profiles
CREATE TABLE IF NOT EXISTS facility_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  facility_name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN ('Hospital', 'Clinic', 'NGO Facility')),
  location VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(30),
  description TEXT,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facility_profiles(id) ON DELETE CASCADE,
  role_needed VARCHAR(50) NOT NULL CHECK (role_needed IN ('Nurse', 'Midwife', 'Lab Technician', 'Pharmacist', 'Radiographer', 'Admin')),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  pay_etb DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'filled', 'completed', 'cancelled')),
  confirmed_worker_id INTEGER REFERENCES worker_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shift applications
CREATE TABLE IF NOT EXISTS shift_applications (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id INTEGER REFERENCES worker_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  applied_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shift_id, worker_id)
);

-- Ratings
-- rater_id / ratee_id = users.id (not profile id)
-- rater_type = 'facility' means facility rated the worker
-- rater_type = 'worker' means worker rated the facility
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
  rater_id INTEGER REFERENCES users(id),
  ratee_id INTEGER REFERENCES users(id),
  rater_type VARCHAR(20) NOT NULL CHECK (rater_type IN ('worker', 'facility')),
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shift_id, rater_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shifts_facility_id ON shifts(facility_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_role_date ON shifts(role_needed, shift_date);
CREATE INDEX IF NOT EXISTS idx_applications_shift ON shift_applications(shift_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON shift_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee ON ratings(ratee_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater ON ratings(rater_id);
