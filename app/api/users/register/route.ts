import { NextRequest, NextResponse } from 'next/server'
import { generateSeedPhrase } from 'lucid-cardano'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId and email' },
        { status: 400 }
      )
    }

    // Generate unique userId with timestamp on server side
    const uniqueUserId = `${userId}_${Date.now()}`

    // Generate a new Cardano wallet address
    const seedPhrase = generateSeedPhrase()
    
    // For demo purposes, generate a mock Cardano address
    // In production, you would use actual Blockfrost API
    const mockCardanoAddress = `addr_test1q${Math.random().toString(36).substring(2, 50)}${Math.random().toString(36).substring(2, 10)}`

    // In a real application, you would save this to a database
    // For now, we'll just return the user data
    const userData = {
      userId: uniqueUserId,
      email,
      cardanoAddress: mockCardanoAddress,
      seedPhrase, // In production, this should be encrypted and stored securely
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: userData.userId,
        email: userData.email,
        cardanoAddress: mockCardanoAddress
      },
      message: 'User registered successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      },
      { status: 500 }
    )
  }
}
