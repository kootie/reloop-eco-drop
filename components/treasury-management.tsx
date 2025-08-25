'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  CheckCircle2,
  RefreshCw,
  Shield
} from 'lucide-react'

// Extend Window type for multiple wallet providers
declare global {
  interface Window {
    cardano?: {
      eternl?: {
        enable(): Promise<{ address: string; networkId: number }>
        isEnabled(): Promise<boolean>
        getBalance(): Promise<string>
        getUsedAddresses(): Promise<string[]>
        getUnusedAddresses(): Promise<string[]>
        getNetworkId(): Promise<number>
        signTx(tx: string): Promise<string>
        submitTx(tx: string): Promise<string>
        getUtxos(): Promise<Array<{ address: string; amount: string; assets: Record<string, string> }>>
      }
      nami?: {
        enable(): Promise<{ address: string; networkId: number }>
        isEnabled(): Promise<boolean>
        getBalance(): Promise<string>
        getUsedAddresses(): Promise<string[]>
        getUnusedAddresses(): Promise<string[]>
        getNetworkId(): Promise<number>
        signTx(tx: string): Promise<string>
        submitTx(tx: string): Promise<string>
        getUtxos(): Promise<Array<{ address: string; amount: string; assets: Record<string, string> }>>
      }
      lace?: {
        enable(): Promise<{ address: string; networkId: number }>
        isEnabled(): Promise<boolean>
        getBalance(): Promise<string>
        getUsedAddresses(): Promise<string[]>
        getUnusedAddresses(): Promise<string[]>
        getNetworkId(): Promise<number>
        signTx(tx: string): Promise<string>
        submitTx(tx: string): Promise<string>
        getUtxos(): Promise<Array<{ address: string; amount: string; assets: Record<string, string> }>>
      }
    }
  }
}

interface TreasuryInfo {
  balance: number
  totalFunded: number
  totalPaidOut: number
  pendingPayouts: number
  lastUpdated: string
}

interface AdminWalletInfo {
  address: string
  balance: number
  network: 'testnet' | 'mainnet'
  provider: 'eternl' | 'nami' | 'lace'
}

interface TreasuryManagementProps {
  adminId: string
}

