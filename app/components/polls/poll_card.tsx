'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { createClient } from '@/app/lib/client';

interface PollModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    pollId: string; // Assuming you pass the poll ID to fetch specific poll data
}

export default function PollModal({ isOpen, setIsOpen, pollId }: PollModalProps) {
    const [pollData, setPollData] = useState<any | null>(null);
    const [optionsData, setOptionsData] = useState<any[]>([]);
    const supabase = createClient();

    // Fetch poll and options data when modal is opened
    useEffect(() => {
        if (!pollId || !isOpen) return;

        const fetchPollData = async () => {
            try {
                // Fetch poll data from `polls` table
                const { data: pollData, error: pollError } = await supabase
                    .from("polls")
                    .select("id, title, description, end_date, is_private")
                    .eq('id', pollId)
                    .single(); // Get one poll based on the id

                if (pollError) {
                    console.error("Error fetching poll data:", pollError.message);
                    return;
                }

                setPollData(pollData);

                // Fetch options data from `options` table related to this poll
                const { data: optionsData, error: optionsError } = await supabase
                    .from("options")
                    .select("text, vote_count")
                    .eq('poll_id', pollId); // Fetch options where the `poll_id` matches

                if (optionsError) {
                    console.error("Error fetching options data:", optionsError.message);
                    return;
                }

                setOptionsData(optionsData);

            } catch (error) {
                console.error("Error fetching poll data:", error);
            }
        };

        fetchPollData();
    }, [isOpen, pollId, supabase]);

    // Format the end date
    const formatDate = (date: string) => new Date(date).toLocaleString();

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md text-gray-400 hover:text-gray-300"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" className="text-base/7 font-semibold text-white">
                                            Poll Details
                                        </DialogTitle>
                                        <p className="mt-1 text-sm/6 text-gray-400">
                                            Here are the details of the selected poll.
                                        </p>

                                        {/* Display Poll Data */}
                                        {pollData ? (
                                            <div className="mt-6 space-y-8">
                                                <div>
                                                    <h4 className="text-xl font-medium text-white">
                                                        {pollData.title}
                                                    </h4>
                                                    <p className="mt-2 text-gray-400">
                                                        {pollData.description}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-white">End Date</p>
                                                    <p className="text-sm text-gray-400">{formatDate(pollData.end_date)}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-white">Poll Options</p>
                                                    <ul className="space-y-2 text-gray-400">
                                                        {optionsData.length > 0 ? (
                                                            optionsData.map((option: any, index: number) => (
                                                                <li key={index}>
                                                                    {option.text} - <strong>{option.vote_count}</strong> votes
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <p>No options available.</p>
                                                        )}
                                                    </ul>
                                                </div>

                                            </div>
                                        ) : (
                                            <p className="text-gray-400">Loading poll data...</p>
                                        )}

                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
