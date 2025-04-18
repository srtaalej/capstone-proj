"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useRef, useEffect } from 'react';
import NewPollModal from '../polls/make_new_poll_card';
import SearchResults from './search_results';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { createClient } from '@/app/lib/client';
import { Poll } from '@/app/types/poll';

export default function Navbar() {
  const supabase = createClient();
  const connected  = useWallet();
  const { setVisible } = useWalletModal();
  const [isNewPollModalOpen, setIsNewPollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Poll[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleNewPollClick = () => {
    if (!connected) {
      setVisible(true);
    } else {
      setIsNewPollModalOpen(true);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const fetchPolls = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_private', false)
        .ilike('title', `%${debouncedQuery}%`);

      if (error) {
        console.error('Error fetching polls:', error);
      } else {
        console.log('Fetched Polls:', data); // Log the returned data to inspect its format
        setSearchResults(data || []);
      }
      setIsSearching(false);
    };

    fetchPolls();
  }, [debouncedQuery, supabase]);

  return (
    <Disclosure as="nav" className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center px-2 lg:px-0">
            <div className="shrink-0">
              {/* ✅ Ensuring proper navigation */}
              <Link href="/home">
                <span className="-ml-0.5 text-md font-semibold text-white">
                  BlockVote
                </span>
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:block">
              <div className="flex items-center space-x-4">
                <DisclosureButton
                  onClick={handleNewPollClick}
                  type="button"
                  className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  New Poll
                </DisclosureButton>
                <Link
                  href="/public_polls"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                >
                  Public Polls
                </Link>
                {(
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                  >
                    Dashboard
                  </Link>
                )}

                {/* ✅ FAQ Link */}
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="grid w-full max-w-lg grid-cols-1 lg:max-w-xs relative" ref={searchRef}>
              <input
                name="search"
                type="search"
                placeholder="Search public polls"
                aria-label="Search public polls"
                className="col-start-1 row-start-1 block w-full rounded-md bg-gray-700 py-1.5 pl-10 pr-3 text-base text-white outline-none placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 sm:text-sm/6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
              />
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400"
              />
              <SearchResults
                results={searchResults}
                isVisible={isSearching && searchQuery.length > 0}
                onClose={() => setIsSearching(false)}
              />
            </div>
          </div>
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
      <DisclosurePanel className="lg:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <Link
            href="/home"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Home
          </Link>

          {connected && (
            <Link
              href="/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Dashboard
            </Link>
          )}

          <Link
            href="/faq"
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            FAQ
          </Link>
        </div>
      </DisclosurePanel>

      <NewPollModal isOpen={isNewPollModalOpen} setIsOpen={setIsNewPollModalOpen} />
    </Disclosure>
  );
}
