import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  user_id: string
  email: string
  password_hash: string
  full_name?: string
  cardano_address?: string
  wallet_type?: string
  network?: string
  current_balance_ada: number
  total_earned_ada: number
  pending_rewards_ada: number
  total_drops: number
  successful_drops: number
  rejected_drops: number
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Drop {
  id: string
  drop_id: string
  user_id: string
  bin_id: string
  device_type_id: string
  user_latitude: number
  user_longitude: number
  bin_latitude: number
  bin_longitude: number
  distance_to_bin_meters: number
  estimated_weight_kg: number
  actual_weight_kg?: number
  quantity: number
  device_condition: string
  photo_url?: string
  photo_hash?: string
  estimated_reward_ada: number
  actual_reward_ada?: number
  reward_lovelace?: number
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'paid'
  admin_notes?: string
  rejection_reason?: string
  reviewed_by?: string
  reviewed_at?: string
  approved_by?: string
  approved_at?: string
  payment_status: 'pending' | 'processing' | 'completed' | 'failed'
  payment_tx_hash?: string
  payment_amount_ada?: number
  paid_at?: string
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface DeviceType {
  id: string
  device_code: string
  device_name: string
  category: string
  risk_level: number
  reward_ada: number
  reward_lovelace: number
  typical_weight_kg?: number
  contains_batteries: boolean
  contains_hazardous_materials: boolean
  is_active: boolean
}

export interface Bin {
  id: string
  bin_id: string
  qr_code: string
  latitude: number
  longitude: number
  address?: string
  location_name?: string
  city?: string
  country?: string
  bin_type: string
  capacity_kg: number
  current_weight_kg: number
  fill_percentage: number
  is_active: boolean
  is_operational: boolean
  total_drops: number
  total_weight_collected_kg: number
  total_rewards_distributed_ada: number
  created_at: string
  updated_at: string
}

// =============================================================================
// USER OPERATIONS
// =============================================================================

export class UserService {
  // Create a new user
  static async create(userData: {
    user_id: string
    email: string
    password_hash: string
    full_name?: string
    cardano_address?: string | null
    wallet_type?: string
    network?: string
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        user_id: userData.user_id,
        email: userData.email,
        password_hash: userData.password_hash,
        full_name: userData.full_name,
        cardano_address: userData.cardano_address,
        wallet_type: userData.wallet_type || 'eternl',
        network: userData.network || 'testnet'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Find user by user_id
  static async findByUserId(user_id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Find user by Cardano address
  static async findByAddress(cardano_address: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cardano_address', cardano_address)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update last login timestamp
  static async updateLastLogin(user_id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (error) throw error
  }

  // Update user's Cardano wallet information
  static async updateWalletInfo(
    user_id: string, 
    cardano_address: string, 
    wallet_type: string = 'eternl', 
    network: string = 'testnet'
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        cardano_address,
        wallet_type,
        network,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (error) throw error
  }

  // Update user balance and statistics
  static async updateBalanceAndStats(
    user_id: string, 
    reward_ada: number, 
    drop_approved: boolean = true
  ): Promise<void> {
    const user = await this.findByUserId(user_id)
    if (!user) throw new Error('User not found')

    const updates = {
      pending_rewards_ada: user.pending_rewards_ada + (drop_approved ? reward_ada : 0),
      total_earned_ada: user.total_earned_ada + (drop_approved ? reward_ada : 0),
      total_drops: user.total_drops + 1,
      successful_drops: drop_approved ? user.successful_drops + 1 : user.successful_drops,
      rejected_drops: drop_approved ? user.rejected_drops : user.rejected_drops + 1,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', user_id)

    if (error) throw error
  }

  // Process payment (move from pending to current balance)
  static async processPayment(user_id: string, amount_ada: number): Promise<void> {
    const user = await this.findByUserId(user_id)
    if (!user) throw new Error('User not found')
    
    if (user.pending_rewards_ada < amount_ada) {
      throw new Error('Insufficient pending rewards')
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        current_balance_ada: user.current_balance_ada + amount_ada,
        pending_rewards_ada: user.pending_rewards_ada - amount_ada,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (error) throw error
  }

  // Get all users with pending rewards above threshold
  static async getUsersWithPendingRewards(min_amount_ada: number = 1.0): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .gte('pending_rewards_ada', min_amount_ada)
      .eq('is_active', true)
      .order('pending_rewards_ada', { ascending: false })

    if (error) throw error
    return data
  }
}

// =============================================================================
// DROP OPERATIONS
// =============================================================================

export class DropService {
  // Create a new drop submission
  static async create(dropData: {
    drop_id: string
    user_id: string
    bin_id: string
    device_type_id: string
    user_latitude: number
    user_longitude: number
    bin_latitude: number
    bin_longitude: number
    distance_to_bin_meters: number
    estimated_weight_kg: number
    quantity: number
    device_condition: string
    photo_url?: string
    photo_hash?: string
    estimated_reward_ada: number
  }): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .insert([dropData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get pending drops for admin review
  static async getPendingDrops(limit: number = 50): Promise<Array<{
    drop_id: string
    user_id: string
    status: string
    submitted_at: string
    estimated_reward_ada: number
    users: { email: string; full_name: string; cardano_address: string | null; is_verified: boolean }
    device_types: { device_name: string; category: string }
    bins: { location_name: string }
  }>> {
    const { data, error } = await supabase
      .from('drops')
      .select(`
        *,
        users!inner(email, full_name, cardano_address, is_verified),
        device_types!inner(device_name, category),
        bins!inner(location_name)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Approve a drop and calculate final reward
  static async approve(
    drop_id: string, 
    admin_user_id: string, 
    actual_weight_kg: number,
    actual_reward_ada: number,
    admin_notes?: string
  ): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .update({
        status: 'approved',
        actual_weight_kg,
        actual_reward_ada,
        reward_lovelace: actual_reward_ada * 1_000_000,
        admin_notes,
        approved_by: admin_user_id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('drop_id', drop_id)
      .select()
      .single()

    if (error) throw error

    // Update user statistics
    await UserService.updateBalanceAndStats(data.user_id, actual_reward_ada, true)

    return data
  }

  // Reject a drop
  static async reject(
    drop_id: string, 
    admin_user_id: string, 
    rejection_reason: string,
    admin_notes?: string
  ): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .update({
        status: 'rejected',
        rejection_reason,
        admin_notes,
        reviewed_by: admin_user_id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('drop_id', drop_id)
      .select()
      .single()

    if (error) throw error

    // Update user statistics
    await UserService.updateBalanceAndStats(data.user_id, 0, false)

    return data
  }

  // Get approved drops ready for payment
  static async getApprovedDropsForPayment(limit: number = 100): Promise<Array<{
    drop_id: string
    user_id: string
    actual_reward_ada: number
    users: { cardano_address: string; user_id: string }
  }>> {
    const { data, error } = await supabase
      .from('drops')
      .select(`
        *,
        users!inner(cardano_address, user_id)
      `)
      .eq('status', 'approved')
      .eq('payment_status', 'pending')
      .order('approved_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Mark drops as paid
  static async markAsPaid(
    drop_ids: string[], 
    payment_tx_hash: string, 
    batch_id: string
  ): Promise<void> {
    const { error } = await supabase
      .from('drops')
      .update({
        payment_status: 'completed',
        payment_tx_hash,
        payment_amount_ada: supabase.raw('actual_reward_ada'),
        batch_id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('drop_id', drop_ids)

    if (error) throw error
  }
}

// =============================================================================
// DEVICE TYPE OPERATIONS
// =============================================================================

export class DeviceTypeService {
  // Get all active device types
  static async getActiveDeviceTypes(): Promise<DeviceType[]> {
    const { data, error } = await supabase
      .from('device_types')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('reward_ada')

    if (error) throw error
    return data
  }

  // Get device type by code
  static async getByCode(device_code: string): Promise<DeviceType | null> {
    const { data, error } = await supabase
      .from('device_types')
      .select('*')
      .eq('device_code', device_code)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// =============================================================================
// BIN OPERATIONS
// =============================================================================

export class BinService {
  // Get all active bins
  static async getActiveBins(): Promise<Bin[]> {
    const { data, error } = await supabase
      .from('bins')
      .select('*')
      .eq('is_active', true)
      .eq('is_operational', true)
      .order('location_name')

    if (error) throw error
    return data
  }

  // Find bin by QR code
  static async findByQRCode(qr_code: string): Promise<Bin | null> {
    const { data, error } = await supabase
      .from('bins')
      .select('*')
      .eq('qr_code', qr_code)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update bin statistics after a drop
  static async updateAfterDrop(
    bin_id: string, 
    weight_kg: number, 
    reward_ada: number
  ): Promise<void> {
    const bin = await this.findByQRCode(bin_id)
    if (!bin) throw new Error('Bin not found')

    const newWeight = bin.current_weight_kg + weight_kg
    const fillPercentage = Math.min(100, (newWeight * 100) / bin.capacity_kg)

    const { error } = await supabase
      .from('bins')
      .update({
        total_drops: bin.total_drops + 1,
        total_weight_collected_kg: bin.total_weight_collected_kg + weight_kg,
        current_weight_kg: newWeight,
        total_rewards_distributed_ada: bin.total_rewards_distributed_ada + reward_ada,
        fill_percentage: fillPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('bin_id', bin_id)

    if (error) throw error
  }
}
