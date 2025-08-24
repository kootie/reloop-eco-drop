import { Lucid, Blockfrost, TxHash, PolicyId, AssetName } from 'lucid-cardano'
import { supabase } from './supabase'

// Treasury Smart Contract Service for managing e-waste rewards
export class TreasuryService {
  private lucid: Lucid | null = null
  private isInitialized = false
  private treasuryAddress: string | null = null
  private treasuryPolicyId: PolicyId | null = null

  constructor() {
    this.initializeLucid()
  }

  // Initialize Lucid with backend wallet for Cardano testnet
  private async initializeLucid(): Promise<void> {
    try {
      if (!process.env.BACKEND_WALLET_SEED) {
        console.warn('⚠️ BACKEND_WALLET_SEED not set - using demo mode')
        this.isInitialized = true
        return
      }

      if (!process.env.BLOCKFROST_PROJECT_ID) {
        console.warn('⚠️ BLOCKFROST_PROJECT_ID not set - using demo mode')
        this.isInitialized = true
        return
      }

      // Initialize Lucid for Cardano testnet
      this.lucid = await Lucid.new(
        new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0",
          process.env.BLOCKFROST_PROJECT_ID
        ),
        "Preprod" // Cardano testnet
      )

      // Select backend wallet for treasury operations
      this.lucid.selectWalletFromSeed(process.env.BACKEND_WALLET_SEED)
      this.isInitialized = true

      // Set treasury address (this would be the smart contract address)
      this.treasuryAddress = process.env.TREASURY_ADDRESS || null
      
      console.log(`✅ Treasury Service initialized for Cardano testnet`)
      if (this.treasuryAddress) {
        console.log(`💰 Treasury address: ${this.treasuryAddress}`)
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Treasury Service:', error)
      console.warn('⚠️ Falling back to demo mode')
      this.isInitialized = true
    }
  }

  // Ensure Lucid is initialized before operations
  private async ensureInitialized(): Promise<Lucid> {
    if (!this.isInitialized || !this.lucid) {
      await this.initializeLucid()
    }
    return this.lucid!
  }

  // Get treasury balance from smart contract
  async getTreasuryBalance(): Promise<{
    ada: number
    lovelace: bigint
    lastUpdated: string
  }> {
    try {
      if (!this.lucid || !this.treasuryAddress) {
        // Demo mode - return simulated balance
        return {
          ada: 5000, // Demo balance: 5000 ADA
          lovelace: 5000_000_000n,
          lastUpdated: new Date().toISOString()
        }
      }

      // Query treasury UTXOs
      const utxos = await this.lucid.provider.getUtxos(this.treasuryAddress)
      
      let totalLovelace = 0n
      utxos.forEach(utxo => {
        totalLovelace += BigInt(utxo.assets.lovelace || 0)
      })

      return {
        ada: Number(totalLovelace) / 1_000_000,
        lovelace: totalLovelace,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get treasury balance:', error)
      throw error
    }
  }

  // Fund treasury from admin wallet
  async fundTreasury(
    amountADA: number,
    adminWalletAddress: string,
    adminId: string
  ): Promise<{
    success: boolean
    txHash?: string
    error?: string
  }> {
    try {
      if (!this.lucid || !this.treasuryAddress) {
        // Demo mode - simulate funding
        const txHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Update database
        await this.recordTreasuryFunding(amountADA, adminWalletAddress, adminId, txHash)
        
        console.log(`✅ [DEMO] Funded treasury with ${amountADA} ADA from ${adminWalletAddress}`)
        return { success: true, txHash }
      }

      // Verify admin role
      const isAdmin = await this.verifyAdminWallet(adminWalletAddress, adminId)
      if (!isAdmin) {
        return { success: false, error: 'Unauthorized admin wallet' }
      }

      // Check if admin wallet has sufficient funds
      const adminUtxos = await this.lucid.provider.getUtxos(adminWalletAddress)
      let adminBalance = 0n
      adminUtxos.forEach(utxo => {
        adminBalance += BigInt(utxo.assets.lovelace || 0)
      })

      const requiredLovelace = BigInt(Math.floor(amountADA * 1_000_000))
      if (adminBalance < requiredLovelace) {
        return { success: false, error: 'Insufficient balance in admin wallet' }
      }

      // Build funding transaction
      const lovelaceAmount = Math.floor(amountADA * 1_000_000)
      
      let tx = this.lucid
        .newTx()
        .payToAddress(this.treasuryAddress, { lovelace: BigInt(lovelaceAmount) })
        .attachMetadata(674, {
          type: 'treasury_funding',
          amount_ada: amountADA,
          admin_wallet: adminWalletAddress,
          admin_id: adminId,
          timestamp: new Date().toISOString()
        })

      // Complete and sign transaction
      const completeTx = await tx.complete()
      const signedTx = await completeTx.sign().complete()
      const txHash = await signedTx.submit()

      // Update database
      await this.recordTreasuryFunding(amountADA, adminWalletAddress, adminId, txHash)

      console.log(`✅ Funded treasury with ${amountADA} ADA, TX: ${txHash}`)
      return { success: true, txHash }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Failed to fund treasury:`, error)
      return { success: false, error: errorMessage }
    }
  }

  // Process payout from treasury to user
  async processPayout(
    dropId: string,
    recipientAddress: string,
    amountADA: number,
    userId: string
  ): Promise<{
    success: boolean
    txHash?: string
    error?: string
  }> {
    try {
      // Check treasury balance
      const treasuryBalance = await this.getTreasuryBalance()
      if (treasuryBalance.ada < amountADA) {
        return { 
          success: false, 
          error: `Insufficient treasury balance: ${treasuryBalance.ada} ADA available, ${amountADA} ADA required` 
        }
      }

      if (!this.lucid || !this.treasuryAddress) {
        // Demo mode - simulate payout
        const txHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Update database
        await this.recordTreasuryPayout(dropId, recipientAddress, amountADA, userId, txHash)
        
        console.log(`✅ [DEMO] Processed payout: ${amountADA} ADA to ${recipientAddress}`)
        return { success: true, txHash }
      }

      // Build payout transaction
      const lovelaceAmount = Math.floor(amountADA * 1_000_000)
      
      let tx = this.lucid
        .newTx()
        .payToAddress(recipientAddress, { lovelace: BigInt(lovelaceAmount) })
        .attachMetadata(674, {
          type: 'treasury_payout',
          drop_id: dropId,
          amount_ada: amountADA,
          recipient: recipientAddress,
          user_id: userId,
          timestamp: new Date().toISOString()
        })

      // Complete and sign transaction
      const completeTx = await tx.complete()
      const signedTx = await completeTx.sign().complete()
      const txHash = await signedTx.submit()

      // Update database
      await this.recordTreasuryPayout(dropId, recipientAddress, amountADA, userId, txHash)

      console.log(`✅ Processed treasury payout: ${amountADA} ADA to ${recipientAddress}, TX: ${txHash}`)
      return { success: true, txHash }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Failed to process treasury payout:`, error)
      return { success: false, error: errorMessage }
    }
  }

