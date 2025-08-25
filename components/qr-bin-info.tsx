"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Recycle, TrendingUp, Shield, AlertTriangle, Zap, Skull, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BinInfo {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  qrCode: string
  status: string
  capacity: {
    total: number
    current: number
    available: number
    fillPercentage: number
  }
  retailer: {
    name: string
    phone: string
    operatingHours: string
  }
  stats: {
    totalDrops: number
    lastMaintenance: string
    rewardRate: number
  }
  acceptedMaterials: string[]
  acceptedItems: {
    [key: string]: string[]
  }
  riskLevels: {
    [key: string]: {
      name: string
      risk: string
      materials: string
      disposal: string
    }
  }
}

interface QRBinInfoProps {
  qrCode: string
  onStartDrop?: () => void
}

const getRiskIcon = (level: string) => {
  switch (level) {
    case "level1": return CheckCircle
    case "level2": return Shield
    case "level3": return AlertTriangle
    case "level4": return Zap
    case "level5": return Skull
    default: return CheckCircle
  }
}

const getRiskColor = (level: string) => {
  switch (level) {
    case "level1": return "text-green-600"
    case "level2": return "text-blue-600"
    case "level3": return "text-yellow-600"
    case "level4": return "text-orange-600"
    case "level5": return "text-red-600"
    default: return "text-gray-600"
  }
}

const getRiskBgColor = (level: string) => {
  switch (level) {
    case "level1": return "bg-green-50"
    case "level2": return "bg-blue-50"
    case "level3": return "bg-yellow-50"
    case "level4": return "bg-orange-50"
    case "level5": return "bg-red-50"
    default: return "bg-gray-50"
  }
}

export default function QRBinInfo({ qrCode, onStartDrop }: QRBinInfoProps) {
  const [binInfo, setBinInfo] = useState<BinInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const fetchBinInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/bins/qr/${encodeURIComponent(qrCode)}`)
      const data = await response.json()

      if (data.success) {
        setBinInfo(data.bin)
      } else {
        setError(data.error || 'Failed to load bin information')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [qrCode])

  useEffect(() => {
    setIsMounted(true)
    fetchBinInfo()
  }, [qrCode, fetchBinInfo])

  if (!isMounted || loading) {
    return (
      <Card className="border-green-200">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-green-600">Loading bin information...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBinInfo} variant="outline" className="border-red-200">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!binInfo) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Bin Header */}
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-800">{binInfo.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {binInfo.address}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Capacity Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Fill:</span>
                  <span className="font-semibold">{binInfo.capacity.fillPercentage}%</span>
                </div>
                <Progress value={binInfo.capacity.fillPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{binInfo.capacity.current}kg used</span>
                  <span>{binInfo.capacity.available}kg available</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Retailer:</span>
                  <span>{binInfo.retailer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{binInfo.retailer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{binInfo.retailer.operatingHours}</span>
                </div>
              </div>
            </div>
          </div>

          {binInfo.status === "inactive" && (
            <div className="mt-6 pt-4 border-t border-red-200">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ Bin Currently Inactive</p>
                <p className="text-red-600 text-sm">
                  This recycling bin is temporarily out of service. Please choose an active bin from the map.
                </p>
              </div>
            </div>
          )}

          {onStartDrop && binInfo.status === "active" && (
            <div className="mt-6 pt-4 border-t border-green-200">
              <Button 
                onClick={onStartDrop} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={binInfo.capacity.fillPercentage >= 95}
              >
                {binInfo.capacity.fillPercentage >= 95 ? 'Bin Nearly Full' : 'Start Drop Process'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accepted Materials */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Accepted E-Waste Materials</CardTitle>
          <CardDescription>
            This bin accepts the following risk levels. Higher levels earn more ADA rewards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {binInfo.acceptedMaterials && binInfo.acceptedMaterials.length > 0 ? (
              binInfo.acceptedMaterials.map((levelKey) => {
                const level = binInfo.riskLevels[levelKey]
                if (!level) return null // Skip if level definition is missing
                
                const levelNumber = parseInt(levelKey.replace('level', ''))
                const IconComponent = getRiskIcon(levelKey)
                
                return (
                  <div key={levelKey} className={`p-4 rounded-lg ${getRiskBgColor(levelKey)} border border-gray-200`}>
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className={`w-5 h-5 ${getRiskColor(levelKey)}`} />
                      <h3 className="font-semibold">Level {levelNumber}: {level.name}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {(levelNumber * 0.5).toFixed(1)} ADA/kg
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Accepted Items:</h4>
                        <div className="flex flex-wrap gap-1">
                          {binInfo.acceptedItems[levelKey]?.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white">
                              {item}
                            </Badge>
                          )) || (
                            <span className="text-sm text-gray-500 italic">No specific items listed</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Materials:</h4>
                        <p className="text-sm text-gray-600">{level.materials}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-700 mb-1">Disposal Requirements:</h4>
                      <p className="text-sm text-gray-600">{level.disposal}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No accepted materials information available for this bin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Bin Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{binInfo.stats.totalDrops}</div>
              <div className="text-sm text-gray-600">Total Drops</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{binInfo.stats.rewardRate}</div>
              <div className="text-sm text-gray-600">Base ADA Rate</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-800">
                {new Date(binInfo.stats.lastMaintenance).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-gray-600">Last Maintenance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-700">QR Code ID</h4>
              <p className="text-sm font-mono text-gray-600">{binInfo.qrCode}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Coordinates</h4>
              <p className="text-sm font-mono text-gray-600">
                {binInfo.coordinates.lat.toFixed(4)}, {binInfo.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
