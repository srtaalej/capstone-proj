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

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

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

  const [isClient,     setIsClient]     = useState(false);
  const [kycVerified,  setKycVerified]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal,    setShowModal]    = useState(false);
  const [modalStep,    setModalStep]    =
        useState<"ocr" | "minting" | "success" | "error">("ocr");
  const [transactionId,setTransactionId]= useState<string>();
  const [errorMessage, setErrorMessage]= useState<string>();

  useEffect(() => setIsClient(true), []);

  /* ---------- check NFT ---------- */
  const checkNFTOwnership = useCallback(async () => {
    if (!publicKey) { setKycVerified(false); setIsLoading(false); return; }
    try {
      const ta = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
      const has = ta.value.some(
        (acc) =>
          acc.account.data.parsed.info.tokenAmount.amount === "1" &&
          acc.account.data.parsed.info.tokenAmount.decimals === 0
      );
      setKycVerified(has);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => void checkNFTOwnership(), [checkNFTOwnership]);

  /* ---------- helpers ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedFile(e.target.files?.[0] ?? null);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const inp = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (inp) inp.value = "";
  };

  /* ---------- main KYC ---------- */
  const handleKYC = async () => {
    if (!selectedFile || !publicKey || !signTransaction || !signAllTransactions) return;

    setShowModal(true);
    setModalStep("ocr");
    setErrorMessage(undefined);

    try {
      /* ---- OCR ---- */
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

      setModalStep("minting");

      /* ---- Anchor setup ---- */
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions } as any,
        { commitment: "confirmed", preflightCommitment: "confirmed" }
      );
      const program = new Program(idl, NFT_ID_PROGRAM_ID, provider);

      /* PDAs */
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
      const destination = await getAssociatedTokenAddress(
        mint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
      );

      /* RPC */
      const sig = await program.methods
        .initiateToken(payload.name, payload.dob, payload.gender)
        .accounts({
          metadata,
          mint,
          tokenData,           // pass the PDA
          destination,
          payer: publicKey,
          rent: web3.SYSVAR_RENT_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .rpc();

      setTransactionId(sig);
      setModalStep("success");
      await checkNFTOwnership();
    } catch (e: any) {
      if (e.logs) console.error("Logs:", e.logs);
      setErrorMessage(e.message ?? "Failed");
      setModalStep("error");
    }
  };

  /* ---------- status helper ---------- */
  const status = !connected
    ? { color: "gray",   text: "Not Connected", description: "Connect your wallet." }
    : isLoading
    ? { color: "blue",   text: "Checking",      description: "Verifying KYC..." }
    : kycVerified
    ? { color: "green",  text: "Verified",      description: "ID NFT detected." }
    : { color: "yellow", text: "Unverified",    description: "Complete KYC." };

  /* ---------- JSX ---------- */
  if (!isClient) return null;
  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-500" />
      </div>
    );

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

      {connected && !kycVerified && !isLoading && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload ID Document
            </label>
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
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleKYC}
            disabled={!selectedFile}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
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
