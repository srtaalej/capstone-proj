"use client";

import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

const faqs = [
  {
    question: "What is BlockVote?",
    answer: "BlockVote is a decentralized voting platform built on the Solana blockchain. It allows users to create and participate in polls with enhanced security and transparency through blockchain technology."
  },
  {
    question: "How do I get started?",
    answer: "To get started, connect your Solana wallet, complete the KYC verification process, and you'll be ready to create polls or participate in existing ones. Check out our Getting Started guide for detailed instructions."
  },
  {
    question: "Why do I need to complete KYC?",
    answer: "KYC (Know Your Customer) verification helps maintain the integrity of the voting process and prevents duplicate votes. It's a one-time process that ensures each user can only vote once per poll."
  },
  {
    question: "How secure is BlockVote?",
    answer: "BlockVote leverages Solana's blockchain technology to ensure that all votes are immutable and transparent. Each vote is recorded as a transaction on the blockchain, making it virtually impossible to tamper with the results."
  },
  {
    question: "Can I create my own polls?",
    answer: "Yes! Once you've completed the KYC verification, you can create your own polls. Click the 'New Poll' button to get started. You'll need to provide a title, description, options, and end date for your poll."
  },
  {
    question: "What happens if I lose my wallet?",
    answer: "If you lose access to your wallet, you'll need to recover it using your wallet's recovery phrase. Make sure to keep your recovery phrase in a safe place. BlockVote cannot recover lost wallets or votes."
  },
  {
    question: "Are my votes anonymous?",
    answer: "While votes are recorded on the blockchain, your personal identity is not directly linked to your votes. The system maintains voter anonymity while ensuring the integrity of the voting process."
  },
  {
    question: "How do I know my vote was counted?",
    answer: "All votes are recorded as transactions on the Solana blockchain. You can verify your vote by checking the transaction history in your wallet or using a Solana blockchain explorer."
  }
];

export default function FAQPage() {
  return (
    <div className="bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions about BlockVote
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <div className="bg-gray-800 rounded-lg">
                  <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-4 text-left text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
                    <span>{faq.question}</span>
                    <ChevronUpIcon
                      className={`${
                        open ? 'rotate-180 transform' : ''
                      } h-5 w-5 text-indigo-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-300">
                    {faq.answer}
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </div>
  );
} 