"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useRouter } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [needsKYC, setNeedsKYC] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycProcessing, setKycProcessing] = useState(false);
  const [kycResponse, setKycResponse] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
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
        console.log("🔍 NFT Ownership:", hasNFT);
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

  const handleCopyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleKYC = async () => {
    if (!selectedFile) {
      setKycResponse("❌ Please select a file before submitting.");
      return;
    }
    setKycProcessing(true);
    setKycResponse(null);
    setExtractedData(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setKycResponse("❌ KYC submission failed. Please try again.");
      } else {
        setKycResponse("✅ KYC Submitted Successfully!");
        setExtractedData(data);
        setNeedsKYC(false);
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      setKycResponse("❌ KYC submission failed. Please try again.");
    } finally {
      setKycProcessing(false);
    }
  };

  // 1) If wallet isn't connected, show a message with WalletMultiButton
  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg mb-4">Please connect your wallet to view the dashboard.</p>
        <WalletMultiButton className="px-4 py-2 bg-indigo-600 text-white rounded-md" />
      </div>
    );
  }

  // 2) Otherwise, show the KYC / Dashboard content
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Removed <Navbar /> because layout.tsx already includes it */}
      <main className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

        <div className="p-4 border rounded-lg bg-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Wallet Address</h2>
            <p className="font-mono text-sm bg-gray-200 px-3 py-1 rounded-md">
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </p>
          </div>
          <button onClick={handleCopyAddress} className="text-blue-500 hover:underline">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="p-4 border rounded-lg bg-gray-100 flex flex-col items-center mt-6">
          <h2 className="text-lg font-semibold mb-2">KYC Status</h2>
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

          {needsKYC && (
            <div className="mt-4 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2 p-2 border rounded-md"
              />
              {selectedFile ? (
                <div className="text-sm mt-2 flex items-center">
                  <span className="mr-2">📂 {selectedFile.name}</span>
                  <button onClick={handleRemoveFile} className="text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No file uploaded.</p>
              )}
              <button
                onClick={handleKYC}
                disabled={kycProcessing}
                className="mt-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                {kycProcessing ? "Processing..." : "Submit KYC"}
              </button>
            </div>
          )}

          {kycResponse && (
            <p className="mt-2 text-sm font-semibold">{kycResponse}</p>
          )}

          {extractedData && (
            <div className="mt-4 p-4 bg-gray-200 rounded-md w-full">
              <h3 className="text-lg font-semibold">Extracted Information:</h3>
              <p><strong>First Name:</strong> {extractedData.first_name}</p>
              <p><strong>Middle Name:</strong> {extractedData.middle_name}</p>
              <p><strong>Last Name:</strong> {extractedData.last_name}</p>
              <p><strong>DOB:</strong> {extractedData.dob}</p>
              <p><strong>Gender:</strong> {extractedData.gender}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
