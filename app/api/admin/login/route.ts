import { NextRequest, NextResponse } from "next/server";

// Simple admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "reloop2024!",
  role: "admin",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Debug logging
    console.log("Admin login attempt:", { username, password });
    console.log("Expected credentials:", {
      username: ADMIN_CREDENTIALS.username,
      password: ADMIN_CREDENTIALS.password,
    });

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password required" },
        { status: 400 },
      );
    }

    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // In production, use JWT tokens and proper session management
      const adminToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      return NextResponse.json({
        success: true,
        admin: {
          username: ADMIN_CREDENTIALS.username,
          role: ADMIN_CREDENTIALS.role,
          token: adminToken,
        },
        message: "Login successful",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
