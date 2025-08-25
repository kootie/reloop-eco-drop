"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Phone,
  Clock,
  Package,
  Recycle,
  TrendingUp,
  Shield,
  AlertTriangle,
  Zap,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface BinInfo {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  qrCode: string;
  status: string;
  capacity: {
    total: number;
    current: number;
    available: number;
    fillPercentage: number;
  };
  retailer: {
    name: string;
    phone: string;
    operatingHours: string;
  };
  stats: {
    totalDrops: number;
    lastMaintenance: string;
  };
  acceptedMaterials: string[];
}

const getRiskIcon = (level: string) => {
  switch (level) {
    case "level1":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "level2":
      return <Shield className="w-4 h-4 text-blue-600" />;
    case "level3":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "level4":
      return <Zap className="w-4 h-4 text-orange-600" />;
    case "level5":
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Recycle className="w-4 h-4 text-gray-600" />;
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case "level1":
      return "text-green-600";
    case "level2":
      return "text-blue-600";
    case "level3":
      return "text-yellow-600";
    case "level4":
      return "text-orange-600";
    case "level5":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const getRiskBgColor = (level: string) => {
  switch (level) {
    case "level1":
      return "bg-green-50";
    case "level2":
      return "bg-blue-50";
    case "level3":
      return "bg-yellow-50";
    case "level4":
      return "bg-orange-50";
    case "level5":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

const getRiskName = (level: string) => {
  switch (level) {
    case "level1":
      return "Safe Items";
    case "level2":
      return "Low Risk Items";
    case "level3":
      return "Medium Risk Items";
    case "level4":
      return "High Risk Items";
    case "level5":
      return "Very High Risk Items";
    default:
      return "General Items";
  }
};

const getAcceptedItems = (level: string) => {
  switch (level) {
    case "level1":
      return ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"];
    case "level2":
      return ["LED bulbs", "CFL lights", "Small electronics", "Computer mice", "Keyboards"];
    case "level3":
      return ["Smartphones", "Small appliances", "Wireless devices", "Bluetooth speakers"];
    case "level4":
      return ["Laptops", "Tablets", "Gaming devices", "Monitors"];
    case "level5":
      return ["Power banks", "Laptop batteries", "Electric tool batteries", "UPS batteries"];
    default:
      return ["General electronics"];
  }
};

export default function PublicBinPage({ params }: { params: { qrCode: string } }) {
  const [binInfo, setBinInfo] = useState<BinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const qrCode = decodeURIComponent(params.qrCode);

  useEffect(() => {
    setIsMounted(true);
    fetchBinInfo();
  }, [qrCode]);

  const fetchBinInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bins/qr/${encodeURIComponent(qrCode)}`);
      const data = await response.json();

      if (data.success) {
        setBinInfo(data.bin);
      } else {
        setError(data.error || "Bin not found");
      }
    } catch (err) {
      setError("Failed to load bin information");
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (binInfo) {
      const { lat, lng } = binInfo.coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };

  const callRetailer = () => {
    if (binInfo?.retailer.phone) {
      window.open(`tel:${binInfo.retailer.phone}`, "_self");
    }
  };

  const startRecycling = () => {
    // Redirect to the main app with the bin pre-selected
    const url = new URL(window.location.origin);
    url.searchParams.set("bin", qrCode);
    window.open(url.toString(), "_blank");
  };

  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bin information...</p>
        </div>
      </div>
    );
  }

  if (error || !binInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Bin Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || "This bin location could not be found."}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {binInfo.name}
          </h1>
          <p className="text-gray-600">
            E-Waste Recycling Station
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <Badge
            variant={binInfo.status === "active" ? "default" : "secondary"}
            className={`${
              binInfo.status === "active"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            } px-4 py-2 text-sm font-medium`}
          >
            {binInfo.status === "active" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Active & Accepting Items
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Temporarily Closed
              </>
            )}
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Address</p>
              <p className="font-medium">{binInfo.address}</p>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={openInMaps}
                className="flex-1"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
              
              {binInfo.retailer.phone && (
                <Button
                  variant="outline"
                  onClick={callRetailer}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capacity Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Bin Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Current Fill Level</span>
                  <span className="font-medium">{binInfo.capacity.fillPercentage}%</span>
                </div>
                <Progress value={binInfo.capacity.fillPercentage} className="h-3" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {binInfo.capacity.current}kg
                  </p>
                  <p className="text-xs text-gray-600">Current</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {binInfo.capacity.available}kg
                  </p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {binInfo.capacity.total}kg
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Materials */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-green-600" />
              Accepted Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["level1", "level2", "level3", "level4", "level5"].map((level) => (
                <div
                  key={level}
                  className={`p-3 rounded-lg border ${getRiskBgColor(level)}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getRiskIcon(level)}
                    <span className={`font-medium ${getRiskColor(level)}`}>
                      {getRiskName(level)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getAcceptedItems(level).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {binInfo.stats.totalDrops}
                </p>
                <p className="text-sm text-gray-600">Total Drops</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {binInfo.retailer.operatingHours}
                </p>
                <p className="text-sm text-gray-600">Operating Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {binInfo.status === "active" && (
            <Button
              onClick={startRecycling}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              <Recycle className="w-5 h-5 mr-2" />
              Start Recycling Now
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.open(window.location.origin, "_blank")}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Reloop Platform
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🔄 Reloop E-Waste Recycling Platform</p>
          <p>Scan QR codes to recycle and earn ADA rewards</p>
        </div>
      </div>
    </div>
  );
}
