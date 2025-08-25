# Cardano Testnet Setup Guide

## Overview

The Reloop application now uses real Cardano testnet transactions for ADA payments. This guide will help you set up the required environment variables and testnet wallet.

## Prerequisites

1. **Blockfrost Account**: Sign up at [blockfrost.io](https://blockfrost.io) to get a testnet project ID
2. **Cardano Testnet Wallet**: Create a wallet with testnet ADA for the backend

## Step 1: Get Blockfrost Testnet Project ID

1. Go to [blockfrost.io](https://blockfrost.io) and create an account
2. Create a new project for **Preprod** (Cardano testnet)
3. Copy your project ID (it will look like: `preprod1234567890abcdef`)

## Step 2: Create Backend Testnet Wallet

### Option A: Use Eternl Wallet

1. Install Eternl wallet extension
2. Create a new wallet for testnet
3. Get testnet ADA from [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
4. Export your seed phrase (24 words)

### Option B: Use Cardano CLI

```bash
# Generate a new wallet
cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey

# Generate address
cardano-cli address build --payment-verification-key-file payment.vkey --testnet-magic 1 --out-file payment.addr

# Get seed phrase (if using mnemonic wallet)
cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file payment.skey --out-file payment.mnemonic
```

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://avvirivnoktxyjvcmvnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dmlyaXZub2t0eHlqdmNtdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mjg4NjQsImV4cCI6MjA3MTIwNDg2NH0.yJRWxux3-2c5JHd-Z1gzcUQvdQR8Ji3GJTlYDfDKc54

# JWT Secret for authentication
JWT_SECRET=a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8

# Application Environment
NODE_ENV=development

# Cardano Testnet Configuration
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id_here
BACKEND_WALLET_SEED=your_24_word_seed_phrase_here
```

## Step 4: Get Testnet ADA

1. Visit [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
2. Enter your backend wallet address
3. Request testnet ADA (you can get up to 1000 ADA)

## Step 5: Test the Integration

1. Start the application: `npm run dev`
2. Submit an e-waste drop as a user
3. Approve the drop as an admin
4. Check that ADA is sent to the user's wallet on testnet

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your seed phrase** to version control
2. **Use a dedicated testnet wallet** for the backend
3. **Keep your seed phrase secure** - anyone with it can access your funds
4. **Use environment variables** for all sensitive data

## Troubleshooting

### Common Issues:

1. **"BLOCKFROST_PROJECT_ID environment variable is required"**
   - Make sure you've set the environment variable correctly
   - Check that your `.env.local` file is in the project root

2. **"BACKEND_WALLET_SEED environment variable is required"**
   - Ensure your seed phrase is correctly formatted (24 words separated by spaces)
   - Don't include quotes around the seed phrase

3. **"Insufficient balance"**
   - Get more testnet ADA from the faucet
   - Check your wallet balance using a Cardano explorer

4. **Transaction fails**
   - Ensure you have enough ADA for transaction fees
   - Check that recipient addresses are valid testnet addresses

## Testnet Resources

- **Blockfrost Testnet**: https://blockfrost.io
- **Cardano Testnet Faucet**: https://docs.cardano.org/cardano-testnet/tools/faucet/
- **Testnet Explorer**: https://preprod.cardanoscan.io/
- **Testnet Documentation**: https://docs.cardano.org/cardano-testnet/

## Production Migration

When ready for mainnet:

1. Change `BLOCKFROST_PROJECT_ID` to mainnet project
2. Update Lucid network from "Preprod" to "Mainnet"
3. Use mainnet wallet with real ADA
4. Update all addresses to mainnet format
