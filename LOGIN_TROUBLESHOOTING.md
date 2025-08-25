# 🔐 Login Troubleshooting Guide for Vercel Deployment

## 🚨 Issue: Login Works Locally But Not on Vercel

### **Root Causes & Solutions**

## 1. 🔑 JWT_SECRET Environment Variable Issue

**Problem**: The code expects `JWT_SECRET` but Vercel might have `NEXTAUTH_SECRET` or no JWT secret at all.

**Solution**: 
- ✅ **FIXED**: Updated all authentication routes to use both `JWT_SECRET` and `NEXTAUTH_SECRET` as fallback
- Set `JWT_SECRET` in your Vercel environment variables

**Steps**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `JWT_SECRET=your-super-secure-random-string-here`
3. Generate a secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 2. 🌐 CORS Configuration Issues

**Problem**: Authentication requests might be blocked by CORS policies.

**Solution**: 
- ✅ **FIXED**: Updated `vercel.json` with proper CORS headers
- Added `Access-Control-Allow-Credentials: true`
- Added `X-Requested-With` to allowed headers

## 3. 🔧 Environment Variables Checklist

**Required Variables for Login to Work**:

```bash
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Authentication
JWT_SECRET=your_jwt_secret_key_here
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional but recommended
NEXT_PUBLIC_APP_NAME=Reloop Live
NEXT_PUBLIC_APP_ENVIRONMENT=production
```

## 4. 🗄️ Database Connection Issues

**Check Supabase Connection**:

1. **Verify Supabase URL and Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the correct URL and anon key
   - Ensure they match your Vercel environment variables

2. **Check Database Tables**:
   - Verify `users` table exists in Supabase
   - Check if RLS (Row Level Security) policies allow authentication

3. **Test Database Connection**:
   ```bash
   # Test locally first
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## 5. 🔍 Debugging Steps

### Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `/api/auth/login` function
3. Check for errors in the logs

### Step 2: Test API Endpoints

```bash
# Test login endpoint
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test registration endpoint
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

### Step 3: Check Browser Console

1. Open browser developer tools
2. Go to Network tab
3. Try to login
4. Check for failed requests and error messages

### Step 4: Verify Environment Variables

```bash
# Check if environment variables are accessible
curl https://your-domain.vercel.app/api/auth/login
# Should not expose sensitive data but should not error
```

## 6. 🛠️ Quick Fixes

### Fix 1: Regenerate JWT Secret

```bash
# Generate a new secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Fix 2: Clear Browser Cache

1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Test with different browser

### Fix 3: Redeploy with Debug

```bash
# Redeploy with debug information
vercel --debug
```

## 7. 🔧 Code Changes Made

### Updated Files:

1. **`app/api/auth/login/route.ts`**:
   - Added fallback for `NEXTAUTH_SECRET`

2. **`app/api/auth/register/route.ts`**:
   - Added fallback for `NEXTAUTH_SECRET`

3. **`app/api/auth/wallet/route.ts`**:
   - Added fallback for `NEXTAUTH_SECRET`

4. **`app/api/admin/submissions/pending/route.ts`**:
   - Added fallback for `NEXTAUTH_SECRET`

5. **`app/api/admin/submissions/batch-approve/route.ts`**:
   - Added fallback for `NEXTAUTH_SECRET`

6. **`vercel.json`**:
   - Enhanced CORS configuration
   - Added credentials support

7. **`env-production-template.txt`**:
   - Added `JWT_SECRET` variable
   - Updated documentation

## 8. 🚀 Deployment Checklist

- [ ] Set `JWT_SECRET` in Vercel environment variables
- [ ] Verify Supabase URL and anon key
- [ ] Test database connection
- [ ] Redeploy application
- [ ] Test login functionality
- [ ] Check browser console for errors
- [ ] Verify CORS headers are working

## 9. 📞 Getting Help

If login still doesn't work:

1. **Check Vercel Function Logs**: Look for specific error messages
2. **Test Database Connection**: Verify Supabase is accessible
3. **Compare Local vs Production**: Check environment variable differences
4. **Browser Network Tab**: Look for failed requests and error responses

## 10. 🎯 Success Criteria

Login should work when:
- ✅ JWT_SECRET is properly set
- ✅ Supabase connection is working
- ✅ CORS headers are configured
- ✅ No JavaScript errors in browser console
- ✅ API endpoints return proper responses

---

**Status**: Fixed and Ready for Testing 🚀  
**Last Updated**: December 2024  
**Version**: 1.0.0
