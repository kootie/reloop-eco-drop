"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Recycle } from "lucide-react"
import MapView from "@/components/map-view"
import DropProcess from "@/components/drop-process"
import LanguageSwitcher from "@/components/language-switcher"
import { useTranslation } from "@/hooks/use-translation"

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

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ userId: string; email: string; cardanoAddress: string } | null>(null)
  const [currentView, setCurrentView] = useState<View>("home")
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null)
  const { t } = useTranslation()

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuth={(userData) => {
          setUser(userData)
          setIsAuthenticated(true)
        }}
      />
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
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-green-600">{t.app.walletConnected}</p>
            </div>
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

        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 text-center">{t.home.availableInZugdidi}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
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
      </main>
    </div>
  )
}

function AuthScreen({ onAuth }: { onAuth: (user: { userId: string; email: string; cardanoAddress: string }) => void }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useTranslation()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Generate userId from email and name
      const userId = `${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onAuth({
          userId: data.user.userId,
          email: data.user.email,
          cardanoAddress: data.user.cardanoAddress,
        })
      } else {
        setError(data.error || t.auth.registrationFailed)
      }
    } catch (err) {
      setError(t.auth.networkError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-800">{t.auth.welcome}</CardTitle>
          <CardDescription>{t.auth.welcomeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">
                {t.auth.fullName}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t.auth.enterFullName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700">
                {t.auth.emailAddress}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t.auth.enterEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-green-200 focus:border-green-500"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
            )}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? t.auth.creatingAccount : t.auth.createAccount}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-green-600">
            <p>{t.auth.walletInfo}</p>
            <p className="mt-1">{t.auth.earnInfo}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
