-- =============================================================================
-- RELOOP LIVE - Supabase Database Schema
-- E-Waste Recycling Platform with ADA Rewards
-- =============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE - Store registered users with wallet information
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cardano_address VARCHAR(128),
    wallet_type VARCHAR(50) DEFAULT 'eternl' CHECK (wallet_type IN ('eternl', 'nami', 'typhon', 'flint', 'native')),
    network VARCHAR(20) DEFAULT 'testnet' CHECK (network IN ('testnet', 'mainnet')),
    
    -- Profile information
    full_name VARCHAR(255),
    phone VARCHAR(20),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    
    -- Wallet statistics
    current_balance_ada DECIMAL(20, 6) DEFAULT 0.00,
    total_earned_ada DECIMAL(20, 6) DEFAULT 0.00,
    pending_rewards_ada DECIMAL(20, 6) DEFAULT 0.00,
    
    -- Activity tracking
    total_drops INTEGER DEFAULT 0,
    successful_drops INTEGER DEFAULT 0,
    rejected_drops INTEGER DEFAULT 0,
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_level INTEGER DEFAULT 1 CHECK (verification_level BETWEEN 1 AND 5),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================================================
-- DEVICE_TYPES TABLE - Define e-waste device categories and rewards
-- =============================================================================
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Risk and reward information
    risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5),
    reward_ada DECIMAL(10, 6) NOT NULL,
    reward_lovelace BIGINT NOT NULL, -- Calculated as reward_ada * 1,000,000
    
    -- Device specifications
    typical_weight_kg DECIMAL(8, 3),
    contains_batteries BOOLEAN DEFAULT false,
    contains_hazardous_materials BOOLEAN DEFAULT false,
    recyclable_materials TEXT[], -- Array of materials like ['copper', 'aluminum', 'plastic']
    
    -- Processing information
    special_handling_required BOOLEAN DEFAULT false,
    processing_cost_estimate DECIMAL(10, 2),
    environmental_impact_score INTEGER CHECK (environmental_impact_score BETWEEN 1 AND 10),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_seasonal BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- BINS TABLE - Store e-waste collection bin information
-- =============================================================================
CREATE TABLE bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_id VARCHAR(100) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    
    -- Location information
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    location_name VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- Bin specifications
    bin_type VARCHAR(50) DEFAULT 'standard' CHECK (bin_type IN ('standard', 'hazardous', 'large_electronics', 'batteries')),
    capacity_kg INTEGER DEFAULT 100,
    current_weight_kg INTEGER DEFAULT 0,
    fill_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Status and management
    is_active BOOLEAN DEFAULT true,
    is_operational BOOLEAN DEFAULT true,
    needs_maintenance BOOLEAN DEFAULT false,
    last_emptied TIMESTAMP,
    
    -- Contact and admin info
    responsible_admin_id UUID REFERENCES users(id),
    contact_phone VARCHAR(20),
    installation_date DATE,
    
    -- Statistics
    total_drops INTEGER DEFAULT 0,
    total_weight_collected_kg DECIMAL(10, 2) DEFAULT 0.00,
    total_rewards_distributed_ada DECIMAL(20, 6) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT bins_coordinates_check CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    ),
    CONSTRAINT bins_capacity_check CHECK (capacity_kg > 0),
    CONSTRAINT bins_weight_check CHECK (current_weight_kg >= 0 AND current_weight_kg <= capacity_kg)
);

-- =============================================================================
-- DROPS TABLE - Store e-waste drop submissions and approvals
-- =============================================================================
CREATE TABLE drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drop_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- User and bin information
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bin_id UUID NOT NULL REFERENCES bins(id),
    device_type_id UUID NOT NULL REFERENCES device_types(id),
    
    -- Location verification
    user_latitude DECIMAL(10, 8) NOT NULL,
    user_longitude DECIMAL(11, 8) NOT NULL,
    bin_latitude DECIMAL(10, 8) NOT NULL,
    bin_longitude DECIMAL(11, 8) NOT NULL,
    distance_to_bin_meters DECIMAL(8, 2),
    
    -- Drop details
    estimated_weight_kg DECIMAL(8, 3),
    actual_weight_kg DECIMAL(8, 3),
    quantity INTEGER DEFAULT 1,
    device_condition VARCHAR(50) CHECK (device_condition IN ('working', 'damaged', 'broken', 'parts_only')),
    
    -- Photo and verification
    photo_url TEXT,
    photo_hash VARCHAR(128),
    photo_verified BOOLEAN DEFAULT false,
    
    -- Reward calculation
    estimated_reward_ada DECIMAL(10, 6),
    actual_reward_ada DECIMAL(10, 6),
    reward_lovelace BIGINT,
    reward_multiplier DECIMAL(3, 2) DEFAULT 1.00, -- For bonus/penalty adjustments
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'paid')),
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Admin review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Payment tracking
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
    payment_tx_hash VARCHAR(128),
    payment_amount_ada DECIMAL(10, 6),
    paid_at TIMESTAMP,
    
    -- Smart contract integration
    contract_submitted BOOLEAN DEFAULT false,
    contract_tx_hash VARCHAR(128),
    batch_id VARCHAR(100),
    
    -- Quality scores (for ML/AI future features)
    photo_quality_score DECIMAL(3, 2),
    location_accuracy_score DECIMAL(3, 2),
    user_reputation_score DECIMAL(3, 2),
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT drops_coordinates_check CHECK (
        user_latitude BETWEEN -90 AND 90 AND 
        user_longitude BETWEEN -180 AND 180 AND
        bin_latitude BETWEEN -90 AND 90 AND 
        bin_longitude BETWEEN -180 AND 180
    ),
    CONSTRAINT drops_weight_check CHECK (estimated_weight_kg > 0 AND actual_weight_kg >= 0),
    CONSTRAINT drops_quantity_check CHECK (quantity > 0),
    CONSTRAINT drops_reward_check CHECK (estimated_reward_ada >= 0 AND actual_reward_ada >= 0)
);

