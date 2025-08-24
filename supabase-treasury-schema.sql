-- =============================================================================
-- RELOOP LIVE - Treasury Management Database Schema Updates
-- E-Waste Platform with Smart Contract Treasury Integration
-- =============================================================================

-- =============================================================================
-- ADMIN_WALLETS TABLE - Store authorized admin wallet addresses
-- =============================================================================
CREATE TABLE admin_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(128) NOT NULL,
    wallet_type VARCHAR(50) DEFAULT 'eternl' CHECK (wallet_type IN ('eternl', 'nami', 'lace', 'native')),
    network VARCHAR(20) DEFAULT 'testnet' CHECK (network IN ('testnet', 'mainnet')),
    
    -- Authorization status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP,
    
    -- Usage tracking
    total_funded_ada DECIMAL(20, 6) DEFAULT 0.00,
    last_funding_date TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(admin_id, wallet_address)
);

-- =============================================================================
-- TREASURY_TRANSACTIONS TABLE - Track all treasury funding and payouts
-- =============================================================================
CREATE TABLE treasury_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Transaction details
    type VARCHAR(50) NOT NULL CHECK (type IN ('funding', 'payout', 'refund', 'fee')),
    amount_ada DECIMAL(20, 6) NOT NULL,
    amount_lovelace BIGINT NOT NULL, -- Calculated as amount_ada * 1,000,000
    
    -- Funding transactions
    admin_wallet_address VARCHAR(128),
    admin_id UUID REFERENCES users(id),
    
    -- Payout transactions
    recipient_address VARCHAR(128),
    user_id UUID REFERENCES users(id),
    drop_id UUID REFERENCES drops(id),
    
    -- Blockchain information
    tx_hash VARCHAR(128),
    block_height BIGINT,
    confirmation_count INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB, -- Store additional transaction details
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT treasury_transactions_type_check CHECK (
        (type = 'funding' AND admin_wallet_address IS NOT NULL AND admin_id IS NOT NULL) OR
        (type = 'payout' AND recipient_address IS NOT NULL AND user_id IS NOT NULL AND drop_id IS NOT NULL) OR
        (type IN ('refund', 'fee'))
    )
);

-- =============================================================================
-- TREASURY_BALANCES TABLE - Track treasury balance over time
-- =============================================================================
CREATE TABLE treasury_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Balance snapshot
    balance_ada DECIMAL(20, 6) NOT NULL,
    balance_lovelace BIGINT NOT NULL,
    
    -- Transaction counts
    total_funding_transactions INTEGER DEFAULT 0,
    total_payout_transactions INTEGER DEFAULT 0,
    
    -- Amount totals
    total_funded_ada DECIMAL(20, 6) DEFAULT 0.00,
    total_paid_out_ada DECIMAL(20, 6) DEFAULT 0.00,
    
    -- Pending amounts
    pending_payouts_ada DECIMAL(20, 6) DEFAULT 0.00,
    
    -- Timestamp
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Create indexes for better performance
-- =============================================================================

-- Admin wallets indexes
CREATE INDEX idx_admin_wallets_admin_id ON admin_wallets(admin_id);
CREATE INDEX idx_admin_wallets_wallet_address ON admin_wallets(wallet_address);
CREATE INDEX idx_admin_wallets_active ON admin_wallets(is_active);

-- Treasury transactions indexes
CREATE INDEX idx_treasury_transactions_transaction_id ON treasury_transactions(transaction_id);
CREATE INDEX idx_treasury_transactions_type ON treasury_transactions(type);
CREATE INDEX idx_treasury_transactions_status ON treasury_transactions(status);
CREATE INDEX idx_treasury_transactions_tx_hash ON treasury_transactions(tx_hash);
CREATE INDEX idx_treasury_transactions_created_at ON treasury_transactions(created_at);
CREATE INDEX idx_treasury_transactions_admin_id ON treasury_transactions(admin_id);
CREATE INDEX idx_treasury_transactions_user_id ON treasury_transactions(user_id);
CREATE INDEX idx_treasury_transactions_drop_id ON treasury_transactions(drop_id);

-- Treasury balances indexes
CREATE INDEX idx_treasury_balances_recorded_at ON treasury_balances(recorded_at);

-- =============================================================================
-- Insert sample admin wallet (for testing)
-- =============================================================================
-- Note: Replace with actual admin user ID and wallet address
-- INSERT INTO admin_wallets (admin_id, wallet_address, wallet_type, network, is_active, is_verified) 
-- VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual admin user ID
--     'addr_test1...', -- Replace with actual admin wallet address
--     'eternl',
--     'testnet',
--     true,
--     true
-- );

-- =============================================================================
-- Insert initial treasury balance record
-- =============================================================================
INSERT INTO treasury_balances (
    balance_ada,
    balance_lovelace,
    total_funding_transactions,
    total_payout_transactions,
    total_funded_ada,
    total_paid_out_ada,
    pending_payouts_ada
) VALUES (
    0.00,
    0,
    0,
    0,
    0.00,
    0.00,
    0.00
);

-- =============================================================================
-- Create function to update treasury balance
-- =============================================================================
CREATE OR REPLACE FUNCTION update_treasury_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert new balance record
    INSERT INTO treasury_balances (
        balance_ada,
        balance_lovelace,
        total_funding_transactions,
        total_payout_transactions,
        total_funded_ada,
        total_paid_out_ada,
        pending_payouts_ada
    )
    SELECT 
        COALESCE(
            (SELECT SUM(amount_ada) FROM treasury_transactions WHERE type = 'funding' AND status = 'completed') -
            (SELECT COALESCE(SUM(amount_ada), 0) FROM treasury_transactions WHERE type = 'payout' AND status = 'completed'),
            0
        ) as balance_ada,
        COALESCE(
            (SELECT SUM(amount_lovelace) FROM treasury_transactions WHERE type = 'funding' AND status = 'completed') -
            (SELECT COALESCE(SUM(amount_lovelace), 0) FROM treasury_transactions WHERE type = 'payout' AND status = 'completed'),
            0
        ) as balance_lovelace,
        (SELECT COUNT(*) FROM treasury_transactions WHERE type = 'funding' AND status = 'completed') as total_funding_transactions,
        (SELECT COUNT(*) FROM treasury_transactions WHERE type = 'payout' AND status = 'completed') as total_payout_transactions,
        (SELECT COALESCE(SUM(amount_ada), 0) FROM treasury_transactions WHERE type = 'funding' AND status = 'completed') as total_funded_ada,
        (SELECT COALESCE(SUM(amount_ada), 0) FROM treasury_transactions WHERE type = 'payout' AND status = 'completed') as total_paid_out_ada,
        (SELECT COALESCE(SUM(actual_tokens), 0) FROM drops WHERE status = 'approved' AND payment_status = 'pending') as pending_payouts_ada;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Create trigger to automatically update treasury balance
-- =============================================================================
CREATE TRIGGER trigger_update_treasury_balance
    AFTER INSERT OR UPDATE OR DELETE ON treasury_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_treasury_balance();

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Treasury management database schema created successfully!';
    RAISE NOTICE '✅ Tables: admin_wallets, treasury_transactions, treasury_balances';
    RAISE NOTICE '✅ Triggers: Automatic treasury balance updates';
    RAISE NOTICE '✅ Indexes: Performance optimization for treasury operations';
    RAISE NOTICE '🚀 Ready for treasury smart contract integration!';
END $$;
