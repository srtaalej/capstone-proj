"use client";

import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
//import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useRef, useEffect, Fragment } from 'react';
import NewPollModal from '../polls/make_new_poll_card';
import SearchResults from './search_results';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { createClient } from '@/app/lib/client';
import { Poll } from '@/app/types/poll';

export default function Navbar() {
  const supabase = createClient();
  const connected = true;
  //useWallet();
  const { setVisible } = useWalletModal();
  const [isNewPollModalOpen, setIsNewPollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Poll[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setIsSearchFocused(false); 
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  
  useEffect(() => {
    const fetchPolls = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setIsSearchLoading(false); 
        return;
      }

      setIsSearchLoading(true); 
      setSearchResults([]); 

      const { data, error } = await supabase
        .from('polls')
        .select(`
            id,
            title,
            description,
            end_date,
            is_private,
            created_at,
            options (
              poll_id,
              text,
              vote_count
            )
          `) // Fetch options if needed
        .eq('is_private', false)
        .ilike('title', `%${debouncedQuery}%`) // Case-insensitive search
        .limit(10); // Limit results

      if (error) {
        console.error('Error fetching polls:', error);
        setSearchResults([]); // Clear results on error
      } else {
        // console.log('Fetched Polls:', data);
        setSearchResults(data);
      }

      setIsSearchLoading(false); // Set loading false after fetch is done
    };

    fetchPolls();
  }, [debouncedQuery, supabase]);

  // Check if search dropdown should be visible
  const isSearchDropdownVisible = isSearchFocused && searchQuery.length > 0;

  return (
    <Disclosure as="nav" className="bg-gray-900" >
      {({ close }) => ( 
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center px-2 lg:px-0">
                <div className="shrink-0">
                  <Link href="/home">
                    <span className="-ml-0.5 text-md font-semibold text-white">
                      BlockVote
                    </span>
                  </Link>
                </div>
                <div className="hidden lg:ml-6 lg:block">
                  <div className="flex items-center space-x-4">
                    {/* New Poll Button */}
                    <button
                      onClick={handleNewPollClick}
                      type="button"
                      className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                      New Poll
                    </button>
                    {/* Desktop Links */}
                    <Link
                      href="/public_polls"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold"
                    >
                      Public Polls
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

              <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="w-full max-w-lg lg:max-w-xs relative" ref={searchRef}>
                  <div className="relative"> 
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                       {isSearchLoading ? (
                         <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
                       ) : (
                         <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                       )}
                    </div>
                    <input
                      ref={inputRef}
                      name="search"
                      type="search"
                      placeholder="Search public polls"
                      aria-label="Search public polls"
                      className="block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-10 pr-3 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 focus:placeholder:text-gray-500 sm:text-sm sm:leading-6" // Updated focus styles
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}

                    />
                  </div>
                  {/* Search Results with Transition */}
                  <Transition
                    as={Fragment}
                    show={isSearchDropdownVisible}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >

                    <div className="absolute left-0 right-0 z-10 mt-1">
                      <SearchResults
                        results={searchResults}
                        isLoading={isSearchLoading} 
                        onResultClick={() => { 
                          setIsSearchFocused(false);
                          setSearchQuery(''); 
                          
                        }}
                        
                      />
                    </div>
                  </Transition>
                </div>
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
                href="/public_polls"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={(e) => {
                  close();
                }}
              >
                Public Polls
              </Link>
              {connected && (
                <Link
                  href="/dashboard"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={(e) => {
                    close();
                  }}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/faq"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={(e) => {
                  close();
                }}
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

          <NewPollModal isOpen={isNewPollModalOpen} setIsOpen={setIsNewPollModalOpen} />
        </>
      )}
    </Disclosure>
  );
}