  // Get treasury statistics
  async getTreasuryStats(): Promise<{
    balance: number
    totalFunded: number
    totalPaidOut: number
    pendingPayouts: number
    lastUpdated: string
  }> {
    try {
      // Get current balance
      const balance = await this.getTreasuryBalance()
      
      // Get funding and payout statistics from database
      const { data: fundingStats } = await supabase
        .from('treasury_transactions')
        .select('amount_ada, type')
        .eq('type', 'funding')

      const { data: payoutStats } = await supabase
        .from('treasury_transactions')
        .select('amount_ada, type')
        .eq('type', 'payout')

      const { data: pendingDrops } = await supabase
        .from('drops')
        .select('actual_tokens')
        .eq('status', 'approved')
        .eq('payment_status', 'pending')

      const totalFunded = fundingStats?.reduce((sum, tx) => sum + (tx.amount_ada || 0), 0) || 0
      const totalPaidOut = payoutStats?.reduce((sum, tx) => sum + (tx.amount_ada || 0), 0) || 0
      const pendingPayouts = pendingDrops?.reduce((sum, drop) => sum + (drop.actual_tokens || 0), 0) || 0

      return {
        balance: balance.ada,
        totalFunded,
        totalPaidOut,
        pendingPayouts,
        lastUpdated: balance.lastUpdated
      }
    } catch (error) {
      console.error('Failed to get treasury stats:', error)
      throw error
    }
  }

  // Verify admin wallet authorization
  private async verifyAdminWallet(walletAddress: string, adminId: string): Promise<boolean> {
    try {
      const { data: admin, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .eq('wallet_address', walletAddress)
        .eq('admin_id', adminId)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to verify admin wallet:', error)
      return false
    }
  }

  // Record treasury funding transaction
  private async recordTreasuryFunding(
    amountADA: number,
    adminWalletAddress: string,
    adminId: string,
    txHash: string
  ): Promise<void> {
    try {
      await supabase
        .from('treasury_transactions')
        .insert({
          type: 'funding',
          amount_ada: amountADA,
          admin_wallet_address: adminWalletAddress,
          admin_id: adminId,
          tx_hash: txHash,
          status: 'completed',
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to record treasury funding:', error)
    }
  }

  // Record treasury payout transaction
  private async recordTreasuryPayout(
    dropId: string,
    recipientAddress: string,
    amountADA: number,
    userId: string,
    txHash: string
  ): Promise<void> {
    try {
      await supabase
        .from('treasury_transactions')
        .insert({
          type: 'payout',
          amount_ada: amountADA,
          recipient_address: recipientAddress,
          user_id: userId,
          drop_id: dropId,
          tx_hash: txHash,
          status: 'completed',
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to record treasury payout:', error)
    }
  }

  // Check if service is in real mode (not demo)
  isRealMode(): boolean {
    return this.lucid !== null && this.isInitialized
  }

  // Get service status
  getServiceStatus(): {
    mode: 'real' | 'demo'
    initialized: boolean
    treasuryAddress?: string
    error?: string
  } {
    return {
      mode: this.isRealMode() ? 'real' : 'demo',
      initialized: this.isInitialized,
      treasuryAddress: this.treasuryAddress || undefined
    }
  }
}

// Singleton instance
export const treasuryService = new TreasuryService()

export default treasuryService
