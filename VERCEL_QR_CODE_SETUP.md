# 🔧 Vercel QR Code URL Fix

## 🚨 Issue
QR codes are showing `localhost` URLs instead of your Vercel domain.

## ✅ Solution

### Method 1: Set Environment Variable (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on "Settings" tab
   - Go to "Environment Variables"

2. **Add Environment Variable**
   - **Name**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://your-domain.vercel.app` (replace with your actual domain)
   - **Environment**: Production, Preview, Development

3. **Redeploy**
   - Go to "Deployments" tab
   - Click "Redeploy" on your latest deployment

### Method 2: Automatic Detection (Already Implemented)

The code has been updated to automatically detect the correct URL:
- Uses `VERCEL_URL` environment variable (automatically set by Vercel)
- Falls back to request headers
- Uses `localhost` only for local development

## 🔍 Verification

### Test QR Code Generation

1. **Check API Endpoint**
   ```
   https://your-domain.vercel.app/api/bins/qr/generate?qrCode=RELOOP_BIN_001_KIKALISVILI_2024
   ```

2. **Scan Generated QR Code**
   - Should open: `https://your-domain.vercel.app/qr/RELOOP_BIN_001_KIKALISVILI_2024`
   - NOT: `http://localhost:3000/qr/RELOOP_BIN_001_KIKALISVILI_2024`

### Test Admin Interface

1. **Go to Admin Panel**
   ```
   https://your-domain.vercel.app/admin
   ```

2. **Navigate to QR Codes**
   - Click "QR Codes" tab
   - Click "Open QR Code Generator"

3. **Generate QR Codes**
   - Select bins
   - Click "Generate Print Page"
   - Download and test QR codes

## 🛠️ Environment Variables Checklist

Make sure these are set in Vercel:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.vercel.app` | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ |
| `JWT_SECRET` | Your JWT secret | ✅ |

## 🔄 Redeploy Steps

1. **Update Environment Variables**
   - Add/update `NEXT_PUBLIC_BASE_URL`
   - Save changes

2. **Trigger Redeploy**
   ```bash
   # Option 1: Via Vercel Dashboard
   # Go to Deployments → Redeploy

   # Option 2: Via CLI
   vercel --prod
   ```

3. **Verify Fix**
   - Test QR code generation
   - Scan generated QR codes
   - Check admin interface

## 🐛 Troubleshooting

### QR Codes Still Show Localhost

1. **Check Environment Variables**
   - Verify `NEXT_PUBLIC_BASE_URL` is set correctly
   - Ensure it's deployed to all environments

2. **Clear Cache**
   - QR codes are cached for 1 year
   - Add cache-busting parameter: `?v=2`

3. **Check Deployment**
   - Ensure latest code is deployed
   - Check deployment logs for errors

### Admin Interface Issues

1. **Check Console Errors**
   - Open browser developer tools
   - Look for JavaScript errors

2. **Verify API Endpoints**
   - Test `/api/admin/bins` endpoint
   - Check authentication

## 📱 Testing QR Codes

### Before Printing

1. **Generate Test QR Code**
   ```
   https://your-domain.vercel.app/api/bins/qr/generate?qrCode=RELOOP_BIN_001_KIKALISVILI_2024
   ```

2. **Scan with Phone**
   - Use any QR scanner app
   - Should open your Vercel domain
   - Verify bin information loads

3. **Test All QR Codes**
   - Test each bin location
   - Verify correct information displays

### After Fix

1. **Regenerate All QR Codes**
   - Go to admin panel
   - Download fresh QR codes
   - Print new versions

2. **Update Existing QR Codes**
   - Replace any printed QR codes
   - Test new QR codes in location

## 🎯 Best Practices

### Environment Management

- **Development**: Use `http://localhost:3000`
- **Staging**: Use staging domain
- **Production**: Use production domain

### URL Structure

```
✅ Correct: https://your-domain.vercel.app/qr/RELOOP_BIN_001_KIKALISVILI_2024
❌ Wrong: http://localhost:3000/qr/RELOOP_BIN_001_KIKALISVILI_2024
```

### Testing Checklist

- [ ] QR codes generate with correct domain
- [ ] QR codes scan and open correct URL
- [ ] Bin information displays correctly
- [ ] Admin interface works properly
- [ ] Print pages generate correctly

---

**Last Updated**: January 2024  
**Status**: ✅ Fixed  
**Deployment**: Vercel
