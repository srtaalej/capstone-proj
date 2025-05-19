"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircleIcon, LockClosedIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    id: 1,
    title: "Connect Your Wallet",
    description: "Start by connecting your Solana wallet to BlockVote.",
    details: [
      "Click the 'Connect Wallet' button in the top right corner.",
      "Select your preferred wallet (Phantom, Solflare, etc.).",
      "Approve the connection request."
    ],
    icon: PlusCircleIcon,
  },
  {
    id: 2,
    title: "Complete KYC Verification",
    description: "Verify your identity to participate in polls.",
    details: [
      "Visit your Dashboard after connecting your wallet.",
      "Click 'Start KYC Verification'.",
      "Follow the verification process.",
      "Wait for admin approval."
    ],
    icon: LockClosedIcon,
  },
  {
    id: 3,
    title: "Browse and Vote",
    description: "Explore existing polls and cast your votes.",
    details: [
      "View all available polls on the home page.",
      "Click on a poll to see its details.",
      "Select your preferred option and submit your vote.",
      "Your vote will be recorded on the blockchain."
    ],
    icon: PlusCircleIcon,
  },
  {
    id: 4,
    title: "Create Your Own Polls",
    description: "Want to gather opinions? You can create your own polls.",
    details: [
      "Click on the 'New Poll' button.",
      "Fill in the poll's title, description, options, and end date.",
      "KYC verification will be required before creating polls.",
      "Submit your new poll with a quick transaction approval."
    ],
    icon: PlusCircleIcon,
  },
  {
    id: 5,
    title: "Understanding Security & Anonymity",
    description: "BlockVote leverages blockchain for unparalleled security and voter anonymity.",
    details: [
      "Each vote is a transaction recorded on an immutable, decentralized ledger.",
      "Your personal identity remains unlinked from your specific vote.",
      "All votes are verifiable on the blockchain."
    ],
    icon: LockClosedIcon,
  },
  {
    id: 6,
    title: "Need More Help?",
    description: "If you have more questions, our FAQ page is a great resource.",
    details: [
      "Check out common questions and answers about BlockVote.",
      "Contact support if you need additional assistance."
    ],
    icon: QuestionMarkCircleIcon,
    actionText: "Visit FAQ",
    actionLink: "/faq",
    externalLink: false,
  },
];

export default function GettingStartedPage() {
  const [visibleSteps, setVisibleSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepId: number) => {
    setVisibleSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  return (
    <div className="bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Getting Started with BlockVote</h1>
          <p className="text-xl text-gray-300">
            Follow these steps to start using BlockVote for secure, decentralized voting.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <step.icon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="ml-6 flex-shrink-0">
                  <svg
                    className={`h-6 w-6 transform ${
                      visibleSteps[step.id] ? 'rotate-180' : ''
                    } text-gray-400`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {visibleSteps[step.id] && (
                <div className="px-6 pb-4">
                  <ul className="mt-2 space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-gray-300 text-sm">
                        • {detail}
                      </li>
                    ))}
                  </ul>
                  {step.actionLink && (
                    <div className="mt-6">
                      <Link
                        href={step.actionLink}
                        target={step.externalLink ? "_blank" : "_self"}
                        rel={step.externalLink ? "noopener noreferrer" : ""}
                        className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {step.actionText}
                        {step.externalLink && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 3h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.19a.75.75 0 0 0 .053 1.06Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 