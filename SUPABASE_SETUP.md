# 🚀 Supabase Setup for Reloop Live

Simple 5-minute setup to get your database running on Supabase!

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new organization (free)

## Step 2: Create New Project

1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `reloop-live`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup

## Step 3: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**
   - **Project API Key** (anon/public)

## Step 4: Create Environment File

Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# JWT Secret for authentication
JWT_SECRET=your_secure_jwt_secret_here

# Application Environment
NODE_ENV=development
```

To generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cardano_address VARCHAR(128),
    wallet_type VARCHAR(50) DEFAULT 'eternl',
    network VARCHAR(20) DEFAULT 'testnet',
    full_name VARCHAR(255),
    phone VARCHAR(20),
    current_balance_ada DECIMAL(20, 6) DEFAULT 0.00,
    total_earned_ada DECIMAL(20, 6) DEFAULT 0.00,
    pending_rewards_ada DECIMAL(20, 6) DEFAULT 0.00,
    total_drops INTEGER DEFAULT 0,
    successful_drops INTEGER DEFAULT 0,
    rejected_drops INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Device types table
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5),
    reward_ada DECIMAL(10, 6) NOT NULL,
    reward_lovelace BIGINT NOT NULL,
    typical_weight_kg DECIMAL(8, 3),
    contains_batteries BOOLEAN DEFAULT false,
    contains_hazardous_materials BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bins table
CREATE TABLE bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_id VARCHAR(100) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    location_name VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    bin_type VARCHAR(50) DEFAULT 'standard',
    capacity_kg INTEGER DEFAULT 100,
    current_weight_kg INTEGER DEFAULT 0,
    fill_percentage DECIMAL(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    is_operational BOOLEAN DEFAULT true,
    total_drops INTEGER DEFAULT 0,
    total_weight_collected_kg DECIMAL(10, 2) DEFAULT 0.00,
    total_rewards_distributed_ada DECIMAL(20, 6) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drops table
CREATE TABLE drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drop_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bin_id UUID NOT NULL REFERENCES bins(id),
    device_type_id UUID NOT NULL REFERENCES device_types(id),
    user_latitude DECIMAL(10, 8) NOT NULL,
    user_longitude DECIMAL(11, 8) NOT NULL,
    bin_latitude DECIMAL(10, 8) NOT NULL,
    bin_longitude DECIMAL(11, 8) NOT NULL,
    distance_to_bin_meters DECIMAL(8, 2),
    estimated_weight_kg DECIMAL(8, 3),
    actual_weight_kg DECIMAL(8, 3),
    quantity INTEGER DEFAULT 1,
    device_condition VARCHAR(50),
    photo_url TEXT,
    photo_hash VARCHAR(128),
    estimated_reward_ada DECIMAL(10, 6),
    actual_reward_ada DECIMAL(10, 6),
    reward_lovelace BIGINT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_tx_hash VARCHAR(128),
    payment_amount_ada DECIMAL(10, 6),
    paid_at TIMESTAMP,
    batch_id VARCHAR(100),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment batches table
CREATE TABLE payment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    total_drops INTEGER NOT NULL,
    total_users INTEGER NOT NULL,
    total_amount_ada DECIMAL(20, 6) NOT NULL,
    total_amount_lovelace BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    processed_by VARCHAR(100),
    tx_hash VARCHAR(128),
    processed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample device types
INSERT INTO device_types (device_code, device_name, category, risk_level, reward_ada, reward_lovelace, typical_weight_kg, contains_batteries, contains_hazardous_materials) VALUES
('smartphone', 'Smartphone', 'Medium Electronics', 3, 3.000000, 3000000, 0.2, true, true),
('laptop', 'Laptop', 'Large Electronics', 4, 5.000000, 5000000, 2.5, true, true),
('phone_charger', 'Phone Charger', 'Cables & Chargers', 1, 1.000000, 1000000, 0.3, false, false),
('headphones', 'Headphones', 'Small Electronics', 2, 1.500000, 1500000, 0.4, false, false),
('tablet', 'Tablet', 'Large Electronics', 4, 5.000000, 5000000, 0.7, true, true),
('usb_cable', 'USB Cable', 'Cables & Chargers', 1, 1.000000, 1000000, 0.2, false, false);

-- Insert sample bins
INSERT INTO bins (bin_id, qr_code, latitude, longitude, address, location_name, city, country) VALUES
('BIN001', 'QR_BIN_001', 42.2623, 41.6941, 'Rustaveli Street 1', 'City Center Bin', 'Zugdidi', 'Georgia'),
('BIN002', 'QR_BIN_002', 42.2651, 41.6987, 'Agmashenebeli Avenue 15', 'Trade Center Mall', 'Zugdidi', 'Georgia');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_drops_status ON drops(status);
CREATE INDEX idx_drops_user_id ON drops(user_id);
```

4. Click "Run" to execute the SQL
5. Verify tables were created in **Table Editor**

## Step 6: Test Your Setup

1. Start your app: `npm run dev`
2. Visit: http://localhost:3000
3. Try registering a new user
4. Check Supabase dashboard to see the new user in the `users` table

## 🎉 You're Done!

Your Reloop Live app is now running with Supabase!

### What You Have:

- ✅ User authentication with email/password
- ✅ Cardano wallet connection
- ✅ E-waste submission system
- ✅ Admin verification with batch processing
- ✅ Automatic ADA reward distribution
- ✅ All data stored in Supabase cloud database

### Next Steps:

1. **Deploy to Vercel**: Your app will work perfectly on Vercel with Supabase
2. **Add more device types**: Use the Supabase dashboard to add more e-waste categories
3. **Customize rewards**: Adjust ADA rewards for different device types
4. **Add real payment integration**: Replace mock payments with actual Cardano transactions

## 🔧 Environment Variables Summary

Make sure your `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-generated-secret
NODE_ENV=development
```

## 🆘 Troubleshooting

**Can't connect to Supabase?**

- Check your URL and API key are correct
- Make sure environment variables are set
- Restart your development server

**SQL errors?**

- Make sure you're running the SQL in the correct order
- Check the Supabase logs for specific error messages

**App won't start?**

- Run `npm install` to ensure all dependencies are installed
- Check your `.env.local` file exists and has the right variables

Perfect! Your Reloop Live platform is now powered by Supabase and ready for production deployment! 🚀
