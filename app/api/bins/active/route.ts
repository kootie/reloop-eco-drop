import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

// Get bins from Supabase database
export async function GET() {
  try {
    const { data: bins, error } = await getSupabaseClient()
      .from("bins")
      .select("*")
      .eq("is_active", true)
      .eq("is_operational", true);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bins: bins || [],
    });
  } catch (error) {
    console.error("Error fetching active bins:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bin locations" },
      { status: 500 },
    );
  }
}
