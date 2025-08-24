"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Navigation, Recycle, QrCode } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import LanguageSwitcher from "@/components/language-switcher"
import QRBinInfo from "@/components/qr-bin-info"
import DropSubmission from "@/components/drop-submission"

interface BinLocation {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  qrCode: string
  status: "active" | "inactive"
  totalDrops: number
}

// Zugdidi bin locations
const ZUGDIDI_BINS: BinLocation[] = [
  {
    id: "zugdidi_001",
    name: "კიკალიშვილის ბინი",
    address: "კიკალიშვილის 6, Zugdidi 2100, Georgia",
    coordinates: {
      lat: 42.5088,
      lng: 41.8709,
    },
    qrCode: "RELOOP_BIN_001_KIKALISVILI_2024",
    status: "active",
    totalDrops: 0,
  },
  {
    id: "zugdidi_002",
    name: "Trade Center Zugdidi Mall",
    address: "28 Merab Kostava St, Zugdidi 2100, Georgia",
    coordinates: {
      lat: 42.5095,
      lng: 41.8715,
    },
    qrCode: "RELOOP_BIN_002_TRADECENTER_2024",
    status: "active",
    totalDrops: 0,
  },
]

interface MapViewProps {
  user: { userId: string; email: string; cardanoAddress: string }
  onBack: () => void
  onSelectBin: (bin: BinLocation) => void
}

