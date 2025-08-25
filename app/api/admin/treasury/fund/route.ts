import { NextRequest, NextResponse } from "next/server";
import { treasuryService } from "@/lib/treasury-service";
import { getSupabaseClient } from "@/lib/supabase";

// Fund treasury from admin wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, adminWalletAddress, adminId } = body;

    if (!amount || !adminWalletAddress || !adminId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Verify admin exists
    const { data: admin, error: adminError } = await getSupabaseClient()
      .from("users")
      .select("id, role")
      .eq("id", adminId)
      .eq("role", "admin")
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized admin access" },
        { status: 403 },
      );
    }

    // Fund treasury using smart contract
    const result = await treasuryService.fundTreasury(
      amount,
      adminWalletAddress,
      adminId,
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully funded treasury with ${amount} ADA`,
        txHash: result.txHash,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to fund treasury" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error funding treasury:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fund treasury." },
      { status: 500 },
    );
  }
}
