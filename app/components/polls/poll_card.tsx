import React from 'react';
import Link from 'next/link';
import { Poll } from '@/app/types/poll';

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
        return (
              <div className="col-span-1 flex flex-col divide-y divide-indigo-500 rounded-lg bg-gray-850 border border-indigo-500  text-center shadow"
              >
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mt-6 text-sm font-semibold text-white">{poll.title}</h3>
                  <dl className="mt-1 flex grow flex-col justify-between">
                    <dt className="sr-only">Title</dt>
                    <dd className="text-sm text-gray-400">{poll.description}</dd>
                    <dt className="sr-only">End Date</dt>
                    <dd className="mt-3">
                      <span className="inline-flex items-center rounded-full bg-green-60 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-500/20">
                        {formatDate(poll.end_date)}
                      </span>
                    </dd>
                  </dl>
                </div>
                <div>
                <div className="-mt-px flex divide-x divide-indigo-500">
                    {poll.options.map((option) => (
                        <div key={option.text} className="flex w-0 flex-1">
                        <span
                            className="p-2 relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-xs font-semibold text-white"
                        >
                            {option.text}: {option.vote_count}
                        </span>
                        </div>
                    ))}
                 </div>
                </div>
              </div>
    )     
};
