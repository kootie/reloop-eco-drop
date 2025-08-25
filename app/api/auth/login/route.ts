import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await UserService.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Update last login
    await UserService.updateLastLogin(user.user_id);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: "user",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        cardanoAddress: user.cardano_address,
        walletType: user.wallet_type,
        network: user.network,
        currentBalanceAda: user.current_balance_ada,
        totalEarnedAda: user.total_earned_ada,
        pendingRewardsAda: user.pending_rewards_ada,
        totalDrops: user.total_drops,
        successfulDrops: user.successful_drops,
        isVerified: user.is_verified,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
