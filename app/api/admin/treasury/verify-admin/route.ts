import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Verify admin wallet authorization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, adminId } = body

    if (!walletAddress || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', adminId)
      .eq('role', 'admin')
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access' },
        { status: 403 }
      )
    }

    // Check if wallet is authorized for this admin
    const { data: adminWallet, error: walletError } = await supabase
      .from('admin_wallets')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('admin_id', adminId)
      .eq('is_active', true)
      .single()

    if (walletError || !adminWallet) {
      // If no admin wallet record exists, create one (first time setup)
      const { error: insertError } = await supabase
        .from('admin_wallets')
        .insert({
          admin_id: adminId,
          wallet_address: walletAddress,
          wallet_type: 'eternl', // Default, can be updated
          is_active: true,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Failed to create admin wallet record:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to authorize admin wallet' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Admin wallet authorized successfully',
        newlyAuthorized: true
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin wallet already authorized',
      newlyAuthorized: false
    })

  } catch (error) {
    console.error('Error verifying admin wallet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify admin wallet.' },
      { status: 500 }
    )
  }
}
