# 🚀 Vercel Deployment Guide for Reloop Live

## Overview

This guide will walk you through deploying your Reloop Live e-waste platform with treasury management to Vercel.

## 📋 Prerequisites

### 1. Vercel Account

- Sign up at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm i -g vercel`

### 2. GitHub Repository

- Push your code to GitHub
- Ensure all files are committed

### 3. Environment Setup

- Supabase project configured
- Cardano wallet credentials ready
- Blockfrost API keys obtained

## 🔧 Pre-Deployment Setup

### 1. Database Migration

Run the treasury schema in your Supabase project:

```sql
-- Execute the contents of supabase-treasury-schema.sql
-- This creates the necessary tables for treasury management
```

### 2. Environment Variables

Copy `env-production-template.txt` and fill in your actual values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cardano
NEXT_PUBLIC_CARDANO_NETWORK=mainnet
BACKEND_WALLET_SEED=your_wallet_seed_phrase
BLOCKFROST_PROJECT_ID=your_blockfrost_id
TREASURY_ADDRESS=your_treasury_contract_address

# App
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🚀 Deployment Steps

### Method 1: Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Project Name: `reloop-live` (or your preferred name)
   - Framework Preset: Next.js
   - Root Directory: `./` (default)

3. **Environment Variables**
   - Add all environment variables from your `.env` file
   - Ensure `NEXT_PUBLIC_` variables are set correctly

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Method 2: Vercel CLI

1. **Login to Vercel**

   ```bash
   vercel login
   ```

2. **Deploy from Project Directory**

   ```bash
   cd reloop-live
   vercel
   ```

3. **Follow Prompts**
   - Link to existing project or create new
   - Set environment variables
   - Confirm deployment

## ⚙️ Configuration Files

### vercel.json

Already configured with:

- Next.js build settings
- API function timeouts (30s)
- CORS headers for API routes
- Production environment

### next.config.ts

Ensure your Next.js config is production-ready:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["your-supabase-domain.supabase.co"],
  },
};

module.exports = nextConfig;
```

## 🔐 Environment Variables Setup

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Cardano
NEXT_PUBLIC_CARDANO_NETWORK
BACKEND_WALLET_SEED
BLOCKFROST_PROJECT_ID
TREASURY_ADDRESS

# Authentication
NEXTAUTH_SECRET
NEXTAUTH_URL
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
NEXT_PUBLIC_SENTRY_DSN

# App Info
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_VERSION
NEXT_PUBLIC_APP_ENVIRONMENT
```

## 🗄️ Database Setup

### 1. Supabase Project

- Create new project or use existing
- Run the treasury schema migration
- Set up Row Level Security (RLS) policies

### 2. RLS Policies Example

```sql
-- Admin wallets policy
CREATE POLICY "Admin wallets are viewable by admin users" ON admin_wallets
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM users WHERE role = 'admin'
));

-- Treasury transactions policy
CREATE POLICY "Treasury transactions viewable by admins" ON treasury_transactions
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM users WHERE role = 'admin'
));
```

## 🔍 Post-Deployment Verification

### 1. Health Check

- Visit your deployed URL
- Check if the app loads correctly
- Verify admin dashboard access

### 2. API Testing

Test treasury endpoints:

```bash
# Treasury status
curl https://your-domain.vercel.app/api/admin/treasury/status

# Verify admin
curl -X POST https://your-domain.vercel.app/api/admin/treasury/verify-admin \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"test","adminId":"test"}'
```

### 3. Database Connection

- Verify Supabase connection
- Check if treasury tables exist
- Test admin wallet authorization

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Check build logs in Vercel dashboard
   # Verify all dependencies are in package.json
   # Ensure TypeScript compilation passes
   ```

2. **Environment Variables**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no extra spaces or quotes

3. **Database Connection**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Test connection locally first

4. **API Timeouts**
   - Treasury operations may take time
   - Check function timeout settings in vercel.json
   - Monitor API response times

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs your-project-name

# Redeploy with debug info
vercel --debug
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

- Enable in project settings
- Monitor performance metrics
- Track API usage

### 2. Error Tracking

- Set up Sentry for error monitoring
- Monitor treasury transaction failures
- Track user authentication issues

### 3. Performance

- Monitor API response times
- Check database query performance
- Optimize image loading

## 🔄 Continuous Deployment

### 1. Automatic Deployments

- Push to main branch triggers deployment
- Preview deployments for pull requests
- Automatic rollback on failures

### 2. Environment Management

- Production: main branch
- Preview: feature branches
- Development: local environment

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] RLS policies set up
- [ ] Treasury smart contract deployed
- [ ] Admin wallets authorized
- [ ] CORS headers configured
- [ ] Error monitoring enabled
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Backup strategy in place

## 🆘 Support

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

### Getting Help

- Check Vercel deployment logs
- Review Supabase dashboard
- Check browser console for errors
- Verify environment variable configuration

---

**Deployment Status**: Ready for Production 🚀  
**Last Updated**: December 2024  
**Version**: 1.0.0
