// dashboard_card.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useRouter } from "next/navigation"; 
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  ArrowLeftStartOnRectangleIcon, 
} from "@heroicons/react/24/outline";

// Button style definitions
const btnBase = "inline-flex items-center justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition duration-150 ease-in-out";
const btnIndigo = `${btnBase} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`;
const btnRed = `${btnBase} bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600`;
const btnYellow = `${btnBase} bg-yellow-500 text-white hover:bg-yellow-400 focus-visible:outline-yellow-500`;
// const btnGray = `${btnBase} bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline-gray-600`;


export default function Dashboard() {
  const { publicKey, disconnect } = useWallet();
  const router = useRouter(); // Keep for potential future use
  const [needsKYC, setNeedsKYC] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycProcessing, setKycProcessing] = useState(false);
  const [kycResponse, setKycResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null); // Type assertion for extractedData
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      setNeedsKYC(null);
      setKycResponse(null);
      setExtractedData(null);
      setSelectedFile(null);
      return;
    }
    setLoading(true);
    const checkNFTs = async () => {
      try {
        const connection = new Connection(clusterApiUrl("devnet")); // Ensure correct cluster
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });
        let hasNFT = false;
        tokenAccounts.value.forEach((tokenAccount) => {
          const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
          // Consider specific mint check:
          // const mint = tokenAccount.account.data.parsed.info.mint;
          // if (mint === 'YOUR_NFT_MINT_ADDRESS' && ...)
          if (tokenAmount.amount === "1" && tokenAmount.decimals === 0) {
            hasNFT = true;
          }
        });
        // console.log("🔍 NFT Ownership:", hasNFT); // Optional logging
        setNeedsKYC(!hasNFT);
      } catch (error) {
        console.error("Error checking NFTs:", error);
        setNeedsKYC(true); // Default to needing KYC on error
      } finally {
        setLoading(false);
      }
    };
    checkNFTs();
  }, [publicKey]);

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setKycResponse(null);
    } else {
        setSelectedFile(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('kyc-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Reset the file input control
    }
  };

  const handleKYC = async () => {
    if (!selectedFile) {
      setKycResponse({ type: "error", message: "Please select a file." });
      return;
    }
    setKycProcessing(true);
    setKycResponse(null);
    setExtractedData(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:5001/upload", { // Verify backend URL
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || data.error) {
         console.error("KYC API Error:", data.error || `HTTP status ${response.status}`);
        setKycResponse({ type: "error", message: data.error || "KYC submission failed." });
      } else {
        setKycResponse({ type: "success", message: "KYC Submitted Successfully!" });
        setExtractedData(data);
        setNeedsKYC(false); // Mark verified
        handleRemoveFile(); // Clear file input on success
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      setKycResponse({ type: "error", message: "KYC submission failed (network/server error)." });
    } finally {
      setKycProcessing(false);
    }
  };

  const handleReupload = () => {
    setNeedsKYC(true); // Allow re-upload
    setSelectedFile(null);
    setExtractedData(null);
    setKycResponse(null);
    const fileInput = document.getElementById('kyc-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };


  // --- Render Logic ---

  // 1) Wallet not connected state
  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
            </svg>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Connect Wallet</h1>
          <p className="mt-4 text-lg leading-7 text-gray-400">
            Please connect your Solana wallet to access your dashboard.
          </p>
          <div className="mt-6">
            <WalletMultiButton style={{}} className="!bg-indigo-600 hover:!bg-indigo-500 !text-white !font-semibold !py-2 !px-4 !rounded-md !shadow-sm transition duration-150 ease-in-out"/>
          </div>
        </div>
      </div>
    );
  }

  // 2) Wallet connected state
  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      {/* Main dashboard card */}
      <main className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Manage your account and KYC status.</p>
        </div>

        <div className="p-6 space-y-6">

          {/* Wallet Information Section */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-medium text-white mb-3">Wallet Information</h2>
            <div className="flex items-center justify-between gap-4">
              {/* Wallet Address */}
              <p className="font-mono text-sm text-gray-300 bg-gray-600 px-3 py-1 rounded-md inline-block overflow-hidden text-ellipsis whitespace-nowrap" title={publicKey.toString()}>
                 {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-6)}
              </p>
              {/* Copy Button */}
              <button
                onClick={handleCopyAddress}
                className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition"
                title="Copy address"
              >
                <ClipboardDocumentIcon className={`h-5 w-5 ${copied ? 'hidden' : 'inline-block'}`} aria-hidden="true" />
                <CheckCircleIcon className={`h-5 w-5 ${copied ? 'inline-block' : 'hidden'}`} aria-hidden="true" />
                <span className="sr-only">{copied ? "Copied!" : "Copy"}</span>
                 {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* KYC Section */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-medium text-white mb-3">KYC Status</h2>
            {loading ? (
              <div className="flex items-center text-gray-400">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking NFT ownership...</span>
              </div>
            ) : needsKYC === false ? ( // Verified State
               <div className="flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-2 text-green-400">
                      <DocumentCheckIcon className="h-6 w-6"/>
                      <span className="text-sm font-semibold">Verified</span>
                   </div>
                   <button
                      onClick={handleReupload}
                      className={btnYellow} // yellow button style
                    >
                      Re-upload KYC
                    </button>
               </div>
            ) : ( // Needs KYC State
              <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-400">
                      <ExclamationTriangleIcon className="h-6 w-6"/>
                      <span className="text-sm font-semibold">KYC Required</span>
                  </div>
                  <p className="text-sm text-gray-400">
                      Please upload identification for verification.
                  </p>

                  {/* KYC Form Container */}
                  <div className="w-full max-w-sm space-y-3"> 
                      {/* File Upload Input */}
                      <div>
                          <label htmlFor="kyc-file-input" className="sr-only">Choose file</label>
                           <input
                              id="kyc-file-input"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                              className="block w-full text-sm text-gray-300 border border-gray-600 rounded-lg cursor-pointer bg-gray-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                           />
                      </div>

                      {/* Selected File Info & Remove Button */}
                      {selectedFile && (
                          <div className="flex items-center justify-between text-sm bg-gray-600 px-3 py-2 rounded-md">
                              <span className="text-gray-200 truncate pr-2">
                                  {selectedFile.name}
                              </span>
                              <button onClick={handleRemoveFile} className="text-red-400 hover:text-red-300 shrink-0" title="Remove file">
                                  <TrashIcon className="h-5 w-5"/>
                                  <span className="sr-only">Remove file</span>
                              </button>
                          </div>
                       )}

                      {/* Submit Button */}
                      <button
                          onClick={handleKYC}
                          disabled={kycProcessing || !selectedFile}
                          className={`${btnIndigo} w-full ${ (kycProcessing || !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                          {kycProcessing ? (
                              <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                              </>
                          ) : (
                              <>
                              <ArrowUpTrayIcon className="h-5 w-5 mr-1"/>
                              Submit KYC Document
                              </>
                          )}
                      </button>
                  </div>
              </div>
            )}

              {/* KYC Response Message */}
              {kycResponse && (
                  <div className={`mt-4 p-3 rounded-md text-sm font-medium flex items-center gap-2 ${kycResponse.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                       {kycResponse.type === 'success' ? <CheckCircleIcon className="h-5 w-5"/> : <XCircleIcon className="h-5 w-5"/>}
                       <span>{kycResponse.message}</span>
                  </div>
               )}

               {/* Extracted Data Display */}
              {extractedData && !needsKYC && (
                  <div className="mt-4 p-4 bg-gray-600 rounded-lg">
                    <h3 className="text-md font-semibold text-white mb-2">Extracted Information:</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      {Object.entries(extractedData).map(([key, value]) => (
                         value && // Only display if value is not null/empty/false etc.
                         <p key={key}>
                           <strong className="font-medium text-gray-100 mr-2">
                             {/* Format key */}
                             {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                           </strong>
                           {String(value)}
                         </p>
                      ))}
                    </div>
                  </div>
                )}
          </div>
        </div>
      </main>

      {/* Disconnect Button */}
      {publicKey && (
        <div className="max-w-4xl mx-auto mt-6 px-6 flex justify-start"> 
           <button
            onClick={disconnect}
            className={btnRed} 
           >
             <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-1"/> 
             Disconnect
           </button>
        </div>
      )}
    </div>
  );
}
