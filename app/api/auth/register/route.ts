import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and full name are required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const timestamp = Date.now();
    const userId = `user_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

    // Create user in database
    const newUser = await UserService.create({
      user_id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      // Cardano address will be set when user connects wallet
      cardano_address: null,
      wallet_type: "eternl",
      network: "testnet",
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.user_id,
        email: newUser.email,
        role: "user",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        userId: newUser.user_id,
        email: newUser.email,
        fullName: newUser.full_name,
        cardanoAddress: newUser.cardano_address,
        walletType: newUser.wallet_type,
        network: newUser.network,
        currentBalanceAda: newUser.current_balance_ada,
        totalEarnedAda: newUser.total_earned_ada,
        pendingRewardsAda: newUser.pending_rewards_ada,
        totalDrops: newUser.total_drops,
        successfulDrops: newUser.successful_drops,
        isVerified: newUser.is_verified,
      },
      token,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Registration failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