export default function MapView({ user, onBack, onSelectBin }: MapViewProps) {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [bins, setBins] = useState<BinLocation[]>(ZUGDIDI_BINS)
  const [isLoadingBins, setIsLoadingBins] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQRInfo, setShowQRInfo] = useState<string | null>(null)
  const [showDropForm, setShowDropForm] = useState<BinLocation | null>(null)
  const { t, isHydrated } = useTranslation()

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const getDefaultBins = (): BinLocation[] => [
    {
      id: "zugdidi_001",
      name: t.locations.kikalisviliBin,
      address: t.locations.kikalisviliAddress,
      coordinates: {
        lat: 42.5088,
        lng: 41.8709,
      },
      qrCode: "RELOOP_BIN_001_KIKALISVILI_2024",
      status: "active",
      totalDrops: 0,
    },
    {
      id: "zugdidi_002",
      name: t.locations.tradeCenterMall,
      address: t.locations.tradeCenterAddress,
      coordinates: {
        lat: 42.5095,
        lng: 41.8715,
      },
      qrCode: "RELOOP_BIN_002_TRADECENTER_2024",
      status: "active",
      totalDrops: 0,
    },
  ]

  useEffect(() => {
    loadActiveBins()
  }, []) // Load once on mount

  const loadActiveBins = async () => {
    setIsLoadingBins(true)
    setError(null)

    try {
      const response = await fetch("/api/bins/active")
      const data = await response.json()

      if (data.success && data.bins.length > 0) {
        setBins(
          data.bins.map((bin: {
            id: string
            location_name?: string
            name?: string
            address?: string
            latitude: number | string
            longitude: number | string
            qr_code?: string
            qrCode?: string
            is_active?: boolean
            is_operational?: boolean
            status?: string
            total_drops?: number
            totalDrops?: number
          }) => ({
            id: bin.id,
            name: bin.location_name ?? bin.name ?? 'Recycling Bin',
            address: bin.address ?? '',
            coordinates: {
              lat: typeof bin.latitude === 'number' ? bin.latitude : Number(bin.latitude) || 0,
              lng: typeof bin.longitude === 'number' ? bin.longitude : Number(bin.longitude) || 0,
            },
            qrCode: bin.qr_code ?? bin.qrCode ?? '',
            status: (bin.is_active && bin.is_operational) ? 'active' : (bin.status || 'inactive'),
            totalDrops: bin.total_drops ?? bin.totalDrops ?? 0,
          })),
        )
      } else {
        setBins(getDefaultBins())
      }
    } catch (error) {
      console.error("Failed to load bins:", error)
      setError("Failed to load bin locations")
      setBins(getDefaultBins())
    } finally {
      setIsLoadingBins(false)
    }
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoadingLocation(false)
          setError("Location access denied. Using default location.")
          // Default to Zugdidi center if location fails
          setUserLocation({
            lat: 42.5092,
            lng: 41.8712,
          })
          // Clear error after 3 seconds
          setTimeout(() => setError(null), 3000)
        },
      )
    } else {
      setIsLoadingLocation(false)
      setError("Geolocation not supported. Using default location.")
      // Default to Zugdidi center
      setUserLocation({
        lat: 42.5092,
        lng: 41.8712,
      })
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getDistanceToUser = (bin: BinLocation) => {
    if (!userLocation || !bin.coordinates || typeof bin.coordinates.lat !== 'number' || typeof bin.coordinates.lng !== 'number') {
      return null
    }
    const distance = calculateDistance(userLocation.lat, userLocation.lng, bin.coordinates.lat, bin.coordinates.lng)
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  const handleBinSelect = (bin: BinLocation) => {
    setSelectedBin(bin)
  }

  const handleViewQR = (bin: BinLocation) => {
    if (bin.qrCode) {
      router.push(`/qr/${encodeURIComponent(bin.qrCode)}`)
    }
  }

  const handleCloseQR = () => {
    setShowQRInfo(null)
  }

  const handleStartDrop = (bin: BinLocation) => {
    if (bin.status === 'active') {
      setShowDropForm(bin)
      setShowQRInfo(null)
    }
  }

  const handleStartDropFromSelection = () => {
    if (selectedBin) {
      onSelectBin(selectedBin)
    }
  }

  const handleDropSuccess = () => {
    setShowDropForm(null)
    // Optionally show a success message or redirect
  }

  const handleDropCancel = () => {
    setShowDropForm(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-green-700 hover:text-green-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.common.back}
            </Button>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h1 className="text-lg font-semibold text-green-800">{t.map.recyclingBins}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isLoadingLocation ? t.map.locating : t.map.myLocation}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map placeholder - In a real app, this would be an interactive map */}
        <Card className="mb-6 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">{t.map.recyclingBins}</CardTitle>
            <CardDescription>{t.map.findNearest}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-100 rounded-lg p-8 text-center border-2 border-dashed border-green-300">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-green-700 font-medium mb-2">{t.map.interactiveMap}</p>
              <p className="text-green-600 text-sm">{t.map.showingBins.replace("{count}", bins.length.toString())}</p>
              {userLocation && (
                <p className="text-green-500 text-xs mt-2">
                  {t.map.yourLocation}: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bin List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-green-800 mb-4">{t.map.availableBins}</h2>

          {isLoadingBins ? (
            <Card className="border-green-200">
              <CardContent className="p-8 text-center">
                <p className="text-green-600">{t.common.loading}</p>
              </CardContent>
            </Card>
          ) : (
            bins.map((bin) => (
              <Card
                key={bin.id}
                className={`border-green-200 cursor-pointer transition-all ${
                  selectedBin?.id === bin.id ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-green-50"
                }`}
                onClick={() => handleBinSelect(bin)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Recycle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">{bin.name}</h3>
                        <Badge
                          variant={bin.status === "active" ? "default" : "secondary"}
                          className={bin.status === "active" ? "bg-green-600" : ""}
                        >
                          {bin.status}
                        </Badge>
                        <div className="ml-auto flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewQR(bin)
                            }}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Info
                          </Button>
                          {bin.status === 'active' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartDrop(bin)
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Drop
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{bin.address}</p>
                      <div className="flex items-center gap-4 text-xs text-green-600">
                        <span>
                          {t.map.totalDrops}: {bin.totalDrops}
                        </span>
                        {userLocation && (
                          <span>
                            {t.map.distance}: {getDistanceToUser(bin)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">{t.map.coordinates}</p>
                      <p className="text-xs font-mono text-green-600">
                        {bin.coordinates && typeof bin.coordinates.lat === 'number' && typeof bin.coordinates.lng === 'number'
                          ? `${bin.coordinates.lat.toFixed(4)}, ${bin.coordinates.lng.toFixed(4)}`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Drop Submission Form */}
        {showDropForm && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-800">Submit E-Waste Drop</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDropCancel}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
            <DropSubmission
              bin={showDropForm}
              user={user}
              onSuccess={handleDropSuccess}
              onCancel={handleDropCancel}
            />
          </div>
        )}

        {/* QR Code Information */}
        {showQRInfo && !showDropForm && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-800">QR Code Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseQR}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
            <QRBinInfo 
              qrCode={showQRInfo} 
              onStartDrop={() => {
                const bin = bins.find(b => b.qrCode === showQRInfo)
                if (bin) {
                  handleStartDrop(bin)
                }
              }}
            />
          </div>
        )}

        {/* Selected Bin Actions */}
        {selectedBin && (
          <Card className="mt-6 border-green-500 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">{t.map.selectedBin}</CardTitle>
              <CardDescription>
                {selectedBin.name} - {t.map.readyToStart}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={handleStartDropFromSelection} className="bg-green-600 hover:bg-green-700">
                  {t.map.startDropProcess}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBin(null)}
                  className="border-green-200 text-green-700"
                >
                  {t.common.cancel}
                </Button>
              </div>
              <div className="mt-4 p-3 bg-white rounded-md border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">{t.map.instructions}</p>
                <ol className="text-sm text-green-600 space-y-1">
                  {t.map.instructionSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
