-- =====================================
-- 🌱 SEED DATA FOR DIGITAL DEMOCRACY
-- =====================================

-- ===============================
-- 👤 USERS
-- ===============================
INSERT INTO users (name, email, password, role)
VALUES
('Admin Officer', 'admin@demo.com', '123456', 'admin'),
('Field Manager', 'manager@demo.com', '123456', 'manager')
ON CONFLICT (email) DO NOTHING;


-- ===============================
-- 🏙️ CONSTITUENCIES
-- ===============================
INSERT INTO constituencies (name, city, state, total_voters)
VALUES
('Faridabad Central', 'Faridabad', 'Haryana', 142300),
('NIT Constituency', 'Faridabad', 'Haryana', 98700),
('Ballabhgarh', 'Faridabad', 'Haryana', 87400),
('Tigaon', 'Faridabad', 'Haryana', 76200)
ON CONFLICT DO NOTHING;


-- ===============================
-- 👷 FIELD WORKERS
-- ===============================
INSERT INTO field_workers (name, phone, area, constituency_id, status)
VALUES
('Rajesh Kumar', '9876543210', 'Sector 14-20', 1, 'active'),
('Priya Sharma', '9876543211', 'NIT Area', 2, 'active'),
('Amit Singh', '9876543212', 'Ballabhgarh Main', 3, 'active'),
('Sunita Devi', '9876543213', 'Old Faridabad', 1, 'active'),
('Vikram Yadav', '9876543214', 'Tigaon Road', 4, 'active')
ON CONFLICT DO NOTHING;


-- ===============================
-- 📝 FEEDBACK
-- ===============================
INSERT INTO feedback 
(description, category, location, sentiment, topic, status, priority, created_at)
VALUES

('Road full of potholes causing accidents', 'Roads', 'Sector 16', 'negative', 'infrastructure', 'open', 'high', NOW() - INTERVAL '2 days'),

('Water supply irregular for 10 days', 'Water Supply', 'NIT Colony', 'negative', 'utilities', 'in-progress', 'critical', NOW() - INTERVAL '5 days'),

('New park is well maintained', 'Public Transport', 'Sector 21', 'positive', 'amenities', 'resolved', 'low', NOW() - INTERVAL '10 days'),

('Street lights broken for months', 'Electricity', 'NH-48', 'negative', 'utilities', 'open', 'high', NOW() - INTERVAL '1 day'),

('School has no toilets for girls', 'Education', 'Tigaon', 'negative', 'education', 'escalated', 'critical', NOW() - INTERVAL '7 days'),

('Healthcare center is excellent', 'Healthcare', 'Sector 12', 'positive', 'healthcare', 'resolved', 'low', NOW() - INTERVAL '15 days'),

('Garbage not collected for 2 weeks', 'Sanitation', 'Sector 9', 'negative', 'sanitation', 'open', 'high', NOW() - INTERVAL '3 days'),

('Bus cancelled without notice', 'Public Transport', 'Crown Chowk', 'negative', 'transport', 'in-progress', 'medium', NOW() - INTERVAL '4 days'),

('Drain overflowing into homes', 'Sanitation', 'Old Faridabad', 'negative', 'sanitation', 'escalated', 'critical', NOW() - INTERVAL '6 days'),

('Electricity cuts 10 hours daily', 'Electricity', 'Sector 31', 'negative', 'utilities', 'open', 'high', NOW() - INTERVAL '2 days'),

('New pipeline improved water pressure', 'Water Supply', 'Sector 7', 'positive', 'utilities', 'resolved', 'low', NOW() - INTERVAL '20 days'),

('Police helpline always busy', 'Security', 'NIT Area', 'negative', 'security', 'open', 'medium', NOW() - INTERVAL '1 day'),

('Road repaired near station', 'Roads', 'Railway Road', 'positive', 'infrastructure', 'resolved', 'low', NOW() - INTERVAL '12 days'),

('No ambulance at health center', 'Healthcare', 'Ballabhgarh', 'negative', 'healthcare', 'open', 'critical', NOW() - INTERVAL '3 days'),

('Trees planted but not maintained', 'Environment', 'Sector 23', 'negative', 'environment', 'open', 'low', NOW() - INTERVAL '8 days')

ON CONFLICT DO NOTHING;


-- ===============================
-- 📢 ANNOUNCEMENTS
-- ===============================
INSERT INTO announcements (title, content, constituency_id, created_by, created_at)
VALUES

('Water Supply Change',
'Water timing changed due to maintenance',
1, 1, NOW() - INTERVAL '1 day'),

('Road Repair Notice',
'Road work starting next week',
NULL, 1, NOW() - INTERVAL '3 days'),

('Free Health Camp',
'Health camp on July 20',
2, 1, NOW() - INTERVAL '5 days'),

('Ration Card Update',
'Update before deadline',
NULL, 1, NOW() - INTERVAL '7 days')

ON CONFLICT DO NOTHING;


-- =====================================
-- ✅ SEED COMPLETE
-- =====================================