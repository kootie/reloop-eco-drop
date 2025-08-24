"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Package
} from "lucide-react"

interface BinLocation {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  qrCode: string
  status: 'active' | 'inactive'
  capacity: number
  currentFill: number
  retailer: string
  contactPhone: string
  operatingHours: string
  materials: string[]
  acceptedItems: {
    [key: string]: string[]
  }
  rewardRate: number
  totalDrops: number
  lastMaintenance: string
  createdAt?: string
}

interface BinStats {
  totalBins: number
  activeBins: number
  inactiveBins: number
  totalDrops: number
  totalCapacity: number
  totalCurrentFill: number
  averageFillPercentage: number
  binsNeedingAttention: BinLocation[]
  popularBins: BinLocation[]
}

interface Stats {
  bins: BinStats
  drops: {
    total: number
    pending: number
    approved: number
    rejected: number
    recent: number
    monthly: number
    byRiskLevel: Record<string, number>
  }
  users: {
    total: number
    activeThisMonth: number
  }
  tokens: {
    totalAwarded: number
    monthlyAwarded: number
    averagePerDrop: number
  }
}

export default function BinManagement() {
  const [bins, setBins] = useState<BinLocation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBin, setSelectedBin] = useState<BinLocation | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<BinLocation>>({})

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [binsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/bins'),
        fetch('/api/admin/stats')
      ])

      const binsData = await binsResponse.json()
      const statsData = await statsResponse.json()

      if (binsData.success) {
        setBins(binsData.bins)
      }

      if (statsData.success) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBin = () => {
    setFormData({
      name: '',
      address: '',
      coordinates: { lat: 42.5092, lng: 41.8709 },
      qrCode: '',
      status: 'active',
      capacity: 100,
      currentFill: 0,
      retailer: '',
      contactPhone: '',
      operatingHours: '24/7',
      materials: ['level1', 'level2'],
      acceptedItems: {
        level1: ['USB cables', 'Phone chargers'],
        level2: ['LED bulbs', 'Small electronics']
      },
      rewardRate: 0.5
    })
    setIsEditing(false)
    setShowForm(true)
  }

  const handleEditBin = (bin: BinLocation) => {
    setFormData(bin)
    setSelectedBin(bin)
    setIsEditing(true)
    setShowForm(true)
  }

  const handleDeleteBin = async (binId: string) => {
    if (!confirm('Are you sure you want to delete this bin?')) return

    try {
      const response = await fetch('/api/admin/bins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ binId })
      })

      const data = await response.json()
      if (data.success) {
        loadData() // Reload data
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Error deleting bin:', error)
      setError('Failed to delete bin')
    }
  }

  const handleToggleStatus = async (bin: BinLocation) => {
    const newStatus = bin.status === 'active' ? 'inactive' : 'active'
    
    try {
      const response = await fetch('/api/admin/bins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          binId: bin.id, 
          status: newStatus 
        })
      })

      const data = await response.json()
      if (data.success) {
        loadData() // Reload data
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Error updating bin status:', error)
      setError('Failed to update bin status')
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = '/api/admin/bins'
      const method = isEditing ? 'PUT' : 'POST'
      const payload = isEditing 
        ? { binId: selectedBin?.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (data.success) {
        setShowForm(false)
        setFormData({})
        setSelectedBin(null)
        loadData() // Reload data
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Error saving bin:', error)
      setError('Failed to save bin')
    }
  }

  const getFillPercentage = (bin: BinLocation) => {
    return Math.round((bin.currentFill / bin.capacity) * 100)
  }

  const getFillColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Bin' : 'Create New Bin'}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false)
              setFormData({})
              setSelectedBin(null)
            }}
          >
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Bin Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="retailer">Retailer *</Label>
                  <Input
                    id="retailer"
                    value={formData.retailer || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, retailer: e.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    value={formData.coordinates?.lat || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      coordinates: { 
                        ...prev.coordinates!, 
                        lat: parseFloat(e.target.value) 
                      }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude *</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    value={formData.coordinates?.lng || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      coordinates: { 
                        ...prev.coordinates!, 
                        lng: parseFloat(e.target.value) 
                      }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="qrCode">QR Code *</Label>
                  <Input
                    id="qrCode"
                    value={formData.qrCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currentFill">Current Fill</Label>
                  <Input
                    id="currentFill"
                    type="number"
                    value={formData.currentFill || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentFill: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    value={formData.operatingHours || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rewardRate">Reward Rate (ADA per kg)</Label>
                  <Input
                    id="rewardRate"
                    type="number"
                    step="0.1"
                    value={formData.rewardRate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardRate: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {isEditing ? 'Update Bin' : 'Create Bin'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bin Management</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateBin} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Bin
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Bins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bins.totalBins}</p>
                  <p className="text-sm text-green-600">{stats.bins.activeBins} Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Drops</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bins.totalDrops}</p>
                  <p className="text-sm text-blue-600">{stats.drops.recent} This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.activeThisMonth}</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Bins Need Attention</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bins.binsNeedingAttention?.length || 0}</p>
                  <p className="text-sm text-orange-600">Over 90% Full</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bins List */}
      <Card>
        <CardHeader>
                        <CardTitle>All Bins ({bins?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bins.map((bin) => (
              <div key={bin.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{bin.name}</h3>
                      <Badge variant={bin.status === 'active' ? 'default' : 'secondary'}>
                        {bin.status}
                      </Badge>
                      {getFillPercentage(bin) >= 90 && (
                        <Badge variant="destructive">Needs Attention</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Address:</strong> {bin.address}</p>
                        <p><strong>Retailer:</strong> {bin.retailer}</p>
                      </div>
                      <div>
                        <p><strong>Capacity:</strong> {bin.currentFill}/{bin.capacity}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getFillColor(getFillPercentage(bin))}`}
                              style={{ width: `${getFillPercentage(bin)}%` }}
                            />
                          </div>
                          <span className="text-xs">{getFillPercentage(bin)}%</span>
                        </div>
                      </div>
                      <div>
                        <p><strong>Total Drops:</strong> {bin.totalDrops}</p>
                        <p><strong>Reward Rate:</strong> {bin.rewardRate} ADA</p>
                      </div>
                      <div>
                        <p><strong>Operating:</strong> {bin.operatingHours}</p>
                        <p><strong>Contact:</strong> {bin.contactPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(bin)}
                    >
                      {bin.status === 'active' ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBin(bin)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBin(bin.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
