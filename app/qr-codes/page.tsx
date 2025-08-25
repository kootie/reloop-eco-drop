"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, MapPin, ExternalLink, Download } from "lucide-react";

interface Bin {
  id: string;
  qr_code: string;
  location_name: string;
  address: string;
  is_active: boolean;
  total_drops: number;
}

export default function PublicQRCodesPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBins();
  }, []);

  const loadBins = async () => {
    try {
      const response = await fetch("/api/public/bins");
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

  const getQRCodeUrl = (qrCode: string) => {
    return `https://reloop-eco-drop.vercel.app/api/public/qr/${encodeURIComponent(qrCode)}`;
  };

  const getPublicBinUrl = (qrCode: string) => {
    return `https://reloop-eco-drop.vercel.app/bin/${encodeURIComponent(qrCode)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔄 Reloop QR Codes
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Scan these QR codes to access bin information and submit e-waste drops
          </p>
          <p className="text-sm text-gray-500">
            All QR codes are publicly accessible - no login required
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bins.map((bin) => (
            <Card key={bin.id} className="hover:shadow-lg transition-shadow">
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
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{bin.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <QrCode className="w-4 h-4" />
                    <span className="font-mono text-xs">{bin.qr_code}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(getQRCodeUrl(bin.qr_code), "_blank")}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(getPublicBinUrl(bin.qr_code), "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Bin Details
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = getQRCodeUrl(bin.qr_code);
                      link.download = `${bin.qr_code}.png`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
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
              <p className="text-gray-500">
                No QR codes are available at the moment
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📱 How to Use QR Codes
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Click "View QR Code" to see the QR code image</p>
                <p>2. Right-click and save the image for printing</p>
                <p>3. Print and attach to your bin location</p>
                <p>4. Users can scan with any QR code reader app</p>
                <p>5. QR codes redirect to public bin information pages</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
