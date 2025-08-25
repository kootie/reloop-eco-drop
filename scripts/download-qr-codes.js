const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 
                 'https://reloop-eco-drop.vercel.app';
const OUTPUT_DIR = './qr-codes';

// List of existing QR codes from your system
const QR_CODES = [
  {
    code: 'RELOOP_BIN_001_KIKALISVILI_2024',
    name: 'Kikalisvili Recycling Station',
    location: 'Kikalisvili Street, Zugdidi, Georgia'
  },
  {
    code: 'RELOOP_BIN_002_TRADECENTER_2024',
    name: 'Trade Center Mall',
    location: 'Trade Center, Zugdidi, Georgia'
  },
  {
    code: 'RELOOP_BIN_004_UNIVERSITY_2024',
    name: 'University Campus Recycling Point',
    location: 'Shota Rustaveli State University, Zugdidi, Georgia'
  },
  {
    code: 'RELOOP_BIN_005_MARKET_2024',
    name: 'Market Square Collection Point',
    location: 'Central Market Square, Zugdidi, Georgia'
  }
];

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Download function
function downloadQRCode(qrCode, filename) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/api/bins/qr/generate?qrCode=${encodeURIComponent(qrCode)}`;
    const protocol = BASE_URL.startsWith('https') ? https : http;
    
    console.log(`Downloading: ${qrCode}...`);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filename);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(filename);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filename, () => {}); // Delete file on error
        reject(err);
      });
    }).on('error', reject);
  });
}

// Generate HTML page with all QR codes
function generateHTMLPage() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reloop Bin QR Codes - Print Ready</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #0f5132;
            margin-bottom: 30px;
        }
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        .qr-card {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            page-break-inside: avoid;
        }
        .qr-code {
            margin: 20px 0;
        }
        .qr-code img {
            max-width: 200px;
            height: auto;
            border: 1px solid #ddd;
        }
        .bin-name {
            font-size: 18px;
            font-weight: bold;
            color: #0f5132;
            margin-bottom: 10px;
        }
        .bin-location {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }
        .qr-code-text {
            font-family: monospace;
            font-size: 12px;
            color: #999;
            word-break: break-all;
            margin-top: 10px;
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0f5132;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .print-button:hover {
            background: #0a3d25;
        }
        @media print {
            .print-button {
                display: none;
            }
            body {
                background: white;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print All QR Codes</button>
    <div class="container">
        <h1>🔄 Reloop Bin QR Codes</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Scan these QR codes to access bin information and submit e-waste drops
        </p>
        
                 <div class="qr-grid">
             ${QR_CODES.map(bin => `
                 <div class="qr-card">
                     <div class="bin-name">${bin.name}</div>
                     <div class="bin-location">${bin.location}</div>
                     <div class="qr-code">
                         <img src="/api/bins/qr/generate?qrCode=${encodeURIComponent(bin.code)}" 
                              alt="QR Code for ${bin.name}" />
                     </div>
                     <div class="qr-url">
                         <small>${BASE_URL}/bin/${encodeURIComponent(bin.code)}</small>
                     </div>
                     <div class="qr-code-text">${bin.code}</div>
                 </div>
             `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            <p><strong>Instructions:</strong></p>
            <p>1. Print this page on standard A4 paper</p>
            <p>2. Cut out each QR code card</p>
            <p>3. Laminate for durability (recommended)</p>
            <p>4. Attach to the corresponding bin location</p>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'qr-codes-print.html'), html);
  console.log(`✅ Generated HTML page: ${OUTPUT_DIR}/qr-codes-print.html`);
}

// Main execution
async function main() {
  console.log('🔄 Reloop QR Code Downloader');
  console.log('==============================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log('');

  try {
    // Download individual QR codes
    for (const bin of QR_CODES) {
      const filename = path.join(OUTPUT_DIR, `${bin.code}.png`);
      await downloadQRCode(bin.code, filename);
    }

    // Generate HTML page
    generateHTMLPage();

    console.log('');
    console.log('🎉 All QR codes downloaded successfully!');
    console.log('');
    console.log('Files created:');
    console.log(`📁 Directory: ${OUTPUT_DIR}/`);
    QR_CODES.forEach(bin => {
      console.log(`   📄 ${bin.code}.png`);
    });
    console.log(`   🌐 qr-codes-print.html`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Open qr-codes-print.html in your browser');
    console.log('2. Click "Print All QR Codes" button');
    console.log('3. Print on A4 paper');
    console.log('4. Cut and laminate each QR code');
    console.log('5. Attach to your bin locations');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { downloadQRCode, generateHTMLPage, QR_CODES };
