"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useRouter } from "next/navigation";
import Navbar from "../components/landing_page/user_navbar_card";

export default function Dashboard() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [needsKYC, setNeedsKYC] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to landing page if user is not logged in
    if (!publicKey) {
      router.push("/");
      return;
    }

    const checkNFTs = async () => {
      try {
        const connection = new Connection(clusterApiUrl("devnet"));
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        let hasNFT = false;
        tokenAccounts.value.forEach((tokenAccount) => {
          const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
          if (tokenAmount.amount === "1" && tokenAmount.decimals === 0) {
            hasNFT = true;
          }
        });

        setNeedsKYC(!hasNFT);
      } catch (error) {
        console.error("Error checking NFTs:", error);
        setNeedsKYC(true);
      } finally {
        setLoading(false);
      }
    };

    checkNFTs();
  }, [publicKey, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar/>
  
      {/* Dashboard Content */}
      <main className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>
  
        {publicKey ? (
          <div className="space-y-6">
            {/* Wallet Information */}
            <div className="p-4 border rounded-lg bg-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Wallet Address</h2>
                <p className="text-gray-600 font-mono text-sm bg-gray-200 px-3 py-1 rounded-md">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(publicKey.toString())}
                className="text-blue-500 hover:underline"
              >
                Copy
              </button>
            </div>

          
            {/* KYC Status */}
            <div className="p-4 border rounded-lg bg-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">KYC Status</h2>
              {loading ? (
                <p className="text-gray-500">Checking NFT ownership...</p>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                    needsKYC ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {needsKYC ? "Required" : "Verified"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-600">Redirecting...</p> 
        )}
      </main>
    </div>
  );
}