export default function TreasuryManagement({ adminId }: TreasuryManagementProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [adminWallet, setAdminWallet] = useState<AdminWalletInfo | null>(null)
  const [treasuryInfo, setTreasuryInfo] = useState<TreasuryInfo | null>(null)
  const [fundAmount, setFundAmount] = useState<string>('')
  const [isFunding, setIsFunding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Available wallet providers
  const walletProviders = [
    { id: 'eternl', name: 'Eternl', icon: '🔷' },
    { id: 'nami', name: 'Nami', icon: '🔵' },
    { id: 'lace', name: 'Lace', icon: '🟣' }
  ]

  useEffect(() => {
    loadTreasuryInfo()
  }, [])

  const loadTreasuryInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/treasury/status')
      if (response.ok) {
        const data = await response.json()
        setTreasuryInfo(data.treasury)
      }
    } catch (error) {
      console.error('Failed to load treasury info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async (provider: 'eternl' | 'nami' | 'lace') => {
    if (!window.cardano?.[provider]) {
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} wallet not found. Please install the extension.`)
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const api = await window.cardano[provider].enable()
      
      // Get wallet addresses
      const usedAddresses = await api.getUsedAddresses()
      const unusedAddresses = await api.getUnusedAddresses()
      
      const addresses = [...usedAddresses, ...unusedAddresses]
      if (addresses.length === 0) {
        throw new Error('No addresses found in wallet')
      }

      const address = addresses[0]
      
      // Get network ID (0 = testnet, 1 = mainnet)
      const networkId = await api.getNetworkId()
      const network = networkId === 0 ? 'testnet' : 'mainnet'
      
      // Get balance
      const balanceHex = await api.getBalance()
      const balanceLovelace = parseInt(balanceHex, 16)
      const balanceAda = balanceLovelace / 1_000_000

      const walletData: AdminWalletInfo = {
        address,
        balance: balanceAda,
        network,
        provider
      }

      setAdminWallet(walletData)
      setIsConnected(true)
      
      // Verify admin role for this wallet
      await verifyAdminRole(address)
      
    } catch (err) {
      console.error('Failed to connect wallet:', err)
      setError(err instanceof Error ? err.message : `Failed to connect to ${provider} wallet`)
    } finally {
      setIsConnecting(false)
    }
  }

  const verifyAdminRole = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/admin/treasury/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, adminId })
      })

      const data = await response.json()
      if (!data.success) {
        setError('This wallet is not authorized as an admin wallet')
        setAdminWallet(null)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to verify admin role:', error)
      setError('Failed to verify admin role')
      setAdminWallet(null)
      setIsConnected(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAdminWallet(null)
    setError(null)
    setSuccess(null)
  }

  const fundTreasury = async () => {
    if (!adminWallet || !fundAmount) return

    const amount = parseFloat(fundAmount)
    if (amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > adminWallet.balance) {
      setError('Insufficient balance in your wallet')
      return
    }

    setIsFunding(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/treasury/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          adminWalletAddress: adminWallet.address,
          adminId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Successfully funded treasury with ${amount} ADA`)
        setFundAmount('')
        await loadTreasuryInfo()
        
        // Update local wallet balance
        setAdminWallet(prev => prev ? {
          ...prev,
          balance: prev.balance - amount
        } : null)
      } else {
        setError(data.error || 'Failed to fund treasury')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsFunding(false)
    }
  }

  const getWalletProviderIcon = (provider: string) => {
    const providerInfo = walletProviders.find(p => p.id === provider)
    return providerInfo ? providerInfo.icon : '🔷'
  }

  if (isLoading) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-600">Loading treasury information...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Treasury Overview */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Treasury Overview
          </CardTitle>
          <CardDescription>
            Monitor treasury balance and funding status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treasuryInfo ? (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">
                  {treasuryInfo.balance.toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">Current Balance (ADA)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-800">
                  {treasuryInfo.totalFunded.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Total Funded (ADA)</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-800">
                  {treasuryInfo.totalPaidOut.toFixed(2)}
                </div>
                <div className="text-sm text-purple-600">Total Paid Out (ADA)</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-800">
                  {treasuryInfo.pendingPayouts.toFixed(2)}
                </div>
                <div className="text-sm text-orange-600">Pending Payouts (ADA)</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Treasury information not available
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={loadTreasuryInfo} 
              variant="outline" 
              size="sm"
              className="border-blue-200 text-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Wallet Connection */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Admin Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your admin wallet to fund the treasury
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {walletProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    onClick={() => connectWallet(provider.id as 'eternl' | 'nami' | 'lace')}
                    disabled={isConnecting}
                    variant="outline"
                    className="h-20 flex-col gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <span className="text-sm font-medium">{provider.name}</span>
                  </Button>
                ))}
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Wallet Connected</span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">Provider:</span> {getWalletProviderIcon(adminWallet!.provider)} {adminWallet!.provider.charAt(0).toUpperCase() + adminWallet!.provider.slice(1)}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> 
                    <span className="font-mono text-xs ml-2 break-all">{adminWallet!.address}</span>
                  </div>
                  <div>
                    <span className="font-medium">Balance:</span> {adminWallet!.balance.toFixed(2)} ADA
                  </div>
                  <div>
                    <span className="font-medium">Network:</span> 
                    <Badge variant={adminWallet!.network === 'testnet' ? 'secondary' : 'default'} className="ml-2">
                      {adminWallet!.network}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button 
                onClick={disconnectWallet}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fund Treasury */}
      {isConnected && adminWallet && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Fund Treasury
            </CardTitle>
            <CardDescription>
              Send ADA from your admin wallet to the treasury smart contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fundAmount" className="text-sm font-medium text-gray-700">
                  Amount to Fund (ADA)
                </Label>
                <Input
                  id="fundAmount"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={adminWallet.balance}
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount in ADA"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available balance: {adminWallet.balance.toFixed(2)} ADA
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <Button
                onClick={fundTreasury}
                disabled={isFunding || !fundAmount || parseFloat(fundAmount) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isFunding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Funding Treasury...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Fund Treasury
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treasury Security Info */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Treasury Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Only authorized admin wallets can fund the treasury</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Smart contract automatically manages payouts to users</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>All transactions are recorded on the Cardano blockchain</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Insufficient treasury funds prevent new approvals</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
