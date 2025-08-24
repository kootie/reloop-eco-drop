import { supabase } from './supabase'

// Database service for managing drops and users
export class Database {
  static async connect() {
    // Supabase connection is handled in supabase.ts
    return supabase
  }
}

// Drop service for managing e-waste drop submissions
export class DropService {
  // Get approved drops ready for payment
  static async getApprovedDropsForPayment(maxDrops: number = 50) {
    try {
      const { data: drops, error } = await supabase
        .from('drops')
        .select(`
          drop_id,
          user_identifier,
          cardano_address,
          actual_reward_ada,
          status,
          approved_at,
          approved_by
        `)
        .eq('status', 'approved')
        .is('payment_tx_hash', null) // Not yet paid
        .order('approved_at', { ascending: true })
        .limit(maxDrops)

      if (error) throw error
      return drops || []
    } catch (error) {
      console.error('Error fetching approved drops:', error)
      return []
    }
  }

  // Mark drops as paid
  static async markAsPaid(dropIds: string[], txHash: string, batchId: string) {
    try {
      const { error } = await supabase
        .from('drops')
        .update({
          payment_tx_hash: txHash,
          payment_batch_id: batchId,
          paid_at: new Date().toISOString(),
          payment_status: 'completed'
        })
        .in('drop_id', dropIds)

      if (error) throw error
      console.log(`✅ Marked ${dropIds.length} drops as paid with TX: ${txHash}`)
    } catch (error) {
      console.error('Error marking drops as paid:', error)
      throw error
    }
  }

  // Get drop by ID
  static async getDropById(dropId: string) {
    try {
      const { data: drop, error } = await supabase
        .from('drops')
        .select('*')
        .eq('drop_id', dropId)
        .single()

      if (error) throw error
      return drop
    } catch (error) {
      console.error('Error fetching drop:', error)
      return null
    }
  }

  // Update drop status
  static async updateDropStatus(dropId: string, status: string, adminUsername?: string, notes?: string) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString()
        updateData.approved_by = adminUsername
      } else if (status === 'rejected') {
        updateData.rejected_at = new Date().toISOString()
        updateData.rejected_by = adminUsername
      }

      if (notes) {
        updateData.admin_notes = notes
      }

      const { error } = await supabase
        .from('drops')
        .update(updateData)
        .eq('drop_id', dropId)

      if (error) throw error
      console.log(`✅ Updated drop ${dropId} status to ${status}`)
    } catch (error) {
      console.error('Error updating drop status:', error)
      throw error
    }
  }
}

// User service for managing user data and balances
export class UserService {
  // Process payment for a user
  static async processPayment(userId: string, amountADA: number) {
    try {
      // Get current user balance
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('total_earned_ada, pending_balance_ada')
        .eq('user_identifier', userId)
        .single()

      if (fetchError) throw fetchError

      const currentTotal = user?.total_earned_ada || 0
      const currentPending = user?.pending_balance_ada || 0

      // Update user balance
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_earned_ada: currentTotal + amountADA,
          pending_balance_ada: Math.max(0, currentPending - amountADA),
          last_payment_at: new Date().toISOString()
        })
        .eq('user_identifier', userId)

      if (updateError) throw updateError
      console.log(`✅ Updated user ${userId} balance: +${amountADA} ADA`)
    } catch (error) {
      console.error('Error processing user payment:', error)
      throw error
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_identifier', userId)
        .single()

      if (error) throw error
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  // Get user by Cardano address
  static async getUserByAddress(cardanoAddress: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('cardano_address', cardanoAddress)
        .single()

      if (error) throw error
      return user
    } catch (error) {
      console.error('Error fetching user by address:', error)
      return null
    }
  }

  // Update user wallet address
  static async updateUserWallet(userId: string, cardanoAddress: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          cardano_address: cardanoAddress,
          wallet_connected_at: new Date().toISOString()
        })
        .eq('user_identifier', userId)

      if (error) throw error
      console.log(`✅ Updated user ${userId} wallet address`)
    } catch (error) {
      console.error('Error updating user wallet:', error)
      throw error
    }
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    try {
      const { data: drops, error: dropsError } = await supabase
        .from('drops')
        .select('status, actual_reward_ada')
        .eq('user_identifier', userId)

      if (dropsError) throw dropsError

      const stats = {
        totalDrops: drops?.length || 0,
        approvedDrops: drops?.filter(d => d.status === 'approved').length || 0,
        pendingDrops: drops?.filter(d => d.status === 'pending').length || 0,
        rejectedDrops: drops?.filter(d => d.status === 'rejected').length || 0,
        totalEarned: drops?.reduce((sum, d) => sum + (d.actual_reward_ada || 0), 0) || 0
      }

      return stats
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        totalDrops: 0,
        approvedDrops: 0,
        pendingDrops: 0,
        rejectedDrops: 0,
        totalEarned: 0
      }
    }
  }
}

export default {
  Database,
  DropService,
  UserService
}
