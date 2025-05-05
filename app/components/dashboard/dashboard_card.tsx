"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Program, AnchorProvider, web3, Idl } from "@project-serum/anchor";
import { createClient } from "../../lib/client";
import KYCModal from "./kyc_modal";
import type { NextPage } from "next";
import type { NftIdContract } from "../../../types/nft_id_contract";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const supabase = createClient();
const idl = require("../../idl/nft_id_contract.json") as NftIdContract & Idl;
const NFT_ID_PROGRAM_ID = new PublicKey("GgLTHPo25XiFsQJAkotD3KPiyMFeypJhUSx4UVcxfjcj");
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

interface InitTokenParams {
  name: string;
  dob: string;
  gender: string;
}

const DashboardCard: NextPage = () => {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const [isClient, setIsClient] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycPending, setKycPending] = useState(false);
  const [kycApproved, setKycApproved] = useState(false);
  const [approvedData, setApprovedData] = useState<InitTokenParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"ocr" | "confirm" | "minting" | "success" | "error">("ocr");
  const [successMode, setSuccessMode] = useState<"minted" | "submitted">("minted");
  const [transactionId, setTransactionId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [ocrData, setOcrData] = useState<InitTokenParams | null>(null);
  const [originalOcrData, setOriginalOcrData] = useState<InitTokenParams | null>(null);

  useEffect(() => setIsClient(true), []);

  const checkNFTOwnership = useCallback(async () => {
    if (!publicKey) { setKycVerified(false); setIsLoading(false); return; }
    try {
      const ta = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
      const has = ta.value.some(
        (acc) => acc.account.data.parsed.info.tokenAmount.amount === "1" &&
                 acc.account.data.parsed.info.tokenAmount.decimals === 0
      );
      setKycVerified(has);

      const { data: pendingData } = await supabase
        .from("kyc_submissions")
        .select("id")
        .eq("wallet", publicKey.toBase58())
        .eq("status", "pending")
        .maybeSingle();

      const { data: approvedDataResult } = await supabase
        .from("kyc_submissions")
        .select("name, dob, gender")
        .eq("wallet", publicKey.toBase58())
        .eq("status", "approved")
        .maybeSingle();

      setKycPending(!!pendingData);
      if (approvedDataResult) {
        setKycApproved(true);
        setApprovedData({
          name: approvedDataResult.name,
          dob: approvedDataResult.dob,
          gender: approvedDataResult.gender,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => void checkNFTOwnership(), [checkNFTOwnership]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedFile(e.target.files?.[0] ?? null);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const inp = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (inp) inp.value = "";
  };

  const handleKYC = async () => {
    if (!selectedFile || !publicKey) return;

    setShowModal(true);
    setModalStep("ocr");
    setErrorMessage(undefined);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const ocrRes = await fetch("http://localhost:5001/upload", { method: "POST", body: fd });
      if (!ocrRes.ok) throw new Error("OCR server error");
      const ocr = await ocrRes.json();

      const payload: InitTokenParams = {
        name: `${ocr.first_name ?? ""}${ocr.last_name ?? ""}`.trim().slice(0, 9),
        dob: ocr.dob ?? "",
        gender: (ocr.gender ?? "").slice(0, 1),
      };

      setOcrData(payload);
      setOriginalOcrData(payload);
      setModalStep("confirm");
    } catch (e: any) {
      setErrorMessage(e.message ?? "Failed OCR");
      setModalStep("error");
    }
  };

  const handleConfirmKYC = async () => {
    if (!ocrData || !originalOcrData || !publicKey || !selectedFile) return;

    const isEdited =
      ocrData.name !== originalOcrData.name ||
      ocrData.dob !== originalOcrData.dob ||
      ocrData.gender !== originalOcrData.gender;

    if (isEdited) {
      try {
        const filename = `kyc-${publicKey.toBase58()}-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("kyc-images")
          .upload(filename, selectedFile);

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase
          .storage
          .from("kyc-images")
          .getPublicUrl(uploadData.path);

        const { error: insertError } = await supabase.from("kyc_submissions").insert({
          wallet: publicKey.toBase58(),
          name: ocrData.name,
          dob: ocrData.dob,
          gender: ocrData.gender,
          image_url: urlData.publicUrl,
          status: "pending",
        });

        if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

        setKycPending(true);
        setSuccessMode("submitted");
        setModalStep("success");
        return;
      } catch (err: any) {
        setErrorMessage(err.message ?? "Submission failed");
        setModalStep("error");
        return;
      }
    }

    try {
      setModalStep("minting");

      const provider = new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions } as any, {
        commitment: "confirmed", preflightCommitment: "confirmed"
      });

      const program = new Program(idl, NFT_ID_PROGRAM_ID, provider);

      const [mint] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), publicKey.toBuffer()],
        NFT_ID_PROGRAM_ID
      );
      const [tokenData] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_data"), mint.toBuffer()],
        NFT_ID_PROGRAM_ID
      );
      const [metadata] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
      );
      const destination = await getAssociatedTokenAddress(mint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

      const txSig = await program.methods
        .initiateToken(ocrData.name, ocrData.dob, ocrData.gender)
        .accounts({
          metadata,
          mint,
          tokenData,
          destination,
          payer: publicKey,
          rent: web3.SYSVAR_RENT_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .rpc();

      setTransactionId(txSig);
      setSuccessMode("minted");
      setModalStep("success");
      await checkNFTOwnership();
    } catch (e: any) {
      setErrorMessage(e.message ?? "Minting failed");
      setModalStep("error");
    }
  };

  const handleMintApproved = async () => {
    if (!approvedData || !publicKey || !signTransaction || !signAllTransactions) return;

    try {
      setShowModal(true);
      setModalStep("minting");

      const provider = new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions } as any, {
        commitment: "confirmed", preflightCommitment: "confirmed"
      });

      const program = new Program(idl, NFT_ID_PROGRAM_ID, provider);

      const [mint] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), publicKey.toBuffer()],
        NFT_ID_PROGRAM_ID
      );
      const [tokenData] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_data"), mint.toBuffer()],
        NFT_ID_PROGRAM_ID
      );
      const [metadata] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
      );
      const destination = await getAssociatedTokenAddress(mint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

      const txSig = await program.methods
        .initiateToken(approvedData.name, approvedData.dob, approvedData.gender)
        .accounts({
          metadata,
          mint,
          tokenData,
          destination,
          payer: publicKey,
          rent: web3.SYSVAR_RENT_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .rpc();

      setTransactionId(txSig);
      setSuccessMode("minted");
      setModalStep("success");
      await checkNFTOwnership();
    } catch (e: any) {
      setErrorMessage(e.message ?? "Minting failed");
      setModalStep("error");
    }
  };

  const status = !connected
    ? { color: "gray", text: "Not Connected", description: "Connect your wallet." }
    : isLoading
    ? { color: "blue", text: "Checking", description: "Verifying KYC..." }
    : kycVerified
    ? { color: "green", text: "Verified", description: "ID NFT detected." }
    : kycApproved
    ? { color: "green", text: "Approved", description: "Mint your ID NFT." }
    : kycPending
    ? { color: "yellow", text: "Submitted for Review", description: "Waiting for admin approval." }
    : { color: "yellow", text: "Unverified", description: "Complete KYC." };

  if (!isClient) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
        <WalletMultiButton />
      </div>

      <div className={`mb-6 p-4 rounded-lg bg-${status.color}-50 border border-${status.color}-200`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full bg-${status.color}-500 mr-2`} />
          <span className={`font-semibold text-${status.color}-700`}>{status.text}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{status.description}</p>
      </div>

      {connected && !kycVerified && !kycPending && !kycApproved && !isLoading && (
        <div className="space-y-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm text-gray-600">{selectedFile.name}</span>
              <button onClick={handleRemoveFile} className="text-red-500 text-sm font-medium">Remove</button>
            </div>
          )}
          <button
            onClick={handleKYC}
            disabled={!selectedFile}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Submit KYC
          </button>
        </div>
      )}

      {connected && kycApproved && !kycVerified && !isLoading && (
        <div className="mt-6">
          <button
            onClick={handleMintApproved}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Mint Your Approved KYC NFT
          </button>
        </div>
      )}

      <KYCModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        modalStep={modalStep}
        successMode={successMode}
        transactionId={transactionId}
        errorMessage={errorMessage}
        ocrData={ocrData ?? undefined}
        setOcrData={setOcrData}
        onConfirm={handleConfirmKYC}
      />
    </div>
  );
};

export default DashboardCard;
