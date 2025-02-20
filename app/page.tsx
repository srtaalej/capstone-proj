"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  const handleAuth = () => {
    // TODO: Integrate Phantom wallet authentication here.
    console.log("Authenticate with Phantom wallet");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow-lg">
        <div className="text-xl font-bold text-gray-800">Block Vote</div>
        <div>
          <Link href="/faq" className="text-black hover:underline">
            FAQ
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <h1 className="text-5xl font-semibold text-gray-800 my-8 text-center">
          Block Vote
        </h1>
        <p className="text-xl text-gray-600 mb-6 text-center">
          A decentralized voting system using blockchain technology.
        </p>
        <button
          onClick={handleAuth}
          className="px-8 py-4 bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Authenticate
        </button>
      </main>
    </div>
  );
}
