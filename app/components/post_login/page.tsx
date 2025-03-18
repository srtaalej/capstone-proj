"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useRouter } from "next/navigation";
import Navbar from "../landing_page/user_navbar_card";
import { ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { publicKey } = useWallet();
  const mockPublicKey = { toString: () => "DummyPublicKey123456789" }; // Mock public key for testing
  const router = useRouter();
  const [needsKYC, setNeedsKYC] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycProcessing, setKycProcessing] = useState(false);
  const [kycResponse, setKycResponse] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null); // Store extracted data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    //if (!publicKey) {
      //router.push("/");
      //return;
    //}

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleKYC = async () => {
    if (!selectedFile) {
      setKycResponse("❌ Please select a file before submitting.");
      return;
    }

    setKycProcessing(true);
    setKycResponse(null);
    setExtractedData(null); // Reset extracted data

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
        setExtractedData(data); // Store extracted OCR data
        setNeedsKYC(false);
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      setKycResponse("❌ KYC submission failed. Please try again.");
    } finally {
      setKycProcessing(false);
    }
  };
//  Call Mint Function After Successful KYC  
//const handleMint = async () => {
//Add minting integration here 
//}
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

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
            <div className="p-4 border rounded-lg bg-gray-100 flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">KYC Status</h2>
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

              {/* KYC Upload Section */}
              {needsKYC && (
                <div className="mt-4 flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-2 p-2 border rounded-md"
                  />
                  <button
                    onClick={handleKYC}
                    disabled={kycProcessing}
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                  >
                    {kycProcessing ? "Processing..." : "Submit KYC"}
                  </button>
                </div>
              )}

              {/* KYC Response */}
              {kycResponse && (
                <p className="mt-2 text-sm font-semibold text-gray-700">{kycResponse}</p>
              )}

              {/* Extracted Data Display */}
              {extractedData && (
                <div className="mt-4 p-4 bg-gray-200 rounded-md w-full">
                  <h3 className="text-lg font-semibold text-gray-700">Extracted Information:</h3>
                  <p className="text-gray-600"><strong>First Name:</strong> {extractedData.first_name}</p>
                  <p className="text-gray-600"><strong>Middle Name:</strong> {extractedData.middle_name}</p>
                  <p className="text-gray-600"><strong>Last Name:</strong> {extractedData.last_name}</p>
                  <p className="text-gray-600"><strong>DOB:</strong> {extractedData.dob}</p>
                  <p className="text-gray-600"><strong>Gender:</strong> {extractedData.gender}</p>
                </div>
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
