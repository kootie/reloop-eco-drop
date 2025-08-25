import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

// Get all drops for admin review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Get drops from Supabase database
    let query = getSupabaseClient()
      .from("drops")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: filteredDrops, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      drops: filteredDrops || [],
      total: filteredDrops?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching drops:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch drops." },
      { status: 500 },
    );
  }
}

// Approve or reject a drop
export async function PUT(request: NextRequest) {
  try {
    const { action, dropId, actualTokens, notes, adminUsername } =
      await request.json();

    if (!action || !dropId || !adminUsername) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: action, dropId, adminUsername",
        },
        { status: 400 },
      );
    }

    // Get the drop details first
    const { data: drop, error: dropError } = await getSupabaseClient()
      .from("drops")
      .select("*")
      .eq("drop_id", dropId)
      .single();

    if (dropError || !drop) {
      return NextResponse.json(
        { success: false, error: "Drop not found" },
        { status: 404 },
      );
    }

    // Type assertion for drop data
    const dropData = drop as { user_id: string; [key: string]: unknown };

    let updatedDrop = null;
    let paymentResult: {
      success: boolean;
      txHash?: string;
      error?: string;
    } | null = null;

    if (action === "approve") {
      if (!actualTokens || actualTokens <= 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Actual tokens amount is required and must be greater than 0",
          },
          { status: 400 },
        );
      }

      // Get user's Cardano address from the drop or user table
      const { data: user, error: userError } = await getSupabaseClient()
        .from("users")
        .select("cardano_address")
        .eq("user_id", dropData.user_id)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 },
        );
      }

      // Type assertion for user data
      const userData = user as { cardano_address: string };

      if (!userData.cardano_address) {
        return NextResponse.json(
          {
            success: false,
            error:
              "User Cardano address not found. User must connect their Eternl wallet first.",
          },
          { status: 400 },
        );
      }

      // Process ADA payment from treasury to user's wallet
      try {
        // Import treasury service
        const { treasuryService } = await import("@/lib/treasury-service");

        // Check treasury balance before processing
        const treasuryBalance = await treasuryService.getTreasuryBalance();
        if (treasuryBalance.ada < actualTokens) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient treasury balance: ${treasuryBalance.ada} ADA available, ${actualTokens} ADA required. Please fund the treasury first.`,
            },
            { status: 400 },
          );
        }

        // Process payout from treasury
        paymentResult = await treasuryService.processPayout(
          dropId,
          userData.cardano_address,
          actualTokens,
          dropData.user_id,
        );

        if (!paymentResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: `Treasury payout failed: ${paymentResult.error}`,
            },
            { status: 500 },
          );
        }
      } catch (paymentError) {
        console.error("Treasury payment error:", paymentError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to process treasury payout to user wallet",
          },
          { status: 500 },
        );
      }

      // Update drop status in database
      const { data: updatedDropData, error: updateError } =
        await getSupabaseClient()
          .from("drops")
          .update({
            status: "approved",
            actual_tokens: actualTokens,
            approved_at: new Date().toISOString(),
            approved_by: adminUsername,
            notes: notes || "",
            payment_status: "completed",
            payment_tx_hash: paymentResult.txHash,
            paid_at: new Date().toISOString(),
          })
          .eq("drop_id", dropId)
          .select()
          .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to update drop status" },
          { status: 500 },
        );
      }

      updatedDrop = updatedDropData;
    } else if (action === "reject") {
      const { data: updatedDropData, error: updateError } =
        await getSupabaseClient()
          .from("drops")
          .update({
            status: "rejected",
            actual_tokens: 0,
            approved_at: new Date().toISOString(),
            approved_by: adminUsername,
            notes: notes || "Drop rejected by admin",
          })
          .eq("drop_id", dropId)
          .select()
          .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to update drop status" },
          { status: 500 },
        );
      }

      updatedDrop = updatedDropData;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "approve" or "reject"',
        },
        { status: 400 },
      );
    }

    // Add notification to database
    const { error: notificationError } = await getSupabaseClient()
      .from("notifications")
      .insert({
        user_id: dropData.user_id,
        type: action === "approve" ? "drop_approved" : "drop_rejected",
        title: action === "approve" ? "Drop Approved!" : "Drop Rejected",
        message:
          action === "approve"
            ? `Your drop has been approved! You earned ${actualTokens} ADA.`
            : `Your drop was rejected. ${notes || "No reason provided."}`,
        data: {
          drop_id: dropId,
          action,
          actual_tokens: actualTokens,
          admin_username: adminUsername,
        },
        created_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.warn("Failed to create notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: `Drop ${action}d successfully`,
      drop: updatedDrop,
      paymentResult: action === "approve" ? paymentResult : null,
    });
  } catch (error) {
    console.error("Error processing drop action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process drop action" },
      { status: 500 },
    );
  }
}
