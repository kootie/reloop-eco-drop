"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus,
  Recycle,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface AuthScreenProps {
  onAuth: (userData: {
    userId: string
    email: string
    fullName: string
    cardanoAddress?: string
    token: string
  }) => void
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { t, isHydrated } = useTranslation()

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
    setSuccessMessage("")
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.password) {
      setError("Password is required")
      return false
    }

    if (!isLoginMode) {
      if (!formData.fullName.trim()) {
        setError("Full name is required")
        return false
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long")
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register'
      const requestBody = isLoginMode 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password, 
            fullName: formData.fullName 
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage(data.message)
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token)
        
        // Call onAuth with user data
        onAuth({
          userId: data.user.userId,
          email: data.user.email,
          fullName: data.user.fullName,
          cardanoAddress: data.user.cardanoAddress,
          token: data.token
        })
      } else {
        setError(data.error || `${isLoginMode ? 'Login' : 'Registration'} failed`)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormData({
      email: "",
      password: "",
      fullName: "",
      confirmPassword: ""
    })
    setError("")
    setSuccessMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            {t?.app?.title || "Reloop Live"}
          </h1>
          <p className="text-green-600">
            {isLoginMode 
              ? "Welcome back! Sign in to continue recycling."
              : "Join the e-waste revolution and earn ADA rewards!"
            }
          </p>
        </div>

        {/* Authentication Form */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              {isLoginMode ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isLoginMode 
                ? "Enter your credentials to access your account"
                : "Create your account to start earning ADA for recycling"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Registration only) */}
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="pl-10 border-green-200 focus:border-green-500"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-500"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 border-green-200 focus:border-green-500"
                    placeholder={isLoginMode ? "Enter your password" : "Choose a strong password"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLoginMode && (
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Confirm Password (Registration only) */}
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 border-green-200 focus:border-green-500"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLoginMode ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLoginMode ? (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={toggleMode}
                className="text-green-600 hover:text-green-700 p-0"
                disabled={isLoading}
              >
                {isLoginMode ? "Create Account" : "Sign In"}
              </Button>
            </div>

            {/* Info Badge */}
            {!isLoginMode && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    New
                  </Badge>
                  <div className="text-xs text-blue-600">
                    <p className="font-medium mb-1">After registration:</p>
                    <ul className="space-y-1">
                      <li>• Connect your Cardano wallet</li>
                      <li>• Submit e-waste photos for verification</li>
                                              <li>• Earn ADA tokens for approved submissions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
