"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Printer,
  QrCode,
  MapPin,
  Phone,
  Package,
  RefreshCw,
  Plus,
  ExternalLink,
} from "lucide-react";

interface Bin {
  id: string;
  bin_id: string;
  qr_code: string;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  is_operational: boolean;
  capacity_kg: number;
  current_weight_kg: number;
  contact_phone: string;
  total_drops: number;
  created_at: string;
}

export default function QRCodeGenerator() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBins, setSelectedBins] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    location_name: "",
    address: "",
    latitude: "",
    longitude: "",
    qr_code: "",
    capacity_kg: "100",
    contact_phone: "",
  });

  useEffect(() => {
    loadBins();
  }, []);

  const loadBins = async () => {
    try {
      const response = await fetch("/api/admin/bins");
      const data = await response.json();
      if (data.success) {
        setBins(data.bins || []);
      }
    } catch (error) {
      console.error("Error loading bins:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (qrCode: string) => {
    // Use custom domain for QR code generation
    const baseUrl = "https://reloop-eco-drop.vercel.app";
    return `${baseUrl}/api/bins/qr/generate?qrCode=${encodeURIComponent(qrCode)}`;
  };

  const getPublicBinUrl = (qrCode: string) => {
    // Use custom domain for public bin URLs
    const baseUrl = "https://reloop-eco-drop.vercel.app";
    return `${baseUrl}/bin/${encodeURIComponent(qrCode)}`;
  };

  const downloadQRCode = async (qrCode: string, filename: string) => {
    try {
      const response = await fetch(generateQRCode(qrCode));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const downloadSelectedQRCodes = async () => {
    for (const binId of selectedBins) {
      const bin = bins.find(b => b.id === binId);
      if (bin) {
        await downloadQRCode(bin.qr_code, `${bin.qr_code}.png`);
      }
    }
  };

  const generatePrintPage = () => {
    const selectedBinData = bins.filter(bin => selectedBins.includes(bin.id));
    const html = generatePrintHTML(selectedBinData);
    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-codes-print.html";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generatePrintHTML = (selectedBins: Bin[]) => {
    return `
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
            ${selectedBins.map(bin => `
                <div class="qr-card">
                    <div class="bin-name">${bin.location_name}</div>
                    <div class="bin-location">${bin.address}</div>
                                         <div class="qr-code">
                         <img src="${generateQRCode(bin.qr_code)}" 
                              alt="QR Code for ${bin.location_name}" />
                     </div>
                     <div class="qr-url">
                         <small>${getPublicBinUrl(bin.qr_code)}</small>
                     </div>
                    <div class="qr-code-text">${bin.qr_code}</div>
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
  };

  const handleCreateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/bins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setFormData({
          location_name: "",
          address: "",
          latitude: "",
          longitude: "",
          qr_code: "",
          capacity_kg: "100",
          contact_phone: "",
        });
        loadBins();
      }
    } catch (error) {
      console.error("Error creating bin:", error);
    }
  };

  const toggleBinSelection = (binId: string) => {
    setSelectedBins(prev =>
      prev.includes(binId)
        ? prev.filter(id => id !== binId)
        : [...prev, binId]
    );
  };

  const selectAllBins = () => {
    setSelectedBins(bins.map(bin => bin.id));
  };

  const deselectAllBins = () => {
    setSelectedBins([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading bins...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600">
            Generate and download QR codes for your recycling bins
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Bin
          </Button>
          
          {selectedBins.length > 0 && (
            <>
              <Button
                onClick={downloadSelectedQRCodes}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Selected ({selectedBins.length})
              </Button>
              
              <Button
                onClick={generatePrintPage}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Generate Print Page
              </Button>
            </>
          )}
          
          <Button
            onClick={selectAllBins}
            variant="outline"
            size="sm"
          >
            Select All
          </Button>
          
          <Button
            onClick={deselectAllBins}
            variant="outline"
            size="sm"
          >
            Deselect All
          </Button>
        </div>

        {/* Bin List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bins.map((bin) => (
            <Card
              key={bin.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedBins.includes(bin.id)
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => toggleBinSelection(bin.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {bin.location_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={bin.is_active ? "default" : "secondary"}
                        className={bin.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {bin.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {bin.total_drops} drops
                      </Badge>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedBins.includes(bin.id)}
                    onChange={() => toggleBinSelection(bin.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{bin.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <QrCode className="w-4 h-4" />
                    <span className="font-mono text-xs">{bin.qr_code}</span>
                  </div>
                  
                  {bin.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{bin.contact_phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{bin.current_weight_kg}kg / {bin.capacity_kg}kg</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadQRCode(bin.qr_code, `${bin.qr_code}.png`);
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  
                                     <Button
                     size="sm"
                     variant="outline"
                     onClick={(e) => {
                       e.stopPropagation();
                       window.open(generateQRCode(bin.qr_code), "_blank");
                     }}
                   >
                     <QrCode className="w-4 h-4 mr-1" />
                     QR Code
                   </Button>
                   
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={(e) => {
                       e.stopPropagation();
                       window.open(getPublicBinUrl(bin.qr_code), "_blank");
                     }}
                   >
                     <ExternalLink className="w-4 h-4 mr-1" />
                     Public Page
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bins.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No bins found
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first bin to generate QR codes
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Bin
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Bin Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Bin</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBin} className="space-y-4">
                <div>
                  <Label htmlFor="location_name">Location Name</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) =>
                      setFormData({ ...formData, location_name: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="qr_code">QR Code ID</Label>
                  <Input
                    id="qr_code"
                    value={formData.qr_code}
                    onChange={(e) =>
                      setFormData({ ...formData, qr_code: e.target.value })
                    }
                    placeholder="RELOOP_BIN_XXX_LOCATION_2024"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity_kg">Capacity (kg)</Label>
                    <Input
                      id="capacity_kg"
                      type="number"
                      value={formData.capacity_kg}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity_kg: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Bin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
