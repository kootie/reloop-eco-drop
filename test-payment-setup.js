#!/usr/bin/env node

/**
 * Test Cardano Payment Setup
 * Run this script to verify your environment variables and wallet setup
 */

require("dotenv").config({ path: ".env.local" });

async function testPaymentSetup() {
  console.log("🔍 Testing Cardano Payment Setup...\n");

  // Check environment variables
  console.log("📋 Environment Variables:");
  const blockfrostId = process.env.BLOCKFROST_PROJECT_ID;
  const walletSeed = process.env.BACKEND_WALLET_SEED;

  if (!blockfrostId) {
    console.log("❌ BLOCKFROST_PROJECT_ID: Not set");
  } else {
    console.log(
      `✅ BLOCKFROST_PROJECT_ID: ${blockfrostId.substring(0, 10)}...`,
    );
  }

  if (!walletSeed) {
    console.log("❌ BACKEND_WALLET_SEED: Not set");
  } else {
    const words = walletSeed.split(" ");
    if (words.length === 24) {
      console.log(`✅ BACKEND_WALLET_SEED: ${words.length} words (valid)`);
    } else {
      console.log(
        `❌ BACKEND_WALLET_SEED: ${words.length} words (should be 24)`,
      );
    }
  }

  console.log("\n🔗 Blockfrost Setup:");
  if (blockfrostId) {
    if (blockfrostId.startsWith("preprod")) {
      console.log("✅ Using Preprod (testnet) - Correct!");
    } else if (blockfrostId.startsWith("mainnet")) {
      console.log("⚠️  Using Mainnet - Make sure this is intentional!");
    } else {
      console.log(
        '❓ Unknown network - Should start with "preprod" or "mainnet"',
      );
    }
  } else {
    console.log("❌ No Blockfrost Project ID found");
  }

  console.log("\n💰 Wallet Setup:");
  if (walletSeed) {
    const words = walletSeed.split(" ");
    if (words.length === 24) {
      console.log("✅ Seed phrase format is correct (24 words)");

      // Basic validation of word format
      const validWords = words.every((word) => /^[a-z]+$/.test(word));
      if (validWords) {
        console.log("✅ Seed phrase words appear valid");
      } else {
        console.log("⚠️  Some seed phrase words may be invalid");
      }
    } else {
      console.log("❌ Seed phrase should be exactly 24 words");
    }
  } else {
    console.log("❌ No wallet seed phrase found");
  }

  console.log("\n📝 Next Steps:");
  if (!blockfrostId || !walletSeed) {
    console.log("1. Get Blockfrost Project ID from blockfrost.io");
    console.log("2. Create testnet wallet and get seed phrase");
    console.log("3. Add both to .env.local file");
    console.log("4. Restart your development server");
  } else {
    console.log("1. Restart your development server");
    console.log("2. Check console logs for initialization messages");
    console.log("3. Test a payment by submitting and approving a drop");
    console.log("4. Verify transaction on CardanoScan");
  }

  console.log("\n🔗 Useful Links:");
  console.log("- Blockfrost: https://blockfrost.io");
  console.log("- Eternl Wallet: https://eternl.io");
  console.log(
    "- Testnet Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/",
  );
  console.log("- CardanoScan Testnet: https://preprod.cardanoscan.io");
}

// Run the test
testPaymentSetup().catch(console.error);
