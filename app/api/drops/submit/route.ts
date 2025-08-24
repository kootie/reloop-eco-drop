import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DropService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const userId = formData.get('userId') as string
    const binId = formData.get('binId') as string
    const itemType = formData.get('itemType') as string
    const itemDescription = formData.get('itemDescription') as string
    const photo = formData.get('photo') as File | null
    const userEmail = formData.get('userEmail') as string

    // Validate required fields
    if (!userId || !binId || !itemType || !itemDescription || !photo || !userEmail) {
      console.error('Missing required fields:', { userId, binId, itemType, itemDescription, hasPhoto: !!photo, userEmail })
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For MVP, store a small placeholder to indicate photo was submitted
    // In production, upload to storage and save only the URL.
    const photoPlaceholder = photo ? 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=' : null

    // Calculate estimated tokens based on item type (fixed rate per risk level)
    const riskLevelRates = {
      'level1': 0.5,
      'level2': 1.0,
      'level3': 1.5,
      'level4': 2.0,
      'level5': 2.5
    }
    
    const estimatedTokens = riskLevelRates[itemType as keyof typeof riskLevelRates] || 0.5

    // First, get the user's UUID from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { success: false, error: 'User not found. Please register first.' },
        { status: 404 }
      )
    }

    // Get a default device type (you might want to create this in the database)
    const { data: deviceType, error: deviceError } = await supabase
      .from('device_types')
      .select('id')
      .eq('device_code', itemType)
      .single()

    if (deviceError) {
      console.warn('⚠️ Device type not found, using default')
    }

    // Get the bin details from the database (support both UUID id and string bin_id)
    const { data: bin, error: binError } = await supabase
      .from('bins')
      .select('id, latitude, longitude, bin_id, qr_code')
      .or(`id.eq.${binId},bin_id.eq.${binId}`)
      .single()

    if (binError || !bin) {
      console.error('❌ Bin not found:', binError)
      return NextResponse.json(
        { success: false, error: 'Bin not found. Please select a valid bin.' },
        { status: 404 }
      )
    }

    // Create drop record in database
    const { data: drop, error } = await supabase
      .from('drops')
      .insert({
        drop_id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        bin_id: bin.id,
        device_type_id: deviceType?.id || '00000000-0000-0000-0000-000000000000', // Default UUID if device type not found
        user_latitude: bin.latitude, // Use bin location as user location for now
        user_longitude: bin.longitude,
        bin_latitude: bin.latitude,
        bin_longitude: bin.longitude,
        estimated_weight_kg: 1.0, // Default weight
        device_condition: 'working', // Default condition
        photo_url: photoPlaceholder, // Small placeholder for MVP
        estimated_reward_ada: parseFloat(estimatedTokens.toFixed(2)),
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      throw new Error('Failed to save drop to database')
    }

    console.log('✅ Drop submitted successfully:', drop.drop_id)

    return NextResponse.json({
      success: true,
      drop: {
        id: drop.drop_id,
        estimatedTokens: drop.estimated_reward_ada,
        status: drop.status,
        submittedAt: drop.submitted_at
      },
      message: 'Drop submitted successfully. Awaiting admin verification.'
    })

  } catch (error) {
    console.error('❌ Error submitting drop:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit drop. Please try again.' },
      { status: 500 }
    )
  }
}

// Get user's drops
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // First, get the user's UUID from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const { data: userDrops, error } = await supabase
      .from('drops')
      .select(`
        *,
        device_types(device_name, device_code),
        bins(bin_id, location_name)
      `)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user drops:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch drops' },
        { status: 500 }
      )
    }

    const formattedDrops = userDrops.map(drop => ({
      id: drop.drop_id,
      binId: drop.bins?.bin_id || 'Unknown',
      itemType: drop.device_types?.device_name || drop.device_type_id,
      itemDescription: drop.device_types?.device_name || 'Device',
      estimatedTokens: drop.estimated_reward_ada,
      actualTokens: drop.actual_reward_ada,
      status: drop.status,
      submittedAt: drop.submitted_at,
      approvedAt: drop.approved_at,
      notes: drop.admin_notes || ''
    }))

    return NextResponse.json({
      success: true,
      drops: formattedDrops,
      totalDrops: formattedDrops.length
    })

  } catch (error) {
    console.error('❌ Error fetching user drops:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drops.' },
      { status: 500 }
    )
  }
}
