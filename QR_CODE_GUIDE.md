# 🔄 QR Code Generation & Printing Guide

This guide explains how to generate and print QR codes for your Reloop recycling bins.

## 📋 Overview

Each recycling bin in your system has a unique QR code that users can scan to:
- View bin information and location
- Submit e-waste drops
- Earn ADA rewards
- Track their recycling activity

## 🚀 Quick Start

### Method 1: Admin Dashboard (Recommended)

1. **Access Admin Panel**
   - Go to `/admin` and log in
   - Click on the "QR Codes" tab
   - Click "Open QR Code Generator"

2. **Generate QR Codes**
   - View all existing bins
   - Select bins you want QR codes for
   - Click "Download Selected" or "Generate Print Page"

3. **Print QR Codes**
   - Download the HTML print page
   - Open in your browser
   - Click "Print All QR Codes"
   - Print on A4 paper

### Method 2: Direct URL Access

For individual QR codes, visit:
```
https://your-domain.com/api/bins/qr/generate?qrCode=RELOOP_BIN_001_KIKALISVILI_2024
```

### Method 3: Script Download

Run the Node.js script to download all QR codes:
```bash
node scripts/download-qr-codes.js
```

## 📦 Current Bin QR Codes

| QR Code ID | Location Name | Address |
|------------|---------------|---------|
| `RELOOP_BIN_001_KIKALISVILI_2024` | Kikalisvili Recycling Station | Kikalisvili Street, Zugdidi, Georgia |
| `RELOOP_BIN_002_TRADECENTER_2024` | Trade Center Mall | Trade Center, Zugdidi, Georgia |
| `RELOOP_BIN_004_UNIVERSITY_2024` | University Campus Recycling Point | Shota Rustaveli State University, Zugdidi, Georgia |
| `RELOOP_BIN_005_MARKET_2024` | Market Square Collection Point | Central Market Square, Zugdidi, Georgia |

## 🖨️ Printing Instructions

### Recommended Print Settings

1. **Paper Size**: A4 (210mm × 297mm)
2. **Orientation**: Portrait
3. **Quality**: High (300 DPI or higher)
4. **Paper Type**: Standard white paper or cardstock
5. **Color**: Color (QR codes are green on white)

### Print Layout

The generated HTML page includes:
- ✅ Professional layout with bin information
- ✅ QR codes sized for easy scanning (200px)
- ✅ Location names and addresses
- ✅ Print-optimized styling
- ✅ Cut lines for easy separation

### Post-Printing Steps

1. **Cut Out Cards**: Cut along the dotted lines
2. **Laminate** (Recommended): Use 125-150 micron laminate for durability
3. **Attach**: Use double-sided tape or adhesive strips
4. **Test**: Scan each QR code to verify it works

## 🔧 Adding New Bins

### Via Admin Interface

1. Go to `/admin/qr-codes`
2. Click "Add New Bin"
3. Fill in the form:
   - **Location Name**: Human-readable name
   - **Address**: Full street address
   - **Latitude/Longitude**: GPS coordinates
   - **QR Code ID**: Unique identifier (e.g., `RELOOP_BIN_XXX_LOCATION_2024`)
   - **Capacity**: Maximum weight in kg
   - **Contact Phone**: Optional contact number

### QR Code ID Format

Use this format for consistency:
```
RELOOP_BIN_[NUMBER]_[LOCATION]_[YEAR]
```

Examples:
- `RELOOP_BIN_001_KIKALISVILI_2024`
- `RELOOP_BIN_002_TRADECENTER_2024`
- `RELOOP_BIN_003_UNIVERSITY_2024`

## 📱 QR Code Features

### What Users See When Scanning

1. **Bin Information Page**
   - Location name and address
   - Current capacity and fill level
   - Accepted materials
   - Operating hours
   - Contact information

2. **Drop Submission**
   - Photo upload interface
   - Device type selection
   - Location verification
   - Reward calculation

3. **Real-time Updates**
   - Live bin status
   - Current capacity
   - Recent activity

## 🛠️ Technical Details

### QR Code Generation

- **Format**: PNG image
- **Size**: 512×512 pixels
- **Colors**: Green (#0f5132) on white (#ffffff)
- **Error Correction**: Level M (15% recovery)
- **Content**: URL to bin information page

### URL Structure

```
https://your-domain.com/qr/[QR_CODE_ID]?lat=[LATITUDE]&lng=[LONGITUDE]&name=[LOCATION_NAME]
```

### API Endpoints

- **Generate QR**: `GET /api/bins/qr/generate?qrCode=[CODE]`
- **Get Bin Info**: `GET /api/bins/qr/[CODE]`
- **QR Page**: `/qr/[CODE]`

## 🔍 Troubleshooting

### Common Issues

1. **QR Code Won't Scan**
   - Ensure high print quality (300 DPI+)
   - Check for smudges or damage
   - Verify proper lighting when scanning
   - Test with multiple QR scanner apps

2. **Wrong Bin Information**
   - Verify QR code ID matches database
   - Check bin is active in admin panel
   - Clear browser cache

3. **Print Quality Issues**
   - Use high-quality printer settings
   - Avoid scaling in print dialog
   - Use original PDF/HTML file

### Testing QR Codes

1. **Before Printing**
   - Test each QR code on your phone
   - Verify correct bin information loads
   - Check all links work properly

2. **After Installation**
   - Test from different angles
   - Verify in various lighting conditions
   - Ask others to test scanning

## 📞 Support

If you need help with QR code generation or printing:

1. Check the admin dashboard for bin status
2. Verify QR code IDs are unique
3. Test QR codes before mass printing
4. Contact support if issues persist

## 🎯 Best Practices

### QR Code Placement

- **Height**: 1.2-1.5 meters from ground
- **Visibility**: Clear line of sight
- **Lighting**: Well-lit area
- **Protection**: Weather-resistant if outdoors

### Maintenance

- **Regular Checks**: Monthly QR code scans
- **Cleaning**: Wipe clean as needed
- **Replacement**: Replace if damaged or faded
- **Updates**: Update if bin information changes

### User Experience

- **Clear Instructions**: Add "Scan to recycle" text
- **Multiple QR Codes**: Place on multiple sides of large bins
- **Accessibility**: Ensure QR codes are reachable
- **Backup**: Keep digital copies of all QR codes

---

**Last Updated**: January 2024  
**Version**: 1.0  
**System**: Reloop Live E-Waste Platform
