-- Tiruf Demo Seed Data
-- Passwords are all: Demo1234!

-- Facility users (password: Demo1234!)
INSERT INTO users (email, password_hash, user_type) VALUES
  ('hayat@tiruf.demo', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'facility'),
  ('mcm@tiruf.demo',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'facility'),
  ('landmark@tiruf.demo', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'facility')
ON CONFLICT (email) DO NOTHING;

-- Worker users (password: Demo1234!)
INSERT INTO users (email, password_hash, user_type) VALUES
  ('abebe@tiruf.demo',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
  ('tigist@tiruf.demo', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
  ('meron@tiruf.demo',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
  ('dawit@tiruf.demo',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
  ('hana@tiruf.demo',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker')
ON CONFLICT (email) DO NOTHING;

-- Facility profiles
INSERT INTO facility_profiles (user_id, facility_name, facility_type, location, description)
SELECT id, 'Hayat Hospital', 'Hospital', 'Bole, Addis Ababa',
  'One of Ethiopia''s leading private hospitals serving Addis Ababa for over 30 years. Specialises in emergency, maternity, and surgical services.'
FROM users WHERE email = 'hayat@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO facility_profiles (user_id, facility_name, facility_type, location, description)
SELECT id, 'MCM General Hospital', 'Hospital', 'Kazanchis, Addis Ababa',
  'A full-service general hospital in central Addis Ababa offering primary and specialist care with modern diagnostic facilities.'
FROM users WHERE email = 'mcm@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO facility_profiles (user_id, facility_name, facility_type, location, description)
SELECT id, 'Landmark General Hospital', 'Hospital', 'CMC, Addis Ababa',
  'Modern multi-specialty hospital serving the CMC area. Known for high standards of patient care and state-of-the-art equipment.'
FROM users WHERE email = 'landmark@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

-- Worker profiles
INSERT INTO worker_profiles (user_id, full_name, cadre, years_experience, bio, avg_rating, rating_count, shifts_completed)
SELECT id, 'Abebe Girma', 'Nurse', 5,
  'Experienced nurse specialising in emergency and critical care. Currently works at two public hospitals and looking for weekend shifts.',
  4.8, 12, 12
FROM users WHERE email = 'abebe@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO worker_profiles (user_id, full_name, cadre, years_experience, bio, avg_rating, rating_count, shifts_completed)
SELECT id, 'Tigist Bekele', 'Midwife', 8,
  'Senior midwife with 8 years of experience in maternity care. Passionate about safe delivery practices and maternal health.',
  4.9, 20, 20
FROM users WHERE email = 'tigist@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO worker_profiles (user_id, full_name, cadre, years_experience, bio, avg_rating, rating_count, shifts_completed)
SELECT id, 'Meron Tadesse', 'Lab Technician', 3,
  'Lab technician specialising in haematology and biochemistry. Reliable, detail-oriented, and available for evening shifts.',
  4.5, 8, 8
FROM users WHERE email = 'meron@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO worker_profiles (user_id, full_name, cadre, years_experience, bio, avg_rating, rating_count, shifts_completed)
SELECT id, 'Dawit Alemu', 'Pharmacist', 6,
  'Registered pharmacist with hospital and retail experience. Fluent in Amharic, Oromo and English. Available for weekend coverage.',
  4.7, 15, 15
FROM users WHERE email = 'dawit@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO worker_profiles (user_id, full_name, cadre, years_experience, bio, avg_rating, rating_count, shifts_completed)
SELECT id, 'Hana Yohannes', 'Radiographer', 4,
  'Radiographer with experience in X-ray, ultrasound and CT scanning. Currently freelancing and open to full-day shifts.',
  4.6, 9, 9
FROM users WHERE email = 'hana@tiruf.demo'
ON CONFLICT (user_id) DO NOTHING;

-- Open shifts (using future dates relative to seed time)
INSERT INTO shifts (facility_id, role_needed, shift_date, start_time, end_time, pay_etb, description, status)
SELECT fp.id, 'Nurse', CURRENT_DATE + 2, '07:00', '19:00', 1200,
  'Day shift nurse needed for general ward. Must have experience with IV lines and wound care. Uniform provided.'
FROM facility_profiles fp JOIN users u ON fp.user_id = u.id WHERE u.email = 'hayat@tiruf.demo';

INSERT INTO shifts (facility_id, role_needed, shift_date, start_time, end_time, pay_etb, description, status)
SELECT fp.id, 'Midwife', CURRENT_DATE + 3, '19:00', '07:00', 1500,
  'Night shift midwife for maternity ward. Experienced in active labour management. High caseload expected.'
FROM facility_profiles fp JOIN users u ON fp.user_id = u.id WHERE u.email = 'hayat@tiruf.demo';

INSERT INTO shifts (facility_id, role_needed, shift_date, start_time, end_time, pay_etb, description, status)
SELECT fp.id, 'Lab Technician', CURRENT_DATE + 1, '08:00', '16:00', 900,
  'Lab tech needed for morning shift. Must be proficient in routine blood tests, urinalysis, and sample processing.'
FROM facility_profiles fp JOIN users u ON fp.user_id = u.id WHERE u.email = 'mcm@tiruf.demo';

INSERT INTO shifts (facility_id, role_needed, shift_date, start_time, end_time, pay_etb, description, status)
SELECT fp.id, 'Pharmacist', CURRENT_DATE + 4, '08:00', '20:00', 1400,
  'Pharmacist needed to cover weekend shift in busy hospital pharmacy. Experience with hospital formulary essential.'
FROM facility_profiles fp JOIN users u ON fp.user_id = u.id WHERE u.email = 'landmark@tiruf.demo';

INSERT INTO shifts (facility_id, role_needed, shift_date, start_time, end_time, pay_etb, description, status)
SELECT fp.id, 'Radiographer', CURRENT_DATE + 5, '07:00', '15:00', 1100,
  'Radiographer needed for outpatient imaging department. Experience with X-ray and basic ultrasound required.'
FROM facility_profiles fp JOIN users u ON fp.user_id = u.id WHERE u.email = 'mcm@tiruf.demo';
