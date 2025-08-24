import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all drops for admin review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Get drops from Supabase database
    let query = supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: filteredDrops, error } = await query
    if (error) throw error

    return NextResponse.json({
      success: true,
      drops: filteredDrops || [],
      total: filteredDrops?.length || 0
    })

  } catch (error) {
    console.error('Error fetching drops:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drops.' },
      { status: 500 }
    )
  }
}

// Approve or reject a drop
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { dropId, action, actualTokens, notes, adminUsername } = body

    if (!dropId || !action || !adminUsername) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the drop details first
    const { data: drop, error: dropError } = await supabase
      .from('drops')
      .select('*')
      .eq('drop_id', dropId)
      .single()

    if (dropError || !drop) {
      return NextResponse.json(
        { success: false, error: 'Drop not found' },
        { status: 404 }
      )
    }

    let updatedDrop
    let paymentResult = null
    
    if (action === 'approve') {
      if (actualTokens === undefined || actualTokens < 0) {
        return NextResponse.json(
          { success: false, error: 'Valid token amount required for approval' },
          { status: 400 }
        )
      }

      // Get user's Cardano address from the drop or user table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('cardano_address')
        .eq('user_id', drop.user_id)
        .single()

      if (userError || !user?.cardano_address) {
        return NextResponse.json(
          { success: false, error: 'User Cardano address not found. User must connect their Eternl wallet first.' },
          { status: 400 }
        )
      }

      // Process ADA payment from treasury to user's wallet
      try {
        // Import treasury service
        const { treasuryService } = await import('@/lib/treasury-service')
        
        // Check treasury balance before processing
        const treasuryBalance = await treasuryService.getTreasuryBalance()
        if (treasuryBalance.ada < actualTokens) {
          return NextResponse.json(
            { success: false, error: `Insufficient treasury balance: ${treasuryBalance.ada} ADA available, ${actualTokens} ADA required. Please fund the treasury first.` },
            { status: 400 }
          )
        }

        // Process payout from treasury
        paymentResult = await treasuryService.processPayout(
          dropId,
          user.cardano_address,
          actualTokens,
          drop.user_id
        )

        if (!paymentResult.success) {
          return NextResponse.json(
            { success: false, error: `Treasury payout failed: ${paymentResult.error}` },
            { status: 500 }
          )
        }
      } catch (paymentError) {
        console.error('Treasury payment error:', paymentError)
        return NextResponse.json(
          { success: false, error: 'Failed to process treasury payout to user wallet' },
          { status: 500 }
        )
      }
      
      // Update drop status in database
      const { data: updatedDropData, error: updateError } = await supabase
        .from('drops')
        .update({
          status: 'approved',
          actual_tokens: actualTokens,
          approved_at: new Date().toISOString(),
          approved_by: adminUsername,
          notes: notes || '',
          payment_status: 'completed',
          payment_tx_hash: paymentResult.txHash,
          paid_at: new Date().toISOString()
        })
        .eq('drop_id', dropId)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update drop status' },
          { status: 500 }
        )
      }

      updatedDrop = updatedDropData
      
    } else if (action === 'reject') {
      const { data: updatedDropData, error: updateError } = await supabase
        .from('drops')
        .update({
          status: 'rejected',
          actual_tokens: 0,
          approved_at: new Date().toISOString(),
          approved_by: adminUsername,
          notes: notes || 'Drop rejected by admin'
        })
        .eq('drop_id', dropId)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update drop status' },
          { status: 500 }
        )
      }

      updatedDrop = updatedDropData
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Send notification to user
    const notificationType = action === 'approve' ? 'drop_approved' : 'drop_rejected'
    const notificationMessage = action === 'approve' 
      ? `Your drop has been approved! ${actualTokens} ADA tokens have been sent to your Eternl wallet. Transaction: ${paymentResult?.txHash}`
      : `Your drop has been rejected. ${updatedDrop.notes}`

    // Add notification to database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: updatedDrop.user_id,
        user_email: updatedDrop.user_email,
        type: notificationType,
        title: `Drop ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: notificationMessage,
        read: false,
        created_at: new Date().toISOString(),
        drop_id: updatedDrop.drop_id
      })

    if (notificationError) {
      console.error('Notification error:', notificationError)
      // Don't fail the request for notification errors
    }

    return NextResponse.json({
      success: true,
      drop: updatedDrop,
      payment: paymentResult ? {
        txHash: paymentResult.txHash,
        amount: actualTokens
      } : null,
      message: `Drop ${action}ed successfully${action === 'approve' ? ' and ADA payment sent' : ''}`
    })

  } catch (error) {
    console.error('Error updating drop:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update drop.' },
      { status: 500 }
    )
  }
}


