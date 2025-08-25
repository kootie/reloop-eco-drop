import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getSupabaseClient } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

interface AuthToken {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
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
    if (token.startsWith("admin_")) {
      // Simple admin token validation - for demo purposes
      // In production, implement proper admin session management
      console.log("Admin token detected:", token.substring(0, 20) + "...");
    } else {
      // Try to verify as JWT token for regular users
      try {
        jwt.verify(token, JWT_SECRET) as AuthToken;
        // For now, we'll allow any valid JWT token to access admin functions
        // In production, check for admin role
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 },
        );
      }
    }

    // Get query parameters
    const url = new URL(request.url);
    const userFilter = url.searchParams.get("userFilter") || "all";

    // Build query: pending drops with joined users using specific foreign key
    let query = getSupabaseClient()
      .from("drops")
      .select(
        `
        *,
        users!drops_user_id_fkey(user_id, email, full_name, cardano_address, is_verified)
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    // Apply user filter if specified
    if (userFilter === "verified-users") {
      query = query.eq("users!drops_user_id_fkey.is_verified", true);
    } else if (userFilter === "unverified-users") {
      query = query.eq("users!drops_user_id_fkey.is_verified", false);
    }

    const { data: result, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    const dropsWithWallet = (result || []).filter(
      (row: any) => row.users?.cardano_address,
    );
    const dropsWithoutWallet = (result || []).filter(
      (row: any) => !row.users?.cardano_address,
    );

    // Notify users without wallets to connect before submissions
    try {
      if (dropsWithoutWallet.length > 0) {
        const notifications = dropsWithoutWallet.map((row: any) => ({
          user_id: row.user_id,
          type: "wallet_required",
          title: "Connect Wallet Required",
          message:
            "Please connect your Eternl wallet to submit drops and receive rewards.",
          read: false,
          created_at: new Date().toISOString(),
          drop_id: row.drop_id,
        }));
        await getSupabaseClient().from("notifications").insert(notifications);
      }
    } catch (notifyError) {
      console.error(
        "Failed to send wallet-required notifications:",
        notifyError,
      );
    }

    // Transform only drops with wallets for frontend
    const submissions = dropsWithWallet.map((row: any) => ({
      id: row.id,
      dropId: row.drop_id,
      userId: row.user_id,
      userEmail: row.users?.email || "",
      userFullName: row.users?.full_name || "",
      userCardanoAddress: row.users?.cardano_address || null,
      userIsVerified: !!row.users?.is_verified,
      deviceType: row.device_type_id || "UNKNOWN",
      deviceName: row.device_type_id || "Unknown Device",
      deviceCategory: "Small Electronics", // Default category
      estimatedRewardAda: parseFloat(String(row.estimated_reward_ada || 0)),
      actualWeightKg: row.actual_weight_kg
        ? parseFloat(String(row.actual_weight_kg))
        : null,
      photo: row.photo_url,
      submittedAt: row.created_at,
      binLocation: `Bin ${row.bin_id?.substring(0, 8) || "Unknown"}`,
      userLocation: {
        latitude: parseFloat(String(row.user_latitude || 0)),
        longitude: parseFloat(String(row.user_longitude || 0)),
      },
      distance: parseFloat(String(row.distance_to_bin_meters || 0)),
    }));

    return NextResponse.json({
      success: true,
      submissions,
      total: submissions.length,
      filteredOut: dropsWithoutWallet.length,
      filters: {
        applied: userFilter,
        verifiedUsers: submissions.filter((s) => s.userIsVerified).length,
        unverifiedUsers: submissions.filter((s) => !s.userIsVerified).length,
      },
    });
  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending submissions" },
      { status: 500 },
    );
  }
}
