const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const realWalletAddress =
  "addr_test1qr97zegrra6jedlq5885fhxjrle8zr2zyrdkklptwvdk0scwq03mzrumqqfnld64zuu9rtlca9nhjwaazqlnj4wtjmcqa7ppyc";

async function updateWalletAddresses() {
  console.log("🔧 Updating wallet addresses...");

  try {
    // Get all test users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, user_id, email, cardano_address")
      .like("user_id", "user_%");

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      return;
    }

    console.log(`📋 Found ${users.length} test users`);

    // Update wallet addresses
    let updatedCount = 0;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let walletAddress;

      if (i < 10) {
        // First 10 users get the real wallet address
        walletAddress = realWalletAddress;
      } else if (i < users.length - 10) {
        // Middle users get fake wallet addresses
        walletAddress = `addr_test1fake${user.user_id}${Date.now()}${Math.random().toString(36).substr(2, 8)}`;
      } else {
        // Last 10 users get null (no wallet address)
        walletAddress = null;
      }

      const { error } = await supabase
        .from("users")
        .update({
          cardano_address: walletAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error(`❌ Error updating user ${user.user_id}:`, error);
      } else {
        updatedCount++;
        console.log(
          `✅ Updated ${user.user_id}: ${walletAddress ? "Has wallet" : "No wallet"}`,
        );
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} users`);
    console.log("📊 Summary:");
    console.log("- 10 users with real wallet address");
    console.log("- 30 users with fake wallet addresses");
    console.log("- 10 users with no wallet address");
  } catch (error) {
    console.error("❌ Error updating wallet addresses:", error);
  }
}

updateWalletAddresses();
