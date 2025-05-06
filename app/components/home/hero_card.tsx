"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const { publicKey, connected, disconnect } = useWallet();
  const [walletStatus, setWalletStatus] = useState("Disconnected");

  useEffect(() => {
    if (connected) {
      setWalletStatus("Connected");
      localStorage.setItem("walletConnected", "true");
    } else {
      setWalletStatus("Disconnected");
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");
    }
  }, [connected]);

  const handleDisconnect = async () => {
    try {
      await disconnect(); // Disconnect from wallet
      setWalletStatus("Disconnected"); // Update UI
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");

      // Force Phantom Wallet to remove app from connected apps
      window.location.reload(); // Hard refresh to clear Phantom's session
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Fast and secure voting on Blockchain
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Experience the future of voting with unmatched security and transparency. Our blockchain technology ensures every vote is tamper-proof, verifiable, and instantly counted.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {connected ? (
                <>
                  <WalletMultiButton className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    {walletStatus}
                  </WalletMultiButton>
                </>
              ) : (
                <WalletMultiButton className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                  Get Started
                </WalletMultiButton>
              )}
              <a
                href="/faq"
                className="text-sm/6 font-semibold text-gray-300 hover:text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
