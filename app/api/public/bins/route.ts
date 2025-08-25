import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { data: bins, error } = await getSupabaseClient()
      .from("bins")
      .select("id, qr_code, location_name, address, is_active, total_drops")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bins:", error);
      return new NextResponse(
        JSON.stringify({ success: false, error: "Failed to fetch bins" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new NextResponse(
      JSON.stringify({ success: true, bins: bins || [] }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        } 
      }
    );
  } catch (error) {
    console.error("Error in public bins API:", error);
    return new NextResponse(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
