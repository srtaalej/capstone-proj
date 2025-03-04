"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {
  const { publicKey, disconnect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (publicKey) {
      router.push("/post_login"); // Redirect after login
    }
  }, [publicKey, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex justify-between items-center p-4 bg-white shadow-lg">
        <div className="text-xl font-bold text-gray-800">Block Vote</div>
        <div>
          <Link href="/faq" className="text-black hover:underline">
            FAQ
          </Link>
        </div>
      </nav>
      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <h1 className="text-5xl font-semibold text-gray-800 my-8 text-center">
          Block Vote
        </h1>
        <p className="text-xl text-gray-600 mb-6 text-center">
          A decentralized voting system using blockchain technology.
        </p>
        <WalletMultiButton>{publicKey ? "Authenticated" : "Authenticate"}</WalletMultiButton>
        {publicKey && (
          <p className="mt-4 text-gray-700">Connected: {publicKey.toString()}</p>
        )}
        {publicKey && (
          <button
            onClick={disconnect}
            className="mt-4 px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        )}
      </main>
    </div>
  );
}
