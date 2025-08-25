"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import BinManagement from "@/components/bin-management"
import AdminVerification from "@/components/admin-verification"
import TreasuryManagement from "@/components/treasury-management"
import { 
  Shield, 
  LogOut, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  MapPin,
  Recycle,
  AlertCircle,
  Filter,
  BarChart3,
  Users,
  Coins
} from "lucide-react"

interface Admin {
  username: string
  role: string
  token: string
}

interface Drop {
  id: string
  userId: string
  userEmail: string
  binId: string
  itemType: string
  itemDescription: string
  estimatedTokens: number
  actualTokens: number | null
  photo: string | null
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  approvedAt: string | null
  approvedBy: string | null
  notes: string | null
}

interface AdminDashboardProps {
  admin: Admin
  onLogout: () => void
}

const riskLevelNames = {
  'level1': 'Safe Items',
  'level2': 'Low Risk Items', 
  'level3': 'Medium Risk Items',
  'level4': 'High Risk Items',
  'level5': 'Very High Risk Items'
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'verification' | 'drops' | 'bins' | 'treasury' | 'stats'>('verification')
  const [drops, setDrops] = useState<Drop[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)
  const [reviewTokens, setReviewTokens] = useState<string>('')
  const [reviewNotes, setReviewNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadDrops = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = statusFilter === 'all' 
        ? '/api/admin/drops'
        : `/api/admin/drops?status=${statusFilter}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setDrops(data.drops)
      }
    } catch (error) {
      console.error('Failed to load drops:', error)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadDrops()
  }, [loadDrops])

  const handleDropReview = async (dropId: string, action: 'approve' | 'reject') => {
    if (action === 'approve' && (!reviewTokens || parseFloat(reviewTokens) < 0)) {
      alert('Please enter a valid token amount for approval')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/drops', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dropId,
          action,
          actualTokens: action === 'approve' ? parseFloat(reviewTokens) : 0,
          notes: reviewNotes,
          adminUsername: admin.username
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh drops list
        await loadDrops()
        // Close review modal
        setSelectedDrop(null)
        setReviewTokens('')
        setReviewNotes('')
        alert(`Drop ${action}ed successfully!`)
      } else {
        alert(data.error || `Failed to ${action} drop`)
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDropReview = (drop: Drop) => {
    setSelectedDrop(drop)
    setReviewTokens((drop.estimatedTokens || 0).toString())
    setReviewNotes('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatistics = () => {
    const total = drops.length
    const pending = drops.filter(d => d.status === 'pending').length
    const approved = drops.filter(d => d.status === 'approved').length
    const rejected = drops.filter(d => d.status === 'rejected').length
    const totalTokensAwarded = drops
      .filter(d => d.status === 'approved' && d.actualTokens)
      .reduce((sum, d) => sum + (d.actualTokens || 0), 0)

    return { total, pending, approved, rejected, totalTokensAwarded }
  }

  const stats = getStatistics()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-800">Reloop Admin Dashboard</h1>
              <p className="text-sm text-blue-600">Welcome, {admin.username}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'verification' ? 'default' : 'outline'}
            onClick={() => setActiveTab('verification')}
            className={activeTab === 'verification' ? 'bg-blue-600' : 'border-blue-200 text-blue-700'}
          >
            <Users className="w-4 h-4 mr-2" />
            User Verification
          </Button>
          <Button
            variant={activeTab === 'drops' ? 'default' : 'outline'}
            onClick={() => setActiveTab('drops')}
            className={activeTab === 'drops' ? 'bg-blue-600' : 'border-blue-200 text-blue-700'}
          >
            <Clock className="w-4 h-4 mr-2" />
            Drop Management
          </Button>
          <Button
            variant={activeTab === 'bins' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bins')}
            className={activeTab === 'bins' ? 'bg-blue-600' : 'border-blue-200 text-blue-700'}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Bin Management
          </Button>
          <Button
            variant={activeTab === 'treasury' ? 'default' : 'outline'}
            onClick={() => setActiveTab('treasury')}
            className={activeTab === 'treasury' ? 'bg-blue-600' : 'border-blue-200 text-blue-700'}
          >
            <Coins className="w-4 h-4 mr-2" />
            Treasury Management
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className={activeTab === 'stats' ? 'bg-blue-600' : 'border-blue-200 text-blue-700'}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Button>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-800">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved Drops</div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected Drops</div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Recycle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-800">{stats.totalTokensAwarded.toFixed(1)}</div>
                             <div className="text-sm text-gray-600">ADA Tokens Awarded</div>
            </CardContent>
          </Card>
        </div>

        {/* User Verification Tab */}
        {activeTab === 'verification' && (
          <AdminVerification admin={admin} />
        )}

        {/* Drop Management Tab */}
        {activeTab === 'drops' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Drops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('pending')}
                    className={statusFilter === 'pending' ? 'bg-yellow-600' : ''}
                  >
                    Pending ({stats.pending})
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('approved')}
                    className={statusFilter === 'approved' ? 'bg-green-600' : ''}
                  >
                    Approved ({stats.approved})
                  </Button>
                  <Button
                    variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('rejected')}
                    className={statusFilter === 'rejected' ? 'bg-red-600' : ''}
                  >
                    Rejected ({stats.rejected})
                  </Button>
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    className={statusFilter === 'all' ? 'bg-blue-600' : ''}
                  >
                    All ({stats.total})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drops List */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Drop Submissions</CardTitle>
                <CardDescription>
                  Review and approve/reject e-waste drop submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-blue-600">Loading drops...</p>
                  </div>
                ) : drops.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No drops found for the selected filter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drops.map((drop) => (
                      <div
                        key={drop.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-800">Drop #{drop.id}</h4>
                              {getStatusBadge(drop.status)}
                              <Badge variant="outline">
                                {riskLevelNames[drop.itemType as keyof typeof riskLevelNames]}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-2 md:grid-cols-2 text-sm text-gray-600">
                              <div>
                                <strong>User:</strong> {drop.userEmail}
                              </div>
                              <div>
                                <strong>Bin:</strong> {drop.binId}
                              </div>
                              <div>
                                <strong>Description:</strong> {drop.itemDescription}
                              </div>
                              <div>
                                <strong>Estimated:</strong> {drop.estimatedTokens} ADA
                              </div>
                              <div>
                                <strong>Submitted:</strong> {formatDate(drop.submittedAt)}
                              </div>
                              {drop.approvedAt && (
                                <div>
                                  <strong>Reviewed:</strong> {formatDate(drop.approvedAt)} by {drop.approvedBy || 'Unknown'}
                                </div>
                              )}
                            </div>
                            
                            {drop.notes && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                                <strong>Notes:</strong> {drop.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDropReview(drop)}
                              className="border-blue-200 text-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bin Management Tab */}
        {activeTab === 'bins' && (
          <BinManagement />
        )}

        {/* Treasury Management Tab */}
        {activeTab === 'treasury' && (
          <TreasuryManagement adminId={admin.username} />
        )}

        {activeTab === 'stats' && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Detailed Statistics</CardTitle>
              <CardDescription>System performance and usage analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced statistics coming soon...</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Drop Review Modal */}
      {selectedDrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-blue-800">Review Drop #{selectedDrop.id}</CardTitle>
              <CardDescription>
                Submitted by {selectedDrop.userEmail} on {formatDate(selectedDrop.submittedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Item Photo
                </Label>
                {selectedDrop.photo ? (
                  selectedDrop.photo.includes('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD') ? (
                    <div className="w-full max-w-md mx-auto h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 mb-2">Photo submitted</p>
                        <p className="text-xs text-gray-400">(Photo data stored for MVP)</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={selectedDrop.photo}
                      alt="E-waste item"
                      className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="w-full max-w-md mx-auto h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No photo available</p>
                  </div>
                )}
              </div>

              {/* Drop Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Item Type</Label>
                  <p className="text-gray-600">
                    {riskLevelNames[selectedDrop.itemType as keyof typeof riskLevelNames]}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                  <p className="text-gray-600">{selectedDrop.itemDescription}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Estimated Tokens</Label>
                  <p className="text-gray-600">{selectedDrop.estimatedTokens} ADA</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Bin Location</Label>
                  <p className="text-gray-600">{selectedDrop.binId}</p>
                </div>
              </div>

              {/* Review Form */}
              {selectedDrop.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="reviewTokens" className="text-sm font-semibold text-gray-700">
                      Actual ADA Tokens to Award
                    </Label>
                    <Input
                      id="reviewTokens"
                      type="number"
                      step="0.1"
                      min="0"
                      value={reviewTokens}
                      onChange={(e) => setReviewTokens(e.target.value)}
                      className="mt-1"
                      placeholder="Enter token amount"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reviewNotes" className="text-sm font-semibold text-gray-700">
                      Admin Notes (optional)
                    </Label>
                    <Textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="mt-1"
                      placeholder="Add any notes about this review..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleDropReview(selectedDrop.id, 'approve')}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Processing...' : 'Approve Drop'}
                    </Button>
                    <Button
                      onClick={() => handleDropReview(selectedDrop.id, 'reject')}
                      disabled={isSubmitting}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Processing...' : 'Reject Drop'}
                    </Button>
                    <Button
                      onClick={() => setSelectedDrop(null)}
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Already reviewed */}
              {selectedDrop.status !== 'pending' && (
                <div className="border-t pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Review Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <strong>Status:</strong> {selectedDrop.status.charAt(0).toUpperCase() + selectedDrop.status.slice(1)}
                      </div>
                      <div>
                        <strong>Reviewed by:</strong> {selectedDrop.approvedBy || 'Unknown'}
                      </div>
                      <div>
                        <strong>Review date:</strong> {selectedDrop.approvedAt && formatDate(selectedDrop.approvedAt)}
                      </div>
                      {selectedDrop.actualTokens !== null && (
                        <div>
                          <strong>Tokens awarded:</strong> {selectedDrop.actualTokens} ADA
                        </div>
                      )}
                      {selectedDrop.notes && (
                        <div>
                          <strong>Notes:</strong> {selectedDrop.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setSelectedDrop(null)} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
