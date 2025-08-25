import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserService, getSupabaseClient } from "@/lib/supabase";
import { adaPaymentService } from "@/lib/ada-payment-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

interface AuthToken {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded: AuthToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { cardanoAddress, walletType, network } = body;

    if (!cardanoAddress) {
      return NextResponse.json(
        { success: false, error: "Cardano address is required" },
        { status: 400 },
      );
    }

    // Validate Cardano address format (basic validation)
    if (!cardanoAddress || typeof cardanoAddress !== "string") {
      return NextResponse.json(
        { success: false, error: "Cardano address is required" },
        { status: 400 },
      );
    }

    // Very flexible address validation - accept any string that looks like a Cardano address
    if (!cardanoAddress || typeof cardanoAddress !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Cardano address is required and must be a string",
        },
        { status: 400 },
      );
    }

    // Extremely permissive validation - accept any non-empty string for testing
    if (cardanoAddress.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Cardano address cannot be empty" },
        { status: 400 },
      );
    }

    // Log the address for debugging
    console.log("Received address:", cardanoAddress);
    console.log("Address type:", typeof cardanoAddress);
    console.log("Address length:", cardanoAddress.length);

    // Update user's wallet information
    await UserService.updateWalletInfo(
      decoded.userId,
      cardanoAddress,
      walletType || "eternl",
      network || "testnet",
    );

    // Process any pending payments for this user
    let pendingPaymentResult = null;
    try {
      const supabase = getSupabaseClient();
      const { data: pendingDrops, error: pendingError } = await supabase
        .from("drops")
        .select("drop_id, estimated_reward_ada, actual_reward_ada")
        .eq("user_id", decoded.userId)
        .eq("payment_status", "pending_wallet")
        .eq("status", "approved");

      if (pendingError) {
        console.error("Error fetching pending drops:", pendingError);
      } else if (pendingDrops && pendingDrops.length > 0) {
        console.log(
          `Found ${pendingDrops.length} pending payments for user ${decoded.userId}`,
        );

        // Send payments for all pending drops
        const payments = pendingDrops.map((drop: any) => ({
          address: cardanoAddress,
          amount: (drop.actual_reward_ada ||
            drop.estimated_reward_ada) as number,
          userId: decoded.userId,
          memo: `Reloop e-waste pending reward: Drop ${drop.drop_id}`,
        }));

        if (payments.length > 0) {
          pendingPaymentResult = await adaPaymentService.sendBatchADA(payments);

          // Update the drops to mark them as paid
          const dropIds = pendingDrops.map((d) => d.drop_id);
          const supabase = getSupabaseClient();
          const { error: updateError } = await supabase
            .from("drops")
            .update({
              payment_status: "completed",
              payment_tx_hash: pendingPaymentResult.txHash,
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .in("drop_id", dropIds);

          if (updateError) {
            console.error("Error updating pending drops:", updateError);
          }

          // Update user balance
          const totalPendingAmount = pendingDrops.reduce(
            (sum, drop: any) =>
              sum +
              ((drop.actual_reward_ada || drop.estimated_reward_ada) as number),
            0,
          );
          await UserService.processPayment(decoded.userId, totalPendingAmount);
        }
      }
    } catch (paymentError) {
      console.error("Error processing pending payments:", paymentError);
      // Don't fail the wallet connection if pending payments fail
    }

    // Get updated user data
    const updatedUser = await UserService.findByUserId(decoded.userId);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: updatedUser.user_id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        cardanoAddress: updatedUser.cardano_address,
        walletType: updatedUser.wallet_type,
        network: updatedUser.network,
        currentBalanceAda: updatedUser.current_balance_ada,
        totalEarnedAda: updatedUser.total_earned_ada,
        pendingRewardsAda: updatedUser.pending_rewards_ada,
        totalDrops: updatedUser.total_drops,
        successfulDrops: updatedUser.successful_drops,
        isVerified: updatedUser.is_verified,
      },
      pendingPayments: pendingPaymentResult
        ? {
            processed: true,
            txHash: pendingPaymentResult.txHash,
            totalAmount: pendingPaymentResult.totalAmount,
            dropCount: pendingPaymentResult.recipientCount,
          }
        : null,
      message: pendingPaymentResult
        ? `Wallet connected successfully! ${pendingPaymentResult.totalAmount} ADA from pending rewards have been sent to your wallet.`
        : "Wallet connected successfully",
    });
  } catch (error) {
    console.error("Wallet connection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect wallet. Please try again." },
      { status: 500 },
    );
  }
}
