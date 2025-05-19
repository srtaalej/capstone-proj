"use client";

import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useRef, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/utils/interfaces';

export default function Navbar() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const kycStatus = useSelector((state: RootState) => state.globalStates.kycStatus || 'unknown');

  useEffect(() => {
    setIsMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Disclosure as="nav" className="bg-gray-900">
      {({ close }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center px-2 lg:px-0">
                <div className="shrink-0">
                  <Link href="/">
                    <span className="-ml-0.5 text-md font-semibold text-white">
                      BlockVote
                    </span>
                  </Link>
                </div>
                <div className="hidden lg:ml-6 lg:block">
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/create"
                      className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                      New Poll
                    </Link>
                    {connected && (
                      <Link
                        href="/dashboard"
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/faq"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/getting-started"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                    >
                      Guide
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {/* KYC Status Indicator */}
                {isMounted && (
                  <div className="flex items-center mr-3">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 border-2 border-gray-700 flex items-center justify-center cursor-default`}
                      style={{
                        backgroundColor:
                          kycStatus === 'verified' ? '#22c55e' :
                          kycStatus === 'unverified' ? '#ef4444' :
                          kycStatus === 'checking' ? '#facc15' :
                          '#6b7280',
                      }}
                      title={`KYC Status: ${
                        kycStatus === 'verified' ? 'Verified' :
                        kycStatus === 'unverified' ? 'Unverified' :
                        kycStatus === 'checking' ? 'Checking' :
                        'Unknown'
                      }`}
                    />
                    <span className="text-sm text-gray-300">
                      {kycStatus === 'verified' ? 'KYC Verified' :
                       kycStatus === 'unverified' ? 'KYC Required' :
                       kycStatus === 'checking' ? 'Checking KYC...' :
                       'KYC Status'}
                    </span>
                  </div>
                )}
                {isMounted && (
                  <WalletMultiButton className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md" />
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                  <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <DisclosurePanel className="lg:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link
                href="/create"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={close}
              >
                New Poll
              </Link>
              {connected && (
                <Link
                  href="/dashboard"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={close}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/faq"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={close}
              >
                FAQ
              </Link>
              <Link
                href="/getting-started"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={close}
              >
                Guide
              </Link>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
} 