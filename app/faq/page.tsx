"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const faqs: FAQItem[] = [
    {
      question: "What is Block Vote?",
      answer:
        "Block Vote is a decentralized voting system using blockchain technology that ensures fairness and transparency.",
    },
    {
      question: "How does blockchain ensure security?",
      answer:
        "Blockchain uses decentralized ledgers and consensus mechanisms like Proof of Stake to secure transactions and prevent tampering.",
    },
    {
      question: "What wallet do I need to participate?",
      answer:
        "You'll need a compatible wallet—such as Phantom—to authenticate and participate in the voting process.",
    },
    {
      question: "Is my vote anonymous?",
      answer:
        "Yes, blockchain ensures that votes remain both secure and anonymous while still being verifiable.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number): void => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex justify-between items-center p-4 bg-white shadow-lg">
        <div className="text-xl font-bold text-gray-800">Block Vote</div>
        <div>
          <Link href="/" className="text-black hover:underline mr-4">
            Home
          </Link>
          <Link href="/faq" className="text-black hover:underline">
            FAQ
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-semibold text-gray-800 text-center mb-8">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <h2
                onClick={() => toggleFAQ(index)}
                className="text-xl font-medium cursor-pointer text-black"
              >
                {faq.question}
              </h2>
              {activeIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
