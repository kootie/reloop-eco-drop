# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment (Complete these first!)

### 1. Environment Setup
- [ ] Supabase project created and configured
- [ ] Cardano wallet credentials obtained
- [ ] Blockfrost API keys ready
- [ ] Treasury smart contract address available

### 2. Database Migration
- [ ] Run `supabase-treasury-schema.sql` in Supabase
- [ ] Verify tables: `admin_wallets`, `treasury_transactions`, `treasury_balances`
- [ ] Set up Row Level Security (RLS) policies

### 3. Code Preparation
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub repository
- [ ] No TypeScript compilation errors
- [ ] All dependencies in `package.json`

## 🚀 Deployment Steps

### 1. Vercel Setup
- [ ] Sign up/login to [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`

### 2. Project Import
- [ ] Go to Vercel Dashboard
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Set project name: `reloop-live`

### 3. Environment Variables
Add these in Vercel dashboard:

#### Required Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CARDANO_NETWORK=mainnet
BACKEND_WALLET_SEED=your_wallet_seed_phrase
BLOCKFROST_PROJECT_ID=your_blockfrost_id
TREASURY_ADDRESS=your_treasury_contract_address
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### Optional Variables
```bash
NEXT_PUBLIC_APP_NAME=Reloop Live
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENVIRONMENT=production
```

### 4. Deploy
- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Note your deployment URL

## 🔍 Post-Deployment Verification

### 1. Basic Functionality
- [ ] App loads without errors
- [ ] Navigation works correctly
- [ ] Admin dashboard accessible
- [ ] Treasury management tab visible

### 2. API Testing
- [ ] Treasury status endpoint: `/api/admin/treasury/status`
- [ ] Admin verification: `/api/admin/treasury/verify-admin`
- [ ] Treasury funding: `/api/admin/treasury/fund`

### 3. Database Connection
- [ ] Supabase connection successful
- [ ] Treasury tables accessible
- [ ] Admin wallet authorization working

## 🚨 Quick Commands

### Deploy Commands
```bash
# Quick deploy (preview)
npm run deploy

# Production deploy
npm run deploy:prod

# Using deployment script
npm run deploy:script

# Manual deploy
vercel
vercel --prod
```

### Verification Commands
```bash
# Check deployment status
vercel ls

# View logs
vercel logs your-project-name

# Open project
vercel open
```

## 🔧 Troubleshooting

### Common Issues
1. **Build Failures**: Check Vercel build logs
2. **Environment Variables**: Verify all required vars are set
3. **Database Connection**: Check Supabase credentials
4. **API Timeouts**: Verify function timeout settings

### Quick Fixes
```bash
# Redeploy with debug
vercel --debug

# Force rebuild
vercel --force

# Check local build
npm run build
```

## 📱 Mobile Testing
- [ ] Test on mobile devices
- [ ] Verify responsive design
- [ ] Check wallet connection on mobile
- [ ] Test admin dashboard on mobile

## 🔐 Security Check
- [ ] Admin routes protected
- [ ] Treasury operations secured
- [ ] CORS headers configured
- [ ] Environment variables not exposed

## 📊 Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API performance
- [ ] Set up alerts for failures

---

## 🎯 Success Criteria
- [ ] App deployed and accessible
- [ ] All functionality working
- [ ] Treasury management operational
- [ ] Admin dashboard functional
- [ ] Database connected and working
- [ ] No critical errors in logs

**Status**: Ready for Deployment 🚀  
**Last Updated**: December 2024