-- =============================================================================
-- PAYMENT_BATCHES TABLE - Group payments for efficient blockchain transactions
-- =============================================================================
CREATE TABLE payment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Batch information
    total_drops INTEGER NOT NULL,
    total_users INTEGER NOT NULL,
    total_amount_ada DECIMAL(20, 6) NOT NULL,
    total_amount_lovelace BIGINT NOT NULL,
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_by VARCHAR(100),
    
    -- Blockchain transaction
    tx_hash VARCHAR(128),
    block_height BIGINT,
    confirmation_count INTEGER DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT batches_amounts_check CHECK (
        total_drops > 0 AND 
        total_users > 0 AND 
        total_amount_ada > 0 AND
        total_amount_lovelace > 0
    )
);

-- =============================================================================
-- Create indexes for better performance
-- =============================================================================

-- Users table indexes
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cardano_address ON users(cardano_address);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Device types indexes
CREATE INDEX idx_device_types_code ON device_types(device_code);
CREATE INDEX idx_device_types_category ON device_types(category);
CREATE INDEX idx_device_types_active ON device_types(is_active);

-- Bins table indexes
CREATE INDEX idx_bins_bin_id ON bins(bin_id);
CREATE INDEX idx_bins_qr_code ON bins(qr_code);
CREATE INDEX idx_bins_location ON bins(latitude, longitude);
CREATE INDEX idx_bins_active ON bins(is_active);
CREATE INDEX idx_bins_city ON bins(city);

-- Drops table indexes
CREATE INDEX idx_drops_drop_id ON drops(drop_id);
CREATE INDEX idx_drops_user_id ON drops(user_id);
CREATE INDEX idx_drops_bin_id ON drops(bin_id);
CREATE INDEX idx_drops_device_type ON drops(device_type_id);
CREATE INDEX idx_drops_status ON drops(status);
CREATE INDEX idx_drops_payment_status ON drops(payment_status);
CREATE INDEX idx_drops_submitted_at ON drops(submitted_at);
CREATE INDEX idx_drops_batch_id ON drops(batch_id);

-- Payment batches indexes
CREATE INDEX idx_batches_batch_id ON payment_batches(batch_id);
CREATE INDEX idx_batches_status ON payment_batches(status);
CREATE INDEX idx_batches_created_at ON payment_batches(created_at);

-- =============================================================================
-- INSERT SAMPLE DATA
-- =============================================================================

-- Insert default device types with ADA rewards
INSERT INTO device_types (device_code, device_name, category, risk_level, reward_ada, reward_lovelace, typical_weight_kg, contains_batteries, contains_hazardous_materials, recyclable_materials) VALUES

-- Cables & Chargers (1 ADA)
('usb_cable', 'USB Cable', 'Cables & Chargers', 1, 1.000000, 1000000, 0.2, false, false, ARRAY['copper', 'plastic']),
('phone_charger', 'Phone Charger', 'Cables & Chargers', 1, 1.000000, 1000000, 0.3, false, false, ARRAY['copper', 'plastic', 'aluminum']),
('laptop_charger', 'Laptop Charger', 'Cables & Chargers', 1, 1.000000, 1000000, 0.8, false, false, ARRAY['copper', 'plastic', 'aluminum']),
('hdmi_cable', 'HDMI Cable', 'Cables & Chargers', 1, 1.000000, 1000000, 0.3, false, false, ARRAY['copper', 'plastic']),
('audio_cable', 'Audio Cable', 'Cables & Chargers', 1, 1.000000, 1000000, 0.1, false, false, ARRAY['copper', 'plastic']),

