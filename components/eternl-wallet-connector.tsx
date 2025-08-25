"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Wallet, CheckCircle2, ExternalLink } from "lucide-react";

// Extend Window type for Eternl
declare global {
  interface Window {
    cardano?: {
      eternl?: {
        enable(): Promise<{
          getUsedAddresses(): Promise<string[]>;
          getUnusedAddresses(): Promise<string[]>;
          getNetworkId(): Promise<number>;
          getBalance(): Promise<string>;
        }>;
        isEnabled(): Promise<boolean>;
        getBalance(): Promise<string>;
        getUsedAddresses(): Promise<string[]>;
        getUnusedAddresses(): Promise<string[]>;
        getNetworkId(): Promise<number>;
        signTx(tx: string): Promise<string>;
        submitTx(tx: string): Promise<string>;
        getUtxos(): Promise<
          Array<{
            txHash: string;
            outputIndex: number;
            amount: string;
            address: string;
          }>
        >;
      };
    };
  }
}

interface EternlWalletConnectorProps {
  onWalletConnected: (walletInfo: {
    address: string;
    balance: number;
    network: "testnet" | "mainnet";
  }) => void;
  onWalletDisconnected: () => void;
}

export default function EternlWalletConnector({
  onWalletConnected,
  onWalletDisconnected,
}: EternlWalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance: number;
    network: "testnet" | "mainnet";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEternlAvailable, setIsEternlAvailable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if Eternl is installed
  useEffect(() => {
    const checkEternlAvailability = () => {
      try {
        if (typeof window !== "undefined" && window.cardano?.eternl) {
          setIsEternlAvailable(true);
        } else {
          setIsEternlAvailable(false);
        }
      } catch (error) {
        console.warn("Eternl wallet check failed:", error);
        setIsEternlAvailable(false);
      }
    };

    checkEternlAvailability();

    // Check again after a short delay (wallet extensions might load asynchronously)
    const timer = setTimeout(checkEternlAvailability, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle retry attempts
  useEffect(() => {
    if (retryCount > 0 && retryCount <= 3) {
      const timer = setTimeout(() => {
        connectWallet();
      }, 1000 * retryCount); // Exponential backoff
      return () => clearTimeout(timer);
    }
  }, [retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectWallet = async () => {
    if (!window.cardano?.eternl) {
      setError("Eternl wallet not found. Please install Eternl extension.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Add a small delay to allow Eternl extension to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enable the wallet with timeout
      const enablePromise = window.cardano.eternl.enable();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Wallet connection timeout')), 10000)
      );
      
      const api = await Promise.race([enablePromise, timeoutPromise]) as Awaited<ReturnType<typeof window.cardano.eternl.enable>>;

      // Get wallet addresses
      const usedAddresses = await api.getUsedAddresses();
      const unusedAddresses = await api.getUnusedAddresses();

      // Use the first available address
      const addresses = [...usedAddresses, ...unusedAddresses];
      if (addresses.length === 0) {
        throw new Error("No addresses found in wallet");
      }

      const address = addresses[0];

      // Debug: Log the address format
      console.log("Eternl wallet address:", address);
      console.log("Address type:", typeof address);
      console.log("Address length:", address.length);
      console.log("Address starts with addr:", address.startsWith("addr"));
      console.log("Address includes addr:", address.includes("addr"));
      console.log("Address contains test:", address.includes("test"));
      console.log("Full address for debugging:", JSON.stringify(address));

      // Get network ID (0 = testnet, 1 = mainnet)
      const networkId = await api.getNetworkId();
      const network: "testnet" | "mainnet" =
        networkId === 0 ? "testnet" : "mainnet";

      // Get balance
      const balanceHex = await api.getBalance();
      const balanceLovelace = parseInt(balanceHex, 16);
      const balanceAda = balanceLovelace / 1_000_000;

      const walletData = {
        address,
        balance: balanceAda,
        network,
      };

      setWalletInfo(walletData);
      setIsConnected(true);
      onWalletConnected(walletData);

      console.log("Eternl wallet connected:", walletData);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      
      // Handle specific Eternl extension errors
      if (err instanceof Error) {
        if (err.message.includes('domId') || err.message.includes('no data')) {
          setError("Eternl extension error. Please try refreshing the page or restarting the extension.");
        } else if (err.message.includes('timeout')) {
          setError("Connection timeout. Please check if Eternl extension is unlocked.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to connect to Eternl wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletInfo(null);
    setError(null);
    onWalletDisconnected();
  };

  if (!isEternlAvailable) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Eternl Wallet Required
          </CardTitle>
          <CardDescription>
            Please install the Eternl wallet extension to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => window.open("https://eternl.io/", "_blank")}
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Install Eternl Wallet
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            After installation, refresh this page to connect your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isConnected && walletInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your Eternl wallet is connected and ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Address:</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {walletInfo.address}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Balance:</p>
              <p className="text-lg font-bold">
                {walletInfo.balance.toFixed(2)} ADA
              </p>
            </div>
            <Badge
              variant={
                walletInfo.network === "testnet" ? "secondary" : "default"
              }
            >
              {walletInfo.network}
            </Badge>
          </div>

          <Button
            onClick={disconnectWallet}
            variant="outline"
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Eternl Wallet
        </CardTitle>
        <CardDescription>
          Connect your Eternl wallet to register and receive ADA rewards for
          e-waste recycling
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
            <div className="mt-2 flex gap-2">
              <Button
                onClick={() => {
                  setError(null);
                  setRetryCount(prev => prev + 1);
                  connectWallet();
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Retry
              </Button>
              <Button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Eternl Wallet
            </>
          )}
        </Button>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-600">
            <strong>Why Eternl?</strong> Eternl is the most advanced Cardano
            wallet with support for:
          </p>
          <ul className="text-xs text-blue-600 mt-1 ml-4 list-disc">
            <li>Multi-account management</li>
            <li>Hardware wallet support</li>
            <li>Advanced staking features</li>
            <li>NFT and DeFi compatibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
