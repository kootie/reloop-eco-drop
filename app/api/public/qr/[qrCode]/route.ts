import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const resolvedParams = await params;
    const qrCode = resolvedParams.qrCode;
    
    if (!qrCode) {
      return new NextResponse("qrCode is required", { status: 400 });
    }

    // Lookup bin for metadata (optional)
    const { data: bin } = await getSupabaseClient()
      .from("bins")
      .select("qr_code, location_name, latitude, longitude")
      .eq("qr_code", qrCode)
      .single();

    // Build destination URL that the QR should open
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   "https://reloop-eco-drop.vercel.app";
    const url = new URL(`${baseUrl}/bin/${encodeURIComponent(qrCode)}`);
    if (bin?.latitude && bin?.longitude) {
      url.searchParams.set("lat", String(bin.latitude));
      url.searchParams.set("lng", String(bin.longitude));
    }
    if (bin?.location_name) {
      url.searchParams.set("name", bin.location_name as string);
    }

    // Generate QR PNG buffer
    const pngBuffer = await QRCode.toBuffer(url.toString(), {
      width: 512,
      margin: 1,
      color: { dark: "#0f5132", light: "#ffffff" },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error generating QR:", error);
    return new NextResponse("Failed to generate QR", { status: 500 });
  }
}
