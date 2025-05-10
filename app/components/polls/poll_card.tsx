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
  {new Date(poll.end_date).toLocaleString()}
        return (
            <div className="col-span-1 flex flex-col bg-gray-800 p-6 hover:bg-gray-700/70 transition-colors rounded-2xl">
            <div className="flex flex-1 flex-col">
              <h3 className="text-xl font-bold text-white mb-2">{poll.title}</h3>
              <div className="flex flex-col flex-grow">
                <p className="text-md text-gray-300 mb-4">{poll.description}</p>
                <div className="mt-auto flex items-center">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className={`mr-1 ${
                        new Date(poll.end_date) < new Date() 
                            ? 'text-red-500' 
                            : 'text-green-500'
                        }`}>
                      {new Date(poll.end_date) < new Date() 
                        ? 'Ended' 
                        : `Ends ${new Date(poll.end_date).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
    )     
};
