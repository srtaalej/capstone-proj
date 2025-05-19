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
import { createClient } from "@/lib/client";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const supabase = createClient();
const idl = require("../../idl/nft_id_contract.json") as NftIdContract & Idl;

const NFT_ID_PROGRAM_ID = new PublicKey("GgLTHPo25XiFsQJAkotD3KPiyMFeypJhUSx4UVcxfjcj");
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const DashboardCard: NextPage = () => {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  const [isClient, setIsClient] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"upload" | "ocr" | "review" | "minting" | "success" | "error">("upload");
  const [transactionId, setTransactionId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [submissionStatus, setSubmissionStatus] = useState<null | "pending" | "approved" | "rejected">(null);

  const [manualForm, setManualForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
  });
  const [ocrValues, setOcrValues] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
  });

  const mapGender = (g: string): "M" | "F" | "O" | "" => {
    const val = g?.toLowerCase();
    if (val.startsWith("m")) return "M";
    if (val.startsWith("f")) return "F";
    if (val.startsWith("o")) return "O";
    return "";
  };

  const mapDOB = (input: string): string => {
    const d = new Date(input);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!publicKey) return;
    const checkStatus = async () => {
      const { data } = await supabase
        .from("kyc_submissions")
        .select("status")
        .eq("wallet", publicKey.toBase58())
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();
      setSubmissionStatus(data?.status || null);
    };
    checkStatus();
  }, [publicKey]);

  const checkNFTOwnership = useCallback(async () => {
    if (!publicKey) {
      setKycVerified(false);
      setIsLoading(false);
      return;
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setOcrValues({ first_name: "", last_name: "", dob: "", gender: "" });
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setManualForm({ ...manualForm, [e.target.name]: e.target.value });
  };

  const handleStartOCR = async () => {
    if (!selectedFile) return;
    setModalStep("ocr");
    setErrorMessage(undefined);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const ocrRes = await fetch("http://localhost:5001/upload", { method: "POST", body: fd });
      if (!ocrRes.ok) throw new Error("OCR server error");

      const ocr = await ocrRes.json();
      const clean = (s: string) => s?.replace(/,/g, "").trim();
      const formattedDOB = mapDOB(ocr.dob);
      const normalizedGender = mapGender(ocr.gender);

      const firstName = clean(ocr.first_name ?? "");
      const lastName = clean(ocr.last_name ?? "");

      setOcrValues({
        first_name: firstName,
        last_name: lastName,
        dob: formattedDOB,
        gender: normalizedGender,
      });

      setManualForm({
        firstName,
        lastName,
        dob: formattedDOB,
        gender: normalizedGender,
      });

      setModalStep("review");
    } catch (e: any) {
      setErrorMessage(e.message ?? "Failed");
      setModalStep("error");
    }
  };

  const handleMintOrSubmit = async () => {
    let imageUrl = "";

    if (selectedFile) {
      const { data: uploadData, error } = await supabase.storage
        .from("kyc-images")
        .upload(`kyc/${publicKey?.toBase58()}-${Date.now()}.jpg`, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadData?.path) {
        const { data: publicUrl } = supabase.storage
          .from("kyc-images")
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrl.publicUrl;
      }
    }

    await supabase.from("kyc_submissions").insert({
      wallet: publicKey?.toBase58(),
      name: `${manualForm.firstName} ${manualForm.lastName}`,
      dob: manualForm.dob,
      gender: manualForm.gender,
      status: "pending",
      image_url: imageUrl,
    });

    setSubmissionStatus("pending");
    setModalStep("success");
  };

  const handleMint = async () => {
    try {
      if (!publicKey || !signTransaction || !signAllTransactions) return;

      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions } as any,
        { commitment: "confirmed", preflightCommitment: "confirmed" }
      );
      const program = new Program(idl, NFT_ID_PROGRAM_ID, provider);
      const [mint] = PublicKey.findProgramAddressSync([Buffer.from("mint"), publicKey.toBuffer()], NFT_ID_PROGRAM_ID);
      const [tokenData] = PublicKey.findProgramAddressSync([Buffer.from("token_data"), mint.toBuffer()], NFT_ID_PROGRAM_ID);
      const [metadata] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
      );
      const destination = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const payload = {
        name: `${manualForm.firstName}${manualForm.lastName}`.trim().slice(0, 9),
        dob: manualForm.dob,
        gender: manualForm.gender.slice(0, 1),
      };

      setModalStep("minting");

      const sig = await program.methods
        .initiateToken(payload.name, payload.dob, payload.gender)
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

      setTransactionId(sig);
      setModalStep("success");
      await checkNFTOwnership();
    } catch (e: any) {
      setErrorMessage(e.message ?? "Failed");
      setModalStep("error");
    }
  };

  const handleApprovedMintClick = async () => {
    const { data } = await supabase
      .from("kyc_submissions")
      .select("*")
      .eq("wallet", publicKey?.toBase58())
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const [firstName, lastName] = (data.name || "").split(" ");
      setManualForm({
        firstName: firstName || "",
        lastName: lastName || "",
        dob: data.dob || "",
        gender: data.gender || "",
      });
      setOcrValues({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "",
      });
      setShowModal(true);
      setModalStep("minting");
      setTimeout(() => handleMint(), 250);
    }
  };

  return (
    <div className="bg-gray-900 shadow rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
        <WalletMultiButton />
      </div>

      {connected && !kycVerified && !isLoading && (
        <>
          {submissionStatus === "pending" ? (
            <button className="w-full bg-yellow-400 text-black py-2 px-4 rounded-md cursor-not-allowed" disabled>
              Pending Review...
            </button>
          ) : submissionStatus === "rejected" ? (
            <button
              onClick={() => {
                setShowModal(true);
                setModalStep("upload");
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md"
            >
              Resubmit - You were rejected
            </button>
          ) : submissionStatus === "approved" ? (
            <button
              onClick={handleApprovedMintClick}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md"
            >
              Mint ID NFT
            </button>
          ) : (
            <button
              onClick={() => {
                setShowModal(true);
                setModalStep("upload");
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md"
            >
              Start KYC Verification
            </button>
          )}
        </>
      )}

      {showModal && (
        <KYCModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setOcrValues({ first_name: "", last_name: "", dob: "", gender: "" });
            setSelectedFile(null);
          }}
          modalStep={modalStep}
          manualForm={manualForm}
          ocrValues={ocrValues}
          handleManualChange={handleManualChange}
          handleFileChange={handleFileChange}
          handleStartOCR={handleStartOCR}
          handleMint={handleMintOrSubmit}
          selectedFile={selectedFile}
          transactionId={transactionId}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default DashboardCard;
