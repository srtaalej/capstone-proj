"use client";

import Link from 'next/link';
import { WalletIcon, ArrowRightCircleIcon, CheckBadgeIcon, PlusCircleIcon, LockClosedIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    id: 1,
    title: "Get a Solana-Compatible Wallet",
    description: "To interact with BlockVote, you need a Solana wallet. This secure digital pocket lets you manage your identity and approve transactions on the blockchain.",
    details: [
      "We recommend popular choices like Phantom or Solflare, available as browser extensions and mobile apps.",
      "During setup, securely back up your seed phrase (recovery phrase). This is crucial for wallet recovery and should never be shared."
    ],
    icon: WalletIcon,
    actionText: "Learn about Phantom",
    actionLink: "https://phantom.app/",
    externalLink: true,
  },
  {
    id: 2,
    title: "Connect Your Wallet to BlockVote",
    description: "Once your wallet is ready, connect it to our platform to start participating.",
    details: [
      "Look for the 'Connect Wallet' button, on our homepage.",
      "Click it, and your wallet extension will prompt you to approve the connection. Grant permission to proceed."
    ],
    icon: ArrowRightCircleIcon,
  },
  {
    id: 3,
    title: "Explore and Vote on Polls",
    description: "With your wallet connected, you can browse public polls and cast your votes securely.",
    details: [
      "Navigate to the 'Public Polls' section to see available polls.",
      "Click on a poll to view its details and options. Select your choice and click 'Vote'.",
      "Your wallet will ask for approval to submit the voting transaction to the blockchain. This ensures your vote is recorded transparently and securely."
    ],
    icon: CheckBadgeIcon,
  },
  {
    id: 4,
    title: "Create Your Own Polls",
    description: "Want to gather opinions? You can create your own polls.",
    details: [
      "Click on the 'New Poll' button. You'll be guided to fill in the poll's title, description, options, and end date.",
      "KYC verification (found on your Dashboard) will be required before creating polls.",
      "Submitting your new poll will also require a quick transaction approval from your wallet."
    ],
    icon: PlusCircleIcon,
  },
  {
    id: 5,
    title: "Understanding Security & Anonymity",
    description: "BlockVote leverages blockchain for unparalleled security and voter anonymity.",
    details: [
      "Each vote is a transaction recorded on an immutable, decentralized ledger, making tampering virtually impossible.",
      "While votes are verifiable on the blockchain, your personal identity remains unlinked from your specific vote, ensuring anonymity."
    ],
    icon: LockClosedIcon,
  },
  {
    id: 6,
    title: "Need More Help?",
    description: "If you have more questions, our FAQ page is a great resource.",
    details: [
      "Check out common questions and answers about BlockVote and its functionalities."
    ],
    icon: QuestionMarkCircleIcon,
    actionText: "Visit FAQ",
    actionLink: "/faq",
    externalLink: false,
  },
];

export default function GettingStartedPage() {
    const [visibleSteps, setVisibleSteps] = useState<Record<number, boolean>>({});
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              
              const stepId = Number(entry.target.getAttribute('data-step-id'));
              if (stepId) {
                setVisibleSteps((prev) => ({ ...prev, [stepId]: true }));
                observer.unobserve(entry.target); 
              }
            }
          });
        },
        {
          rootMargin: '0px', 
          threshold: 0.2, 
        }
      );
  
      stepRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
  
      return () => {
        stepRefs.current.forEach((ref) => {
          if (ref) observer.unobserve(ref);
        });
      };
    }, [steps]); 
  
    return (
      <div className="bg-gray-900 min-h-screen text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Getting Started with BlockVote
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Follow these simple steps to connect your wallet, vote securely, and engage with our blockchain-based polling system.
            </p>
          </div>
  
          <div className="space-y-10 md:space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.id}
                
                ref={(el) => (stepRefs.current[index] = el)}
                data-step-id={step.id}
                
                
                className={`
                  p-6 sm:p-8 rounded-xl shadow-lg 
                  ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/70'}
                  opacity-0 transform translate-y-5 transition-all duration-700 ease-out delay-100
                  ${visibleSteps[step.id] ? 'scroll-animate-in' : ''}
                `}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-x-6">
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <step.icon className="h-10 w-10 text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white">
                      {step.id}. {step.title}
                    </h2>
                    <p className="mt-2 text-base text-gray-300">
                      {step.description}
                    </p>
                    {step.details && step.details.length > 0 && (
                      <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-gray-400">
                        {step.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}
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
                </div>
              </div>
            ))}
          </div>
  
          <div className="mt-16 sm:mt-20 text-center">
              <p className="text-gray-400">Ready to explore further?</p>
              <Link href="/dashboard" className="mt-4 inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Go to Dashboard
              </Link>
          </div>
  
        </div>
      </div>
    );
  }