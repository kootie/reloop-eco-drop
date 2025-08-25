import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    // Get real bins data from Supabase database
    const { data: bins, error } = await supabase
      .from("bins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bins: bins || [],
    });
  } catch (error) {
    console.error("Error fetching bins:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bins" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const binData = await request.json();

    // Validate required fields
    const requiredFields = [
      "location_name",
      "address",
      "latitude",
      "longitude",
      "qr_code",
    ];
    for (const field of requiredFields) {
      if (!binData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const supabase = getSupabaseClient();
    // Create new bin in Supabase database
    const { data: newBin, error } = await supabase
      .from("bins")
      .insert([
        {
          location_name: binData.location_name,
          address: binData.address,
          latitude: parseFloat(binData.latitude),
          longitude: parseFloat(binData.longitude),
          qr_code: binData.qr_code,
          status: binData.status || "active",
          capacity_kg: parseFloat(binData.capacity_kg) || 100,
          current_fill_kg: parseFloat(binData.current_fill_kg) || 0,
          retailer_name: binData.retailer_name || "",
          contact_phone: binData.contact_phone || "",
          operating_hours: binData.operating_hours || "24/7",
          accepted_materials: binData.accepted_materials || ["electronics"],
          reward_rate_per_kg: parseFloat(binData.reward_rate_per_kg) || 0.5,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bin: newBin,
      message: "Bin created successfully",
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bin" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { binId, ...updateData } = await request.json();

    if (!binId) {
      return NextResponse.json(
        { success: false, error: "Bin ID is required" },
        { status: 400 },
      );
    }

    // Convert numeric fields for database
    const dbUpdateData: Record<string, string | number> = {};
    if (updateData.location_name)
      dbUpdateData.location_name = updateData.location_name;
    if (updateData.address) dbUpdateData.address = updateData.address;
    if (updateData.latitude)
      dbUpdateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude)
      dbUpdateData.longitude = parseFloat(updateData.longitude);
    if (updateData.capacity_kg)
      dbUpdateData.capacity_kg = parseFloat(updateData.capacity_kg);
    if (updateData.current_fill_kg)
      dbUpdateData.current_fill_kg = parseFloat(updateData.current_fill_kg);
    if (updateData.reward_rate_per_kg)
      dbUpdateData.reward_rate_per_kg = parseFloat(
        updateData.reward_rate_per_kg,
      );
    if (updateData.status) dbUpdateData.status = updateData.status;
    if (updateData.retailer_name)
      dbUpdateData.retailer_name = updateData.retailer_name;
    if (updateData.contact_phone)
      dbUpdateData.contact_phone = updateData.contact_phone;
    if (updateData.operating_hours)
      dbUpdateData.operating_hours = updateData.operating_hours;

    const supabase = getSupabaseClient();
    // Update bin in Supabase database
    const { data: updatedBin, error } = await supabase
      .from("bins")
      .update(dbUpdateData)
      .eq("id", binId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bin: updatedBin,
      message: "Bin updated successfully",
    });
  } catch (error) {
    console.error("Error updating bin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bin" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { binId } = await request.json();

    if (!binId) {
      return NextResponse.json(
        { success: false, error: "Bin ID is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();
    // Delete bin from Supabase database
    const { error } = await supabase.from("bins").delete().eq("id", binId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Bin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bin" },
      { status: 500 },
    );
  }
}
