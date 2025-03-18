"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import FaqCard from "../faq/faq_card";

export default function HeroSection() {
  const [showFaq, setShowFaq] = useState(false);
  const { publicKey, disconnect } = useWallet();

  const scrollToPolls = () => {
    const pollsSection = document.getElementById("public-polls");
    if (pollsSection) {
      pollsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        ></div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center"></div>
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Fast and secure voting on Blockchain
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Experience the future of voting with unmatched security and transparency. Our blockchain technology ensures every vote is tamper-proof, verifiable, and instantly counted.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <WalletMultiButton className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                {publicKey ? "Connected" : "Get Started"}
              </WalletMultiButton>
              <a
                href="/components/faq"
                className="text-sm/6 font-semibold text-gray-300 hover:text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        ></div>
      </div>
    </div>
  );
}