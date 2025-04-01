"use client";
import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import type { NextPage } from "next";
import type { NftIdContract } from "../../../types/nft_id_contract";
import KYCModal from "./kyc_modal";

// Dynamically import the wallet button with SSR disabled
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Load your updated IDL JSON (which matches your deployed contract's nine accounts)
const idl = require("../../idl/nft_id_contract.json") as NftIdContract & Idl;

// Program IDs – ensure these match your deployed contract.
const NFT_ID_PROGRAM_ID = new PublicKey(
  "GgLTHPo25XiFsQJAkotD3KPiyMFeypJhUSx4UVcxfjcj"
);
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Define the parameters for the minting instruction.
interface InitTokenParams {
  name: string;
  dob: string;
  gender: string;
}

const DashboardCard: NextPage = () => {
  const { publicKey, connected, signTransaction, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();

  const [isClient, setIsClient] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"ocr" | "minting" | "success" | "error">("ocr");
  const [transactionId, setTransactionId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check NFT ownership
  const checkNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      setKycVerified(false);
      setIsLoading(false);
      return;
    }
    try {
      console.log("Checking NFT ownership for wallet:", publicKey.toString());
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      let hasNFT = false;
      for (const acc of tokenAccounts.value) {
        const parsed = acc.account.data.parsed.info.tokenAmount;
        if (parsed.amount === "1" && parsed.decimals === 0) {
          hasNFT = true;
          break;
        }
      }
      setKycVerified(hasNFT);
    } catch (error) {
      console.error("Error checking NFTs:", error);
      setKycVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    checkNFTOwnership();
  }, [checkNFTOwnership]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const getStatusDisplay = () => {
    if (!connected) {
      return {
        color: "gray",
        text: "Not Connected",
        description: "Please connect your wallet to proceed with KYC verification.",
      };
    }
    if (isLoading) {
      return {
        color: "blue",
        text: "Checking Status",
        description: "Verifying your KYC status...",
      };
    }
    if (kycVerified) {
      return {
        color: "green",
        text: "Verified",
        description: "Your identity has been verified on the blockchain.",
      };
    }
    return {
      color: "yellow",
      text: "Unverified",
      description: "Please complete KYC verification.",
    };
  };

  const handleKYC = async () => {
    if (!selectedFile || !publicKey || !signTransaction || !signAllTransactions) return;

    setShowModal(true);
    setModalStep("ocr");
    setErrorMessage(undefined);

    try {
      console.log("Starting OCR process...");
      
      // Create a FormData object and append the selected file.
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Send the file to your Flask OCR server.
      const ocrResponse = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!ocrResponse.ok) {
        throw new Error("OCR server error");
      }
      
      // Parse the OCR response.
      const ocrData = await ocrResponse.json();
      console.log("OCR data:", ocrData);
      const fullName = `${ocrData.first_name}${ocrData.last_name}`.trim().slice(0, 9);
      console.log(fullName, ocrData.dob, ocrData.gender)
      // Build the payload using the OCR response.
      const ocrPayload: InitTokenParams = {
        name: fullName,
        dob: ocrData.dob,
        gender: ocrData.gender.slice(0,1),
      };


      // Proceed with minting using the OCR payload.
      setModalStep("minting");

      // Use the wallet adapter's wallet instance.
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };

      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      });

      const program = new Program(idl, NFT_ID_PROGRAM_ID, provider);
      console.log("Available program methods:", Object.keys(program.methods));

      // Derive PDAs as required.
      const [mint] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), publicKey.toBuffer()],
        NFT_ID_PROGRAM_ID
      );

      const [metadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer()
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const destination = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log("Account addresses:", {
        mint: mint.toBase58(),
        metadata: metadata.toBase58(),
        destination: destination.toBase58(),
        payer: publicKey.toBase58()
      });

      // Call the minting instruction with the OCR payload.
      const txSig = await program.methods
        .initiateToken(ocrPayload.name, ocrPayload.dob, ocrPayload.gender)
        .accounts({
          metadata,
          mint,
          destination,
          payer: publicKey,
          rent: web3.SYSVAR_RENT_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID
        })
        .rpc();

      console.log("Transaction signature:", txSig);
      setTransactionId(txSig);
      setModalStep("success");
      await checkNFTOwnership();
    } catch (err) {
      console.error("Transaction error:", err);
      const error = err as { logs?: string[]; message?: string };
      if (error.logs) console.error("Transaction logs:", error.logs);
      setModalStep("error");
      setErrorMessage(error.message || "Failed to mint NFT");
    }
  };

  const status = getStatusDisplay();

  if (!isClient) return null;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
        <WalletMultiButton />
      </div>

      {/* Status Indicator */}
      <div className={`mb-6 p-4 rounded-lg bg-${status.color}-50 border border-${status.color}-200`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full bg-${status.color}-500 mr-2`} />
          <span className={`font-semibold text-${status.color}-700`}>{status.text}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{status.description}</p>
      </div>

      {connected && !kycVerified && !isLoading && (
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Document</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">Selected: {selectedFile.name}</span>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit KYC */}
          <button
            onClick={handleKYC}
            disabled={!selectedFile}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit KYC
          </button>
        </div>
      )}

      <KYCModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        modalStep={modalStep}
        transactionId={transactionId}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default DashboardCard;
