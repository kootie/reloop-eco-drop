# ADA Payment Integration for Eternl Wallets

## Overview

This document explains how the Reloop system now ensures that ADA tokens are automatically transferred to users' Eternl wallets when admins approve e-waste submissions.

## System Architecture

### 1. Smart Contract Integration
- **Plutus Contract**: The existing smart contract has been extended to support admin approval actions
- **Contract Actions**: Added `ApproveDrop` and `RejectDrop` actions to handle admin decisions
- **Data Validation**: Contract validates admin permissions and token amounts

### 2. Backend Payment Service
- **ADAPaymentService**: Handles all ADA token transfers to user wallets
- **Lucid Integration**: Uses Lucid library for Cardano blockchain interactions
- **Transaction Management**: Manages transaction signing, submission, and confirmation

### 3. Admin Approval Flow
- **Individual Approval**: Admins can approve/reject individual drops
- **Batch Approval**: Admins can approve multiple drops in a single operation
- **Payment Integration**: Automatic ADA transfer upon approval

## Implementation Details

### 1. Admin Individual Drop Approval

**Endpoint**: `POST /api/admin/drops/:dropId/review`

**Process**:
1. Admin submits approval with token amount and notes
2. System validates drop exists in smart contract
3. System retrieves user's Eternl wallet address
4. System sends ADA payment to user's wallet
5. System updates drop status in smart contract
6. System sends notification to user

**Example Request**:
```json
{
  "action": "approve",
  "actualTokens": 3.5,
  "notes": "Valid e-waste submission",
  "adminUsername": "admin_user"
}
```

**Example Response**:
```json
{
  "success": true,
  "dropId": "drop_123",
  "action": "approve",
  "adminUsername": "admin_user",
  "actualTokens": 3.5,
  "notes": "Valid e-waste submission",
  "payment": {
    "success": true,
    "txHash": "tx_hash_here",
    "amount": 3.5,
    "recipientAddress": "addr1q9x2m3n4..."
  },
  "contractTransaction": "contract_tx_hash_here",
  "message": "Drop approved successfully and ADA payment sent"
}
```

### 2. Admin Batch Drop Approval

**Endpoint**: `POST /api/admin/drops/batch-approve`

**Process**:
1. Admin submits batch of drop IDs with token amount
2. System validates all drops exist
3. System retrieves all user wallet addresses
4. System sends individual ADA payments to each user
5. System updates all drop statuses
6. System sends notifications to all users

**Example Request**:
```json
{
  "dropIds": ["drop_1", "drop_2", "drop_3"],
  "actualTokens": 2.0,
  "notes": "Batch approval",
  "adminUsername": "admin_user"
}
```

### 3. Frontend Integration

**Updated Components**:
- `admin-dashboard.tsx`: Updated to show payment status and transaction hashes
- `drop-submission.tsx`: Updated to show ADA token rewards instead of RELOOP
- `auth-screen.tsx`: Updated messaging to reflect ADA rewards

**Payment Status Display**:
- Shows transaction hash when payment is completed
- Displays payment amount in ADA
- Indicates payment status (pending/completed/failed)

## Technical Implementation

### 1. ADA Payment Service

**Key Methods**:
- `sendADA()`: Send ADA to single recipient
- `sendBatchADA()`: Send ADA to multiple recipients
- `sendIndividualReward()`: Send reward for specific drop
- `processApprovedDrops()`: Process multiple approved drops

**Error Handling**:
- Validates recipient addresses
- Checks backend wallet balance
- Handles transaction failures
- Provides detailed error messages

### 2. Smart Contract Actions

**ApproveDrop Action**:
```aiken
ApproveDrop {
  drop_id: Bytes,
  admin_username: Bytes,
  actual_tokens: Integer,
  notes: Bytes,
  timestamp: Integer
}
```

**RejectDrop Action**:
```aiken
RejectDrop {
  drop_id: Bytes,
  admin_username: Bytes,
  actual_tokens: Integer,
  notes: Bytes,
  timestamp: Integer
}
```

### 3. Database Integration

**Updated Tables**:
- `drops`: Added payment status and transaction hash fields
- `payment_batches`: Tracks batch payment operations
- `notifications`: Sends payment confirmations to users

**Payment Status Fields**:
- `payment_status`: 'pending' | 'completed' | 'failed'
- `payment_tx_hash`: Transaction hash from Cardano blockchain
- `paid_at`: Timestamp when payment was completed

## Security Considerations

### 1. Admin Authentication
- JWT token validation for admin actions
- Admin role verification
- Session management

### 2. Payment Security
- Backend wallet seed phrase protection
- Transaction signing with proper keys
- Address validation before payments

### 3. Smart Contract Security
- Admin permission validation
- Token amount validation
- Timestamp validation to prevent replay attacks

## Environment Configuration

### Required Environment Variables:
```bash
# Cardano Blockchain
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
BACKEND_WALLET_SEED=your_backend_wallet_seed_phrase

# Smart Contract
RELOOP_CONTRACT_ADDRESS=your_contract_address
RELOOP_CONTRACT_SCRIPT=your_contract_script

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

## Testing

### 1. Testnet Testing
- Use Cardano testnet for development
- Test with small ADA amounts
- Verify transaction confirmations

### 2. Payment Testing
- Test individual payments
- Test batch payments
- Test error scenarios (insufficient balance, invalid addresses)

### 3. Integration Testing
- Test admin approval flow
- Test user notification system
- Test database updates

## Monitoring and Logging

### 1. Payment Monitoring
- Track successful payments
- Monitor failed transactions
- Log payment amounts and recipients

### 2. Error Logging
- Log payment failures with details
- Track admin approval actions
- Monitor smart contract interactions

### 3. Performance Monitoring
- Track payment processing times
- Monitor blockchain transaction fees
- Monitor backend wallet balance

## User Experience

### 1. Admin Interface
- Clear approval/rejection buttons
- Token amount input fields
- Payment status indicators
- Transaction hash display

### 2. User Notifications
- Immediate payment confirmation
- Transaction hash in notifications
- Payment amount display
- Wallet balance updates

### 3. Error Handling
- Clear error messages for failed payments
- Retry mechanisms for failed transactions
- Support contact information

## Future Enhancements

### 1. Payment Optimization
- Batch multiple payments in single transaction
- Optimize transaction fees
- Implement payment scheduling

### 2. Advanced Features
- Payment history tracking
- Automated payment retries
- Payment analytics dashboard

### 3. Integration Improvements
- Real-time payment status updates
- Webhook notifications for payments
- Enhanced error recovery mechanisms

## Conclusion

The ADA payment integration ensures that users receive their rewards directly in their Eternl wallets when admins approve e-waste submissions. The system provides:

- **Automatic Payments**: No manual intervention required
- **Secure Transactions**: Proper blockchain security measures
- **User Transparency**: Clear payment confirmations and transaction hashes
- **Admin Control**: Flexible approval and payment management
- **Error Handling**: Robust error handling and recovery mechanisms

This implementation maintains the existing system architecture while adding seamless ADA payment functionality for a complete e-waste recycling reward system.
