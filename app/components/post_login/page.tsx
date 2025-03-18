"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Navbar from "../landing_page/user_navbar_card";
import { ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { publicKey, disconnect } = useWallet();
  const mockPublicKey = { toString: () => "DummyPublicKey123456789" }; // Mock public key for testing
  const router = useRouter();
  const [needsKYC, setNeedsKYC] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Comment out the redirect for testing
    // if (!publicKey) {
    //   router.push("/");
    //   return;
    // }

    const checkNFTs = async () => {
      try {
        // Always set to false for testing
        setNeedsKYC(false);
        setLoading(false);
      } catch (error) {
        console.error("Error checking NFTs:", error);
        setNeedsKYC(false);
        setLoading(false);
      }
    };

    checkNFTs();
  }, [router]);

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(mockPublicKey.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-12">
          <div className="border-b border-white/10 pb-12">
            <h1 className="text-base/7 font-semibold text-white">Dashboard</h1>
            <p className="mt-1 text-sm/6 text-gray-400">
              View and manage your account information and voting status.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Wallet Information */}
              <div className="col-span-full">
                <h2 className="text-sm/6 font-medium text-white mb-4">Wallet Information</h2>
                <div className="rounded-lg bg-white/5 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Connected Address</p>
                      <p className="font-mono text-sm text-white">
                        {mockPublicKey.toString().slice(0, 8)}...{mockPublicKey.toString().slice(-8)}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="rounded-md bg-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              <div className="col-span-full">
                <h2 className="text-sm/6 font-medium text-white mb-4">Account Status</h2>
                <div className="rounded-lg bg-white/5 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">KYC Verification</p>
                      <div className="flex items-center gap-x-2">
                        {loading ? (
                          <div className="animate-pulse bg-white/10 h-5 w-20 rounded"></div>
                        ) : (
                          <>
                            {needsKYC ? (
                              <XCircleIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            )}
                            <span className="text-sm text-white">
                              {needsKYC ? "Verification Required" : "Verified"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {needsKYC && (
                      <button
                        className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
                      >
                        Complete KYC
                      </button>
                    )}
                  </div>
                </div>
                {/* Disconnect Button */}
                {publicKey && (
                  <div className="mt-4 flex justify-start">
                    <button
                      onClick={disconnect}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
