"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface BinLocation {
  id: string
  name: string
  address: string
  qrCode: string
  status: string
}

interface User {
  userId: string
  email: string
  cardanoAddress?: string
}

interface DropSubmissionProps {
  bin: BinLocation
  user: User
  onSuccess?: (drop: { dropId: string; status: string; estimatedRewardAda: number }) => void
  onCancel?: () => void
}

const riskLevels = [
  {
    level: 'level1',
    name: 'Safe Items',
    rate: 0.5,
    examples: ['USB cables', 'Phone chargers', 'Audio cables', 'HDMI cables'],
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    level: 'level2', 
    name: 'Low Risk Items',
    rate: 1.0,
    examples: ['LED bulbs', 'CFL lights', 'Small electronics', 'Computer mice'],
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    level: 'level3',
    name: 'Medium Risk Items', 
    rate: 1.5,
    examples: ['Smartphones', 'Small appliances', 'Wireless devices', 'Bluetooth speakers'],
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  },
  {
    level: 'level4',
    name: 'High Risk Items',
    rate: 2.0, 
    examples: ['Laptops', 'Tablets', 'Gaming devices', 'Monitors'],
    color: 'bg-orange-100 border-orange-300 text-orange-800'
  },
  {
    level: 'level5',
    name: 'Very High Risk Items',
    rate: 2.5,
    examples: ['Power banks', 'Laptop batteries', 'Electric tool batteries', 'UPS batteries'],
    color: 'bg-red-100 border-red-300 text-red-800'
  }
]

export default function DropSubmission({ bin, user, onSuccess, onCancel }: DropSubmissionProps) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('')
  const [itemDescription, setItemDescription] = useState<string>('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isHydrated } = useTranslation()

  if (!isHydrated) {
    return (
      <Card className="border-green-200">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-green-600">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  const selectedLevel = riskLevels.find(level => level.level === selectedRiskLevel)
  // Fixed token amount based on risk level (no weight calculation)
  const estimatedTokens = selectedLevel ? selectedLevel.rate.toFixed(2) : '0'

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRiskLevel || !itemDescription.trim() || !photo) {
      setErrorMessage('Please fill in all required fields and upload a photo')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('userId', user.userId)
      formData.append('userEmail', user.email)
      formData.append('binId', bin.id)
      formData.append('itemType', selectedRiskLevel)
      formData.append('itemDescription', itemDescription)
      formData.append('photo', photo)

      const response = await fetch('/api/drops/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        if (onSuccess) {
          onSuccess(data.drop)
        }
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Failed to submit drop')
      }
    } catch {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <Card className="border-green-500 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">Drop Submitted Successfully!</h3>
          <p className="text-green-700 mb-4">
            Your e-waste drop has been submitted for review. Estimated reward: <strong>{estimatedTokens} ADA tokens</strong>
          </p>
          <p className="text-green-600 text-sm mb-6">
            You will receive a notification once the admin verifies your submission (usually within 1 week).
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => {
                setSubmitStatus('idle')
                              setSelectedRiskLevel('')
              setItemDescription('')
              setPhoto(null)
              setPhotoPreview('')
              }}
              variant="outline"
              className="border-green-200 text-green-700"
            >
              Submit Another Drop
            </Button>
            {onCancel && (
              <Button onClick={onCancel} className="bg-green-600 hover:bg-green-700">
                Back to Map
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bin Information */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Drop Location</CardTitle>
          <CardDescription>
            Submit your e-waste drop at {bin.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-700">{bin.name}</p>
              <p className="text-sm text-gray-600">{bin.address}</p>
            </div>
            <Badge className="bg-green-600">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Drop Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Type Selection */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Item Type & Risk Level</CardTitle>
            <CardDescription>
              Select the category that best matches your e-waste item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {riskLevels.map((level) => (
                <div
                  key={level.level}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRiskLevel === level.level
                      ? 'ring-2 ring-green-500 border-green-500'
                      : 'border-gray-200 hover:border-green-300'
                  } ${level.color}`}
                  onClick={() => setSelectedRiskLevel(level.level)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{level.name}</h4>
                    <Badge variant="outline">{level.rate} ADA/kg</Badge>
                  </div>
                  <p className="text-sm opacity-75">
                    Examples: {level.examples.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Item Description */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Item Description</CardTitle>
            <CardDescription>
              Provide a brief description of your e-waste item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="itemDescription">Item Description</Label>
              <Input
                id="itemDescription"
                type="text"
                placeholder="e.g., Old smartphone charger, broken laptop, etc."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="border-green-200 focus:border-green-500"
                required
              />
              {selectedLevel && (
                                   <p className="text-sm text-green-600">
                     Estimated reward: <strong>{estimatedTokens} ADA tokens</strong>
                   </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Item Photo</CardTitle>
            <CardDescription>
              Take a clear photo of your e-waste item for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                required
              />
              
              {photoPreview ? (
                <div className="space-y-3">
                  <img
                    src={photoPreview}
                    alt="E-waste item"
                    className="w-full max-w-md mx-auto rounded-lg border border-green-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-green-200 text-green-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Camera className="w-8 h-8 mb-2" />
                  <span>Take Photo</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {errorMessage && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedRiskLevel || !itemDescription.trim() || !photo}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Drop'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
