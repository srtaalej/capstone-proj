import React from 'react';
import Link from 'next/link';
import { Poll, Option } from '@/app/types/poll';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/client';

const supabase = createClient();

interface PublicPollResultsProps {
  poll: Poll
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};



export default function PollCard({ poll }: PublicPollResultsProps) {
    const [options, setOptions] = useState(poll.options); // Local state for options

  useEffect(() => {
    // Subscribe to changes in the `options` table for this poll
    const channel = supabase
      .channel(`poll-${poll.id}`) // Unique channel for this poll
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listen for updates
          schema: 'public',
          table: 'options',
          filter: `poll_id=eq.${poll.id}`, // Only listen for changes to this poll's options
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          const updatedOption = payload.new as Option;

          // Update the specific option in the local state
          setOptions((prevOptions) =>
            prevOptions.map((option) =>
              option.poll_id === updatedOption.poll_id ? updatedOption : option
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll.id]);
        return (
              <div className="col-span-1 flex flex-col divide-y rounded-lg text-center shadow bg-gray-800"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-semibold text-white">{poll.title}</h3>
                  <dl className="mt-1 flex grow flex-col justify-between">
                    <dt className="sr-only">Title</dt>
                    <dd className="text-sm text-gray-400">{poll.description}</dd>
                    <dt className="sr-only">End Date</dt>
                    <dd className="mt-3">
                        <span
                            className={`inline-flex items-center rounded-full bg-gray-600 px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                new Date(poll.end_date) < new Date()
                                ? 'text-red-500'
                                : 'text-indigo-500'
                            }`}
                            >
                            {new Date(poll.end_date) < new Date() ? 'Ended' : formatDate(poll.end_date)}
                        </span>
                    </dd>
                  </dl>
                </div>
              </div>
    )     
};
