-- Test data to verify admin dashboard shows real database values
-- Run this in your Supabase SQL Editor to see real numbers

-- Insert some test users
INSERT INTO users (user_id, email, password_hash, full_name, cardano_address, is_verified, total_earned_ada) VALUES
('user_001', 'john@example.com', '$2b$10$example', 'John Doe', 'addr_test123', true, 15.50),
('user_002', 'jane@example.com', '$2b$10$example', 'Jane Smith', 'addr_test456', false, 8.25),
('user_003', 'bob@example.com', '$2b$10$example', 'Bob Wilson', 'addr_test789', true, 22.75);

-- Insert some test bins
INSERT INTO bins (location_name, address, latitude, longitude, qr_code, status, capacity_kg, current_fill_kg, retailer_name) VALUES
('Downtown Mall', '123 Main St, City', 40.7128, -74.0060, 'QR001', 'active', 100.0, 25.5, 'TechMart'),
('University Campus', '456 Campus Dr, City', 40.7589, -73.9851, 'QR002', 'active', 75.0, 10.0, 'Student Store'),
('Shopping Center', '789 Plaza Ave, City', 40.7831, -73.9712, 'QR003', 'maintenance', 150.0, 120.0, 'ElectroHub');

-- Insert some test device types
INSERT INTO device_types (device_code, device_name, category, base_reward_ada) VALUES
('PHONE', 'Smartphone', 'electronics', 2.50),
('LAPTOP', 'Laptop Computer', 'electronics', 5.00),
('TABLET', 'Tablet', 'electronics', 3.00);

-- Insert some test drops
INSERT INTO drops (drop_id, user_id, bin_id, device_type_id, status, estimated_weight_kg, actual_weight_kg, estimated_reward_ada, actual_reward_ada, user_latitude, user_longitude, bin_latitude, bin_longitude, device_condition) 
SELECT 
    'drop_' || generate_random_uuid()::text,
    u.id,
    b.id,
    dt.id,
    CASE 
        WHEN random() < 0.3 THEN 'pending'
        WHEN random() < 0.8 THEN 'approved'
        ELSE 'rejected'
    END,
    (random() * 2 + 0.5)::numeric(8,3),
    (random() * 2 + 0.5)::numeric(8,3),
    (random() * 5 + 1)::numeric(10,6),
    (random() * 5 + 1)::numeric(10,6),
    40.7128 + (random() - 0.5) * 0.01,
    -74.0060 + (random() - 0.5) * 0.01,
    b.latitude,
    b.longitude,
    CASE 
        WHEN random() < 0.25 THEN 'working'
        WHEN random() < 0.5 THEN 'damaged'
        WHEN random() < 0.75 THEN 'broken'
        ELSE 'parts_only'
    END
FROM 
    users u
    CROSS JOIN bins b
    CROSS JOIN device_types dt
LIMIT 12;

-- Add some recent drops (created in the last 7 days)
UPDATE drops SET created_at = NOW() - (random() * interval '7 days') WHERE drop_id LIKE 'drop_%';
