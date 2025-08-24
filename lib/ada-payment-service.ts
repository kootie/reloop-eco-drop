import { Lucid, Blockfrost, TxHash } from 'lucid-cardano'
import { DropService, UserService } from './database'
import crypto from 'crypto'

// ADA Payment Service for sending rewards to users
export class ADAPaymentService {
  private lucid: Lucid | null = null
  private isInitialized = false

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

      // Select backend wallet for sending payments
      this.lucid.selectWalletFromSeed(process.env.BACKEND_WALLET_SEED)
      this.isInitialized = true

      // Verify wallet has funds
      const balance = await this.getBackendBalance()
      console.log(`✅ ADA Payment Service initialized for Cardano testnet`)
      console.log(`💰 Backend wallet balance: ${balance.ada} ADA`)
      
      if (balance.ada < 10) {
        console.warn(`⚠️ Low balance: ${balance.ada} ADA. Consider adding more testnet ADA`)
      }
    } catch (error) {
      console.error('❌ Failed to initialize ADA Payment Service:', error)
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

  // Get backend wallet balance from Cardano testnet
  async getBackendBalance(): Promise<{ ada: number; lovelace: bigint }> {
    await this.ensureInitialized()
    
    if (!this.lucid) {
      // Demo mode - return simulated balance
      return {
        ada: 1000, // Demo balance: 1000 ADA
        lovelace: 1000_000_000n
      }
    }

    const utxos = await this.lucid.wallet.getUtxos()
    
    let totalLovelace = 0n
    utxos.forEach(utxo => {
      totalLovelace += BigInt(utxo.assets.lovelace || 0)
    })

    return {
      ada: Number(totalLovelace) / 1_000_000,
      lovelace: totalLovelace
    }
  }

  // Send ADA to a single recipient on Cardano testnet
  async sendADA(
    recipientAddress: string, 
    amountADA: number, 
    memo?: string
  ): Promise<TxHash> {
    await this.ensureInitialized()
    
    try {
      const lovelaceAmount = Math.floor(amountADA * 1_000_000)
      
      if (lovelaceAmount < 1_000_000) { // Minimum 1 ADA
        throw new Error('Minimum payment amount is 1 ADA')
      }

      if (!this.lucid) {
        // Demo mode - generate realistic transaction hash
        const txHash = `tx_${crypto.randomBytes(32).toString('hex')}`
        console.log(`✅ [DEMO] Sent ${amountADA} ADA to ${recipientAddress}, TX: ${txHash}`)
        console.log(`📝 Memo: ${memo || 'No memo'}`)
        return txHash
      }

      // Build transaction
      let tx = this.lucid
        .newTx()
        .payToAddress(recipientAddress, { lovelace: BigInt(lovelaceAmount) })

      // Add memo if provided
      if (memo) {
        tx = tx.attachMetadata(674, { msg: [memo] })
      }

      // Complete and sign transaction
      const completeTx = await tx.complete()
      const signedTx = await completeTx.sign().complete()
      const txHash = await signedTx.submit()

      console.log(`✅ Sent ${amountADA} ADA to ${recipientAddress} on testnet, TX: ${txHash}`)
      console.log(`📝 Memo: ${memo || 'No memo'}`)
      
      return txHash
    } catch (error) {
      console.error(`❌ Failed to send ADA to ${recipientAddress}:`, error)
      throw error
    }
  }

  // Send ADA to multiple recipients in a single transaction on Cardano testnet
  async sendBatchADA(
    payments: Array<{
      address: string
      amount: number
      userId?: string
      memo?: string
    }>
  ): Promise<{ txHash: TxHash; totalAmount: number; recipientCount: number }> {
    await this.ensureInitialized()
    
    try {
      if (payments.length === 0) {
        throw new Error('No payments to process')
      }

      if (payments.length > 50) {
        throw new Error('Maximum 50 recipients per batch transaction')
      }

      if (!this.lucid) {
        // Demo mode - generate realistic transaction hash
        const txHash = `tx_${crypto.randomBytes(32).toString('hex')}`
        let totalADA = 0
        
        for (const payment of payments) {
          const lovelaceAmount = Math.floor(payment.amount * 1_000_000)
          if (lovelaceAmount >= 1_000_000) {
            totalADA += payment.amount
          }
        }
        
        console.log(`✅ [DEMO] Batch payment: ${totalADA} ADA to ${payments.length} recipients, TX: ${txHash}`)
        return {
          txHash,
          totalAmount: totalADA,
          recipientCount: payments.length
        }
      }

      let tx = this.lucid.newTx()
      let totalLovelace = 0n
      let totalADA = 0

      // Add each payment to the transaction
      for (const payment of payments) {
        const lovelaceAmount = Math.floor(payment.amount * 1_000_000)
        
        if (lovelaceAmount < 1_000_000) {
          console.warn(`Skipping payment to ${payment.address}: amount ${payment.amount} ADA is below minimum`)
          continue
        }

        tx = tx.payToAddress(payment.address, { lovelace: BigInt(lovelaceAmount) })
        totalLovelace += BigInt(lovelaceAmount)
        totalADA += payment.amount
      }

      if (totalLovelace === 0n) {
        throw new Error('No valid payments to process')
      }

      // Add metadata with payment summary
      const metadata = {
        type: 'reloop_batch_payment',
        total_recipients: payments.length,
        total_amount_ada: totalADA,
        timestamp: new Date().toISOString(),
        description: 'E-waste recycling rewards batch payment'
      }
      tx = tx.attachMetadata(674, metadata)

      // Complete and sign transaction
      const completeTx = await tx.complete()
      const signedTx = await completeTx.sign().complete()
      const txHash = await signedTx.submit()

      console.log(`✅ Batch payment completed on testnet: ${totalADA} ADA to ${payments.length} recipients, TX: ${txHash}`)
      
      return {
        txHash,
        totalAmount: totalADA,
        recipientCount: payments.length
      }
    } catch (error) {
      console.error('❌ Failed to process batch payment:', error)
      throw error
    }
  }

  // Process approved drops and send payments
  async processApprovedDrops(maxDrops: number = 50): Promise<{
    success: boolean
    processedDrops: number
    totalPaid: number
    txHash?: string
    batchId: string
    errors: string[]
  }> {
    const errors: string[] = []
    const batchId = `batch_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
    
    try {
      // Get approved drops ready for payment
      const approvedDrops = await DropService.getApprovedDropsForPayment(maxDrops)
      
      if (approvedDrops.length === 0) {
        return {
          success: true,
          processedDrops: 0,
          totalPaid: 0,
          batchId,
          errors: ['No approved drops ready for payment']
        }
      }

      // Check backend wallet balance
      const backendBalance = await this.getBackendBalance()
      const totalRequired = approvedDrops.reduce((sum, drop) => sum + (drop.actual_reward_ada || 0), 0)
      
      if (backendBalance.ada < totalRequired + 5) { // Keep 5 ADA buffer for fees
        throw new Error(`Insufficient backend balance: ${backendBalance.ada} ADA available, ${totalRequired} ADA required`)
      }

      // Group payments by user (in case user has multiple approved drops)
      const userPayments = new Map<string, {
        address: string
        amount: number
        dropIds: string[]
        userId: string
      }>()

      for (const drop of approvedDrops) {
        const key = drop.cardano_address
        if (userPayments.has(key)) {
          const existing = userPayments.get(key)!
          existing.amount += drop.actual_reward_ada || 0
          existing.dropIds.push(drop.drop_id)
        } else {
          userPayments.set(key, {
            address: drop.cardano_address,
            amount: drop.actual_reward_ada || 0,
            dropIds: [drop.drop_id],
            userId: drop.user_identifier
          })
        }
      }

      // Prepare batch payments
      const payments = Array.from(userPayments.values()).map(payment => ({
        address: payment.address,
        amount: payment.amount,
        userId: payment.userId,
        memo: `Reloop e-waste rewards: ${payment.dropIds.length} drops`
      }))

      // Send batch payment
      const result = await this.sendBatchADA(payments)

      // Update database: mark drops as paid
      const allDropIds = approvedDrops.map(drop => drop.drop_id)
      await DropService.markAsPaid(allDropIds, result.txHash, batchId)

      // Update user balances
      for (const payment of userPayments.values()) {
        await UserService.processPayment(payment.userId, payment.amount)
      }

      console.log(`✅ Processed ${approvedDrops.length} drops, paid ${result.totalAmount} ADA to ${result.recipientCount} users`)

      return {
        success: true,
        processedDrops: approvedDrops.length,
        totalPaid: result.totalAmount,
        txHash: result.txHash,
        batchId,
        errors
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMessage)
      console.error('❌ Failed to process approved drops:', error)

      return {
        success: false,
        processedDrops: 0,
        totalPaid: 0,
        batchId,
        errors
      }
    }
  }

  // Send individual reward payment (for immediate processing)
  async sendIndividualReward(
    dropId: string,
    recipientAddress: string,
    amountADA: number,
    userId: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const memo = `Reloop e-waste reward: Drop ${dropId}`
      const txHash = await this.sendADA(recipientAddress, amountADA, memo)
      
      // Update database
      await DropService.markAsPaid([dropId], txHash, `individual_${Date.now()}`)
      await UserService.processPayment(userId, amountADA)

      return { success: true, txHash }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Failed to send individual reward for drop ${dropId}:`, error)
      return { success: false, error: errorMessage }
    }
  }

  // Check transaction status on Cardano testnet
  async getTransactionStatus(txHash: string): Promise<{
    confirmed: boolean
    confirmations: number
    blockHeight?: number
  }> {
    const lucid = await this.ensureInitialized()
    
    try {
      // Query the actual transaction on Cardano testnet
      const tx = await lucid.provider.getTx(txHash)
      
      if (!tx) {
        return {
          confirmed: false,
          confirmations: 0
        }
      }

      // Get current block height for confirmation count
      const latestBlock = await lucid.provider.getLatestBlock()
      const confirmations = latestBlock ? latestBlock.height - tx.blockHeight : 0

      return {
        confirmed: true,
        confirmations,
        blockHeight: tx.blockHeight
      }
    } catch (error) {
      console.error(`Failed to get transaction status for ${txHash}:`, error)
      return {
        confirmed: false,
        confirmations: 0
      }
    }
  }

  // Validate if an address can receive ADA
  async validateRecipientAddress(address: string): Promise<{
    valid: boolean
    network: 'testnet' | 'mainnet'
    error?: string
  }> {
    try {
      if (!address || typeof address !== 'string') {
        return { valid: false, network: 'testnet', error: 'Invalid address format' }
      }

      // Basic Cardano address validation
      if (address.startsWith('addr_test1')) {
        return { valid: true, network: 'testnet' }
      } else if (address.startsWith('addr1')) {
        return { valid: true, network: 'mainnet' }
      } else {
        return { valid: false, network: 'testnet', error: 'Unsupported address format' }
      }
    } catch (error) {
      return { 
        valid: false, 
        network: 'testnet', 
        error: error instanceof Error ? error.message : 'Address validation failed' 
      }
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
    balance?: { ada: number; lovelace: bigint }
    error?: string
  } {
    return {
      mode: this.isRealMode() ? 'real' : 'demo',
      initialized: this.isInitialized,
      balance: this.lucid ? undefined : undefined // Will be fetched when needed
    }
  }
}

// Singleton instance
export const adaPaymentService = new ADAPaymentService()

export default adaPaymentService