-- Small Electronics (1.5 ADA)
('headphones', 'Headphones', 'Small Electronics', 2, 1.500000, 1500000, 0.4, false, false, ARRAY['plastic', 'copper', 'aluminum']),
('earbuds', 'Earbuds', 'Small Electronics', 2, 1.500000, 1500000, 0.1, true, false, ARRAY['plastic', 'copper', 'lithium']),
('bluetooth_speaker', 'Bluetooth Speaker', 'Small Electronics', 2, 1.500000, 1500000, 0.6, true, false, ARRAY['plastic', 'copper', 'lithium']),
('computer_mouse', 'Computer Mouse', 'Small Electronics', 2, 1.500000, 1500000, 0.2, false, false, ARRAY['plastic', 'copper']),
('keyboard', 'Keyboard', 'Small Electronics', 2, 1.500000, 1500000, 1.2, false, false, ARRAY['plastic', 'copper', 'aluminum']),
('remote_control', 'Remote Control', 'Small Electronics', 2, 1.500000, 1500000, 0.3, true, false, ARRAY['plastic', 'copper']),

-- Medium Electronics (3 ADA)
('smartphone', 'Smartphone', 'Medium Electronics', 3, 3.000000, 3000000, 0.2, true, true, ARRAY['aluminum', 'copper', 'lithium', 'rare_earth']),
('basic_phone', 'Basic Phone', 'Medium Electronics', 3, 3.000000, 3000000, 0.15, true, false, ARRAY['plastic', 'copper', 'lithium']),
('smartwatch', 'Smartwatch', 'Medium Electronics', 3, 3.000000, 3000000, 0.1, true, true, ARRAY['aluminum', 'copper', 'lithium', 'rare_earth']),
('fitness_tracker', 'Fitness Tracker', 'Medium Electronics', 3, 3.000000, 3000000, 0.08, true, false, ARRAY['plastic', 'copper', 'lithium']),
('gaming_controller', 'Gaming Controller', 'Medium Electronics', 3, 3.000000, 3000000, 0.5, true, false, ARRAY['plastic', 'copper', 'lithium']),

-- Large Electronics (5 ADA)
('tablet', 'Tablet', 'Large Electronics', 4, 5.000000, 5000000, 0.7, true, true, ARRAY['aluminum', 'copper', 'lithium', 'rare_earth', 'glass']),
('laptop', 'Laptop', 'Large Electronics', 4, 5.000000, 5000000, 2.5, true, true, ARRAY['aluminum', 'copper', 'lithium', 'rare_earth', 'plastic']),
('desktop_computer', 'Desktop Computer', 'Large Electronics', 4, 5.000000, 5000000, 8.0, false, true, ARRAY['aluminum', 'copper', 'steel', 'rare_earth', 'plastic']),
('monitor', 'Monitor', 'Large Electronics', 4, 5.000000, 5000000, 5.0, false, true, ARRAY['plastic', 'copper', 'aluminum', 'glass', 'rare_earth']),
('printer', 'Printer', 'Large Electronics', 4, 5.000000, 5000000, 6.0, false, true, ARRAY['plastic', 'copper', 'aluminum', 'ink_cartridges']),

-- Batteries & Hazardous (7 ADA)
('phone_battery', 'Phone Battery', 'Batteries & Hazardous', 5, 7.000000, 7000000, 0.05, true, true, ARRAY['lithium', 'cobalt', 'nickel']),
('laptop_battery', 'Laptop Battery', 'Batteries & Hazardous', 5, 7.000000, 7000000, 0.3, true, true, ARRAY['lithium', 'cobalt', 'nickel']),
('power_bank', 'Power Bank', 'Batteries & Hazardous', 5, 7.000000, 7000000, 0.4, true, true, ARRAY['lithium', 'plastic', 'copper']),
('car_battery', 'Car Battery', 'Batteries & Hazardous', 5, 7.000000, 7000000, 15.0, true, true, ARRAY['lead', 'acid', 'plastic']);

-- Insert sample bins (Zugdidi, Georgia locations)
INSERT INTO bins (bin_id, qr_code, latitude, longitude, address, location_name, city, country) VALUES
('BIN001', 'QR_BIN_001', 42.2623, 41.6941, 'Rustaveli Street 1', 'City Center Bin', 'Zugdidi', 'Georgia'),
('BIN002', 'QR_BIN_002', 42.2651, 41.6987, 'Agmashenebeli Avenue 15', 'Trade Center Mall', 'Zugdidi', 'Georgia'),
('BIN003', 'QR_BIN_003', 42.2590, 41.6920, 'University Campus', 'University Electronics Bin', 'Zugdidi', 'Georgia');

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Reloop Live database schema created successfully!';
    RAISE NOTICE '✅ Tables: users, device_types, bins, drops, payment_batches';
    RAISE NOTICE '✅ Sample data: % device types, % bins', 
        (SELECT COUNT(*) FROM device_types),
        (SELECT COUNT(*) FROM bins);
    RAISE NOTICE '🚀 Ready for your Reloop Live application!';
END $$;
