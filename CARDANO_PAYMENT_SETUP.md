# Cardano Payment Setup Guide

## 🎯 **Quick Setup for Real ADA Payments**

### **Step 1: Get Blockfrost Project ID**

1. **Sign up at [blockfrost.io](https://blockfrost.io)**
2. **Create a new project:**
   - Click "Create Project"
   - Select **"Preprod"** (Cardano testnet)
   - Name: "Reloop Testnet"
   - Copy your Project ID (e.g., `preprod1234567890abcdef`)

### **Step 2: Create Backend Wallet**

#### **Option A: Eternl Wallet (Recommended)**
1. Install [Eternl Wallet](https://eternl.io/) browser extension
2. Create new wallet
3. Switch to **Testnet**: Settings → Network → Preprod
4. Export seed phrase: Settings → Security → Export Seed Phrase
5. **Save the 24 words securely!**

#### **Option B: Cardano CLI**
```bash
# Generate wallet keys
cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey

# Build address
cardano-cli address build --payment-verification-key-file payment.vkey --out-file payment.addr --testnet-magic 1

# Get seed phrase (if using mnemonic)
cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file payment.skey --out-file payment.skey.json
```

### **Step 3: Get Testnet ADA**

1. **Go to [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)**
2. **Enter your wallet address**
3. **Request 1000 ADA** (free for testing)
4. **Wait 1-2 minutes for confirmation**

### **Step 4: Set Environment Variables**

Create `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Cardano Testnet Configuration
BLOCKFROST_PROJECT_ID=preprod1234567890abcdef
BACKEND_WALLET_SEED=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24

# Application Configuration
NODE_ENV=development
```

### **Step 5: Test Real Payments**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Check console logs for:**
   ```
   ✅ ADA Payment Service initialized for Cardano testnet
   💰 Backend wallet balance: 1000 ADA
   ```

3. **Test a payment:**
   - Submit an e-waste drop
   - Approve it as admin
   - Check for real transaction hash

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **"BACKEND_WALLET_SEED not set"**
- ✅ Check `.env.local` file exists
- ✅ Verify seed phrase is 24 words
- ✅ Restart development server

#### **"BLOCKFROST_PROJECT_ID not set"**
- ✅ Get Project ID from blockfrost.io
- ✅ Use Preprod (testnet) project
- ✅ Check for typos

#### **"Insufficient balance"**
- ✅ Get testnet ADA from faucet
- ✅ Wait for transaction confirmation
- ✅ Check wallet address is correct

#### **"Invalid address format"**
- ✅ Use testnet addresses (start with `addr_test1`)
- ✅ Verify address is valid Cardano format

## 🚀 **Production Deployment**

### **For Vercel:**
1. **Add environment variables in Vercel dashboard**
2. **Deploy with:**
   ```bash
   vercel --prod
   ```

### **For Other Platforms:**
- **Railway**: Add in Railway dashboard
- **Netlify**: Add in Netlify dashboard
- **DigitalOcean**: Add in App Platform settings

## 💡 **Security Best Practices**

### **Never commit `.env.local`:**
```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
```

### **Use different wallets:**
- **Development**: Testnet wallet
- **Production**: Mainnet wallet (when ready)

### **Monitor balances:**
- Keep backend wallet funded
- Set up alerts for low balance
- Regular balance checks

## 📊 **Monitoring Real Payments**

### **Check Transaction Status:**
```javascript
// In your admin dashboard
const status = await adaPaymentService.getTransactionStatus(txHash)
console.log(`Transaction confirmed: ${status.confirmed}`)
console.log(`Confirmations: ${status.confirmations}`)
```

### **View on Cardano Explorer:**
- **Testnet**: [preprod.cardanoscan.io](https://preprod.cardanoscan.io)
- **Mainnet**: [cardanoscan.io](https://cardanoscan.io)

## 🎉 **Success Indicators**

✅ **Real Mode Active**: Console shows "Cardano testnet"  
✅ **Balance Displayed**: Shows actual ADA balance  
✅ **Real TX Hashes**: Transaction IDs start with `tx_`  
✅ **Explorer Verification**: Transactions visible on CardanoScan  

## 🔄 **Switching to Mainnet**

When ready for production:

1. **Create mainnet Blockfrost project**
2. **Create mainnet wallet**
3. **Get real ADA**
4. **Update environment variables:**
   ```env
   BLOCKFROST_PROJECT_ID=mainnet1234567890abcdef
   BACKEND_WALLET_SEED=your_mainnet_seed_phrase
   ```

---

**Need help?** Check the console logs for detailed error messages and ensure all environment variables are set correctly!
