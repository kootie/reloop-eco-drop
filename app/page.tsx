"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Recycle, Wallet, LogOut } from "lucide-react"
import MapView from "@/components/map-view"
import DropProcess from "@/components/drop-process"
import AuthScreen from "@/components/auth-screen"
import EternlWalletConnector from "@/components/eternl-wallet-connector"
import LanguageSwitcher from "@/components/language-switcher"
import { useTranslation } from "@/hooks/use-translation"
import Link from "next/link"

type View = "home" | "map" | "drop"

interface BinLocation {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  qrCode: string
  status: "active" | "inactive"
  totalDrops: number
}

interface User {
  userId: string
  email: string
  fullName: string
  cardanoAddress?: string
  token: string
  walletType?: string
  network?: string
  currentBalanceAda?: number
  totalEarnedAda?: number
  pendingRewardsAda?: number
  totalDrops?: number
  successfulDrops?: number
  isVerified?: boolean
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<View>("home")
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showWalletConnect, setShowWalletConnect] = useState(false)
  const { t, isHydrated } = useTranslation()

  useEffect(() => {
    // Add a small delay to ensure DOM is completely ready and browser extensions have loaded
    const timer = setTimeout(() => {
      setIsMounted(true)
      // Check for stored authentication
      checkStoredAuth()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const checkStoredAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      
      if (token && userData) {
        try {
          const parsedUserData = JSON.parse(userData)
          setUser({ ...parsedUserData, token })
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
        }
      }
    }
  }

  const handleAuth = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    
    // Store auth data
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', userData.token)
      localStorage.setItem('userData', JSON.stringify(userData))
    }
    
    // Show wallet connection if no wallet connected
    if (!userData.cardanoAddress) {
      setShowWalletConnect(true)
    }
  }

  const handleWalletConnected = async (walletInfo: {
    address: string
    balance: number
    network: 'testnet' | 'mainnet'
  }) => {
    if (!user) return

    try {
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          cardanoAddress: walletInfo.address,
          walletType: 'eternl',
          network: walletInfo.network
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const updatedUser = { ...user, ...data.user }
        setUser(updatedUser)
        setShowWalletConnect(false)
        
        // Update stored user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(updatedUser))
        }
      } else {
        console.error('Failed to update wallet info:', data.error)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setCurrentView("home")
    setSelectedBin(null)
    setShowWalletConnect(false)
    
    // Clear stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
    }
  }

  if (!isMounted || !isHydrated) {
    return null // Return null on server side to prevent hydration mismatch
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} />
  }

  // Show wallet connection modal if authenticated but no wallet connected
  if (showWalletConnect && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Connect Your Wallet
            </h1>
            <p className="text-green-600 mb-6">
              Connect your Cardano wallet to start earning ADA rewards for e-waste recycling
            </p>
          </div>
          
          <EternlWalletConnector
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={() => {}}
          />
          
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowWalletConnect(false)}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "map" && user) {
    return (
      <MapView
        user={user}
        onBack={() => setCurrentView("home")}
        onSelectBin={(bin) => {
          setSelectedBin(bin)
          setCurrentView("drop")
        }}
      />
    )
  }

  if (currentView === "drop" && user) {
    return (
      <DropProcess
        user={user}
        selectedBin={selectedBin}
        onBack={() => setCurrentView("map")}
        onComplete={() => {
          setCurrentView("home")
          setSelectedBin(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-800">{t.app.name}</h1>
              <p className="text-sm text-green-600">{t.app.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-right">
              <p className="text-sm text-gray-600">{user?.fullName || user?.email}</p>
              <div className="flex items-center gap-2">
                {user?.cardanoAddress ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Wallet Connected
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowWalletConnect(true)}
                    className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Wallet className="w-3 h-3 mr-1" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MapPin className="w-5 h-5" />
                {t.home.findBins}
              </CardTitle>
              <CardDescription>{t.home.findBinsDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setCurrentView("map")}>
                {t.home.viewMap}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">{t.home.quickDrop}</CardTitle>
              <CardDescription>{t.home.quickDropDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setCurrentView("map")}>
                {t.home.startDrop}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-green-700 font-medium">{t.home.readyToMakeDifference}</p>
          <p className="text-green-600 text-sm mt-1">{t.home.earnCardanoRewards}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 text-center">{t.home.availableInZugdidi}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="text-center">
                  <h3 className="font-semibold text-green-700 mb-1">{t.locations.kikalisviliBin}</h3>
                  <p className="text-sm text-green-600">{t.locations.kikalisviliAddress}</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-green-700 mb-1">{t.locations.tradeCenterMall}</h3>
                  <p className="text-sm text-green-600">{t.locations.tradeCenterAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 text-center">Safety Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-600 text-sm mb-4">
                Learn about e-waste risk levels and proper disposal methods
              </p>
              <Link href="/guidelines">
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                  View Guidelines
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


