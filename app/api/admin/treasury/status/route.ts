import { NextResponse } from "next/server";
import { treasuryService } from "@/lib/treasury-service";

// Get treasury status and statistics
export async function GET() {
  try {
    const treasuryStats = await treasuryService.getTreasuryStats();

    return NextResponse.json({
      success: true,
      treasury: treasuryStats,
    });
  } catch (error) {
    console.error("Error fetching treasury status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch treasury status." },
      { status: 500 },
    );
  }
}
