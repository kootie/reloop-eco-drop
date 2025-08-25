import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> },
) {
  try {
    const { qrCode } = await params;
    const normalized = decodeURIComponent(qrCode || "").trim();
    console.log("[QR API] Received qrCode:", qrCode, "Normalized:", normalized);

    const { data: bin, error } = await getSupabaseClient()
      .from("bins")
      .select("*")
      .or(`qr_code.eq.${normalized},bin_id.eq.${normalized}`)
      .single();

    if (error || !bin) {
      console.warn(
        "[QR API] Bin not found after normalized or-query. Error:",
        error?.message,
      );
    }

    if (error || !bin) {
      return NextResponse.json(
        { success: false, error: "Bin not found" },
        { status: 404 },
      );
    }

    const fillPercentage =
      typeof (bin as any).fill_percentage === "number"
        ? Math.round((bin as any).fill_percentage)
        : (bin as any).capacity_kg > 0
          ? Math.round(((bin as any).current_weight_kg || 0) / (bin as any).capacity_kg * 100)
          : 0;

    const binInfo = {
      id: bin.id as string,
      name: (bin.location_name as string) || "Recycling Bin",
      address: (bin.address as string) || "",
      coordinates: {
        lat: Number(bin.latitude),
        lng: Number(bin.longitude),
      },
      qrCode: (bin.qr_code as string) || "",
      status: bin.is_active && bin.is_operational ? "active" : "inactive",
      retailer: {
        name: "",
        phone: (bin.contact_phone as string) || "",
        operatingHours: "24/7",
      },
      acceptedMaterials: ["level1", "level2", "level3", "level4", "level5"],
      acceptedItems: {
        level1: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
        level2: [
          "LED bulbs",
          "CFL lights",
          "Small electronics",
          "Computer mice",
          "Keyboards",
        ],
        level3: [
          "Smartphones",
          "Small appliances",
          "Wireless devices",
          "Bluetooth speakers",
        ],
        level4: ["Laptops", "Tablets", "Gaming devices", "Monitors"],
        level5: ["Power banks", "Laptop batteries", "Electric tool batteries"],
      },
      capacity: {
        total: bin.capacity_kg as number,
        current: (bin.current_weight_kg as number) || 0,
        fillPercentage,
        available:
          (bin.capacity_kg as number) -
          ((bin.current_weight_kg as number) || 0),
      },
      stats: {
        totalDrops: (bin.total_drops as number) || 0,
        lastMaintenance:
          (bin.updated_at as string) || (bin.created_at as string),
        rewardRate: 0.5,
      },
      riskLevels: {
        level1: {
          name: "Safe",
          risk: "Minimal environmental impact",
          materials:
            "Mostly non-toxic materials like plastic, copper, and aluminum",
          disposal: "Easy to recycle with standard electronic waste processes",
        },
        level2: {
          name: "Low Risk",
          risk: "Low environmental risk",
          materials: "Some rare earth elements but mostly safe materials",
          disposal:
            "Requires specialized recycling for glass and phosphor components",
        },
        level3: {
          name: "Medium Risk",
          risk: "Moderate environmental impact",
          materials: "Contains lithium, cobalt, and moderately toxic elements",
          disposal:
            "Professional e-waste recycling required for safe material recovery",
        },
        level4: {
          name: "High Risk",
          risk: "High environmental risk",
          materials:
            "Heavy metals, complex electronic components, and rare earth elements",
          disposal:
            "Specialized facility required for safe dismantling and material recovery",
        },
        level5: {
          name: "Very High Risk",
          risk: "Very high environmental impact",
          materials:
            "Lithium-ion cells, heavy metals, toxic electrolytes, and complex circuits",
          disposal:
            "Hazardous waste protocols required. Special handling for battery components",
        },
      },
    };

    return NextResponse.json({
      success: true,
      bin: binInfo,
    });
  } catch (error) {
    console.error("Error fetching bin by QR code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bin information" },
      { status: 500 },
    );
  }
}
