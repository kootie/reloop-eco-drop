import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getSupabaseClient, DropService, UserService } from "@/lib/supabase";
import { adaPaymentService } from "@/lib/ada-payment-service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

interface AuthToken {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    // Check if it's an admin token (simple token format: admin_timestamp_random)
    let userId = "admin";
    if (token.startsWith("admin_")) {
      // Simple admin token validation - for demo purposes
      console.log(
        "Admin token detected for batch approval:",
        token.substring(0, 20) + "...",
      );
      userId = "admin";
    } else {
      // Try to verify as JWT token for regular users
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthToken;
        userId = decoded.userId;
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 },
        );
      }
    }

    const body = await request.json();
    const { submissions, batchNotes, adminUsername } = body;

    // Log batch approval request for monitoring

    if (
      !submissions ||
      !Array.isArray(submissions) ||
      submissions.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Submissions array is required" },
        { status: 400 },
      );
    }

    // Validate submission data
    for (const submission of submissions) {
      if (
        !submission.dropId ||
        !submission.userId ||
        !submission.actualRewardAda
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid submission data" },
          { status: 400 },
        );
      }
    }

    const processedSubmissions: string[] = [];
    const processedUsers = new Set<string>();
    let totalAda = 0;
    const errors: string[] = [];
    const paymentResults: Array<{
      type: string;
      txHash: string;
      totalAmount: number;
      recipientCount: number;
    }> = [];

    // Get user Cardano addresses for all submissions
    const userIds = [...new Set(submissions.map((s) => s.userId))];
    const { data: users, error: usersError } = await getSupabaseClient()
      .from("users")
      .select("user_id, cardano_address")
      .in("user_id", userIds);

    if (usersError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch user wallet addresses" },
        { status: 500 },
      );
    }

    const userAddresses = new Map(
      users?.map((u) => [u.user_id, u.cardano_address]) || [],
    );

    // Check for users without Cardano addresses
    const usersWithoutAddresses = userIds.filter(
      (id) => !userAddresses.get(id),
    );
    if (usersWithoutAddresses.length > 0) {
      console.log(
        `Warning: ${usersWithoutAddresses.length} users without connected Eternl wallets`,
      );
    }

    // Process each submission
    for (const submission of submissions) {
      try {
        // First, get the admin user ID for proper tracking
        const adminUserId = userId;

        // Approve the drop in database
        await DropService.approve(
          submission.dropId,
          adminUserId,
          submission.actualWeightKg || 1.0,
          submission.actualRewardAda,
          batchNotes || `Batch approval by ${adminUsername}`,
        );

        processedSubmissions.push(submission.dropId);
        processedUsers.add(submission.userId);
        totalAda += submission.actualRewardAda;
      } catch {
        console.error(`Error processing submission ${submission.dropId}`);
        errors.push(`Failed to process ${submission.dropId}`);
      }
    }

    // Send batch ADA payment to users with connected wallets
    let batchPaymentResult = null;
    const pendingPayments = [];

    try {
      const payments = submissions
        .filter((s) => processedSubmissions.includes(s.dropId))
        .filter((submission) => userAddresses.get(submission.userId)) // Only users with wallets
        .map((submission) => ({
          address: userAddresses.get(submission.userId) as string,
          amount: submission.actualRewardAda,
          userId: submission.userId,
          memo: `Reloop e-waste batch reward: Drop ${submission.dropId}`,
        }));

      // Track pending payments for users without wallets
      const pendingSubmissions = submissions
        .filter((s) => processedSubmissions.includes(s.dropId))
        .filter((submission) => !userAddresses.get(submission.userId)) // Users without wallets
        .map((submission) => ({
          userId: submission.userId,
          dropId: submission.dropId,
          amount: submission.actualRewardAda,
          status: "pending",
        }));

      pendingPayments.push(...pendingSubmissions);

      if (payments.length > 0) {
        batchPaymentResult = await adaPaymentService.sendBatchADA(payments);
        paymentResults.push({
          type: "batch",
          txHash: batchPaymentResult.txHash,
          totalAmount: batchPaymentResult.totalAmount,
          recipientCount: batchPaymentResult.recipientCount,
        });
      }
    } catch (paymentError) {
      console.error("Batch payment error:", paymentError);
      errors.push(`Failed to send batch payment: ${paymentError}`);
    }

    // Create a batch record for payment processing
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const { error: batchError } = await getSupabaseClient()
        .from("payment_batches")
        .insert([
          {
            batch_id: batchId,
            total_drops: processedSubmissions.length,
            total_users: processedUsers.size,
            total_amount_ada: totalAda,
            total_amount_lovelace: Math.round(totalAda * 1_000_000),
            status: batchPaymentResult ? "completed" : "partial",
            processed_by: userId,
            tx_hash: batchPaymentResult?.txHash || null,
            processed_at: new Date().toISOString(),
            confirmed_at: batchPaymentResult ? new Date().toISOString() : null,
            pending_payments_count: pendingPayments.length,
          },
        ]);

      if (batchError) throw batchError;

      // Update drops with batch ID and payment status
      if (processedSubmissions.length > 0) {
        // Update drops for users with wallets (completed payments)
        const completedDrops = submissions
          .filter((s) => processedSubmissions.includes(s.dropId))
          .filter((submission) => userAddresses.get(submission.userId))
          .map((s) => s.dropId);

        if (completedDrops.length > 0) {
          const { error: updateError } = await getSupabaseClient()
            .from("drops")
            .update({
              batch_id: batchId,
              payment_status: batchPaymentResult ? "completed" : "failed",
              payment_tx_hash: batchPaymentResult?.txHash || null,
              paid_at: batchPaymentResult ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .in("drop_id", completedDrops);

          if (updateError) throw updateError;
        }

        // Update drops for users without wallets (pending payments)
        const pendingDrops = submissions
          .filter((s) => processedSubmissions.includes(s.dropId))
          .filter((submission) => !userAddresses.get(submission.userId))
          .map((s) => s.dropId);

        if (pendingDrops.length > 0) {
          const { error: updateError } = await getSupabaseClient()
            .from("drops")
            .update({
              batch_id: batchId,
              payment_status: "pending_wallet",
              payment_tx_hash: null,
              paid_at: null,
              updated_at: new Date().toISOString(),
            })
            .in("drop_id", pendingDrops);

          if (updateError) throw updateError;
        }
      }

      // Update user balances in database (only for users with wallets)
      for (const submission of submissions) {
        if (
          processedSubmissions.includes(submission.dropId) &&
          userAddresses.get(submission.userId)
        ) {
          await UserService.processPayment(
            submission.userId,
            submission.actualRewardAda,
          );
        }
      }
    } catch (batchError) {
      console.error("Error creating batch record:", batchError);
      errors.push("Failed to create payment batch record");
    }

    // Send notifications to users
    for (const submission of submissions) {
      if (processedSubmissions.includes(submission.dropId)) {
        const hasWallet = userAddresses.get(submission.userId);
        let notificationMessage = "";

        if (hasWallet) {
          notificationMessage = batchPaymentResult
            ? `Your drop has been approved! ${submission.actualRewardAda} ADA tokens have been sent to your Eternl wallet. Transaction: ${batchPaymentResult.txHash}`
            : `Your drop has been approved but payment failed. Please contact support.`;
        } else {
          notificationMessage = `Your drop has been approved! ${submission.actualRewardAda} ADA tokens are pending. Please connect your Eternl wallet to receive your payment.`;
        }

        try {
          await getSupabaseClient().from("notifications").insert({
            user_id: submission.userId,
            type: "drop_approved",
            title: "Drop Approved",
            message: notificationMessage,
            read: false,
            created_at: new Date().toISOString(),
            drop_id: submission.dropId,
          });
        } catch (notificationError) {
          console.error("Notification error:", notificationError);
          // Don't fail the request for notification errors
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: processedSubmissions.length,
      totalUsers: processedUsers.size,
      totalAda: totalAda.toFixed(6),
      batchId,
      payment: batchPaymentResult
        ? {
            txHash: batchPaymentResult.txHash,
            totalAmount: batchPaymentResult.totalAmount,
            recipientCount: batchPaymentResult.recipientCount,
          }
        : null,
      pendingPayments:
        pendingPayments.length > 0
          ? {
              count: pendingPayments.length,
              users: pendingPayments.map((p) => p.userId),
            }
          : null,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${processedSubmissions.length} submissions for ${totalAda.toFixed(2)} ADA${batchPaymentResult ? " and sent payments" : " but payment failed"}${pendingPayments.length > 0 ? ` (${pendingPayments.length} payments pending wallet connection)` : ""}`,
    });
  } catch (error) {
    console.error("Batch approval error:", error);
    return NextResponse.json(
      { success: false, error: "Batch approval failed" },
      { status: 500 },
    );
  }
}
