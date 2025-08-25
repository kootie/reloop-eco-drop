import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    // Get real statistics from Supabase database

    // 1. Get drop statistics
    const { data: allDrops, error: dropsError } = await getSupabaseClient()
      .from("drops")
      .select("*");

    if (dropsError) throw dropsError;

    // 2. Get user statistics
    const { data: allUsers, error: usersError } = await getSupabaseClient()
      .from("users")
      .select("*");

    if (usersError) throw usersError;

    // 3. Get bin statistics
    const { data: allBins, error: binsError } = await getSupabaseClient()
      .from("bins")
      .select("*");

    if (binsError) throw binsError;

    // Calculate drop statistics
    const totalDrops = allDrops?.length || 0;
    const pendingDrops =
      allDrops?.filter((drop) => drop.status === "pending") || [];
    const approvedDrops =
      allDrops?.filter((drop) => drop.status === "approved") || [];
    const rejectedDrops =
      allDrops?.filter((drop) => drop.status === "rejected") || [];

    // Calculate real statistics from database data
    const totalTokensAwarded = approvedDrops.reduce(
      (sum, drop) => sum + (parseFloat((drop as any).actual_reward_ada) || 0),
      0,
    );

    // User statistics
    const totalUsers = allUsers?.length || 0;
    const verifiedUsers =
      allUsers?.filter((user) => (user as any).is_verified) || [];

    // Bin statistics
    const activeBins =
      allBins?.filter((bin) => (bin as any).status === "active") || [];
    const totalBins = allBins?.length || 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDrops =
      allDrops?.filter(
        (drop) =>
          (drop as any).created_at &&
          new Date((drop as any).created_at) > sevenDaysAgo,
      ).length || 0;

    // Monthly stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyDrops =
      allDrops?.filter((drop) => {
        if (!(drop as any).created_at) return false;
        const dropDate = new Date((drop as any).created_at);
        return (
          dropDate.getMonth() === currentMonth &&
          dropDate.getFullYear() === currentYear
        );
      }).length || 0;

    const monthlyTokens = approvedDrops
      .filter((drop) => {
        if (!(drop as any).created_at) return false;
        const dropDate = new Date((drop as any).created_at);
        return (
          dropDate.getMonth() === currentMonth &&
          dropDate.getFullYear() === currentYear
        );
      })
      .reduce(
        (sum, drop) => sum + (parseFloat((drop as any).actual_reward_ada) || 0),
        0,
      );

    return NextResponse.json({
      success: true,
      stats: {
        // Bin statistics (real data from database)
        bins: {
          total: totalBins,
          active: activeBins.length,
          maintenance:
            allBins?.filter((bin) => bin.status === "maintenance").length || 0,
          inactive:
            allBins?.filter((bin) => bin.status === "inactive").length || 0,
        },

        // Drop statistics (real data from database)
        drops: {
          total: totalDrops,
          pending: pendingDrops.length,
          approved: approvedDrops.length,
          rejected: rejectedDrops.length,
          recent: recentDrops,
          monthly: monthlyDrops,
        },

        // User statistics (real data from database)
        users: {
          total: totalUsers,
          verified: verifiedUsers.length,
          unverified: totalUsers - verifiedUsers.length,
          activeThisMonth: new Set(
            allDrops
              ?.filter((drop) => {
                if (!(drop as any).created_at) return false;
                const dropDate = new Date((drop as any).created_at);
                return (
                  dropDate.getMonth() === currentMonth &&
                  dropDate.getFullYear() === currentYear
                );
              })
              .map((drop) => (drop as any).user_id) || [],
          ).size,
        },

        // Token statistics (real data from database)
        tokens: {
          totalAwarded: Math.round(totalTokensAwarded * 1000000) / 1000000, // 6 decimal places for ADA
          monthlyAwarded: Math.round(monthlyTokens * 1000000) / 1000000,
          averagePerDrop:
            approvedDrops.length > 0
              ? Math.round(
                  (totalTokensAwarded / approvedDrops.length) * 1000000,
                ) / 1000000
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
